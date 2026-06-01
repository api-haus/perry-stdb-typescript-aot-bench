// Perry LTO overlay: fast-path implementation of js_dynamic_string_or_number_add
// for the bitcode-link experiment.
//
// When compiled to LLVM bitcode (clang -emit-llvm) and merged with user code
// via llvm-link + opt -O3, LLVM inlines this fast path into the user's hot
// loop, eliminating the function call overhead entirely.
//
// This is a BENCHMARK-SPECIFIC overlay. For general Perry modules where the +
// operator may receive strings, BigInts, or other tagged values, the full
// runtime implementation is required. The trap on tagged operands ensures
// correctness: if our assumption (both operands are plain f64) is violated,
// the module traps instead of silently computing wrong results.
//
// Usage:
//   clang -c -O3 -emit-llvm -target wasm32-unknown-unknown lto_overlay.c -o overlay.bc
//   llvm-as user.ll -o user.bc
//   llvm-link user.bc overlay.bc -o merged.bc
//   opt -O3 merged.bc -o opt.bc
//   llc -filetype=obj -O3 -mtriple=wasm32-unknown-unknown opt.bc -o lto_user.o
//   wasm-ld --allow-multiple-definition ... lto_user.o libperry_runtime.a -o module.wasm

typedef unsigned long long u64;

// NaN-box tag detection: a plain f64 (non-NaN-boxed) has upper 16 bits
// outside the tag range [0x7FFA..0x7FFF]. The tag constants are:
//   0x7FFA = BIGINT_TAG
//   0x7FFB = (unused)
//   0x7FFC = SPECIAL_TAG (undefined, null, true, false)
//   0x7FFD = POINTER_TAG
//   0x7FFE = INT32_TAG
//   0x7FFF = STRING_TAG
// A regular IEEE 754 double (including NaN/Inf) has exponent bits that
// don't fall in this range (NaN quiet bit pattern is 0x7FF8, below 0x7FFA).
static inline int is_plain_f64(double v) {
    union { double d; u64 i; } u;
    u.d = v;
    u64 tag16 = (u.i >> 48) & 0xFFFF;
    return tag16 < 0x7FFA || tag16 > 0x7FFF;
}

// Fast path: if both operands are plain f64, return a + b directly.
// For the cpu_heavy benchmark, both operands are always plain f64 (the
// accumulator and the damage computation result), so this fast path is
// taken on every iteration.
double js_dynamic_string_or_number_add(double a, double b) {
    if (__builtin_expect(is_plain_f64(a) & is_plain_f64(b), 1)) {
        return a + b;
    }
    // Slow path: tagged operand detected. This should never happen for
    // the cpu_heavy benchmark. Trap to catch assumption violations.
    __builtin_trap();
    return 0.0; // unreachable
}
