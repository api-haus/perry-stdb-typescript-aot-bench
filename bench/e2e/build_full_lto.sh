#!/usr/bin/env bash
# Build the Perry full-runtime LTO module (hybrid: overlay + full runtime bitcode).
#
# This script implements the full-runtime LTO pipeline:
#   1. Compile bench.ts with Perry (keeping LLVM IR)
#   2. Build perry-runtime for wasm32 with -Clinker-plugin-lto (LLVM bitcode)
#   3. Extract bitcode objects from the LTO archive
#   4. Merge all runtime bitcode into one module (llvm-link)
#   5. Compile the hot-function overlay to bitcode (clang -emit-llvm)
#   6. Merge user + runtime + overlay (llvm-link --override)
#   7. Whole-program optimize (opt -O3)
#   8. Lower to wasm32 object (llc)
#   9. Compile ABI shim (clang)
#  10. Link with wasm-ld + standard runtime archive (for non-bitcode deps)
#
# The "hybrid" approach: the overlay provides a small, inlineable fast path for
# js_dynamic_string_or_number_add (the hot function in cpu_heavy). The full
# runtime bitcode provides LLVM visibility into all other runtime functions for
# whole-program dead-code elimination and inter-procedural optimization. The
# overlay's definition overrides the runtime's via llvm-link --override.
#
# Why not pure full-runtime LTO without overlay? LLVM's inliner cost model
# refuses to inline the full Rust implementation of js_dynamic_string_or_number_add
# (~500 lines of type checks) even with the full runtime as bitcode. The overlay
# provides a 10-line C fast path that LLVM happily inlines.
#
# Prerequisites:
#   - Perry compiler: _vendor/perry-fork/target/release/perry
#   - LLVM tools: llvm-as, llvm-link, opt, llc, clang, wasm-ld, llvm-nm, llvm-ar
#   - Rust toolchain with wasm32-unknown-unknown target
#
# Usage:
#   ./bench/e2e/build_full_lto.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MODULE_DIR="$SCRIPT_DIR/module"
PERRY="$PROJECT_ROOT/_vendor/perry-fork/target/release/perry"
PERRY_FORK="$PROJECT_ROOT/_vendor/perry-fork"
RT_STD_ARCHIVE="$PERRY_FORK/target/wasm32-unknown-unknown/release/libperry_runtime.a"
RT_LTO_DIR="$PERRY_FORK/target/wasm32-lto"
RT_LTO_ARCHIVE="$RT_LTO_DIR/wasm32-unknown-unknown/release/libperry_runtime.a"

TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

echo "=== Perry Full-Runtime LTO Build ==="
echo "Temp dir: $TMP_DIR"

# Step 1: Compile with Perry, keeping LLVM IR
echo "--- Step 1: Perry compile (keeping IR) ---"
PERRY_LLVM_KEEP_IR=1 $PERRY compile "$MODULE_DIR/bench.ts" \
    --target spacetimedb \
    -o "$TMP_DIR/bench_standard.wasm"

# Find the kept .ll file (most recent)
LL_FILE=$(find /tmp -name 'perry_llvm_*.ll' -newer "$0" 2>/dev/null | head -1)
if [ -z "$LL_FILE" ]; then
    # Fallback: find the most recently modified .ll
    LL_FILE=$(find /tmp -name 'perry_llvm_*.ll' 2>/dev/null -printf '%T@ %p\n' | sort -rn | head -1 | cut -d' ' -f2-)
fi
if [ -z "$LL_FILE" ]; then
    echo "ERROR: Could not find kept .ll file"
    exit 1
fi
echo "  Found IR: $LL_FILE"

# Step 2: Build perry-runtime with LTO flags (produces LLVM bitcode objects)
echo "--- Step 2: Build runtime as LLVM bitcode ---"
if [ ! -f "$RT_LTO_ARCHIVE" ] || [ "$RT_LTO_ARCHIVE" -ot "$RT_STD_ARCHIVE" ]; then
    cd "$PERRY_FORK"
    CARGO_TARGET_DIR="$RT_LTO_DIR" \
    RUSTFLAGS="-Clinker-plugin-lto -Cembed-bitcode=yes" \
    cargo build -p perry-runtime --target wasm32-unknown-unknown \
        --no-default-features --release 2>&1 | tail -3
    cd "$PROJECT_ROOT"
    echo "  Built LTO archive: $RT_LTO_ARCHIVE"
else
    echo "  LTO archive up to date: $RT_LTO_ARCHIVE"
fi

# Step 3: Extract bitcode objects from LTO archive
echo "--- Step 3: Extract bitcode from LTO archive ---"
EXTRACT_DIR="$TMP_DIR/rt_extract"
BC_DIR="$TMP_DIR/rt_bc"
mkdir -p "$EXTRACT_DIR" "$BC_DIR"
cd "$EXTRACT_DIR"
llvm-ar x "$RT_LTO_ARCHIVE"
N=0
for f in *.o; do
    if file "$f" | grep -q "LLVM IR bitcode"; then
        cp "$f" "$BC_DIR/bc_${N}.o"
        N=$((N+1))
    fi
done
echo "  Extracted $N bitcode objects"
cd "$PROJECT_ROOT"

# Step 4: Merge runtime bitcode
echo "--- Step 4: Merge runtime bitcode ---"
cd "$BC_DIR"
llvm-link *.o -o "$TMP_DIR/rt_merged.bc"
cd "$PROJECT_ROOT"

# Step 5: Convert user .ll to .bc
echo "--- Step 5: llvm-as (user .ll -> .bc) ---"
llvm-as "$LL_FILE" -o "$TMP_DIR/user.bc"

# Step 6: Compile overlay
echo "--- Step 6: Compile overlay ---"
clang -c -O3 -emit-llvm -target wasm32-unknown-unknown \
    "$MODULE_DIR/lto_overlay.c" \
    -o "$TMP_DIR/overlay.bc"

# Step 7: Merge user + runtime + overlay
echo "--- Step 7: llvm-link (user + runtime, overlay overrides) ---"
llvm-link "$TMP_DIR/user.bc" "$TMP_DIR/rt_merged.bc" \
    --override "$TMP_DIR/overlay.bc" \
    -o "$TMP_DIR/merged.bc"

# Step 8: Whole-program optimize
echo "--- Step 8: opt -O3 ---"
opt -O3 "$TMP_DIR/merged.bc" -o "$TMP_DIR/opt.bc"

# Step 9: Lower to wasm32 object
echo "--- Step 9: llc (bitcode -> wasm32 .o) ---"
llc -filetype=obj -O3 -mtriple=wasm32-unknown-unknown \
    "$TMP_DIR/opt.bc" -o "$TMP_DIR/lto_user.o"

# Discover exports from the LTO object
EXPORTS=$(llvm-nm --defined-only "$TMP_DIR/lto_user.o" | awk '$2 == "T" && $3 ~ /^perry_fn_/ {print $3}')
echo "  Exports: $EXPORTS"

# Step 10: Generate and compile ABI shim
echo "--- Step 10: Compile ABI shim ---"
cat > "$TMP_DIR/shim.c" << 'SHIM_EOF'
typedef unsigned int   u32;
typedef int            i32;
typedef long long      i64;
typedef unsigned char  u8;

__attribute__((import_module("spacetime_10.0"), import_name("bytes_sink_write")))
extern i32 bytes_sink_write(u32 sink, const u8 *buf_ptr, u32 *buf_len_ptr);

typedef i32 jmp_buf[1];
i32 setjmp(jmp_buf env) { (void)env; return 0; }
__attribute__((noreturn))
void longjmp(jmp_buf env, i32 val) { (void)env; (void)val; __builtin_trap(); }

static const u8 MODULE_DEF[] = {
    0x02,
    0x02,0x00,0x00,0x00,
      0x03,
      0x02,0x00,0x00,0x00,
        0x09,0x00,0x00,0x00, 0x63,0x70,0x75,0x5f,0x68,0x65,0x61,0x76,0x79,
        0x00,0x00,0x00,0x00,
        0x01,
        0x02,0x00,0x00,0x00,0x00,
        0x04,
        0x05,0x00,0x00,0x00, 0x65,0x6d,0x70,0x74,0x79,
        0x00,0x00,0x00,0x00,
        0x01,
        0x02,0x00,0x00,0x00,0x00,
        0x04,
      0x0a,
      0x00,0x00,0x00,0x00,
};
static const u32 MODULE_DEF_LEN = sizeof(MODULE_DEF);

__attribute__((export_name("__describe_module__")))
void __describe_module__(u32 description_sink) {
    u32 written = 0;
    while (written < MODULE_DEF_LEN) {
        u32 chunk = MODULE_DEF_LEN - written;
        i32 ret = bytes_sink_write(description_sink, &MODULE_DEF[written], &chunk);
        if (ret != 0) return;
        if (chunk == 0) return;
        written += chunk;
    }
}

extern double perry_fn_bench_ts__cpu_heavy(void);
extern long long perry_fn_bench_ts__empty_i64(void);

__attribute__((export_name("__call_reducer__")))
i32 __call_reducer__(u32 id,
                     i64 sender_0, i64 sender_1, i64 sender_2, i64 sender_3,
                     i64 conn_0, i64 conn_1, i64 timestamp,
                     u32 args_source, u32 err_sink) {
    (void)sender_0; (void)sender_1; (void)sender_2; (void)sender_3;
    (void)conn_0; (void)conn_1; (void)timestamp; (void)args_source; (void)err_sink;
    if (id == 0) {
        volatile double sink_0 = perry_fn_bench_ts__cpu_heavy();
        (void)sink_0;
        return 0;
    }
    if (id == 1) {
        volatile long long sink_1 = perry_fn_bench_ts__empty_i64();
        (void)sink_1;
        return 0;
    }
    return -1;
}
SHIM_EOF

clang -c -O3 -fno-math-errno -target wasm32-unknown-unknown \
    "$TMP_DIR/shim.c" -o "$TMP_DIR/shim.o"

# Step 11: Link with wasm-ld
echo "--- Step 11: wasm-ld ---"
wasm-ld \
    --no-entry \
    --gc-sections \
    --allow-multiple-definition \
    --export=__describe_module__ \
    --export=__call_reducer__ \
    --export=perry_fn_bench_ts__cpu_heavy \
    --export=perry_fn_bench_ts__empty \
    --export=perry_fn_bench_ts__empty_i64 \
    "$TMP_DIR/shim.o" \
    "$TMP_DIR/lto_user.o" \
    "$RT_STD_ARCHIVE" \
    -o "$MODULE_DIR/bench_perry_full_lto.wasm"

echo ""
echo "=== Build complete ==="
echo "  Output: $MODULE_DIR/bench_perry_full_lto.wasm ($(du -h "$MODULE_DIR/bench_perry_full_lto.wasm" | cut -f1))"

# Validate
if command -v wasm-tools &>/dev/null; then
    wasm-tools validate "$MODULE_DIR/bench_perry_full_lto.wasm" && echo "  wasm-tools validate: PASS"
fi

# Check for inlining
echo ""
echo "--- Hot loop check (should have NO 'call' instructions) ---"
wasm-tools print "$MODULE_DIR/bench_perry_full_lto.wasm" 2>/dev/null | \
    sed -n '/func \$perry_fn_bench_ts__cpu_heavy/,/^  (func /p' | \
    head -80 | grep -E 'call \$|f64\.add|select' || echo "(grep found no calls -- LTO working)"

# Check if js_dynamic_string_or_number_add is eliminated
echo ""
DYNA_COUNT=$(wasm-tools print "$MODULE_DIR/bench_perry_full_lto.wasm" 2>/dev/null | grep -c 'js_dynamic_string_or_number_add' || true)
echo "js_dynamic_string_or_number_add references: $DYNA_COUNT (0 = fully eliminated)"
