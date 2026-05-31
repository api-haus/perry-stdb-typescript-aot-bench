# Perry → WASM: what `--target wasm` actually emits

## Bottom line

Perry's `--target wasm` does **not** produce a freestanding WebAssembly module. It produces a WASM binary that is one half of a **two-part artifact**: the `.wasm` plus a JavaScript runtime bridge (`wasm_runtime.js`, embedded as an HTML page by default). Every Perry-compiled WASM module imports **211 functions from a single hardcoded module namespace `rt`** — the entire JavaScript object model (NaN-boxing, strings, objects, arrays, closures, GC, Math, Date, JSON, Map/Set, Promise) implemented in JS by the host. The module is meaningless without that JS host.

This is the decisive fact for the experiment: SpacetimeDB's native module ABI requires a module that imports `spacetime_10.0`..`10.5` and exports `__describe_module__` / `__call_reducer__` with exact low-level signatures, runnable on Wasmtime with no JS host. Perry's WASM output is the opposite shape on every axis. None of the four required capabilities (a)–(d) can be satisfied without modifying Perry's codegen crate, and even then the NaN-boxing + JS-runtime architecture makes a SpacetimeDB-native target a from-scratch backend, not a shim.

## How Perry was run

Published-binary path worked (the realistic user path). `npm i @perryts/perry` in a scratch dir pulled `@perryts/perry@0.5.1025` + the platform package `@perryts/perry-linux-x64@0.5.1025`. The native binary is at `node_modules/@perryts/perry-linux-x64/bin/perry`; the `bin/perry.js` shim dispatches to it. Working invocation:

$$\texttt{perry compile <input.ts> -o <out> --target wasm}$$

- `-o out/foo` (no `.wasm` extension) → emits `out/foo.html` (~204 KB), a self-contained page: base64 wasm in `window.__perryWasmB64` + the full `wasm_runtime.js` bridge + a `bootPerryWasm(...)` call.
- `-o out/foo.wasm` (`.wasm` extension) → emits the bare `out/foo.wasm` binary only (~8.8 KB). **Same wasm bytes**; still imports all 211 `rt` functions. The "raw" form just omits the HTML wrapper — it does not change the import dependency.

Version note: the published binary I tested is `0.5.1025`; the vendored source at `_vendor/perry` is `0.5.1046` (CLAUDE.md:11). 21 patch versions apart, but the WASM-backend architecture read in source matches the binary's emitted output byte-structure exactly, so the structural conclusions hold for both.

Build is fast and tiny: each sample compiled in 5–7 ms to an 8.7–8.9 KB `.wasm`.

| sample | TS | wasm size | build | imports | exports |
|---|---|---|---|---|---|
| `pureint` | `export function add(a,b){return a+b}` | 8783 B | 7 ms | 211 | 5 |
| `loop` | `for`-loop sum to n | 8935 B | 5 ms | 211 | 5 |
| `strop` | `"hello "+name` | 8801 B | 5 ms | 211 | 5 |
| `ffi` | `declare function table_id_from_name(...)` + use | 8820 B | 5 ms | 212 | 5 |

Samples, outputs, and the node-based extractor/parser are under `/mnt/archive4/DEV/mmodb/_scratch/perry-wasm/`.

## Structural dump of the emitted WASM

Parsed with both `node`'s `WebAssembly.Module.{imports,exports}` reflection and `wasm-tools 1.251.0` (`cargo install wasm-tools`).

**Imports** — every sample, identical: 211 functions, all from module namespace **`"rt"`**:

    (import "rt" "string_new"   (func (type 1)))   ;; (param i64)         -> (result i64)
    (import "rt" "console_log"  (func (type 2)))   ;; (param i64)
    (import "rt" "js_add"       (func (type 9?)))  ;; NaN-boxed i64 args
    (import "rt" "object_new" / "array_push" / "closure_call_0" / "map_set" /
            "json_parse" / "buffer_set" / "uint8array_new" / "mem_call" / ... )

The full catalog and field order is the `RuntimeImports` struct at `crates/perry-codegen-wasm/src/emit/runtime_imports.rs:13-255`. These are the JS object model, not host capabilities.

**Exports** — every sample, identical regardless of source:

    (export "_start"                     (func N))     ;; runs module init (__init_strings + top-level code)
    (export "memory"                     (memory 0))   ;; defined here, 2 pages min, NOT imported
    (export "__indirect_function_table"  (table 0))
    (export "__wasm_func_<idx>"          (func idx))   ;; every user fn, named BY INDEX
    (export "__wasm_global_<idx>"        (global idx)) ;; module-let globals, by index

Emitted at `crates/perry-codegen-wasm/src/emit/compile.rs:1164-1192`.

**Memory**: `(memory 0) 2` — defined in the module and exported as `memory`, not imported. Min 2 pages. Good (this is the one SpacetimeDB-compatible trait).

**Start section**: none. `_start` is an *export*, not the WASM `(start …)` function, and there is no WASI `_start` *import*. A host explicitly calls the exported `_start`.

**Data segments**: 1 (packed string-literal bytes for the string table).

**Runtime/GC embedded?** No. The allocator, GC, NaN-boxing, and entire object model live in the JS host (`wasm_runtime.js`), supplied at `WebAssembly.instantiate(wasmBytes, imports)` (`wasm_runtime.js:4867-4868`). The `.wasm` is pure compiled control flow that calls out to `rt.*` for every non-arithmetic operation.

## Capabilities table (a)–(d)

| # | Required capability | Verdict | Evidence |
|---|---|---|---|
| (a) | Emit a custom import from an **arbitrary** module namespace (e.g. `spacetime_10.0` / `table_id_from_name`) with a chosen signature | **NO** | An FFI mechanism exists (`declare function f(...)` with no body → wasm import), but the namespace is **hardcoded to `"ffi"`** (`compile.rs:986`) and the signature is **forced to NaN-boxed `(i64,…) -> i64`** (`compile.rs:658-663`), ignoring the declared TS types. Empirically: `declare function table_id_from_name(ptr,len):number` produced `(import "ffi" "table_id_from_name" (func (type 3)))` where type 3 = `(param i64 i64)(result i64)`. Cannot choose `spacetime_10.0` namespace; cannot choose `(i32,i32)->i32`. |
| (b) | Export a function with an **exact required name** and a specific low-level signature (e.g. `__call_reducer__` (i32,i64,…) -> i16) | **NO** | The export set is fixed: `_start`, `memory`, `__indirect_function_table`, and every user function as `__wasm_func_<index>` (`compile.rs:1164-1192`). A top-level `export function add(...)` does **not** become a wasm export named `add` — verified: pureint/loop/strop all emit the identical 5 exports, none carrying the TS name. User functions also carry NaN-boxed `(i64,…)` signatures, never a chosen `i32/i64 -> i16`. No mechanism to pin an export name or signature. |
| (c) | Emit a **freestanding/reactor** module (no JS/WASI host; `memory` exported) acceptable to SpacetimeDB's Wasmtime | **NO** | `memory` IS exported and there is no mandatory WASI `_start` import — those two traits are fine. But the module imports **211 functions from `"rt"`**, every one implemented in JavaScript (`wasm_runtime.js`). Wasmtime would refuse to instantiate (211 unresolved imports), and even if stubbed, the module does nothing without the JS object-model runtime. It is a JS-host reactor, not freestanding. No `wasm_import_module` / namespace-config / freestanding / reactor option exists anywhere in `perry-codegen-wasm` or `docs/`. |
| (d) | Let hand-authored TS do raw byte read/write into linear memory (to marshal BSATN) | **NO (not at TS level)** | Linear memory exists and the host reads/writes it via `BigUint64Array(wasmMemory.buffer, base, …)` — but only as Perry's *internal* NaN-box argument bridge at scratch address `0xFF00` (`mem_call` / `mem_call_i32`, `wasm_runtime.js:1377-1409`). TS-level `Uint8Array`/`Buffer`/`DataView` operations are themselves `rt`-imports (`uint8array_new`, `uint8array_set`, `buffer_write`, …) that manipulate **host-side JS-managed buffers behind opaque handles**, not addressable bytes at a chosen offset in the module's own linear memory. There is no TS API to write a BSATN byte at a known linear-memory address that a SpacetimeDB `bytes_sink` host function could then read. |

## How Perry lowers TS → WASM (why a SpacetimeDB shim isn't writable in Perry-compilable TS)

Pipeline (CLAUDE.md "Architecture"): `TS → SWC parse → AST → HIR → transform → codegen`. For `--target wasm`/`--target web` (aliases; same backend, `flags.md:34,162`), the codegen is `perry-codegen-wasm`: HIR → WASM bytecode + the JS bridge.

The runtime model is **NaN-boxing** (CLAUDE.md "NaN-Boxing"; `wasm_runtime.js:6-12`): every JS value is a 64-bit float whose bit pattern encodes a tag (undefined/null/bool/int32/bigint/pointer/string). Numbers are real f64; strings/objects/arrays/closures are NaN-boxed *handle indices* into host-side JS tables (`stringTable`, the handle store), **not** pointers into wasm linear memory. The object model, the generational GC (CLAUDE.md "Garbage Collection"), Math, Date, JSON, Map/Set, Promise, Buffer/Uint8Array — all 211 `rt.*` functions — are implemented **in JavaScript in `wasm_runtime.js`**, not in the wasm. The wasm body is just the lowered control flow that NaN-boxes literals, does f64 arithmetic inline, and calls `rt.*` for everything else.

Consequences for a SpacetimeDB-ABI shim written in Perry-compilable TS:
- A reducer's reactor signature is raw scalars (`__call_reducer__(id: u32, …, args: BytesSource) -> i16`). Perry can only emit user functions with NaN-boxed `i64` params exported by index — it cannot produce that signature or that name.
- Marshalling BSATN means writing/reading concrete bytes at addresses the host's `bytes_source`/`bytes_sink` agree on. Perry has no TS-level addressable-memory primitive; its `Uint8Array` lives as a JS handle in the host, unreachable to a Wasmtime host that isn't the Perry JS bridge.
- Calling `spacetime_10.0::datastore_insert_bsatn(...)` requires an import from that namespace with that raw signature. Perry can only import from `rt` (fixed) or `ffi` (fixed namespace, fixed NaN-boxed signature).

## Feasibility call

**Can Perry output satisfy an external/native WASM ABI?**

- **Without modifying Perry: NO.** Three independent hard walls — hardcoded import namespaces (`rt` for runtime, `ffi` for externs), no user-controllable export names or signatures (everything is `__wasm_func_<index>` with NaN-boxed `i64`), and a mandatory 211-function JS object-model runtime that the module cannot run without. SpacetimeDB needs none of those and forbids all of them.
- **With a small shim: NO, not "small."** A shim would have to (1) provide a Wasmtime-side implementation of all 211 `rt.*` functions — i.e. port Perry's entire JS runtime (object model + GC + string table + handle store) into the SpacetimeDB host, in Rust, with no V8; and (2) bridge SpacetimeDB's `__call_reducer__`/BSATN ABI to Perry's NaN-box-by-index exports. That is re-hosting Perry's runtime inside Wasmtime plus an ABI translation layer — a major subsystem, not a shim. It also defeats the experiment's premise (no V8/JS-runtime in the loop), because you'd be reimplementing the JS runtime in the host anyway.
- **By modifying Perry: possible in principle, but it's a new backend.** A genuine SpacetimeDB target means a codegen path that lowers TS values to a Wasmtime-native representation (linear-memory layout, not host-side handles), emits chosen import namespaces/signatures and chosen export names/signatures, and either omits the managed runtime or compiles a wasm-resident allocator/GC. That is the negative space Perry's wasm backend was *designed around*: it deliberately pushed the object model into a JS host to keep the wasm tiny and to share one backend with `--target web`. Reintroducing wasm-resident values/GC/ABI control is exactly the "unspoken assumptions" rewrite, not an incremental flag.

**Recommended fallback for the PoC** (for the synthesis to weigh, not a directive): the honest comparable is a **raw-compute micro-benchmark** — a CPU-bound TS kernel (no DB calls) compiled by Perry to wasm and run under a JS host (Node `WebAssembly.instantiate` + `wasm_runtime.js`) vs the same kernel as TS-on-V8 in SpacetimeDB. It measures Perry's wasm codegen quality, clearly labelled as a proxy that does **not** exercise the SpacetimeDB native module path (which Perry cannot target). Any claim that this is "Perry as a SpacetimeDB module" would be false; the measurement's negative space (no reducer dispatch, no BSATN, no datastore imports, JS host still present) must be stated up front.

## Side notes / observations / complaints

- **`--target wasm` is `--target web`.** `flags.md:162` documents `wasm` as an alias of `web`, and `architecture.md:31` confirms one backend for both. The output is fundamentally a browser artifact (HTML + JS bridge). The "raw `.wasm`" form (`-o x.wasm`) is the same bytes minus the wrapper — it is not a different, host-agnostic build mode. This is easy to misread as "Perry emits standalone wasm."
- **The 204 KB HTML wrapper is ~96% JS runtime.** The actual compiled wasm for a one-line program is 8.8 KB; the rest is `wasm_runtime.js`. This is a clean signal that the object model lives outside the wasm.
- **FFI looked promising for ~30 seconds.** `declare function` → wasm import is real and the most plausible hook for capability (a). It dies on two hardcoded constants: the `"ffi"` namespace string (`compile.rs:986`) and the unconditional `vec![ValType::I64; param_count]` / `vec![I64]` signature (`compile.rs:658-663`). Both are one-line edits in source — but changing them only gets you a custom import; it does nothing for the exports, the runtime dependency, or the value representation. It's a false floor.
- **Exports-by-index, not by name, is the most surprising finding.** I expected `export function add` to surface as a wasm export `add`. It does not — the TS name is discarded and the function is exported as `__wasm_func_<index>`. The comment at `compile.rs:1168` says this exists "so async JS code can call them by index," reinforcing that the only intended consumer is the bundled JS bridge.
- **Did not build Perry from source.** The published binary worked on the first try and reproduces the exact emitted structure I needed; the source crate read at `_vendor/perry` corroborates every byte. Building the workspace (LLVM toolchain) would have cost minutes for zero additional signal on these four questions.
- **`--enable-wasm-runtime` is a red herring for this experiment.** It links a *wasmi host* into a Perry-compiled *native* binary so that binary can load `.wasm` at runtime (Perry-as-wasm-host). It is unrelated to making Perry *emit* a SpacetimeDB-loadable module.
