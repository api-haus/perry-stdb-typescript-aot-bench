# 16 — Perry wasm32 runtime archive + first bench numbers

**Date:** 2026-06-01
**Branch:** `feat/target-spacetimedb` (perry-fork)
**Base:** HEAD `fd9d7e3a` (dispatch commit)

## Investigation

### Actual wasm32 build errors at HEAD (v0.5.1028 base)

Doc 05 characterized 14 errors in 4 files on an earlier `main`-based branch. At current HEAD on `feat/target-spacetimedb` (which already carries the `4a258ab7` measurement commit with getrandom/dlmalloc/GC-scanner-gate fixes), the actual residual is:

**8 errors in 3 files** (pre-fix):
1. `child_process.rs:340` — `output` undefined on wasm32 (unix/windows cfg gate leaves no fallback)
2. `fs/mod.rs:1402` — `js_fs_symlink_sync` returns `()` on wasm32 (unix/windows symlink arms, no fallback)
3. `geisterhand_registry.rs:538,560,588` — 6x `libc::free` / `libc::c_void` (libc unavailable on wasm32)

After fixing those 8, a second layer of **6 `usize` overflow errors** surfaced (doc 05 mentioned these as already fixed on the measurement branch, but they were NOT on `feat/target-spacetimedb`):
- `array/push_pop.rs:81` — `0x200_0000_0000` literal in platform cfg fallback
- `box.rs:90,181` — `0x0001_0000_0000_0000` address upper-bound checks
- `builtins/formatting.rs:1460` — `0x8000_0000_0000` range literal
- `value/dynamic_object.rs:79,80` — `0x200_0000_0000` and `0x8000_0000_0000` heap bounds

### Resolution approach

All 14 errors (8 + 6) fixed with minimal cfg-gates — no module-level amputation needed:
- child_process: early return on wasm32 before the `match output`
- fs symlink: `#[cfg(target_arch = "wasm32")]` arm returning 0
- geisterhand: `platform_free()` helper that cfg-gates `libc::free` vs no-op
- usize overflows: added `target_arch = "wasm32"` to platform lists that select 32-bit-safe constants, or introduced cfg-split named constants

Result: `cargo build -p perry-runtime --target wasm32-unknown-unknown --no-default-features --release` succeeds, producing a 32MB `libperry_runtime.a` at `target/wasm32-unknown-unknown/release/`.

### Additional link-time issues discovered and resolved

1. **`setjmp`/`longjmp` undefined** — the runtime archive (when linked) pulls panic machinery from the regex crate that references these libc functions. Fixed by adding minimal stubs to the ABI shim C source (`setjmp` returns 0, `longjmp` traps — these are never called in a `panic=abort` build but must be defined to satisfy the linker).

2. **Signature mismatch for void functions** — the shim declared all dispatch targets as `extern long long fn(void)` (i64 return), but void-returning functions like `empty` codegen as `() -> f64` in the NaN-box ABI. Fixed by detecting whether the symbol is an `_i64` variant and using `double` return type for non-`_i64` symbols.

3. **BigInt ABI mismatch (unresolved, kernel switched to `number`)** — the `bigint` xorshift kernel compiled and linked, but `wasm-tools print` revealed `signature_mismatch` trap stubs for `js_bigint_from_string` and `js_bigint_cmp`. The runtime defines these with pointer-typed params (`*const u8`, `*const BigIntHeader` — i32 on wasm32), but the codegen calls them with NaN-boxed i64 params. This is a fundamental ABI width mismatch: the codegen was designed for 64-bit native targets where pointers and NaN-boxed values are both 8 bytes. On wasm32, pointers are 4 bytes but the codegen still passes 64-bit NaN-boxed handles. The `number`-typed kernel avoids this entirely because its operations stay in the f64/i32 domain and don't call pointer-typed runtime functions.

### Kernel selection: `number`-typed xorshift, not `bigint`

The doc-14 design chose bigint to stay in M1's proven i64 envelope. However, the proven envelope was `i64.add` on typed params in a single expression — not bigint-literal construction and comparison. The working kernel uses `number` (f64/i32 arithmetic) which avoids:
- The BigInt runtime functions (pointer-typed, ABI mismatch on wasm32)
- String→BigInt parsing (which passes string pointers the codegen NaN-boxes)

The `number` kernel executes: `i32.shl`, `i32.xor`, `i32.shr_s`, `f64.add` — all wasm value ops. The shadow stack (`js_shadow_frame_push`, `js_shadow_slot_bind`, `js_shadow_slot_set`) resolves cleanly from the runtime archive because these functions take i32/i64 params that match the codegen's calling convention.

## Design

### Runtime archive integration

Added `find_wasm32_runtime_archive()` to `spacetimedb.rs` that locates the pre-built `libperry_runtime.a`:
- Check `PERRY_WASM32_RUNTIME` env var first (explicit path)
- Then check `<workspace>/target/wasm32-unknown-unknown/release/libperry_runtime.a`

The archive is added to the `wasm-ld` command AFTER the user objects (so archive members are only pulled to resolve undefined symbols from the user objects). When absent, the link proceeds without it — amputated code (like M1's `add`) links clean; loop-shaped code that needs the runtime gets a clear undefined-symbol error.

### Bench wiring (SpacetimeDB-fork)

Per doc 14 design:
- `CompiledModule::from_prebuilt(name, path)` — stores `host_type = HostType::Wasm` directly, no CLI build
- `TypeScriptPerryEmpty` / `TypeScriptPerryMix` — `ModuleLanguage` impls pointing at pre-built `.wasm` artifacts
- `perry_empty_bench` — narrow entry in `generic.rs` that only calls `empty_transaction` (avoids table reducer panics)
- `perry_cpu_mix_bench` — narrow entry in `special.rs` calling `call_reducer_binary("mix", &[].into())`
- Artifacts at `crates/bench/artifacts/perry/{empty.wasm, numk.wasm}`

### Deviation from doc 14

- **`number` kernel instead of `bigint`** — forced by the wasm32 pointer-width ABI mismatch (see Investigation §3)
- **Reducer name is "mix" not "cpu_mix"** — `reducer_name_from_symbol("perry_fn_numk_ts__mix")` yields "mix" (the TS function name). The bench calls `call_reducer_binary("mix", ...)` to match.
- **No V8 comparison arm for the kernel** — the V8 TS module's table reducers panic (SDK bug: `Cannot read properties of undefined (reading 'insert')`). The first number is Perry vs Rust (native wasm), with V8 empty from doc 11 for the `empty` comparison.

## Decisions & rejected alternatives

- **Link runtime archive unconditionally (chosen) vs only when link fails.** The unconditional approach is simpler — `--gc-sections` removes any unreferenced runtime code, and the archive is only ~32MB static. Rejected: two-pass link (try without, then with) adds complexity for no benefit since GC handles the unused case.
- **`setjmp`/`longjmp` stubs in the ABI shim (chosen) vs stubbing in the runtime's Rust source.** Putting stubs in the C shim keeps the fix localized to the spacetimedb target path. Rejected: modifying the Rust panic handler in the runtime crate would affect all targets.
- **`number`-typed kernel (chosen) vs fixing the BigInt ABI mismatch.** The BigInt ABI fix requires either (a) changing the codegen to not NaN-box pointer arguments on wasm32, or (b) creating wasm32-specific wrapper functions in the runtime that accept i64 and unwrap. Both are substantial. The `number` kernel gives a real first number NOW. Rejected: spending days fixing BigInt ABI when the measurement is available immediately with `number`.
- **Pre-built artifact bypass (chosen) per doc 14.** The Perry `.wasm` files are compiled separately and committed as bench artifacts. The bench loads them via `from_prebuilt` with `host_type = HostType::Wasm` set directly. No CLI changes.
- **Narrowing bench entries (chosen) vs running full bench_suite.** The single-reducer Perry module lacks table/game reducers. The full `bench_suite` calls `insert_bulk_*` which would trigger `reducer_id_by_name` failure → panic. Narrow entries isolate the measurement.

## Assumptions made

- **The `number`-typed kernel's loop body is the AOT-vs-JIT discriminator, same as `bigint` would have been.** The xorshift operations (`<<`, `>>`, `^`, `+`) are the same regardless of type; the difference is the runtime path for the TYPE SYSTEM, not the arithmetic. On V8, `number` xorshift would JIT to similar instructions. This is a valid comparison kernel.
- **The `js_shadow_*` calls in the number kernel are necessary overhead, not an unfair penalty.** Perry's loop codegen emits shadow-stack root tracking for any function with mutable locals. This is part of Perry's AOT cost — it's the real code that runs, not an artifact. V8 has its own GC root tracking overhead.
- **V8 empty = 7.20 µs from doc 11 is still valid for comparison.** Same machine, same SpacetimeDB host version, but different session. The number is within the same ballpark (7.20 vs 6.84 µs difference is within noise of the Rust baseline shift 7.14→7.22 between sessions).

## Implementation log

### perry-fork changes (all in `crates/perry-runtime/src/`)

| File | Change |
|------|--------|
| `child_process.rs:340` | Added `#[cfg(target_arch = "wasm32")] return` + `#[cfg(not(...))]` on the match block |
| `fs/mod.rs:1411-1415` | Added `#[cfg(target_arch = "wasm32")] { 0 }` arm for symlink |
| `geisterhand_registry.rs:6-16` | Added `platform_free()` helper (cfg-gated `libc::free` vs no-op) |
| `geisterhand_registry.rs:538,560,588` | Replaced `libc::free(...)` with `platform_free(ptr)` |
| `array/push_pop.rs:62-82` | Added `target_arch = "wasm32"` to platform cfg lists |
| `box.rs:90,181` | Added cfg-split `ADDR_MAX` constants |
| `builtins/formatting.rs:1460` | Added cfg-split `ADDR_UPPER` constant |
| `value/dynamic_object.rs:60-80` | Added `target_arch = "wasm32"` to platform cfg + `HEAP_MAX` const |

### perry-fork changes (in `crates/perry/src/commands/compile/spacetimedb.rs`)

| Change | Lines |
|--------|-------|
| Added `setjmp`/`longjmp` stubs to `STDB_ABI_SHIM_HEAD` | After `bytes_sink_write` import |
| Added `find_wasm32_runtime_archive()` function | Before `link_spacetimedb_wasm` |
| Added runtime archive to wasm-ld command | In `link_spacetimedb_wasm`, after user objects |
| Fixed dispatch return type: `double` for non-`_i64` symbols | In `format_stdb_abi_shim_c` call_reducer match arm |

### SpacetimeDB-fork changes

| File | Change |
|------|--------|
| `crates/testing/src/modules.rs` | Added `from_prebuilt()`, `perry_artifacts_dir()`, `TypeScriptPerryEmpty`, `TypeScriptPerryMix` |
| `crates/bench/benches/generic.rs` | Added `TypeScriptPerryEmpty` import, `perry_empty_bench()` function, TEMP-PERRY-BENCH narrowing |
| `crates/bench/benches/special.rs` | Added `TypeScriptPerryMix` import, `perry_cpu_mix_bench()` function, TEMP-PERRY-BENCH narrowing |
| `crates/bench/artifacts/perry/empty.wasm` | Perry-compiled empty reducer (4.9 MB) |
| `crates/bench/artifacts/perry/numk.wasm` | Perry-compiled xorshift mix reducer (4.9 MB) |

### Build verification

- `cargo build -p perry-runtime --target wasm32-unknown-unknown --no-default-features --release` — EXIT 0, 32MB archive
- `perry compile empty.ts --target spacetimedb -o empty.wasm` — EXIT 0, 4.9 MB, VALID
- `perry compile numk.ts --target spacetimedb -o numk.wasm` — EXIT 0, 4.9 MB, VALID
- `wasm-tools validate` — both VALID
- `wasm-tools print` imports check — both have ONLY `spacetime_10.0::bytes_sink_write`
- `cargo build -p spacetimedb-bench --bench generic` — EXIT 0
- `cargo build -p spacetimedb-bench --bench special` — EXIT 0
- `cargo bench -p spacetimedb-bench --bench generic -- "typescript-perry"` — ran, produced numbers
- `cargo bench -p spacetimedb-bench --bench special -- "typescript-perry"` — ran, produced numbers

## Captured numbers

### Raw Criterion output

```
stdb_module/typescript-perry/mem/empty
                        time:   [6.5974 µs 6.8381 µs 7.0774 µs]
Found 4 outliers among 100 measurements (4.00%)

stdb_module/typescript-perry/disk/empty
                        time:   [6.5958 µs 6.7987 µs 7.0222 µs]
Found 7 outliers among 100 measurements (7.00%)

special/stdb_module/typescript-perry/cpu_mix
                        time:   [782.45 µs 789.12 µs 796.08 µs]
Found 3 outliers among 100 measurements (3.00%)
```

### Comparison table

| Workload | Perry AOT (µs) | V8 JIT (µs, doc 11) | Rust native (µs) | Perry/V8 | Perry/Rust |
|----------|----------------|---------------------|-------------------|----------|------------|
| `empty` (mem) | 6.84 | 7.20 | 7.22 (this session) | 0.95x | 0.95x |
| `empty` (disk) | 6.80 | — | — | — | — |
| `cpu_mix` (100k iter) | 789.12 | (no V8 number yet) | — | — | — |

### Interpretation

- **Empty reducer:** Perry AOT (6.84 µs) is at parity with both Rust native (7.22 µs) and V8 JIT (7.20 µs). All three are dominated by the host dispatch overhead (~7 µs), so the language runtime contributes negligible cost. This confirms the dispatch mechanism works correctly (the module loads, the reducer runs, the return is handled).
- **CPU kernel (Perry alone):** 789 µs for 100k iterations = **7.89 ns/iteration** for a xorshift loop with shadow-stack overhead. This is the real AOT cost. No V8 comparison yet (the V8 module's table reducers are broken in the current branch, preventing a full V8 run). A V8 comparison kernel run is needed to complete the AOT-vs-JIT measurement.

## Self-review

### V1 — Amputation (import list + link)
**PASS.** Both `empty.wasm` and `numk.wasm` have exactly one import: `spacetime_10.0::bytes_sink_write`. No `js_*` imports. The runtime archive resolved all internal dependencies; `--gc-sections` stripped anything unreachable from exports.

### V2 — Dispatch is real and survived `--gc-sections`
**PASS.** In both modules, `__call_reducer__` directly `call`s the user function (`$perry_fn_empty_ts__empty` / `$perry_fn_numk_ts__mix`). No `signature_mismatch` stubs. The volatile sink (`f64.store offset=8` + `f64.load offset=8` + `drop`) is visible in both disassemblies. The user functions are DEFINED in the module (not GC'd).

### V3 — The body executed (duration + cross-check)
**PASS.** Perry `cpu_mix` = 789 µs, Perry `empty` = 6.84 µs. The kernel loop dominates by 115x — the body executed. (V8 cross-check pending — the V8 module's table reducers panic, blocking a V8 kernel run in this session.)

### V4 — host_type is Wasm
**PASS by construction.** `CompiledModule::from_prebuilt` sets `host_type: HostType::Wasm` directly. `wasm-tools validate` passes (real wasm, first 4 bytes `\0asm`). If it were loaded as Js, the SpacetimeDB host would try to run it through V8 and fail (the module has no JS source).

### V5 — Source parity (apples-to-apples)
**PARTIAL (no V8 kernel yet).** For `empty`: both the Perry and V8 arms measure a void reducer. Apples-to-apples for call overhead. For `cpu_mix`: no V8 arm exists yet (the TS SDK bug prevents running the V8 module). The kernel source (`numk.ts`) is ready for a V8 wrapper once the SDK issue is resolved.

### Items for fresh-eyes review (escalated)

1. **The `number` kernel's shadow-stack overhead.** Every loop iteration calls `js_shadow_slot_bind` + `js_shadow_slot_set`. Verify these aren't adding disproportionate overhead vs what V8's JIT would see for the same code. This is "real Perry cost" but it's worth quantifying whether the shadow stack dominates the 7.89 ns/iter.
2. **The wasm module is 4.9 MB for a trivial function.** `--gc-sections` preserved the entire runtime (because `perry_module_init` → `js_gc_init` → the GC → everything). For the bench this is fine (load time is not measured), but this is a Perry codegen architecture issue: the module init always pulls the full runtime closure.

## Side notes / observations / complaints

- **The wasm32 runtime port was far easier than anticipated.** Doc 05 characterized 14 errors requiring "3-5 days" of shell amputation work. In practice: 14 trivial cfg-gates, 30 minutes of work. The difference: I didn't try to gate MODULES out of `lib.rs` (which triggers the 31-error dispatch-router cascade doc 05 §5 found). I just fixed the individual compile errors in place. The shell modules compile fine for wasm32 once their platform-specific calls are stubbed — they're just dead code that `--gc-sections` removes.
- **The BigInt ABI mismatch is the real remaining wall** for using Perry's "intended" integer type in a compute kernel. The codegen passes NaN-boxed i64 values to runtime functions that expect raw i32 pointers on wasm32. This isn't fixable with a quick stub — it requires either changing the codegen calling convention for wasm32 or adding ABI-shim wrappers in the runtime. For the first number, the `number` kernel sidesteps this entirely.
- **The V8 module's table reducers are broken** (`Cannot read properties of undefined (reading 'insert')`). This is a pre-existing SpacetimeDB SDK TypeScript bug, not something this change introduced. It prevented running V8 vs Perry comparison numbers. The V8 `empty` number from doc 11 (7.20 µs) is usable for comparison since it's the same host/machine.
- **The 4.9 MB module size is concerning for production** but irrelevant for the bench (Wasmtime compiles it once and caches). The size comes from `perry_module_init` referencing `js_gc_init` which pulls the entire GC + runtime through the link closure. A production fix would need the codegen to not emit `perry_module_init` for the spacetimedb target (it's never called — the reactor shape has no `_start`).
- **`setjmp`/`longjmp` in the regex crate** is an unexpected dependency. The regex crate's backtracking engine generates code referencing these for non-local exit in panic paths. In a `panic=abort` build they're never called, but the linker requires definitions. This is a known wasm ecosystem issue — many crates assume a libc-like environment even on `wasm32-unknown-unknown`.
- **The auto-optimize step (native runtime rebuild) still runs on every `perry compile --target spacetimedb`**, spending 30s rebuilding the 47MB native `libperry_runtime.a` + 70MB `libperry_stdlib.a` that are NEVER used by the wasm32 link. This should be gated off for the spacetimedb target.
- **Second run confirms stability:** empty = 7.52 µs (vs 6.84 first), cpu_mix = 834 µs (vs 789 first). Both within ~5-10% run-to-run variation. The relative ordering (empty ~7µs, cpu_mix ~800µs) is stable.
