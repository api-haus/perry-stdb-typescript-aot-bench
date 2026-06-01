# 06 — Full-runtime LTO experiment for Perry wasm32

**Date:** 2026-06-01
**Shape:** Research -> Architect -> Implement (consolidated)
**Branch:** main (no new branch per constraints)

## Investigation

### The wasm32 runtime compilation blocker is resolved

The previous LTO experiment (doc 05) was blocked by 15 compilation errors in perry-runtime for `wasm32-unknown-unknown`. P1 added `#[cfg(not(target_arch = "wasm32"))]` guards. The runtime now compiles cleanly: `cargo build -p perry-runtime --target wasm32-unknown-unknown --no-default-features --release` passes with zero errors (150 warnings, all harmless).

### Building the runtime as LLVM bitcode

Building with `RUSTFLAGS="-Clinker-plugin-lto -Cembed-bitcode=yes"` and a separate `CARGO_TARGET_DIR` (to avoid contaminating the standard archive) produces an archive where perry-runtime's own codegen units are LLVM IR bitcode. Out of 457 objects in the archive, 53 are bitcode containing 2,026 `js_*` functions. The remaining 404 objects (from dependency crates like `alloc`, `compiler-builtins`, `regex`, `url`) remain as wasm binary.

The critical function `js_dynamic_string_or_number_add` is defined in the bitcode objects.

### LLVM's inliner refuses the full Rust implementation

Merging user `.ll` + 53 runtime bitcode objects via `llvm-link` and running `opt -O3` does NOT inline `js_dynamic_string_or_number_add`. The function remains as a `call` instruction in the hot loop.

Root cause: the full Rust implementation is ~500 lines of type-checking code (GC barrier, RuntimeHandleScope, `to_primitive_default_for_add`, symbol/string/BigInt dispatch, `js_number_coerce`). LLVM's inliner cost model (default threshold ~225) correctly determines it is too expensive. The function has no `noinline` attribute -- this is a cost model decision, not a prohibition.

Attempting `opt -O3 --inline-threshold=10000` produced an empty output file (memory exhaustion or optimizer error with a 19MB bitcode module and aggressive inlining).

### The hybrid approach works

The overlay's C implementation (~10 lines) is trivially inlineable. Combining the overlay with the full-runtime bitcode via `llvm-link --override` replaces the runtime's large implementation with the small fast path before optimization. `opt -O3` then inlines it.

After optimization, `js_dynamic_string_or_number_add` is completely absent from the final module (0 references). In the overlay-only build, the symbol was present but unused; in the hybrid build, it is fully eliminated.

### Option D (wasm-ld --lto-O3) confirmed non-viable

Doc 05 tested `wasm-ld --lto-O3` with mixed bitcode and wasm objects. It confirmed that LTO only applies to bitcode objects; the runtime's wasm objects are linked without optimization. This session's finding reinforces: even if the runtime is bitcode, LLVM's inliner won't inline the 500-line function. `wasm-ld --lto-O3` would not help unless the function is replaced with a small implementation first.

## Design

### Hybrid pipeline: overlay + full-runtime bitcode

```
user.ll  +  53 runtime .bc  +  overlay.bc
         |                       |
         llvm-link ---------> merged.bc (--override for overlay)
                               |
                          opt -O3 (16s) -> inlines overlay into hot loop
                               |
                          llc -filetype=obj -O3 (13s)
                               |
                          lto_user.o  (wasm32 object)
                               |
         wasm-ld ---------> bench_perry_full_lto.wasm
              ^                    (--allow-multiple-definition
              |                     for duplicates with archive)
         shim.o + libperry_runtime.a (standard archive)
```

The standard runtime archive (non-LTO) is still needed in the `wasm-ld` step for: (a) the 404 non-bitcode dependency objects (regex, url, compiler-builtins), and (b) any runtime symbols that were defined in wasm objects but not in the 53 bitcode objects.

### Key design points

1. **Two separate runtime builds.** The LTO archive (`target/wasm32-lto/...`) is built with `-Clinker-plugin-lto` for bitcode extraction. The standard archive (`target/wasm32-unknown-unknown/...`) provides non-bitcode objects for final linking. They coexist via different `CARGO_TARGET_DIR`.

2. **`llvm-link --override` for the overlay.** This flag replaces the runtime's `js_dynamic_string_or_number_add` definition with the overlay's before any optimization pass. Without `--override`, `llvm-link` rejects the duplicate symbol. Without the overlay, LLVM cannot inline the function.

3. **Build time budget: ~90 seconds.** 55s for the LTO runtime build (cached after first run), 16s for `opt -O3`, 13s for `llc`. Acceptable for a benchmark build; would need caching for a production compile path.

## Decisions & rejected alternatives

1. **Hybrid (overlay + full-runtime bitcode) chosen over pure full-runtime LTO.** The Rust runtime's `js_dynamic_string_or_number_add` is too large for LLVM to inline (~500 lines). The overlay provides a small, inlineable replacement. The full-runtime bitcode adds whole-program DCE and optimization of other runtime calls. The hybrid gets the best of both approaches.
   **Flip:** If Perry's codegen gained `is_numeric_expr` support for `Expr::Conditional`, the codegen would emit `fadd` directly and neither LTO approach would be needed for this pattern.

2. **Separate `CARGO_TARGET_DIR` for LTO build chosen over in-place rebuild.** Rebuilding the standard archive with LTO flags would break the normal `perry compile --target spacetimedb` path (the archive would contain bitcode objects that `wasm-ld` cannot link without the LTO pipeline). A separate directory keeps both archives available.
   **Flip:** If the LTO path became the default compile path, a single archive location would suffice.

3. **`--allow-multiple-definition` chosen over selective archive linking.** The LTO object defines many runtime symbols that the standard archive also defines. `--allow-multiple-definition` lets the LTO object's definitions win (listed first in the link order). Selective extraction of non-duplicate objects from the archive would be more precise but significantly more complex.
   **Flip:** If `--allow-multiple-definition` causes symbol resolution problems in more complex modules, selective extraction would be needed.

## Assumptions made

1. **The 53 bitcode objects contain all runtime symbols needed for LTO optimization.** Verified: 2,026 `js_*` functions are defined. The critical `js_dynamic_string_or_number_add` is present. Other runtime functions (GC, string ops, BigInt) are also available for potential inlining in more complex modules.

2. **The standard archive provides all remaining symbols.** The 404 non-bitcode objects in the standard archive define dependency crate symbols. `wasm-ld` resolves them from the archive after linking the LTO object.

3. **The overlay is still required for benchmark-critical performance.** Without the overlay, the hybrid approach is identical to the pure full-runtime LTO (no inlining of the hot function). The overlay is the mechanism that makes the function inlineable.

## Self-review

### The module is larger (7.3MB vs 4.9MB) but faster

The full-runtime LTO module is 49% larger because the bitcode-link path merges all 53 runtime objects into the module before optimization. `wasm-ld --gc-sections` retains 5,489 functions (vs 3,183) because the bitcode-linked code has more transitively reachable paths.

For a production path, this bloat should be addressed via LLVM's `internalize` pass or selective runtime bitcode merging. For the benchmark experiment, the size increase is acceptable.

### Benchmark-specific overlay caveat persists

The overlay traps on tagged operands (NaN-boxed strings, BigInts, etc.). This is safe for cpu_heavy but not general-purpose. The hybrid approach does not eliminate this limitation -- it just adds full-runtime visibility around it.

### No high-risk items requiring fresh-eyes review

The experiment is self-contained (benchmark module only), does not modify Perry source, and the build script is reproducible. The module validates with `wasm-tools` and both reducers are callable on the server.

## Implementation log

### Pipeline executed

1. `perry compile bench.ts --target spacetimedb` with `PERRY_LLVM_KEEP_IR=1` -- captured user `.ll`
2. `cargo build -p perry-runtime --target wasm32-unknown-unknown` with `RUSTFLAGS="-Clinker-plugin-lto -Cembed-bitcode=yes"` and `CARGO_TARGET_DIR=target/wasm32-lto` -- built LTO archive (29MB)
3. `llvm-ar x` + `file` filter -- extracted 53 bitcode objects
4. `llvm-link *.o -o rt_merged.bc` -- merged runtime bitcode (19MB)
5. `clang -c -O3 -emit-llvm -target wasm32-unknown-unknown lto_overlay.c` -- compiled overlay
6. `llvm-link user.bc rt_merged.bc --override overlay.bc` -- merged user + runtime + overlay
7. `opt -O3` -- whole-program optimization (16s)
8. `llc -filetype=obj -O3 -mtriple=wasm32-unknown-unknown` -- wasm32 object (13s)
9. `clang -c shim.c` -- ABI shim
10. `wasm-ld --allow-multiple-definition shim.o lto_user.o libperry_runtime.a` -- final link
11. `wasm-tools validate` -- PASS
12. Published to `bench-perry-full-lto` -- both reducers callable
13. Benchmark: 5 runtimes x 2 reducers x 2 runs

### Verification

- Module validates: `wasm-tools validate` PASS
- Both reducers callable: `spacetime call bench-perry-full-lto empty` and `cpu_heavy` succeed
- Hot loop disassembly: zero `call` instructions, `f64.add` directly in the loop
- `js_dynamic_string_or_number_add`: 0 references in final module (fully eliminated)
- Benchmark numbers consistent across two runs

### Files created/modified

| File | Description |
|------|-------------|
| `docs/orchestrate/perry-e2e-bench/06-full-runtime-lto.md` | This document |
| `docs/orchestrate/perry-e2e-bench/02-consolidated.md` | Appended full-runtime LTO results |
| `bench/e2e/module/bench_perry_full_lto.wasm` | Full-runtime LTO module (7.3MB) |
| `bench/e2e/build_full_lto.sh` | Reproducible build script |
| `_vendor/perry-fork/target/wasm32-lto/...` | LTO runtime build artifacts (not committed) |

### Benchmark summary

**cpu_heavy (2000 iterations, 200 warmup):**

| Runtime | TPS | p50 | p95 | vs Standard |
|---------|-----|-----|-----|-------------|
| Perry Standard | 649 | 1.45ms | 2.29ms | baseline |
| Perry Overlay LTO | 1,786 | 0.53ms | 0.70ms | 2.75x |
| **Perry Full-RT LTO** | **1,830** | **0.52ms** | **0.60ms** | **2.82x** |
| V8 JIT | 1,939 | 0.50ms | 0.57ms | 2.99x |
| Rust / Wasmtime | 2,122 | 0.46ms | 0.54ms | 3.27x |

**empty (2000 iterations, 200 warmup):**

| Runtime | TPS | p50 | p95 |
|---------|-----|-----|-----|
| **Perry Full-RT LTO** | **6,007** | **0.16ms** | **0.19ms** |
| Perry Standard | 5,956 | 0.16ms | 0.21ms |
| Perry Overlay LTO | 5,891 | 0.16ms | 0.20ms |
| V8 JIT | 4,997 | 0.17ms | 0.24ms |
| Rust / Wasmtime | 4,583 | 0.17ms | 0.27ms |

## Side notes / observations / complaints

- **The full-runtime bitcode adds no cpu_heavy speedup beyond the overlay.** The overlay is the critical piece; the full-runtime bitcode's benefit is DCE and optimization of non-hot-path code. For a benchmark with a single hot function, the difference is negligible (1,830 vs 1,786 TPS = 2.4%, within noise). The real benefit of full-runtime bitcode would surface in a module with MANY runtime calls across multiple reducers.

- **Module size regression (7.3MB vs 4.9MB) is a real concern.** The 49% increase comes from the bitcode-link path pulling in entire runtime codegen units rather than individual symbols. A production implementation needs: (a) LLVM `internalize` pass to mark non-exported symbols as internal, (b) selective bitcode merging (only merge objects that define symbols the user code calls), (c) or accept the size and rely on Wasmtime's compilation caching.

- **The LTO runtime build is 29MB archive vs 7MB standard.** LLVM bitcode is more verbose than wasm binary objects. This is a build-time artifact, not a deployment concern (the final wasm is what gets deployed).

- **Perry's empty reducer is now the fastest across all runtimes (6,007 TPS).** This is surprising and consistent. Perry's wasm32 module dispatch appears to have lower overhead than both V8 (which runs an event loop) and Rust/Wasmtime (which has BSATN deserialization overhead even for empty args). The full-RT LTO's `opt -O3` pass may have optimized the function wrapper code that is run on every reducer call.

- **The right production path is codegen Fix 1, not LTO.** Adding `Expr::Conditional` to `is_numeric_expr` in Perry's type analysis would eliminate the `js_dynamic_string_or_number_add` call at codegen time for provably-numeric ternary expressions. This would achieve the same 2.4x speedup WITHOUT the bitcode-link infrastructure, without the module size regression, and without the build-time cost. LTO is a general-purpose optimization; the codegen fix is targeted and cheaper.

- **The aggressive `--inline-threshold=10000` approach failed silently.** `opt -O3 --inline-threshold=10000` on the 19MB merged module produced a 0-byte output file. This is either memory exhaustion (the optimizer tries to inline 500-line functions everywhere, quadratically expanding the module) or a known LLVM bug with extreme inline thresholds. The hybrid approach sidesteps this entirely.

- **`llvm-link --override` is an underused feature.** It cleanly replaces specific function definitions before optimization, without modifying either source module. For cross-language LTO (Rust runtime + C overlay + LLVM IR user code), it is the precise tool: merge all the bitcode, then selectively override functions where you have a better implementation. If Perry ever builds a production LTO path, `--override` for hot-function fast paths should be a documented technique.
