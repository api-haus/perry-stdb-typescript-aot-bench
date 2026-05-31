# 10 — Benchmark landscape: reusing SpacetimeDB's own suite for raw-TS vs Perry

We do not need to invent a benchmark. SpacetimeDB ships an official, language-parameterized module benchmark suite, and it already contains a TypeScript benchmark module. Raw-TS-vs-Perry is an additional arm on that suite, not a new harness.

## What exists (in `_vendor/SpacetimeDB`, verified at HEAD)

- **`crates/bench` (`spacetimedb-bench`)** — Criterion + Callgrind (iai-callgrind) suite. `README.md` states it compares "the underlying spacetime datastore, spacetime modules, and sqlite." Entry points: `benches/{generic,special,index,subscription,delete_table,callgrind}.rs`. Run with `cargo bench --bench generic --bench special` (set `RUN_ONE_MILLION=true` for the large insert/update sweeps).
- **The module arm is generic over language.** `crates/bench/src/spacetime_module.rs` defines `SpacetimeModule<L: ModuleLanguage>`; every `BenchDatabase` method "just invokes reducers" (`call_reducer_binary`). It loads the module in-process via `spacetimedb_testing` (not the docker server) and benchmarks per-reducer execution on a common Criterion clock. The comment at `:24` ties it to `modules/benchmarks/src/lib.rs`.
- **`ModuleLanguage` trait** (`crates/testing/src/modules.rs`) already has four impls, each lazily compiling a language-parallel module: `Rust` → `benchmarks`, `Csharp` → `benchmarks-cs`, `TypeScript` → `benchmarks-ts`, `Cpp` → `benchmarks-cpp`. `NAME` distinguishes them in the result labels (`stdb_module/<NAME>`).
- **`modules/benchmarks-ts/`** — a complete TypeScript benchmark module mirroring the Rust one. `src/synthetic.ts` exports the standard workloads: `empty`, `insert_{unique_0,no_index,btree_each_column}_u32_u64_{str,u64}`, `insert_bulk_*`, `update_bulk_*`, `iterate_*`, and filtering; `src/{circles,ia_loop,load}.ts` are the game-like / bulk workloads. It depends on `spacetimedb` (`workspace:^`), i.e. our fork's `crates/bindings-typescript`.

## The gap

The criterion entry points currently instantiate only Rust and C#: `generic.rs` runs `bench_suite::<SpacetimeModule<Rust>>` and `<Csharp>`; `special.rs` runs `custom_benchmarks::<Rust>` and `<Csharp>`. **The `TypeScript` language is defined but not wired into the default benchmark runs**, and there is no Perry arm.

## How raw-TS vs Perry maps onto it

One source, two arms, identical harness and clock:

- **Raw TypeScript (control)** — `SpacetimeModule<TypeScript>`: `benchmarks-ts` compiled the normal way (rolldown → single JS → `host_type=Js`, embedded V8). This arm needs no Perry at all; wiring it into `generic.rs`/`special.rs` yields the V8-TS baseline immediately, alongside Rust/C#/C++ for context.
- **Perry** — a new `ModuleLanguage` impl (e.g. `TypeScriptPerry`, `NAME="typescript-perry"`) that compiles the **same** `benchmarks-ts` source with `--engine perry` (the M4 flag) → freestanding wasm32 → `host_type=Wasm`, loaded by the stock Wasmtime path. Add it next to the others: `bench_suite::<SpacetimeModule<TypeScriptPerry>>`.

`cargo bench` then runs both arms over the same reducers, and the Criterion report is the direct V8-JIT-vs-Perry-AOT comparison on a common clock — the number this project exists to produce, inside the official suite.

## What is measurable when (honest milestone split)

- **`empty` reducer (call overhead) — soonest.** `empty` touches no datastore and does no compute; it isolates reducer-dispatch cost. The M2 spike already loads and calls a no-op reducer on the stock host, so the Perry side of an `empty`-overhead comparison is within reach of M2-proper (real `__call_reducer__` dispatch with a no-arg reducer), independent of any table support.
- **A CPU-bound kernel (the `mix` xorshift kernel from doc 03/04) — next.** Reducer-only (no datastore), so reachable once Perry has real dispatch + arg decode + the wasm32 runtime archive linked. This is the cleanest AOT-vs-JIT signal and is not in the stock suite; add it as a `special.rs` custom workload or run it standalone.
- **The synthetic datastore workloads (`insert_bulk`/`update_bulk`/`iterate`/`filter`) — M3.** These call table ops, so the Perry module needs the full datastore ABI (the table-related `spacetime_10.x` imports + the `bindings-typescript` SDK lowering). They are the richest comparison but gated on M3.
- **`circles`/`ia_loop` (game-like) — after the datastore workloads**, same dependency.

## Immediate, Perry-independent win

Wiring `SpacetimeModule<TypeScript>` into `generic.rs`/`special.rs` and running `cargo bench` produces the **raw-TS-on-V8 baseline today** (vs Rust/C#), with zero dependency on the Perry backend. That baseline is independently useful and is the control arm every later Perry number is compared against.

## Side notes / observations / complaints

- The bench module arm runs **in-process** via `spacetimedb_testing` (it caches wasmtime artifacts under `crates/bench/.spacetime`), not against the docker server — so building `crates/bench` links the full STDB core/datastore. That is a heavier build than the docker-publish path the M1/M2 spikes used; budget for it when wiring the TS/Perry arms.
- `benchmarks-ts` depends on `spacetimedb` `workspace:^`, so the bench compiles the TS module against the in-tree `bindings-typescript` — i.e. **our fork's** SDK once we work in `api-haus/SpacetimeDB`. The Perry arm and the SDK lowering therefore co-live in the same fork, which is convenient.
- The default `empty`-reducer overhead is noted at `spacetime_module.rs:39` as ~20,000 ns — a concrete baseline to sanity-check our first Perry `empty` number against.
