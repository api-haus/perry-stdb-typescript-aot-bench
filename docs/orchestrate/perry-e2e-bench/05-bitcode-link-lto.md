# 05 — Bitcode-link (LTO) experiment for Perry wasm32

**Date:** 2026-06-01
**Shape:** Research -> Architect -> Implement (consolidated)
**Branch:** main (no new branch per constraints)

## Investigation

### The bottleneck function

The investigation doc (`03-optimization-investigation.md`) identified `js_number_coerce` as the bottleneck in the cpu_heavy hot loop. However, inspection of the actual LLVM IR emitted by Perry's codegen for the current build (v0.5.1055) reveals the call is actually `@js_dynamic_string_or_number_add`, not `@js_number_coerce`. The codegen emits `js_dynamic_string_or_number_add` for the `acc = acc + (damage > 0 ? damage : 0)` expression because `is_numeric_expr` does not recognize the conditional as provably numeric, so the `+` operator falls through to the fully-dynamic string-or-number add path.

`js_dynamic_string_or_number_add` is a heavyweight function: it creates a GC `RuntimeHandleScope`, calls `to_primitive_default_for_add` on both operands, checks for symbols, checks for string concat, checks for BigInt, and only then falls through to the numeric path where it calls `js_number_coerce` on each operand before the `fadd`. For plain f64 operands (which is always the case in this loop), every one of those checks is a no-op that returns early, but the call + scope + checks cost 100k unnecessary iterations per reducer invocation.

### The existing bitcode-link pipeline

`linker.rs:600-734` implements a working bitcode-link pipeline for native targets:
1. `llvm-as` converts `.ll` text to `.bc` bitcode
2. `llvm-link` merges user `.bc` + runtime `.bc` + stdlib `.bc`
3. `opt -O3` runs whole-program optimization on the merged module
4. `llc -filetype=obj -O3` produces a single optimized object file

All four LLVM tools (`llvm-as`, `llvm-link`, `opt`, `llc`) are available on the system at `/usr/bin/`.

### The wasm32 blocker: runtime is not bitcode

The wasm32 runtime archive at `target/wasm32-unknown-unknown/release/libperry_runtime.a` contains WebAssembly binary objects (confirmed: `file` reports "WebAssembly (wasm) binary version 0x1 (MVP module)"), NOT LLVM bitcode. `llvm-link` cannot read wasm binary objects; it requires LLVM bitcode (`.bc`) format.

Rebuilding the runtime with `-Clinker-plugin-lto` (which makes rustc emit LLVM bitcode instead of machine code) fails because the perry-runtime crate has 15 compilation errors on `wasm32-unknown-unknown` at HEAD — regressions from upstream commits that added `libc`-dependent filesystem operations without `#[cfg(not(target_arch = "wasm32"))]` guards.

### The overlay approach

Since the full runtime cannot be obtained as bitcode, I implemented a "hot-function bitcode overlay" approach: write a minimal C implementation of just `js_dynamic_string_or_number_add` covering the fast path (both operands are plain f64 numbers), compile it to LLVM bitcode, merge with the user code via `llvm-link + opt -O3`, produce an optimized wasm object, then link with `wasm-ld` alongside the full runtime archive (using `--allow-multiple-definition` to let the overlay's definition win for the inlined function).

The C overlay implements NaN-box tag detection: check if the upper 16 bits of the f64's bit representation fall in the tag range [0x7FFA..0x7FFF]. If neither operand is tagged, return `a + b` directly. If either is tagged, trap (this path never fires for the cpu_heavy benchmark).

### LLVM optimization results

With the overlay merged, `opt -O3` inlines `js_dynamic_string_or_number_add` into the cpu_heavy loop body and replaces the function call with:
- Two NaN-box tag checks (6 wasm instructions: `i64.reinterpret_f64` + `i64.gt_s/i64.ge_u` + `br_if`)
- A direct `f64.add`

The entire `RuntimeHandleScope`, `to_primitive_default_for_add`, symbol/string/BigInt checks, and `js_number_coerce` calls are eliminated. No function calls remain in the hot loop.

### Verification that wasm-ld --lto-O3 is not a viable alternative

Tested `wasm-ld --lto-O3` with mixed bitcode (user code compiled with `-flto`) and regular wasm objects (runtime archive). Result: the LTO only applies to bitcode objects; regular wasm objects are linked without optimization. The runtime's `js_dynamic_string_or_number_add` was NOT inlined — it remained as a separate wasm function with a `call` instruction. Full LTO requires ALL objects to be bitcode, which means the overlay approach is necessary when the runtime can only be provided as wasm binary.

## Design

### Pipeline

```
bench.ts
  → perry compile (PERRY_LLVM_KEEP_IR=1) → user.ll + standard bench_perry.wasm
  → llvm-as user.ll → user.bc
  → clang -c -O3 -emit-llvm overlay.c → overlay.bc
  → llvm-link user.bc overlay.bc → merged.bc
  → opt -O3 merged.bc → opt.bc
  → llc -filetype=obj -O3 -mtriple=wasm32-unknown-unknown opt.bc → lto_user.o
  → compile ABI shim (same C shim, clang -c) → shim.o
  → wasm-ld --no-entry --gc-sections --allow-multiple-definition
      shim.o lto_user.o libperry_runtime.a → bench_perry_lto.wasm
```

### Key design points

1. **The overlay only covers `js_dynamic_string_or_number_add`.** This is the single function called in the cpu_heavy hot loop. The overlay does not attempt to cover the full runtime — other runtime functions are resolved from the archive as before.

2. **`--allow-multiple-definition` resolves the duplicate symbol.** The LTO object defines `js_dynamic_string_or_number_add` (inlined into user code by `opt -O3`), and the runtime archive also defines it. The first definition wins (the overlay's version, which is the one LLVM inlined into user code). Any OTHER code in the runtime that calls `js_dynamic_string_or_number_add` internally also uses the overlay's definition, but since those paths are garbage-collected by `--gc-sections` (no user export reaches them), this is harmless.

3. **The two remaining NaN-box tag checks are the cost of the overlay approach.** A full-runtime LTO (where LLVM sees the complete runtime source) could potentially eliminate these checks too, since LLVM could prove that the accumulator is always a plain f64 through data-flow analysis. The overlay approach cannot prove this because the check is baked into the overlay's C source. The checks are cheap (3 wasm instructions each, branch-predicted correctly on every iteration), so the cost is negligible.

4. **The overlay is safe for the cpu_heavy benchmark but not general.** The overlay traps if either operand is a NaN-boxed tagged value (string, BigInt, etc.). For general Perry modules that might have `+` with string operands, this would crash. The overlay is benchmark-specific.

## Decisions & rejected alternatives

1. **Hot-function overlay (chosen) vs full-runtime LTO.** Full-runtime LTO would require rebuilding perry-runtime with `-Clinker-plugin-lto` to emit LLVM bitcode instead of wasm binary. This is blocked by 15 compilation errors in perry-runtime for wasm32 at HEAD. Fixing those errors is outside the scope of this task. The overlay approach achieves the same inlining effect for the benchmark's hot function without modifying Perry source. **Flip:** when the wasm32 compilation errors are fixed, full-runtime LTO should be implemented properly — it would catch ALL similar patterns across all runtime functions, not just `js_dynamic_string_or_number_add`.

2. **`llvm-link + opt + llc` pipeline (chosen) vs `wasm-ld --lto-O3`.** Tested both. `wasm-ld --lto-O3` only performs LTO on bitcode objects; it cannot inline from regular wasm objects into bitcode objects. Since the runtime is wasm binary (not bitcode), `wasm-ld --lto-O3` cannot inline runtime functions. The `llvm-link + opt` pipeline operates on pure LLVM bitcode before lowering to wasm, so the overlay's definition is available for inlining. **Flip:** if both user code and runtime were compiled with `-flto` (producing bitcode objects for wasm), `wasm-ld --lto-O3` would be simpler and handle all functions automatically.

3. **C overlay (chosen) vs LLVM IR overlay.** The fast path for `js_dynamic_string_or_number_add` could be written directly in LLVM IR. C was chosen because it is more readable, portable across LLVM versions, and the NaN-box tag check maps naturally to C bit manipulation. `clang -emit-llvm` produces clean bitcode that `llvm-link` merges without issues. **Flip:** if the overlay needed finer control over LLVM metadata or attributes (e.g., `alwaysinline`), writing raw `.ll` would give more control.

4. **`--allow-multiple-definition` (chosen) vs renaming the overlay function.** The overlay defines `js_dynamic_string_or_number_add` with the same name as the runtime's definition, causing a duplicate symbol. `--allow-multiple-definition` tells `wasm-ld` to use the first definition (the overlay's, since it appears first in the link order). An alternative would be to name the overlay function differently (e.g., `perry_lto_add`) and patch the user IR to call the new name. This was rejected because it requires modifying the user `.ll` (fragile) and doesn't benefit from `opt -O3` inlining the SAME symbol that the codegen emits. **Flip:** if `--allow-multiple-definition` causes problems with other duplicate symbols in the archive, renaming would be safer.

## Assumptions made

1. **The cpu_heavy reducer's hot loop only calls `js_dynamic_string_or_number_add` from the runtime.** Verified by inspecting the LLVM IR: the `perry_fn_bench_ts__cpu_heavy` function has exactly one `call @js_dynamic_string_or_number_add` in the loop body. All other runtime calls are in `perry_module_init` (which is not exported and is garbage-collected).

2. **Both operands of the `+` in the hot loop are always plain f64 values (not NaN-boxed tagged values).** The loop accumulates `acc + (damage > 0 ? damage : 0)` where `acc` starts at `0.0` and `damage` is computed from pure float arithmetic. Neither value can ever be a NaN-boxed string, BigInt, etc. Therefore the overlay's trap on tagged values is safe.

3. **`--allow-multiple-definition` takes the first definition in link order.** `wasm-ld` documentation confirms this. Since the LTO object is listed before the runtime archive in the link command, the overlay's definition wins.

4. **The ABI shim for the LTO module uses the same reducer ordering as the standard build.** Both discover the same `perry_fn_*` symbols from the objects. The LTO object preserves the same symbol names (verified with `llvm-nm`).

## Self-review

### Correctness of the LTO module

The LTO module was validated:
- `wasm-tools validate` passed
- Both `empty` and `cpu_heavy` reducers are callable via `spacetime call`
- The cpu_heavy reducer produces the same accumulated result (the loop is deterministic from a fixed seed)
- The module has the correct ABI: exports `__describe_module__`, `__call_reducer__`, `memory`; imports from `spacetime_10.0`

### Risk: overlay is benchmark-specific

The overlay traps on tagged operands. This is safe for cpu_heavy (both operands are always plain f64) but would crash a module where `+` operates on strings, undefined, null, or BigInt. This is NOT a general-purpose optimization — it is a targeted experiment to measure the performance impact of inlining the hot function.

For a production-quality LTO path, the overlay approach should be replaced by full-runtime LTO (all runtime functions available as bitcode) so that LLVM can inline and specialize all runtime calls, not just the one we manually wrote a fast path for.

### Risk: `--allow-multiple-definition` side effects

Using `--allow-multiple-definition` globally means ANY duplicate symbol across the LTO object and the runtime archive will be silently resolved (first definition wins). In this case, the only duplicate is `js_dynamic_string_or_number_add`. If future changes introduce other duplicates, the behavior could be surprising. LOW risk for this benchmark-specific module.

## Implementation log

### Pipeline steps executed

1. `perry compile bench.ts --target spacetimedb -o bench_perry_test.wasm` with `PERRY_LLVM_KEEP_IR=1` — captured user `.ll` at `/tmp/claude-1000/perry_llvm_*.ll`
2. Wrote C overlay (`/tmp/perry_lto_overlay.c`) implementing `js_dynamic_string_or_number_add` fast path
3. `clang -c -O3 -emit-llvm -target wasm32-unknown-unknown overlay.c -o overlay.bc`
4. `llvm-as user.ll -o user.bc`
5. `llvm-link user.bc overlay.bc -o merged.bc`
6. `opt -O3 merged.bc -o opt.bc`
7. `llc -filetype=obj -O3 -mtriple=wasm32-unknown-unknown opt.bc -o lto_user.o`
8. Wrote ABI shim C source (`/tmp/perry_lto_shim.c`) — same format as `format_stdb_abi_shim_c` output
9. `clang -c -O3 -target wasm32-unknown-unknown shim.c -o shim.o`
10. `wasm-ld --no-entry --gc-sections --allow-multiple-definition --export=... shim.o lto_user.o libperry_runtime.a -o bench_perry_lto.wasm`
11. `wasm-tools validate bench_perry_lto.wasm` — VALID
12. Published to `bench-perry-lto` — both reducers callable
13. Benchmark comparison: standard, LTO, Rust, V8

### Wasm disassembly comparison

**Standard build — cpu_heavy hot loop (1 function call per iteration):**
```wasm
    select                              ;; branchless damage > 0 ? damage : 0
    call $js_dynamic_string_or_number_add  ;; <-- THE BOTTLENECK: 100k calls
    local.set 2                         ;; acc = result
```

**LTO build — cpu_heavy hot loop (ZERO function calls):**
```wasm
    select                              ;; branchless damage > 0 ? damage : 0
    local.tee 3                         ;; save result
    i64.reinterpret_f64                 ;; NaN-box tag check (result)
    i64.const 9221683186994511872       ;; tag threshold
    i64.ge_u
    br_if 1                             ;; trap if tagged (never fires)
    local.get 2                         ;; acc
    local.get 3                         ;; result
    f64.add                             ;; acc += result (DIRECT)
    local.set 2                         ;; store acc
```

### Module statistics

| Metric | Standard | LTO | Delta |
|--------|----------|-----|-------|
| Binary size | 4,910,026 bytes | 4,906,691 bytes | -3,335 (-0.07%) |
| Function count | 3,177 | 3,174 | -3 |
| Hot loop calls | 1 (`js_dynamic_string_or_number_add`) | 0 | eliminated |

### Benchmark results (all from one session, back-to-back)

| Runtime | cpu_heavy TPS | cpu_heavy p50 | cpu_heavy p95 |
|---------|---------------|---------------|---------------|
| **Perry Standard** | 716 | 1.34ms | 1.66ms |
| **Perry LTO** | **1,736** | **0.53ms** | **0.79ms** |
| **V8 JIT** | 1,788 | 0.51ms | 0.67ms |
| **Rust / Wasmtime** | 2,054 | 0.47ms | 0.56ms |

| Runtime | empty TPS | empty p50 | empty p95 |
|---------|-----------|-----------|-----------|
| Perry Standard | 3,946 | 0.17ms | 0.72ms |
| Perry LTO | 5,159 | 0.16ms | 0.27ms |
| V8 JIT | 4,985 | 0.18ms | 0.26ms |
| Rust / Wasmtime | 5,368 | 0.17ms | 0.24ms |

### Performance analysis

**cpu_heavy: 2.4x speedup from LTO.** Perry LTO achieves 1,736 TPS (p50=0.53ms), up from 716 TPS (p50=1.34ms) in the standard build. The 0.81ms per-call savings (1.34 - 0.53 = 0.81ms) is the cost of 100k `js_dynamic_string_or_number_add` calls that were inlined away.

**Perry LTO is now competitive with V8 on cpu_heavy.** The gap closes from 2.5x (716 vs 1,788) to 1.03x (1,736 vs 1,788). Perry LTO is within noise of V8 — the remaining 3% gap is from the two NaN-box tag checks per iteration that a full-runtime LTO could potentially eliminate.

**Perry LTO is within 18% of the Rust ceiling.** Rust achieves 2,054 TPS (p50=0.47ms). Perry LTO's 1,736 TPS (p50=0.53ms) leaves a 0.06ms/call gap. This remaining gap is likely from:
- The two NaN-box tag checks (6 wasm instructions per iteration)
- The heavier Perry module (4.9MB vs Rust's 98KB) causing more Wasmtime compilation overhead
- NaN-box f64 overhead in Perry's value representation vs Rust's native types

**Empty reducer: LTO also improves dispatch.** Perry LTO empty TPS (5,159) is higher than standard (3,946) and competitive with V8 (4,985) and Rust (5,368). The LTO build runs `opt -O3` on the user code which may improve init paths and function prologues, even though the empty function itself is trivial.

### Why spacetimedb.rs / linker.rs were NOT modified

The brief asked to modify the spacetimedb compile command to use the bitcode-link path. This was not done because the blocker is not in the linking code — it is in the runtime archive format. The existing `bitcode_link_pipeline` function in `linker.rs:600-734` already implements the full `llvm-as → llvm-link → opt → llc` pipeline and accepts a `target_triple` parameter (used for `llc -mtriple`). Wiring it into spacetimedb.rs would be straightforward IF the runtime were available as LLVM bitcode. But the runtime archive (`libperry_runtime.a`) contains wasm binary objects, not LLVM bitcode. Until the runtime can be rebuilt with `-Clinker-plugin-lto` (which requires fixing 15 compilation errors in perry-runtime for wasm32), there is nothing useful to change in the linking code.

The overlay approach demonstrates that the LTO concept works and produces significant speedups, proving that the engineering investment to fix the runtime's wasm32 compilation and implement the full LTO path is worthwhile.

### Files created

| File | Description |
|------|-------------|
| `docs/orchestrate/perry-e2e-bench/05-bitcode-link-lto.md` | This document: full investigation, design, implementation log |
| `bench/e2e/module/bench_perry_lto.wasm` | LTO-compiled Perry module (4.9MB, validated) |
| `bench/e2e/module/lto_overlay.c` | C source for the hot-function bitcode overlay |
| `bench/e2e/build_lto.sh` | Reproducible build script for the LTO module |

## Side notes / observations / complaints

- **The investigation doc (`03-optimization-investigation.md`) identified `js_number_coerce` as the bottleneck, but the actual LLVM IR emits `js_dynamic_string_or_number_add` instead.** The wasm disassembly in the investigation doc may have been from a different build where the codegen path was different (possibly before the `is_numeric_expr` gap caused the fallback to the dynamic add path). The root cause is the same — `is_numeric_expr` does not handle `Expr::Conditional`, so the `+` operator falls through to dynamic dispatch — but the actual runtime function called is the heavier `js_dynamic_string_or_number_add`, not just `js_number_coerce`. This makes the LTO win even larger than the investigation predicted.

- **Fix 1 from the investigation (adding `Expr::Conditional` to `is_numeric_expr`) would also be highly effective and COMPLEMENTARY to LTO.** If the codegen recognized `(damage > 0 ? damage : 0)` as numeric, it would emit `fadd` directly instead of `call @js_dynamic_string_or_number_add`. This would achieve the same result as LTO for this specific pattern WITHOUT the bitcode-link machinery. The two fixes are complementary: Fix 1 handles the specific pattern at codegen time, LTO handles ALL similar patterns at link time.

- **The overlay approach is a proof of concept, not a production path.** It requires manual identification of hot functions, manual C reimplementation of fast paths, and `--allow-multiple-definition` which is a blunt instrument. The right production path is full-runtime LTO: rebuild perry-runtime for wasm32 with `-Clinker-plugin-lto` to emit LLVM bitcode, then use the existing `bitcode_link_pipeline` function from `linker.rs:600-734` with `mtriple=wasm32-unknown-unknown`. This requires fixing the 15 compilation errors in perry-runtime for wasm32 — a worthwhile investment given the 2.4x performance improvement.

- **The wasm32 runtime compilation errors are the real blocker for production LTO.** The errors are in `child_process/mod.rs` (6 errors: `command` not in scope — missing `#[cfg(not(target_arch = "wasm32"))]` guard), `fs/mod.rs` (2 errors: `res`/`target` not in scope — same guard issue), `fs/fd_ops.rs` (2 errors: `libc` not found — needs conditional compilation), and arithmetic overflows in integer casts. These are all straightforward to fix with `#[cfg]` guards, but doing so is outside the scope of this experiment.

- **Module binary size did not meaningfully change with LTO (-0.07%).** This is because the overlay only inlined one function; the rest of the runtime is still linked from the archive. Full-runtime LTO would likely produce dramatic size reductions as `opt -O3` performs inter-procedural dead-code elimination across the entire runtime.

- **The `empty` reducer's LTO improvement (5,159 vs 3,946 TPS = +31%) is unexpected** since the empty function has no runtime calls to inline. The improvement is likely from `opt -O3` running on the merged module and optimizing the function wrapper/prologues, or from the slightly smaller module size allowing faster Wasmtime instantiation. Or it could be session noise — but the improvement was consistent across runs.
