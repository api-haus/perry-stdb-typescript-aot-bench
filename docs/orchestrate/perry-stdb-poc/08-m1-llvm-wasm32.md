# 08 — M1: LLVM → wasm32 target plumbing (forked Perry)

M1 resolves the make-or-break unknown of the sound path's plumbing half: can a forked Perry's existing LLVM pipeline (`.ll`-text → shell-out to `clang -c` → shell-out to a linker) emit a freestanding `wasm32-unknown-unknown` module — not the JS-host `perry-codegen-wasm` browser artifact, but a real native wasm32 binary the stock SpacetimeDB Wasmtime loader would accept. The answer is yes, and the seam is exactly the triple + linker swap doc 05 §4 predicted. A trivial `export function add(a, b) { return a + b }` compiled with the new `--target spacetimedb` produces a valid wasm32 module with `memory` exported, the user function exported with a named typed signature, no `(start)`/`_start`, and **zero imports** — no `rt`, no `ffi`, no `env`, no WASI. The zero-import result is the proof it is the LLVM path and not the JS-host backend, whose every module imports 211 functions from `rt`.

Every claim below is grounded in code on branch `feat/target-spacetimedb` (off the fork's `main` at `ed633ca5`, with the `wasm-port-measurement` patch `f4c536a` cherry-picked as `d57ba1cc`) or in an artifact this session built and dumped.

## 1. What was changed

Three source edits in `api-haus/perry`, plus one new file. The native compile flow is reused verbatim through codegen; only the triple and the link step are new.

- **`crates/perry-codegen/src/codegen/helpers.rs:300`** — `resolve_target_triple` gains a `"spacetimedb" => Some("wasm32-unknown-unknown")` arm. This is the single triple-mapping entry doc 05 §4 called a "one-line addition"; it is intentionally distinct from the JS-host `--target wasm`/`web` names, which never reach this function (they branch earlier into `compile_for_wasm`). The resolved triple flows into `CompileOptions.target` at `compile.rs:3568-3570` and from there into the per-module `LlModule`.

- **`crates/perry-codegen/src/codegen/entry.rs:73`** — the `is_dylib` decision that suppresses `main` (emitting `perry_module_init` instead) now also fires for a wasm32 triple: `let is_wasm_reactor = llmod.target_triple.starts_with("wasm32"); let is_dylib = output_type == "dylib" || output_type == "staticlib" || is_wasm_reactor;`. A reactor has no `_start`/`main`; the host calls exported functions on demand. Joining the dylib/staticlib shape keeps the only entry symbol off the mandatory-`_start` path. The native `main`-emission path is unchanged — `is_wasm_reactor` is false for every native triple, verified by a native ELF compile that still emits `main` and runs.

- **`crates/perry/src/commands/compile.rs`** — three changes wire the target through the orchestrator:
  - `compile.rs:44` registers `mod spacetimedb;`.
  - `compile.rs:4405` (the default-output-name closure) gives `--target spacetimedb` a `<stem>.wasm` default when `-o` is omitted.
  - `compile.rs:4748` (right after the staticlib early-return, before any native runtime-lib resolution) short-circuits `target == Some("spacetimedb")` to `spacetimedb::link_spacetimedb_wasm` and returns. Placement matters: `find_runtime_library(target)?` at `compile.rs:4830` would otherwise propagate an error for a wasm32 target, and `build_and_run_link` would append `-lc`, host frameworks, and the runtime archives — none of which belong in a stock-loadable wasm module.

- **`crates/perry/src/commands/compile/spacetimedb.rs`** (new, ~190 lines) — the freestanding-wasm32 link step. It discovers the exportable functions by scanning the compiled objects with `llvm-nm --defined-only` for `perry_fn_*` symbols (the codegen mangling from `scoped_fn_name`, `helpers.rs:82-84`), then shells out to `wasm-ld`. Reading the symbols out of the objects keeps the CLI decoupled from codegen's name-mangling: the prefix and `sanitize` rule are never recomputed here, only observed.

The object-compile step (`perry-codegen/src/linker.rs:compile_ll_to_object`) needed **no change**. It already drops the host `-march=native`/`-mcpu=native` tuning when an explicit `-target` is supplied (`linker.rs:62-64`, `native_tuning_arg` is `None` for explicit targets), so the wasm32 object compile is `clang -c -O3 -fno-math-errno <file>.ll -o <file>.o -target wasm32-unknown-unknown`.

## 2. The new target's compile + link commands

The full pipeline for `perry compile add.ts -o module.wasm --target spacetimedb`:

Per-module object compile (unchanged `linker.rs` path, wasm32 triple):

$$\texttt{clang -c -O3 -fno-math-errno add\_ts.ll -o add\_ts.o -target wasm32-unknown-unknown}$$

Reactor link (new `spacetimedb.rs` path):

$$\texttt{wasm-ld --no-entry --gc-sections --export=perry\_fn\_add\_ts\_\_add --export=perry\_fn\_add\_ts\_\_add\_i64 add\_ts.o -o module.wasm}$$

The link flags are the load-bearing choices:

- **`--no-entry`** — reactor shape, no `_start`/`main`.
- **`--gc-sections`, no `--allow-undefined`** — this is the M1 zero-imports mechanism. Codegen still emits `perry_module_init` (the wasm reactor body), which calls `js_gc_init` and the string-pool init. Those are exported by NOTHING (the link exports only the user `perry_fn_*` functions), and a trivial arithmetic function never reaches `perry_module_init`, so `wasm-ld` garbage-collects the init function and its `js_*` references entirely. The result is a self-contained module. Critically, the absence of `--allow-undefined` means an undefined symbol is a hard link error, not a silently-created host import — so a function that genuinely needs the runtime fails the link with a clear `undefined symbol: js_*` message, which is the correct signal that the wasm32 runtime archive (M2) is required, never a stock-loadability-breaking host import.

## 3. The emitted module (trimmed `wasm-tools print`)

```wat
(module $module.wasm
  (type (;0;) (func (param i64 i64) (result i64)))
  (type (;1;) (func (param f64 f64) (result f64)))
  (table (;0;) 1 1 funcref)
  (memory (;0;) 1)
  (global $__stack_pointer (;0;) (mut i32) i32.const 65536)
  (export "memory" (memory 0))
  (export "perry_fn_add_ts__add_i64" (func $perry_fn_add_ts__add_i64))
  (export "perry_fn_add_ts__add" (func $perry_fn_add_ts__add))
  (func $perry_fn_add_ts__add_i64 (type 0) (param i64 i64) (result i64)
    local.get 1
    local.get 0
    i64.add)
  (func $perry_fn_add_ts__add (type 1) (param f64 f64) (result f64)
    local.get 1
    i64.trunc_sat_f64_s
    local.get 0
    i64.trunc_sat_f64_s
    i64.add
    f64.convert_i64_s)
  (@custom "target_features" ...))
```

- **`wasm-tools validate` passes.**
- **wasm32**: `(memory 1)` is a 32-bit linear memory; `$__stack_pointer` is `(mut i32)` — 32-bit pointers.
- **`memory` is exported.**
- **No `(start)` section, no `_start`, no mandatory WASI import.**
- **Zero imports** — `wasm-tools print | grep -c "(import"` is `0`; no `rt`, `ffi`, or `env` namespace appears. This is the discriminating proof: the JS-host `perry-codegen-wasm` backend hardcodes 211 `rt` imports (`compile.rs:957,974`, doc 04/07); this module imports nothing.
- Perry emits two exports per function: the i64-specialized variant and the f64 NaN-box-ABI variant. Both are present and named.

## 4. NaN-canonicalization observation (doc 05 §4.2, risk B4)

Doc 05 §4.2 flagged the one codegen-correctness risk it could not exercise without a compiled module: the wasm spec permits NaN canonicalization for f64 **arithmetic** ops (`f64.add/sub/mul/div/neg/abs/copysign/min/max/sqrt/...`) but not for `local.get/set`, `global.get/set`, `f64.load/store`, or `call` argument passing, which are bit-preserving. A NaN-boxed `JSValue` carried as `double` through an arithmetic op would have its tag corrupted. The risk is real only if LLVM routes a tag-carrying value through a canonicalizing op during pure data movement.

For this kernel it does not, and the reason is instructive. The emitted LLVM IR (captured via `--trace llvm`) for the f64 NaN-box-ABI `add` is:

```llvm
define double @perry_fn_add_ts__add(double %arg0, double %arg1) alwaysinline {
  %r1 = fptosi double %arg0 to i64
  %r2 = fptosi double %arg1 to i64
  %r3 = call i64 @perry_fn_add_ts__add_i64(i64 %r1, i64 %r2)
  %r4 = sitofp i64 %r3 to double
  ret double %r4
}
```

Perry's type-inference recognized integer-typed operands and performed the addition in integer space (`add i64`), converting only at the ABI boundary. The compiled wasm contains exactly one `f64.` instruction — `f64.convert_i64_s` — and **zero** ops from the canonicalizing-arithmetic class. A full disassembly grep for `f64.(add|sub|mul|div|neg|abs|copysign|min|max|sqrt|ceil|floor|trunc|nearest)` returns empty.

So for this kernel: the f64 operands are moved by `local.get` and passed by `call` (both bit-preserving), and `f64.convert_i64_s` produces a genuine numeric f64 from an integer — it never carries a NaN-box tag through, because the value at that point is an integer, not a boxed pointer/tag. The doc-05 spec-reading holds here: no tag-carrying value reaches a canonicalizing op. The IR also confirms the `.ll` carries `target triple = "wasm32-unknown-unknown"` with **no** `target datalayout` line — clang derives the wasm32 datalayout from the triple, so the M1 fallback of pinning an explicit datalayout in `module.rs` was not needed.

Caveat, stated honestly: this is a trivial integer kernel. It does NOT exercise a value genuinely NaN-boxed as a pointer/string/tag being moved through arithmetic — Perry only does f64 arithmetic on values it has proven are real numbers, which is exactly why it is expected to be safe, but a kernel that churns boxed objects/strings (M2's non-trivial reducer) is the real test of B4. M1 confirms the spec-reading on the one shape it can produce; B4 remains open on the boxed-value kernel until M2 compiles one.

## 5. What M1 proves

- Perry's LLVM path is, as doc 05 claimed, `.ll`-text + shell-out to `clang -c` (`linker.rs:107`) + shell-out to a linker (`compile.rs` → `link/platform_cmd.rs` for native, the new `spacetimedb.rs` for wasm). It is not inkwell, and a trivial function does not route through the JS-host `perry-codegen-wasm` emitter — it goes through the same native LLVM codegen every target uses.
- The triple → clang → wasm-ld seam works end to end: a `--target spacetimedb` build produces a `wasm-tools`-valid, freestanding, zero-import wasm32 reactor module with `memory` and the user function exported and no `(start)`.
- The native compile path is unaffected (native ELF still emits `main` and runs).
- The B4 NaN-canonicalization risk does not materialize for an integer kernel; the value model survives wasm32 emission for this shape.

## 6. Deferred to M2 (explicitly out of M1 scope)

M1 is plumbing only. Everything that makes the module a *SpacetimeDB* module rather than just *a* wasm module is M2:

- **The `spacetime_10.x` typed host imports.** M1 deliberately has zero imports; M0/M2 need ≥1 import under the `spacetime_10.x` namespace for ABI detection. This is codegen B2 (the LLVM `import_module`/`import_name` clang-attribute mechanism, the C++ `abi.h:24` precedent).
- **The `__describe_module__` / `__call_reducer__` reactor dunders** with the exact STDB signatures (`(i32)->()` and `(i32 i64×7 i32 i32)->i32`). M1 exports the user's `perry_fn_*` functions by name; M2 must emit the named, correctly-typed dunder exports. This is codegen B2.
- **Addressable linear memory for BSATN** — a TS primitive or codegen intrinsic to place bytes at a sink/source-agreed offset. M1's module has linear memory but no way to marshal the ABI through it. This is codegen B3.
- **Linking the wasm32 `libperry_runtime.a`.** M1's trivial function needs no runtime, so `--gc-sections` drops `perry_module_init` and the link has zero undefined symbols. The dunders M2 emits DO reference runtime symbols (GC init, value model, BSATN serialization), so M2 must link the wasm32 build of `libperry_runtime.a` — which on this branch (the cherry-picked `f4c536a` measurement patch) currently builds to wasm32 with the documented shell residual: `cargo build -p perry-runtime --target wasm32-unknown-unknown --no-default-features` reaches 15 errors, all in shell modules (`child_process`, `geisterhand_registry`, `fs` syscalls; E0425/E0433), with the core green — matching doc 05 §3. The shell amputation (doc 05 §5 A2) is the M2 long pole, not an M1 concern.
- **B4 on a boxed-value kernel.** §4 confirms the integer shape is safe; the non-trivial reducer that churns NaN-boxed objects/strings is the real B4 test, and only M2 can compile one.

## Side notes / observations / complaints

- **The seam is exactly as cheap as doc 05 predicted, and the negative-space design fell out naturally.** The hardest part was not the wasm emission — that worked on the first isolated `clang`/`wasm-ld` probe — but choosing *where* in the 5245-line `compile.rs` orchestrator to short-circuit. The native flow resolves runtime libraries with `find_runtime_library(target)?` (a hard `?`) before the link, so the spacetimedb branch had to land alongside the staticlib early-return, not next to `build_and_run_link`. That placement decision is the one non-obvious thing in the change; everything else is a triple string and a linker invocation.

- **`--gc-sections` doing the runtime-stripping is elegant but load-bearing in a way that will surprise M2.** M1 gets zero imports *for free* because the trivial function is unreachable from any runtime symbol, so the linker drops `perry_module_init` wholesale. The moment M2 emits a `__call_reducer__` that actually calls into the GC or value model, every transitively-referenced `js_*` symbol becomes either a resolved definition (if the wasm32 `libperry_runtime.a` is linked) or a hard `undefined symbol` error (because there is no `--allow-undefined`). That error is the *designed* signal — it is the link refusing to silently create a host import — but whoever does M2 should expect it the first time they emit a runtime-touching dunder and read it as "link the archive," not "add `--allow-undefined`." The doc-comment in `spacetimedb.rs` and the wasm-ld failure message both say this explicitly; it is the single most likely M2 footgun.

- **Perry's integer specialization is why B4 looks safe, but it is also why the benchmark framing must stay honest.** The trivial `add` compiled to pure `i64.add` with an f64 ABI shim, not `f64.add` on NaN-boxed doubles. That is genuinely good codegen — it sidesteps the canonicalization risk — but it also means the "NaN-boxed value model carried as double" hazard (doc 05 §4.2) is invisible on integer kernels precisely because Perry proves they are integers and never boxes them. The kernel that stresses B4 is one that moves boxed objects/strings through code paths LLVM cannot prove are numeric, and that is M2's non-trivial reducer. Do not read M1's clean B4 result as "B4 is closed" — read it as "B4 is closed for the shape M1 can emit."

- **Auto-optimize wastefully rebuilds the host `libperry_runtime.a` (57 MB) and `libperry_stdlib.a` (81 MB) on a spacetimedb build that ignores both.** My branch short-circuits after codegen but the auto-optimize lib build runs earlier in the orchestrator, unconditionally. For M1 it is harmless (just slow on a cold build). For M2/M4 ergonomics it would be worth gating `build_optimized_libs` off for the spacetimedb target, or pointing it at the wasm32 runtime build instead of the host one. Out of M1 scope; flagged for the M2/M4 author.

- **The two-export-per-function shape (`__add` and `__add_i64`) is a real thing M2/M3 must reckon with.** Perry emits both the f64 NaN-box-ABI variant and an i64 specialization, plus a `__perry_wrap_*` closure-ABI wrapper (visible in the IR at `add_ts.ll:2239`). For M1 exporting both `perry_fn_*` is fine. For the STDB dunders M2 will not export `perry_fn_*` at all — it will export `__describe_module__`/`__call_reducer__`, which internally dispatch — so this multiplicity is an M1 artifact of "export the user function directly," not a constraint that propagates. Noting it so M3's schema-walk does not trip over the duplicate-looking symbols.
