#!/usr/bin/env bash
# Build the Perry LTO module for the bitcode-link experiment.
#
# This script implements the manual LTO pipeline:
#   1. Compile bench.ts with Perry (keeping LLVM IR)
#   2. Convert user .ll to .bc (llvm-as)
#   3. Compile the LTO overlay to .bc (clang -emit-llvm)
#   4. Merge user + overlay bitcode (llvm-link)
#   5. Whole-program optimize (opt -O3)
#   6. Lower to wasm32 object (llc)
#   7. Compile ABI shim (clang)
#   8. Link with wasm-ld + runtime archive
#
# Prerequisites:
#   - Perry compiler: _vendor/perry-fork/target/release/perry
#   - LLVM tools: llvm-as, llvm-link, opt, llc, clang, wasm-ld, llvm-nm
#   - wasm32 runtime archive at the path Perry discovers
#
# Usage:
#   ./bench/e2e/build_lto.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MODULE_DIR="$SCRIPT_DIR/module"
PERRY="$PROJECT_ROOT/_vendor/perry-fork/target/release/perry"
RT_ARCHIVE="$PROJECT_ROOT/_vendor/perry-fork/target/wasm32-unknown-unknown/release/libperry_runtime.a"

TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

echo "=== Perry LTO Build ==="
echo "Temp dir: $TMP_DIR"

# Step 1: Compile with Perry, keeping LLVM IR
echo "--- Step 1: Perry compile (keeping IR) ---"
PERRY_LLVM_KEEP_IR=1 $PERRY compile "$MODULE_DIR/bench.ts" \
    --target spacetimedb \
    -o "$TMP_DIR/bench_standard.wasm"

# Find the kept .ll file
LL_FILE=$(find /tmp -name 'perry_llvm_*.ll' -newer "$TMP_DIR/bench_standard.wasm" | head -1)
if [ -z "$LL_FILE" ]; then
    echo "ERROR: Could not find kept .ll file"
    exit 1
fi
echo "  Found IR: $LL_FILE"

# Step 2: Convert user .ll to .bc
echo "--- Step 2: llvm-as (user .ll -> .bc) ---"
llvm-as "$LL_FILE" -o "$TMP_DIR/user.bc"

# Step 3: Compile overlay to .bc
echo "--- Step 3: Compile LTO overlay ---"
clang -c -O3 -emit-llvm -target wasm32-unknown-unknown \
    "$MODULE_DIR/lto_overlay.c" \
    -o "$TMP_DIR/overlay.bc"

# Step 4: Merge bitcode
echo "--- Step 4: llvm-link (merge user + overlay) ---"
llvm-link "$TMP_DIR/user.bc" "$TMP_DIR/overlay.bc" -o "$TMP_DIR/merged.bc"

# Step 5: Whole-program optimize
echo "--- Step 5: opt -O3 ---"
opt -O3 "$TMP_DIR/merged.bc" -o "$TMP_DIR/opt.bc"

# Step 6: Lower to wasm32 object
echo "--- Step 6: llc (bitcode -> wasm32 .o) ---"
llc -filetype=obj -O3 -mtriple=wasm32-unknown-unknown \
    "$TMP_DIR/opt.bc" -o "$TMP_DIR/lto_user.o"

# Discover exports from the LTO object
EXPORTS=$(llvm-nm --defined-only "$TMP_DIR/lto_user.o" | awk '$2 == "T" && $3 ~ /^perry_fn_/ {print $3}')
echo "  Exports: $EXPORTS"

# Step 7: Generate and compile ABI shim
# The shim is the same as what Perry generates -- we reproduce it here
# for the two known reducers (cpu_heavy, empty)
echo "--- Step 7: Compile ABI shim ---"
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

# Step 8: Link
echo "--- Step 8: wasm-ld ---"
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
    "$RT_ARCHIVE" \
    -o "$MODULE_DIR/bench_perry_lto.wasm"

echo ""
echo "=== Build complete ==="
echo "  Standard: $TMP_DIR/bench_standard.wasm ($(du -h "$TMP_DIR/bench_standard.wasm" | cut -f1))"
echo "  LTO:      $MODULE_DIR/bench_perry_lto.wasm ($(du -h "$MODULE_DIR/bench_perry_lto.wasm" | cut -f1))"

# Validate
if command -v wasm-tools &>/dev/null; then
    wasm-tools validate "$MODULE_DIR/bench_perry_lto.wasm" && echo "  wasm-tools validate: PASS"
fi

# Show hot loop
echo ""
echo "--- Hot loop check (should have NO 'call' instructions) ---"
wasm-tools print "$MODULE_DIR/bench_perry_lto.wasm" 2>/dev/null | \
    sed -n '/func \$perry_fn_bench_ts__cpu_heavy/,/^  (func /p' | \
    head -80 | grep -E 'call \$|f64\.add|select' || echo "(grep found no calls -- LTO working)"
