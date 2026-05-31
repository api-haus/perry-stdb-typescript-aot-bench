# 04 — Feasibility verdict, integration design, and PoC scope

This is the decision document. It synthesizes the three investigation docs (01 Perry→WASM, 02 SpacetimeDB native ABI, 03 official TS→V8 baseline) into a single feasibility call, an integration design for the "fork the TS SDK with a Perry build step" idea, a minimal PoC scope, a benchmark harness, a docker-compose, a phased plan, and the negative space. Every load-bearing claim below was re-verified against code at `file:line` or against an artifact I built; where I reproduced a claim myself the reproduction is named.

## Verdict in one line

**RED for the literal experiment** ("compile the same TS module with Perry into a *freestanding* WASM module that satisfies SpacetimeDB's *native* ABI and runs on Wasmtime with no V8"). Perry's `--target wasm` is a JS-host artifact on all three load-bearing axes (import namespace, export names/signatures, value representation), and SpacetimeDB's native module loader forbids exactly the shape Perry emits. The faithful in-module comparison is not buildable without writing a new Perry codegen backend. The honest fallback is a **raw-compute proxy** (same TS kernel, Perry→wasm-on-JS-host vs TS-on-V8), clearly labelled as measuring Perry codegen quality and *not* the SpacetimeDB native module path.

## 1. Feasibility — item-by-item gap analysis

The native SpacetimeDB module contract (doc 02, re-verified) versus what Perry's `--target wasm` can emit (doc 01, re-verified, plus my own fresh compile). I rebuilt the decisive Perry fact at HEAD: `perry compile add.ts -o add.wasm --target wasm` on `export function add(a,b){return a+b}` emits **211 imports all from namespace `"rt"`** and exports exactly `_start`, `memory`, `__indirect_function_table`, `__wasm_func_211`, `__wasm_func_212` — with **no export named `add`, `__call_reducer__`, or `__describe_module__`** (artifact: `/mnt/archive4/DEV/mmodb/_scratch/perry-verify/add.wasm`, dumped with `wasm-tools 1.251.0`).

| STDB-contract requirement | Where enforced | Matching Perry capability | Result |
|---|---|---|---|
| Export `memory` named `"memory"` | `check_required` `wasm_common.rs:239-241` | Perry exports `memory` (defined in-module, not imported), `compile.rs:1166` | **WORKS.** The one axis that lines up. |
| Export `__describe_module__` = `(i32) -> ()` | `DESCRIBE_MODULE_SIG` `wasm_common.rs:145`, validated `:248` | Perry's export set is fixed: `_start`, `memory`, `__indirect_function_table`, `__wasm_func_<idx>` by index, `__wasm_global_<idx>` (`compile.rs:1164-1192`). User function names are discarded; sigs are forced NaN-boxed. | **WALL.** No mechanism to pin an export name or a chosen signature. A top-level `export function describe()` does not surface as a named export at all (reproduced). |
| Export `__call_reducer__` = `(i32 i64×7 i32 i32) -> i32` | `CALL_REDUCER_SIG` `wasm_common.rs:146-168`, validated `:246` | Same fixed export set; user fns carry `vec![ValType::I64; param_count]` params and an `i64`/void result (`compile.rs:696-700, 1001`). Cannot produce the exact 10-arg mixed i32/i64 signature, nor the name. | **WALL.** Both name and signature are unreachable. |
| Import host funcs **only** from `spacetime_10.0..10.5`, exact field names/sigs; ≥1 such import for ABI detection; **no WASI, no `env`, no other namespace** | Linker defines only `abi_funcs!` via `func_wrap` (`link_imports` `wasmtime_module.rs:81-110`); zero WASI/env (verified: 0 matches for `wasi`/`WASI`/`wasm_import_module` in `wasmtime/mod.rs`); ABI detected from imports `abi.rs:5,55`; standard `instantiate_pre` (`mod.rs:174`) rejects unknown imports | Perry emits **211 imports from the single hardcoded namespace `"rt"`** (reproduced) — the JS object model (NaN-boxing/strings/objects/arrays/closures/GC/Math/Date/JSON/Map/Set). FFI exists (`declare function` → import) but the namespace is hardcoded `"ffi"` (`compile.rs:986`) and the signature is forced `(i64,…)->i64` ignoring declared TS types (`compile.rs:658-663, 977-983`). | **WALL (the decisive one).** Perry's module imports 211 functions the STDB linker does not define → instant instantiation failure. Even the FFI hook cannot select `spacetime_10.0` or an i32 signature. |
| Reactor module (no `_start`/`main` required, host calls dunders on demand) | No WASI `_start` import; host calls exports directly (`mod.rs` loader) | Perry emits `_start` as an *export* (module init), not a WASI import, and no `(start …)` section (doc 01). STDB tolerates extra exports. | **WORKS in principle** (the reactor shape is compatible) — moot because the import wall blocks instantiation first. |
| Hand-author BSATN module-def bytes + reducer-arg marshalling in TS | Module writes BSATN `RawModuleDef::V10` to a sink via `bytes_sink_write`; reads args via `bytes_source_read` into linear memory at a chosen offset | Perry has **no TS-level addressable-linear-memory primitive**. `Uint8Array`/`Buffer`/`DataView` are `rt`-imports operating on host-side JS-managed buffers behind opaque handles (doc 01, `wasm_runtime.js`); the only linear-memory traffic is Perry's internal NaN-box arg bridge at scratch `0xFF00`. | **WALL.** Even if the ABI funcs were importable, there is no way in Perry-compilable TS to place a BSATN byte at a linear-memory offset a `bytes_sink`/`bytes_source` would agree on. |

**Net:** one axis works (`memory` export + reactor shape), four are walls (export names, export signatures, import namespace/sigs, addressable memory). The walls are not independent bugs; they are the **deliberate architecture** of Perry's wasm backend (doc 01, `_vendor/perry/CLAUDE.md` "NaN-Boxing"/"Garbage Collection"): the object model and GC live in a JS host so the wasm stays tiny and shares one backend with `--target web` (`flags.md:162` — `wasm` is an alias of `web`). Reaching the native ABI is a new codegen backend (wasm-resident values + GC + chosen import/export ABI + addressable memory), not a flag and not a shim.

**Why "a small shim" does not rescue it.** A shim wrapping Perry's output would have to (1) provide a Wasmtime-side Rust implementation of all 211 `rt.*` functions — i.e. re-host Perry's entire JS object model + generational GC + string/handle tables inside the SpacetimeDB host with no V8 — and (2) bridge STDB's `__call_reducer__`/BSATN ABI to Perry's NaN-box-by-index exports. That re-introduces a JS-runtime-equivalent in the host, defeating the experiment's "no V8/JS runtime in the loop" premise, and is a major subsystem, not a shim. This is a negative-space rewrite (the avoided problem — wasm-resident values — is exactly what you would have to add back), not an increment.

## 2. Integration design — what a "fork of the TS SDK" concretely changes, and why it cannot reach the native path

### 2a. The official TS build path we would fork (doc 03, re-verified shape)

`crates/cli/src/tasks/javascript.rs`: `tsc --noEmit` type-check → **rolldown** bundles fixed entry `./src/index.ts` to a single ESM chunk `./dist/bundle.js` with `spacetime:sys.*` left external → publish posts the **source text** with `host_type=Js` → host loads it into a **V8 isolate**, resolves `spacetime:sys@2.0` to synthetic syscall modules, calls the default export's `[moduleHooks]` to register reducers and cache `__call_reducer__` as a V8 `Function`. There is no WASM, no Wasmtime, no `__call_reducer__` WASM export on this path.

### 2b. The minimal honest fork — a second build path that swaps rolldown→V8 for Perry→wasm-on-JS-host

A faithful fork would add a `host_type` and a CLI build branch (e.g. detect a `perry` field in `package.json` or a `--engine perry` flag) that, instead of rolldown→V8, runs `perry compile src/index.ts -o dist/module.wasm --target wasm`. **But this cannot target the SpacetimeDB native (Wasmtime) loader** for the four wall reasons in §1: the emitted wasm imports `rt`, exports by index, and has no addressable memory. So the only place a Perry artifact can run is **under Perry's own JS host** (`wasm_runtime.js` on Node V8) — which is not a SpacetimeDB module at all.

Therefore the "fork" reduces to one of two real options:

- **Option A — proxy fork (recommended for the PoC).** Do *not* change the SpacetimeDB host or module loader. Build a standalone two-arm benchmark: arm V8 = the official TS module published to the server (doc 03, already built); arm Perry = the *same CPU kernel TS* compiled by `perry --target wasm` and executed under Node + `wasm_runtime.js`, timed in isolation. This measures Perry codegen quality vs V8 JIT on identical source. It is explicitly **not** "Perry as a SpacetimeDB module."
- **Option B — new Perry backend (out of PoC scope).** Add a `--target spacetimedb` codegen path to Perry that lowers TS values to a wasm-resident representation, emits chosen import namespaces/signatures (`spacetime_10.x`) and chosen export names/signatures (`__describe_module__`/`__call_reducer__`), compiles a wasm-resident allocator/GC, and exposes a TS API to read/write BSATN at known linear-memory offsets. This is a multi-week compiler project, not a PoC, and is the only path that would make the literal experiment true.

### 2c. The shim TypeScript that *would* be required (and why it is unwritable in Perry-compilable TS)

For completeness — if Perry could emit chosen imports/exports, the shim module (in Perry-compilable TS) would need to: export `__describe_module__(sink: i32)` that writes the hand-built BSATN `RawModuleDef::V10` bytes (the verified 34-byte layout, doc 02 §iv) to the sink via `spacetime_10.0::bytes_sink_write` looping until drained; export `__call_reducer__(id, sender×4, conn×2, ts, argsSrc, errSink)` that reads args via `spacetime_10.0::bytes_source_read` (sized by `spacetime_10.1::bytes_source_remaining_length`), decodes BSATN per the reducer's `params` ProductType, runs the kernel, and returns `0`; and import at least one `spacetime_10.Y` func for ABI detection. **None of this is expressible in Perry-compilable TS today** because (a) the exports cannot be named/typed and (b) there is no TS primitive to read/write a byte at a chosen linear-memory address. Documenting this is the point: the shim is not "hard to write," it is unwritable until Option B exists.

## 3. PoC scope — the minimal module and the workload

**Single CPU-bound, deterministic kernel, run identically on both arms.** Reuse the validated `mix` kernel from doc 03 §iii (xorshift64*-style integer mixing over `iters` rounds, BigInt math, no clock, no `Math.random`). Its only input is `iters`; its output is a 64-bit checksum. It is deterministic, defeats dead-code elimination (the checksum is observed), and was already measured monotonic/near-linear on the V8 arm (`burn(100k)=11.2ms`, `2M=230.9ms`, `8M=660.4ms`).

- **V8 arm (control):** the doc-03 module at `/mnt/archive4/DEV/mmodb/_scratch/ts-baseline/perry-baseline` — one `result` table (id/iters/checksum), one `burn(iters)` reducer that persists the checksum. Already built and published to a v2.0.1 server.
- **Perry arm (proxy):** the *same* `mix` function in a standalone `kernel.ts` with a thin `export function run(iters): bigint` entry, compiled `perry compile kernel.ts -o kernel.wasm --target wasm`, executed under Node + Perry's `wasm_runtime.js`, timed around the kernel call only.

**Table-touching variant: OUT OF SCOPE.** Doc 02 §iv/§v: a table adds Typespace + Tables + Types BSATN sections (ColList, index-algo enums, defaults, constraints) — large hand-encoding surface with zero benefit to a CPU-bound comparison, and the Perry arm cannot touch the datastore at all (no `spacetime_10.x` imports). The V8 arm uses a one-row `result` table *only* because reducers cannot return values (`reducers.ts:83` hardcodes `okReturnType=Product([])`; `syscall/v2.rs:467` rejects non-undefined returns) — so the checksum is persisted and read back via SQL. The Perry arm has no such constraint (it is not a reducer); it returns the checksum directly. This asymmetry is itself a confound to disclose (§4).

## 4. Benchmark harness — same source, two build paths, what is measured, what makes it dishonest

**Same TS source for the kernel** (`mix`), two build paths (rolldown→V8-in-STDB vs Perry→wasm-on-Node-V8-host), identical `iters` sweep.

- **V8 arm metric:** server-measured per-call latency from the HTTP response header `spacetime-execution-duration-micros` on `POST /v1/database/perrybase/call/burn` with body `[<iters>]` (doc 03 §iv; set at `database.rs:206` from `finish_funcall` `total_duration`, `mod.rs:2034`). This excludes HTTP/connect overhead; it brackets arg-deserialize + user fn. Do **not** use `spacetime-energy-used` — it is always 0 (V8 budget stubbed, `budget.rs:127`).
- **Perry arm metric:** wall-clock around the `instance.exports.__wasm_func_<run-idx>(...)` call under Node, after the module is instantiated and warmed. Because the Perry arm runs on a *different host process* (Node, not the STDB server), the two latencies are **not on a common clock** — they measure different stacks. Report them as two separate distributions answering one question ("how fast does this kernel run as JIT'd-JS-in-V8 vs AOT-Perry-wasm-under-a-JS-host"), never as a single ratio claiming "Perry is Nx faster *as a SpacetimeDB module*."
- **Iterations & warmup:** sweep `iters ∈ {1e5, 5e5, 2e6, 8e6}`. Per workload size, run ≥12 calls; **discard the first 2** (doc 03 measured ~40% first-call V8 JIT warmup, then ~6% steady-state spread over 8 calls). Report **median + IQR** of the steady-state tail, and report cold (first call) separately — never average cold into warm. The Perry/AOT arm has near-zero warmup; the V8 arm's warmup is the most divergent axis and must be shown, not hidden.
- **What makes the comparison dishonest (state up front, per measurement-negative-space):**
  1. **Calling it the native module path.** It is not. The Perry arm exercises zero SpacetimeDB module machinery — no reducer dispatch, no BSATN, no datastore imports, no Wasmtime. A JS host (`wasm_runtime.js`) is still in the loop. Label it a *codegen proxy*.
  2. **Fuel asymmetry.** Wasmtime fuel metering is ON in STDB (`mod.rs:93`, ~120e12 budget reset per call, `wasmtime_module.rs:892`, `energy.rs:135`) — but the Perry arm does **not** run on STDB's Wasmtime, so it pays no STDB fuel. The V8 arm pays no gas (budget stubbed). Neither arm is fuel-metered in this proxy, so fuel is not a live confound *here* — but any future Option-B arm on STDB Wasmtime would be fuel-metered and must disable fuel or compare the fuel stat directly.
  3. **Setup asymmetry.** The V8 path precomputes arg deserializers once and reuses a `ReducerCtx` (`runtime.ts:352,407`); give the Perry arm equivalent one-time setup (instantiate once, warm once) rather than re-instantiating per call.
  4. **Return-path asymmetry.** The V8 arm persists+reads the checksum (forced by the no-return-value rule); the Perry arm returns it directly. Equalize by having the V8 timing bracket only the reducer body (it does — the header excludes SQL readback), and by having the Perry arm also observe the checksum (print it) so neither loop is DCE'd.
  5. **Different V8 builds.** STDB pins `v8 = 145.0.0`; Node v26 ships its own V8. The V8 arm and the Perry arm's JS host are different V8s — disclose it; it bounds how tight any cross-arm claim can be.

## 5. Docker-compose — pinned 2.0.x server

Pin `:v2.0.1` (NOT `clockworklabs/spacetime` bare / `:latest`, which resolves to v2.3.0 per doc 03 §v; the `v` prefix is required — confirmed `docker manifest inspect clockworklabs/spacetime:v2.0.1` succeeds). The image has no Node, so the module build/publish does **not** run inside the container — extract the 2.0.1 CLI from the image and run it on the host (doc 03 §v).

```yaml
# docker-compose.yml
services:
  spacetimedb:
    image: clockworklabs/spacetime:v2.0.1
    command: start
    ports:
      - "3000:3000"
    volumes:
      - stdb-data:/stdb           # persist db across restarts (path per image; verify in phase 0)
volumes:
  stdb-data:
```

The module build+publish step lives **outside compose**, in a host script (`build-and-publish.sh`): extract `spacetimedb-cli` from the image once (`docker cp $(docker create clockworklabs/spacetime:v2.0.1):/opt/spacetime/spacetimedb-cli ./bin/spacetime-2.0.1`), then `./bin/spacetime-2.0.1 build` + `publish --server http://localhost:3000 -p ./perry-baseline perrybase -y` against the running container. Auth gotcha (doc 03 §v): if pre-publish returns `401 InvalidSignature`, `spacetime logout` then `login --server-issued-login`.

**ABI/version coherence note:** doc 02's verified BSATN/ABI anchors are at vendored 2.3.0 (`RawModuleDef::V10`, imports up to `spacetime_10.5`); doc 03's working server is 2.0.1. Both are ABI **major 10 / V10**, and the doc-03 TS module built+published cleanly against 2.0.1, so pinning 2.0.1 is coherent for the (only live) V8 arm. The V10 byte layout in doc 02 §iv applies to 2.0+. If the server is ever bumped to 2.3.0, re-confirm the module still publishes; if dropped to a 1.11.x line it would be V9 and the layout must be re-derived.

## 6. Phased build plan — riskiest unknown first, fallback per risk

The riskiest unknown is **whether Perry can emit the native ABI at all**. §1 already answers it RED with a reproduced artifact, so Phase 0 is a *disproof confirmation* with the smallest possible artifact, and the plan pivots to the proxy immediately rather than sinking effort into a shim.

- **Phase 0 — Disprove the native path with one tiny artifact (riskiest unknown, ~1 hr).** Hand-write the smallest Perry-TS module that *tries* to be a SpacetimeDB module: a `describe`-like export returning the verified 34-byte `RawModuleDef::V10` bytes and a no-op `call_reducer`. Compile with `perry --target wasm`, dump with `wasm-tools`, and confirm it (a) exports nothing named `__describe_module__`/`__call_reducer__`, (b) imports `rt` not `spacetime_10.x`. **Then attempt to load it on the running v2.0.1 server** and capture the rejection (expected: `NotDetected` ABI / unknown-import instantiation failure / required-export validation error). This is the empirical gravestone. **Gate:** if — against all evidence in §1 — it somehow loads, escalate to the human (the whole design changes). Expected outcome: confirmed RED. **Fallback:** none needed; this *is* the fallback trigger for everything downstream.
- **Phase 1 — Stand up the pinned server + V8 control arm (low risk).** `docker compose up` with `:v2.0.1`; extract the 2.0.1 CLI; build+publish the doc-03 `perry-baseline` module; reproduce the doc-03 latency numbers via the HTTP header to confirm the harness. **Fallback if 2.0.1 build breaks:** the doc-03 module is already built/published once; re-pin to the exact image digest used then.
- **Phase 2 — Perry proxy arm (low risk, the real PoC deliverable).** Compile the shared `mix` kernel with `perry --target wasm`; write a Node runner that instantiates `kernel.wasm` with `wasm_runtime.js`, warms it, and times the kernel over the `iters` sweep. **Fallback if `wasm_runtime.js` cannot be driven headless from Node** (it ships embedded in the HTML wrapper by default): emit the bare `.wasm` (`-o kernel.wasm`) and supply the runtime separately, or extract `wasm_runtime.js` from the HTML artifact; if that fails, fall further back to `perry compile kernel.ts -o kernel` (native binary) timed directly — still a Perry-codegen proxy, just native instead of wasm, and labelled as such.
- **Phase 3 — Two-arm report (low risk).** Run both sweeps, discard warmup, report two labelled distributions (V8-in-STDB µs; Perry-wasm-on-Node µs) + cold-vs-warm split, with the §4 dishonesty caveats stated up front. **Fallback:** if cross-arm numbers are too apples-to-oranges to be useful, report each arm's *internal* scaling curve (latency vs iters) and the AOT-vs-JIT warmup contrast, which is defensible without a common clock.

## 7. Negative space — what we deliberately do NOT build, and open questions

**Deliberately not built:**
- **No new Perry codegen backend (Option B).** Out of PoC scope; it is the only path to the literal experiment and is a multi-week compiler effort.
- **No re-hosting of Perry's 211-function `rt` runtime inside the STDB Wasmtime host.** That would reintroduce a JS-runtime-equivalent in the host and defeat the "no V8" premise.
- **No fork of the STDB module loader / no new `host_type`.** The proxy needs no host change; adding one would be scope the PoC cannot justify.
- **No table-touching reducer, no BSATN hand-encoding beyond the Phase-0 gravestone.** Pure encoding surface with no CPU-comparison value.
- **No claim of a common-clock speedup ratio between arms.** The two arms run on different hosts; only internal scaling curves and the warmup contrast are honestly cross-comparable.

**What could invalidate the benchmark:**
- Treating the proxy as the native module path (the headline lie the doc must prevent).
- A low-iteration sweep dominated by V8 JIT warmup (the AOT arm has none) — mitigated by discarding warmup and reporting cold separately.
- Different V8 builds (STDB 145.0.0 vs Node v26) silently attributed to Perry.
- DCE on either arm if the checksum is not observed.
- A future Option-B arm comparing STDB-Wasmtime (fuel-metered) against stubbed-budget V8 without equalizing.

**Open questions for the human:**
- Is the proxy (codegen quality: Perry-wasm-on-JS-host vs TS-on-V8) a useful answer to the underlying question, or does the question only have value if a *true* SpacetimeDB-native Perry module exists (i.e. is Option B the only acceptable deliverable)?
- If Option B is wanted, is a multi-week Perry `--target spacetimedb` backend in budget, or is the right move to report RED + the proxy and stop?
- Server version: pin 2.0.1 (doc-03 working baseline) or bump to 2.3.0 (doc-02 ABI anchor)? Both are ABI v10; 2.0.1 is the proven-publishable one.
- Should the Perry proxy arm be wasm-on-JS-host (closest to "Perry wasm") or native binary (Perry's primary target, fewer moving parts)? The native binary is a cleaner codegen measurement but drops the word "wasm" from the comparison.

## Side notes / observations / complaints

- **The experiment's premise is structurally impossible as literally stated, and the three investigation docs converge on it cleanly.** Doc 01 (Perry emits `rt`-host wasm), doc 02 (STDB forbids non-`spacetime_10.x` imports and requires exact dunder exports), and doc 03 (the official path is V8, not wasm at all) are mutually consistent. I re-derived the single decisive fact myself rather than trust the journals: a fresh `perry --target wasm` build at the installed binary version emits 211 `rt` imports and index-named exports, no `__call_reducer__`. The walls are real and they are architectural, not incidental.
- **Version triangle to keep straight:** vendored SpacetimeDB source = 2.3.0 (ABI v10), the working benchmark server = 2.0.1 (also v10), the installed Perry binary = 0.5.1025, vendored Perry source = 0.5.1046. The doc-02 ABI bytes are 2.3.0 but apply to 2.0+ (both V10); the doc-03 baseline is 2.0.1. The Perry 21-patch source/binary delta did not change the emitted structure (reproduced). None of these deltas changes the RED verdict.
- **The honest framing matters more than the number.** The most likely way this PoC misleads is a headline like "Perry is 5x faster than TypeScript in SpacetimeDB." That sentence is false on two counts: the Perry arm is not in SpacetimeDB, and the arms are not on a common clock. The deliverable's value is "here is Perry's wasm codegen quality vs V8 JIT on an identical kernel, and here is precisely why Perry cannot be a SpacetimeDB native module without a new backend" — which is a genuine, defensible result.
- **The doc-03/doc-02 scratch artifacts I checked were partly gone** (`_scratch/perry-wasm/` top-level and `_scratch/abi-probe/` listed empty), though the Perry binary survived under `_scratch/perry-wasm/npm-try/`. If the orchestrator needs the doc-02 Rust ABI anchors (`minimal_mod.wasm` etc.) for Phase 0, they will need rebuilding — the doc records how. Not load-bearing for this verdict (I reproduced the Perry side fresh and read the STDB side at source).
- **`--target wasm` being an alias of `--target web` (`flags.md:162`) is the root cause in one line:** Perry's wasm output is a browser artifact by design. There is no host-agnostic wasm build mode to coax; the `-o x.wasm` form is the same bytes minus the HTML wrapper.
