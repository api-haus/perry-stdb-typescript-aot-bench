# 07 — Fork plan (canonical engineering plan)

This is the engineering plan the project and all future sessions work from. It supersedes doc 04's PoC framing on one axis: doc 04 ruled the *literal* experiment RED and recommended a labelled proxy, but the user has since locked the **sound path** — a forked Perry that emits a freestanding native wasm32 module satisfying SpacetimeDB's stable `spacetime_10.x` ABI, loaded by the **stock** host exactly like a Rust/C#/C++ module. Docs 05 and 06 measured that path's two halves (runtime-core portability; TS-fork surface), and this document folds their findings into a committed architecture, a two-fork repo layout, a riskiest-first milestone plan, an honest performance expectation, the single release-option UX, and the negative space.

Every load-bearing claim was re-verified against code at `file:line` at the current HEAD of the vendored clones (`_vendor/SpacetimeDB`, `_vendor/perry`) before being relied on here. Where a claim's authority is another doc's measurement (e.g. the runtime-port compile state), that doc is cited and its artifact confirmed to exist on disk.

## 1. Committed architecture

The product is two forks plus an integration repo. A forked Perry gains a new codegen target that emits a freestanding wasm32 module hitting the `spacetime_10.x` ABI; a forked SpacetimeDB TypeScript module gains one build option that routes release builds through that Perry target. The SpacetimeDB core and host are never touched.

```
  src/index.ts  (the user's MMO server module, ONE source)
        │
        ├──[ DEV build ]──────────────────────────────────────────────┐
        │   spacetime build                                            │
        │   tsc --noEmit  →  rolldown  →  dist/bundle.js               │
        │   host_type = "Js"                                           │
        │                                                              ▼
        │                                              ┌──────────────────────────┐
        │                                              │  STOCK SpacetimeDB host  │
        └──[ RELEASE build ]───────────────────┐       │  (NEVER MODIFIED)        │
            spacetime build --engine perry      │       │                          │
            tsc --noEmit  →  perry compile      │       │  host_type=Js  → V8      │
              src/index.ts --target spacetimedb │       │   loader (deno_core/V8)  │
            →  dist/module.wasm                  │       │                          │
            host_type = "Wasm"                   └──────▶│  host_type=Wasm → stock  │
                                                         │   Wasmtime loader        │
   forked Perry emits:                                   │   (same as Rust/C#/C++)  │
   · imports ONLY from spacetime_10.0..10.5              └──────────────────────────┘
   · exports __describe_module__ (i32)->()                          ▲
            __call_reducer__ (i32 i64×7 i32 i32)->i32               │
   · exports memory                                  published with host_type as a
   · in-module runtime/GC (no rt/ffi host imports)   query param; the host routes on
   · addressable linear memory for BSATN             it with NO other discriminator
```

The seam already exists in the host and needs nothing forked. `tasks::build` (`crates/cli/src/tasks/mod.rs:13-58`) returns `(PathBuf, &'static str)` where the `&'static str` is the host_type; the JavaScript arm hardcodes `"Js"` at `:30-31` and every other language returns `"Wasm"` at `:33`/`:56`. `publish.rs` receives that tuple and forwards the string verbatim as a query parameter (`builder.query(&[("host_type", host_type)])`, `publish.rs:637`). The server parses it into `HostType` (`Wasm = 0`, `Js = 1`, `control_db.rs:98-99`) and routes with no other discriminator: `HostType::Wasm → runtimes.wasmtime.make_actor` (`host_controller.rs:721`), `HostType::Js → runtimes.v8.make_actor` (`host_controller.rs:730`). A Perry-compiled wasm published as `host_type=Wasm` is therefore indistinguishable from a Rust/C#/C++ module to the server. Reaching that contract is the new Perry backend, not a host change.

### Rejected: a `PerryWasm` host_type / forking the host

An earlier-considered approach added a third `HostType` variant (e.g. `PerryWasm`) so the host could special-case Perry modules — a Wasmtime config tweak, a relaxed import allow-list, or a host-side shim re-hosting Perry's `rt` runtime. **This is REJECTED as an architectural hack and must not be reopened.** Three reasons, each grounded:

1. **It modifies the thing we are trying to extend.** The whole value proposition is "a normal SpacetimeDB module, just compiled differently." A new host_type means a Perry module only runs on *our* fork of the server, not on stock SpacetimeDB — the opposite of the goal. The user's locked decision (1) names this explicitly.
2. **The seam does not need it.** §1 shows the host already routes `host_type=Wasm` to the stock Wasmtime loader with no language discriminator. A correctly-emitted Perry wasm is already a first-class Wasm module. Adding a variant would be dead weight that buys nothing the `Wasm` path doesn't already give.
3. **The only thing a `PerryWasm` host_type could "fix" is the import wall — and fixing it there is the wrong fix.** Perry's current `--target wasm` imports 211 functions from namespace `"rt"` (`perry-codegen-wasm/src/emit/compile.rs:957,974`), which the stock loader rejects. A host fork could define those `rt.*` imports — but that re-hosts Perry's entire JS object model + GC inside the SpacetimeDB host with no V8, which is doc 04's "re-introduce a JS-runtime-equivalent in the host" anti-pattern (doc 04 §1, "Why a small shim does not rescue it"). The negative-space-correct fix is to make Perry's runtime **wasm-resident** (in-module, like the C++ toolchain bundles libc and shims WASI — `bindings-cpp/.../wasi_shims.cpp`), so the module imports nothing outside `spacetime_10.x`. That is backend work in the Perry fork, where it belongs, not a host concession.

No future session should propose a host-side variant, a relaxed import allow-list, or an in-host Perry runtime. If the import wall feels like it wants a host change, that is the signal that the Perry backend is incomplete, not that the host needs forking.

## 2. The two forks plus the integration repo

Three repos in the `api-haus` GitHub org. Local reference clones live under `/mnt/archive4/DEV/mmodb/_vendor/`.

### api-haus/perry (fork of PerryTS/perry)

The compiler. All new capability that doc 04 proved Perry lacks lives here. Three change areas, none of which exists today:

- **LLVM → wasm32 target plumbing.** Perry's LLVM path is `.ll`-text + shell-out to `clang`/`lld`, not inkwell (`perry-codegen/src/linker.rs:1-7,67`; `perry-codegen/src/module.rs:221` writes `target triple` but no explicit datalayout, so clang derives wasm32's from the triple). Adding the target is a `resolve_target_triple` entry (`perry-codegen/src/codegen/helpers.rs:299-319` today maps 16 host triples — linux at `:312` — and has no wasm), a `clang --target=wasm32-unknown-unknown` compile arm, and a new `wasm-ld --no-entry` link arm with reactor export flags. Doc 05 §4.
- **perry-runtime core → wasm32.** The value model (NaN-boxed `JSValue`, `value/jsvalue.rs:8-10`), generational GC (`gc/`, heap via `std::alloc` not `mmap`), and JS builtins must compile to freestanding wasm32. Doc 05 measured this: the core compiles with **zero errors in any core module** under a ~83-line patch set (getrandom `custom` backend, `dlmalloc` for the global allocator, 5× `1usize<<34→u64` pointer-width widenings, a UTC `date.rs` arm, GC shell-scanner `cfg` gates). The patch is preserved at `/mnt/archive4/DEV/mmodb/_scratch/perry-wasm-port/measurement.diff` (confirmed: 325 lines, 9 files) and applied on branch `wasm-port-measurement` (off `main@4469d0f`, confirmed checked out).
- **ABI plumbing in codegen.** The reactor entry (suppress `main`, which `perry-codegen/src/codegen/entry.rs:134` emits today), the two dunder exports with exact STDB signatures, `spacetime_10.x` typed imports, and an addressable-linear-memory primitive for BSATN. These are the three doc-04 walls turned into compiler features.

Branch: `feat/target-spacetimedb` off the fork's `main`. The measurement work currently on `wasm-port-measurement` rebases onto / merges into this branch as milestone M2 lands.

### api-haus/SpacetimeDB (fork of clockworklabs/SpacetimeDB)

The TS module SDK plus the CLI release option. Core and host are never modified. Changes confined to:

- **`crates/cli/src/tasks/mod.rs`** — split the `ModuleLanguage::Javascript` arm (`:30-31`) into a dev sub-arm (rolldown → `bundle.js`, host_type `"Js"`, the existing `build_javascript`) and a release sub-arm (Perry → `module.wasm`, host_type `"Wasm"`, a new `build_javascript_perry`). The function signature gains one engine parameter mirroring the existing `build_debug: bool`.
- **`crates/cli/src/subcommands/build.rs`** — one new flag (`--engine perry`) read in `build::exec` (`:44-65`) next to `build_debug = args.get_flag("debug")` (`:61`), threaded into `run_build` → `tasks::build`. Publish needs no new arg: it already re-parses `--build-options` through the full `build::cli()` parser (`publish.rs:514-567`, `exec_with_argstring`), so `publish --build-options="--engine perry"` reaches the flag for free.
- **`crates/bindings-typescript/src/server/`** — re-point the `spacetime:sys` V8 externs to `spacetime_10.x` wasm imports and add the wasm-ABI boundary the V8 host currently hides. Per-file audit in §3 of doc 06: `db_view.ts`/`reducers.ts`/`schema.ts` compile as-is; `console.ts`/`polyfills.ts` need `sys.*` re-pointed or trimmed; `runtime.ts` splits (ser/de + ctx + schema-walk + table-view compile; the BytesSource/BytesSink drain loops + named/typed dunder export shims are entirely new code, not in `runtime.ts` because the Rust V8 host did that marshalling at `v2.rs:441-521` / `common.rs:126-139`); `sys.d.ts` is **replaced**, not compiled, by a `spacetime_10.x` import-declaration unit with wasm (ptr,len) signatures.
- **`api-haus/perry` as a git submodule** — co-versions the backend with the ABI major it emits. `build_javascript_perry` shells out `perry compile src/index.ts -o dist/module.wasm --target spacetimedb`, mirroring `build_rust`/`build_csharp` and the existing `wasm-opt` shell-out (`tasks/mod.rs:39` already runs `wasm-opt` via `duct`).

Branch: `feat/perry-release-engine` off the fork's `main`.

### api-haus/mmodb (the integration / project repo)

This repo. Carries: `docs/orchestrate/perry-stdb-poc/` (this plan and its inputs), a `docker-compose.yml` pinning the server (`clockworklabs/spacetime:v2.0.1`, doc 04 §5), the example MMO TS server module, the benchmark harness (publish-both-ways, schema-equality dump, in-STDB latency sweep), and the build/publish scripts. It consumes the two forks (as submodules or pinned builds); it is where the equivalence contract is exercised end-to-end.

## 3. Milestone plan — riskiest first

Ordering is by unknown, not by dependency convenience. The make-or-break unknown is **whether a forked Perry can emit a freestanding wasm32 module the stock STDB host actually loads and runs** — every later milestone is wasted if that is false. Doc 05 resolved the *runtime half* of that unknown to green and located the residual risk entirely in the codegen backend; M0 is therefore the smallest end-to-end artifact that exercises the codegen backend against the real host, not a runtime-port checkpoint.

### M0 — Hello-world reducer: forked Perry → freestanding wasm32 → stock host loads and runs it

**Goal.** The smallest possible Perry-emitted module that is a real SpacetimeDB module: `__describe_module__` returns a hand-built BSATN `RawModuleDef::V10` def (the verified ~34-byte minimal layout, doc 02 §iv) for one no-arg reducer, written to the `BytesSink` via `spacetime_10.0::bytes_sink_write` in a drain loop; `__call_reducer__` is a no-op returning `0`; the module imports **≥1** `spacetime_10.x` func (for ABI detection) and **zero** functions from any other namespace; it exports `memory`. Published `host_type=Wasm` to the stock pinned server (`v2.0.1`).

This requires, minimally, the M1+M2 codegen capabilities (target plumbing + reactor dunders + typed imports + addressable memory). M0 is allowed to **hand-stub** the runtime parts a no-op reducer doesn't exercise (no GC pressure, no real value churn) — the point is to prove the *ABI shape* loads, not to ship the full runtime. If the no-op reducer needs any `rt`/`ffi` import to link, that is an M2 gap surfaced early.

**Gate.** Publish succeeds; `spacetime logs` shows the module instantiated (no `NotDetected` ABI, no unknown-import instantiation failure, no required-export validation error); calling the reducer returns success and the server emits a `spacetime-execution-duration-micros` header. `wasm-tools dump module.wasm` confirms: imports only under `spacetime_10.x`, exports include `__describe_module__`/`__call_reducer__`/`memory` with the exact signatures (`(i32)->()` and `(i32 i64×7 i32 i32)->i32`, doc 04 §1).

**Fallback if it fails.** Bisect which capability is missing by dumping the wasm: wrong/missing export names → B2 dunder-naming incomplete; imports outside `spacetime_10.x` → B2 import-namespace or an un-shimmed runtime service (the C++ in-module-WASI precedent, `wasi_shims.cpp`, is the pattern — satisfy it in-module, never as a host import); BSATN bytes unplaceable → B3 addressable-memory primitive incomplete. Each failure points at a specific backend sub-task, not a redesign. The architecture itself does not have a fallback — if the stock host categorically cannot load a freestanding Perry wasm despite a correct dump, escalate to the user (doc 04's RED would have been wrong about *why*, which would change everything).

### M1 — LLVM → wasm32 target plumbing (Perry fork)

**Goal.** `perry compile x.ts --target spacetimedb` (or `--target wasm32`) produces a `.o` via `clang --target=wasm32-unknown-unknown` and links it with `wasm-ld --no-entry` into a `.wasm`, for a trivial arithmetic function — proving the triple/compile/link seam before any ABI shaping.

**Gate.** A `.wasm` is produced and `wasm-tools validate` passes; `wasm-tools dump` shows wasm32 (32-bit pointers). NaN-canonicalization spot-check: confirm no `f64.neg`/`f64.copysign`/`f64.add` appears on tag-carrying value moves (doc 05 §4.2, B4 — the one codegen risk doc 05 could not exercise without a compiled module).

**Fallback if it fails.** `wasm-ld` is present (`/usr/bin/wasm-ld`, clang 22 lists wasm32, verified locally per doc 05); if the `.ll`→clang→`.o` seam resists wasm32 (unexpected datalayout dependence), the fallback is to set an explicit `target datalayout` string for wasm32 in `module.rs` rather than relying on clang derivation.

### M2 — perry-runtime core → wasm32 + ABI-exact reactor dunders (Perry fork; the long pole)

**Goal.** Land the doc-05 measurement patch set on `feat/target-spacetimedb` (replace the stub RNG with a real `ctx.random` host import; review), perform the clean shell amputation (extract `fs::validate`/`fs::errors`/`fs::time` out of `fs/` into a top-level pure module; trim `object/native_module_dispatch.rs:1484-1504` so the `require()` router stops hard-referencing gated shell modules; introduce a `stdb-core` feature or `cfg(target_arch="wasm32")` gate), and extend codegen to emit the reactor dunders with exact names/signatures, `spacetime_10.x` typed imports, and the addressable-linear-memory primitive for BSATN. This is doc 05's A1–A3 + B2 + B3, and it is the bulk of the project. The C++ precedent (`abi.h:24` `import_module/import_name` macros, confirmed; `module_exports.cpp` `export_name` dunder shims; `wasi_shims.cpp` in-module WASI) is the reference instance.

**Gate.** The full perry-runtime core builds to wasm32 with zero errors (doc 05's furthest state minus the 14 shell residuals, which the amputation removes). A non-trivial reducer (real value churn, exercising the GC and a few builtins) compiled by M1+M2 and loaded per M0 runs correctly end-to-end on the stock host. NaN-canonicalization confirmed safe on the real kernel (B4).

**Fallback if it fails.** The shell amputation is the entanglement risk (doc 05 §5: gating modules out of `lib.rs` without trimming the dispatch router *raised* the error count to 31). If the `fs::validate` extraction or the dispatch-router trim proves larger than the 3–5 day estimate, the fallback is the `cfg(target_arch="wasm32")` route (the wasm target is neither `unix` nor `windows`, so `cfg`-gating shell modules by target compiles them out without a feature flag) — accepting that the same source no longer builds a Node binary, which is acceptable for the SpacetimeDB fork. If B3 (addressable memory) proves undesignable in Perry's TS surface, the fallback is a codegen intrinsic (a built-in `__stdb_write_bytes(ptr,len)` lowered directly) rather than a user-visible TS primitive — narrower, ship-able, revisited later.

### M3 — TS-module lowering: re-point src/server onto the wasm ABI (SpacetimeDB fork)

**Goal.** Replace `sys.d.ts` with a `spacetime_10.x` import-declaration unit (wasm ptr/len signatures, mirroring C++ `abi.h`); re-point every `sys.*` call in `runtime.ts`/`console.ts`; write the BytesSource/BytesSink drain loops and the two dunder export shims (the new code, ported from C++ `Module.cpp:399-460` `ConsumeBytes` + `module_exports.cpp`); trim or confirm the three JS-runtime deps (`object-inspect` in `console.ts:3`, `url-polyfill` in `polyfills.ts:1`, `FinalizationRegistry`/`using` in `runtime.ts:1071,994,1096`). For the example MMO module's reducer-only paths, the latter three are trimmable (doc 06 §2).

**Gate.** The example `src/index.ts` compiles via `perry compile --target spacetimedb`, publishes `host_type=Wasm`, and its `__describe_module__` emits byte-identical BSATN to the same source published via the dev (V8) path — the schema-equality gate (doc 06 §5.1), the strongest single equivalence check, dumped from each published database and diffed.

**Fallback if it fails.** If `object-inspect`/`url-polyfill` are not Perry-compilable, trim them for the release path (CPU-bound modules don't touch `URL`; console formatting can fall back to a minimal in-module formatter). If `FinalizationRegistry`/`using` are needed by a datastore-touching module and Perry lacks them, scope the first release-compilable module to reducer-only (no datastore iterators) and document the constraint — full datastore support becomes a later milestone gated on Perry's explicit-resource-management support.

### M4 — The single release option, wired end-to-end (SpacetimeDB fork)

**Goal.** The `--engine perry` flag on `build` (and via `--build-options` on `publish`), the `tasks/mod.rs` arm split, `build_javascript_perry` shelling out to the embedded Perry submodule, and the `wasm-opt` reuse. Dev `spacetime build` is byte-identical to today.

**Gate.** `spacetime build` (dev) produces `bundle.js`/host_type `Js` unchanged; `spacetime build --engine perry` produces `module.wasm`/host_type `Wasm`; `spacetime publish --build-options="--engine perry"` publishes the wasm with no publish-side code change. The semantic-equality gate (doc 06 §5.2): the same reducer called with the same args on both databases produces identical resulting state (the persisted checksum row).

**Fallback if it fails.** During bring-up, the existing `--bin-path`/`--js-path` publish escape hatches (`publish.rs:213-232`) publish a hand-built Perry wasm directly, decoupling the flag plumbing from the backend. So M4's CLI work is testable against a hand-built artifact independent of M2/M3 completion.

### M5 — Benchmark: the real in-SpacetimeDB comparison

**Goal.** The deliverable measurement. Same `src/index.ts` (the doc-04 `mix` xorshift64*-style CPU kernel persisting a checksum, deterministic, DCE-proof) published two ways into one server, differing only in host_type. Sweep `iters ∈ {1e5, 5e5, 2e6, 8e6}`, ≥12 calls per size, discard the first 2 (V8 JIT warmup), report median + IQR of the steady-state tail and cold separately.

**Gate.** Both arms expose the same server-measured `spacetime-execution-duration-micros` header (set from `finish_funcall` total_duration), so the V8-JIT vs Perry-AOT ratio is a fair in-STDB comparison on a common clock — the headline number doc 04 could not honestly produce. Fuel is ON for the Wasm arm and the V8 budget is stubbed, so compare **wall-clock, not energy**; size the kernel under the fuel budget.

**Fallback if it fails.** If cross-arm numbers are confounded (e.g. fuel metering distorts the Wasm arm at high iters), report each arm's internal scaling curve (latency vs iters) and the cold-vs-warm contrast, which are defensible without a tight ratio. This is doc 04's Phase-3 fallback, now with both arms genuinely in-STDB.

## 4. Effort estimate and dominant risks

Grounded in docs 05 §5 and 06 §6. Ranges, not points.

| Milestone | Effort | Risk | Basis |
|---|---|---|---|
| M0 hello-world end-to-end | folded into M1+M2 (the smallest artifact exercising both); ~2–4 days once M1/M2 reach the dunder-emit stage | the gate, not separable effort | doc 04 §6 Phase 0 was ~1hr to *disprove*; emitting a loadable one is M1+M2 capability |
| M1 target plumbing | 2–3 days | LOW–MEDIUM | doc 05 §5 B1; seam exists, `wasm-ld` present |
| M2 runtime core + ABI dunders + addressable memory | **4–7 weeks** (A1 ~1d, A2 3–5d, A3 1–2d, B2 1.5–3wk, B3 1–2wk, B4 2–4d) | **HIGH** (B2, B3) | doc 05 §5 A1–A3 + B2–B4; the long pole |
| M3 src/server lowering | days–weeks | MEDIUM | doc 06 §6; mechanical port of C++ precedent, blocked on M2 |
| M4 release option | days | LOW | doc 06 §6; mirrors `--debug`/`build_csharp`, testable via `--bin-path` now |
| M5 benchmark | 3–5 days | MEDIUM | doc 05 §5 B5; first true e2e, gated on M2/M3 |

**Overall: multi-week**, critical path entirely in M2's codegen backend (B2 ABI-exact dunders, B3 addressable memory) — both HIGH risk and both genuinely new compiler capability, not flags.

**Dominant risks and kill-criteria:**

- **B2 — ABI-exact reactor dunders with chosen export names/signatures + chosen import namespace.** The load-bearing unknown. Perry's `--target wasm` cannot name an export, pin a non-NaN-box signature, or select an import namespace (re-confirmed: `compile.rs:957,974` hardcode `"rt"`, FFI under `"ffi"` per `module_emitter.rs:47`, exports by-index `__wasm_func_<idx>`). The LLVM path (clang `export_name`/`import_module` attributes, exactly the C++ mechanism at `abi.h:24`) is the route, but it is new surface. **Kill-criterion:** if after a focused 2-week spike the LLVM path cannot emit a wasm with a named, correctly-typed `__call_reducer__` export and a `spacetime_10.x` import that the stock host accepts, the sound path is not viable on Perry's current LLVM architecture — escalate to the user (revert to doc 04's labelled proxy as the only honest deliverable).
- **B3 — addressable linear memory for BSATN.** Perry's TS surface has no addressable-memory concept (`Uint8Array`/`DataView` are `rt`-host handles, doc 04 §1 wall #5). **Kill-criterion:** if neither a TS primitive nor a codegen intrinsic can place a BSATN byte at a sink/source-agreed offset within M2's window, the module cannot marshal the ABI — escalate.
- **B4 — NaN-canonicalization through the f64-carried value model.** Doc 05 §4.2 reads the spec as safe (`local`/`global`/`load`/`store`/`call` are bit-preserving; only arithmetic canonicalizes) but could not exercise it without a compiled wasm. **Kill-criterion:** if the M1 dump shows LLVM routing tag-carrying values through a canonicalizing op and forcing i64 transit doesn't fix it, the value model needs rework on the wasm backend (cost unknown until observed) — measure, don't assume.
- **Shell-amputation entanglement (A2).** Gating shell modules out of `lib.rs` without trimming `native_module_dispatch.rs` *raised* errors to 31 (doc 05 §3 negative result). **Kill-criterion:** none fatal — the `cfg(target_arch="wasm32")` fallback (M2) sidesteps the feature-flag route at the cost of Node-binary buildability from the same tree, acceptable for the fork.

## 5. Performance expectation (stated honestly)

**Perry NaN-boxes values even in the LLVM backend** (`value/jsvalue.rs:8-10` is a `u64`; the LLVM path carries values as `double`, doc 05 §4.2). It is not a static-typed Rust-to-machine-code compiler for arbitrary TS — it is a JS-semantics runtime with AOT codegen and an in-module GC. So the win versus V8 is **not "Rust-fast"** and must never be sold as such. The honest expectation:

- **Steady state: competitive-to-better.** Both run the same NaN-boxed value model; V8's JIT is a mature optimizing compiler. On a hot CPU-bound kernel, Perry-AOT is plausibly comparable, sometimes better (no deopt cliffs, no JIT tier churn, smaller working set), sometimes worse (V8's adaptive optimization is very good on hot loops). The benchmark measures which, per kernel.
- **Cold start: clearly better.** AOT has no JIT warmup. Doc 03 measured ~40% first-call V8 JIT warmup on the kernel; the Perry-AOT arm has none. For an MMO server module where reducers fire at unpredictable rates, predictable first-call latency is a real operational win.
- **The genuine wins are AOT / no-JIT-warmup / predictable latency / smaller surface** (a freestanding wasm with an in-module runtime vs a full embedded V8 isolate), not raw throughput. State the expectation this way in any write-up; the benchmark's value is the honest curve, not a headline multiple.

The M5 benchmark now measures this as a **real in-SpacetimeDB comparison** (both arms in the same host on a common clock), not doc 04's cross-host proxy — which is the entire reason the sound path is worth the multi-week cost over the proxy.

## 6. The single release option (UX)

One user-facing option, everything else identical. Doc 06 §1, §4.

- **Command/flag.** `spacetime build --engine perry` (a value-enum flag defaulting to the existing rolldown engine). Via publish: `spacetime publish --build-options="--engine perry"` — publish needs no new argument because it re-parses `--build-options` through `build::cli()` (`publish.rs:514-567`). A `package.json`/`spacetime.json` field is acceptable only as a *default-source* the flag overrides, never the primary switch (it would make dev-vs-release a tracked-file edit, fighting fast iteration). tsconfig is the wrong layer (it governs type-checking, not artifact lowering).
- **Dev behavior (default).** `spacetime build` runs `tsc --noEmit` → rolldown → `dist/bundle.js`, publishes `host_type=Js`, loads on V8. Byte-identical to today. Fast iteration.
- **Release behavior.** `spacetime build --engine perry` runs the same `tsc --noEmit` → `perry compile src/index.ts -o dist/module.wasm --target spacetimedb` → `wasm-opt`, publishes `host_type=Wasm`, loads on stock Wasmtime. Same source, same type-check gate, same schema, same publish command.
- **Equivalence contract** (doc 06 §5, the M3/M4 gates). Same `src/index.ts` published two ways into one server: (1) byte-identical describe BSATN (both run the same `registerReducer`/`schema()` pipeline; `reducers.ts:83-84` forces `okReturnType=Product([])`/`errReturnType=String`, so the module-def shape is identical); (2) same reducer set, ids, and ordering; (3) identical observable datastore state for identical args; (4) the one deliberate divergence is host_type (`Js`→V8 vs `Wasm`→Wasmtime). This turns doc 04's cross-host proxy into a fair in-STDB comparison.

## 7. Negative space

### Deliberately NOT built

- **No `PerryWasm` host_type, no host fork, no relaxed import allow-list, no in-host Perry runtime.** §1.1. The seam already exists at `host_type=Wasm`; anything that special-cases Perry in the host defeats "a normal SpacetimeDB module" and re-hosts the JS runtime the wasm-resident design exists to avoid.
- **No modification to SpacetimeDB core or the module loader.** Locked. The fork touches only `crates/cli` (build branch) and `crates/bindings-typescript/src/server` (TS lowering).
- **No re-hosting of Perry's 211-function `rt` runtime anywhere.** Perry's runtime becomes wasm-resident (in-module), the way the C++ toolchain bundles libc and shims WASI in-module (`wasi_shims.cpp`). Anything imported outside `spacetime_10.x` is a backend bug, not a host concession.
- **No reliance on Perry's existing `--target wasm`.** It is a browser artifact (alias of `--target web`, doc 04), `rt`-host, by-index exports — the wrong tool. The new `--target spacetimedb` is a separate LLVM-backed path; the two share only the word "wasm" (doc 05 side note).
- **No datastore-touching first module if it needs `FinalizationRegistry`/`using`** and Perry lacks them. The first release-compilable module is scoped to what Perry's surface supports; full datastore iterator support is a later milestone, not M0–M5.
- **No claim of Rust-level performance.** §5. The honest framing (AOT/cold-start/predictable-latency, competitive steady state) is the deliverable, not a headline multiple.

### What invalidates the result

- **Any import outside `spacetime_10.x` in the shipped wasm.** The stock loader rejects it; if M0 "passes" only because a host change was snuck in, the whole premise is void. The `wasm-tools dump` import check is the guard.
- **Schema bytes diverging between the dev and release paths.** If `__describe_module__` BSATN differs, the two arms are not the same module and the latency comparison is meaningless (M3 gate).
- **Fuel metering silently distorting the Wasm arm** while the V8 budget is stubbed — compare wall-clock, not energy; size under the fuel budget (M5).
- **A low-iteration sweep dominated by V8 JIT warmup** read as a Perry win — discard warmup, report cold separately.
- **Treating the NaN-canonicalization spec-reading as proven** before M1's dump confirms it on a real module (B4).

### Open questions for the user

- **Is the multi-week M2 backend in budget?** It is the whole cost. If not, the honest deliverable reverts to doc 04's labelled proxy. The kill-criteria in §4 are the explicit escalation triggers.
- **Server version: pin 2.0.1 (doc-03 working baseline) or bump to 2.3.0 (doc-02 ABI anchor)?** Both are ABI major 10 / V10; 2.0.1 is the proven-publishable one. The Perry `--target spacetimedb` backend must be co-versioned with whichever ABI major the TS runtime targets (currently V10) — a submodule pin or version+sha512 binary pin prevents silent backend-vs-ABI skew.
- **First release-compilable module scope: reducer-only, or datastore-touching?** Reducer-only is buildable without confirming Perry's `FinalizationRegistry`/`using` support; datastore-touching needs that confirmation and may push a later milestone. Which does the MMO use case need first?
- **Embedding: git submodule of api-haus/perry into api-haus/SpacetimeDB (recommended, co-versions backend with ABI), or pinned prebuilt binary (lower build cost, version-skew hazard)?** The submodule is recommended for the product; the binary pin is a frozen-PoC fallback.

## Side notes / observations / complaints

- **The architecture is sound and the seam is genuinely free — that part is not the risk.** I re-verified the host routing (`host_controller.rs:717-735`), the host_type enum (`control_db.rs:98-99`), the CLI branch point (`tasks/mod.rs:30-58`), and the publish forward (`publish.rs:637`) at HEAD; all four match docs 06 exactly. There is nothing to fork in the host. The entire project risk is concentrated in one place: Perry's LLVM backend gaining the ability to name/sign exports, select an import namespace, and address linear memory (M2/B2/B3). Everything else is plumbing.
- **The C++ binding is the complete worked example and should be the M2/M3 author's primary reference.** `bindings-cpp/include/spacetimedb/abi/abi.h:24` is the exact `import_module/import_name` clang mechanism (I confirmed it; doc 06 cited `abi.h:23-40`, the file is actually at `.../abi/abi.h` — a path nuance worth fixing in any brief), `module_exports.cpp` is the `export_name` dunder shims, `Module.cpp` `ConsumeBytes` is the BytesSource drain loop, and `wasi_shims.cpp` is the in-module-WASI answer to "what about the toolchain's host-import needs." Perry is the fourth instantiation of a pattern C++ and C# already prove works.
- **Doc 05's measurement diff is real and on disk** (`/mnt/archive4/DEV/mmodb/_scratch/perry-wasm-port/measurement.diff`, 325 lines / 9 files; branch `wasm-port-measurement` off `main@4469d0f` is currently checked out in `_vendor/perry` with the changes applied uncommitted). The runtime-core-to-wasm32 result is the one genuinely de-risking finding in the whole investigation: it converts the scariest-sounding part ("port a GC and a JS runtime to freestanding wasm") into ~83 lines of standard port friction, and relocates the real risk to codegen where doc 04 already put it. Before any M2 work, decide whether to commit that branch or rebase it onto `feat/target-spacetimedb`.
- **The honest-performance framing is the thing most likely to be lost in translation to a stakeholder.** "We compiled TypeScript to native wasm for SpacetimeDB" invites "so it's Rust-fast now?" — it is not, because the values are still NaN-boxed and GC'd. The defensible, valuable claim is cold-start and predictable-latency for an MMO reducer workload, with competitive steady-state throughput, measured fairly in-STDB. Lead with that, not a multiple.
- **One residual tension in the locked decisions worth surfacing:** decision (3) says DEV builds keep rolldown→V8 for fast iteration, but if a user's module uses any TS that Perry compiles differently from V8 (or that Perry rejects — decorators are the one documented unsupported feature, doc 00), the dev and release arms can diverge *semantically*, not just in performance. The `tsc --noEmit` gate catches type errors but not engine-semantic differences. The equivalence contract's semantic-equality gate (M4) is the only thing that catches this, and only for the cases the benchmark exercises. A user shipping a release build that was only ever tested on V8 is the latent trajectory-failure here — worth a "test the release arm, not just dev" note in the eventual README.
