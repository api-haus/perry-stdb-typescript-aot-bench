# 01 — Context bundle: E2E Perry-vs-V8 benchmarking harness

## Behavioural problemspace

### How it behaves now

Synthetic microbenchmark numbers exist (doc 16 in `docs/orchestrate/perry-stdb-poc/`): Perry empty = 6.84µs, V8 empty = 7.20µs, Perry cpu_mix (100k xorshift) = 789µs. These come from an in-process `load_module` harness (Criterion, WallTime, no network, no server process, no concurrency). They prove the dispatch mechanism works but do not represent what a real SpacetimeDB deployment would see — they skip module publication, server startup, network round-trips, the full STDB transaction pipeline, and concurrent client load.

### How it is supposed to behave

A real SpacetimeDB module published to a real stock server, called by an external client, measured under realistic conditions: cold startup time (publish → first successful call), transactions per second under sustained load, latency percentiles. Both compilation paths (V8 via rolldown+embedded-V8 and Perry AOT via perry compile → wasm32) tested with the same module source, same server, same client, same measurement methodology.

### What the user wants

> "lets move towards a E2E benchmarking harness where we write an actual spacetimedb module with a simple set of reducers and other functional parts and will benchmark it against actual artillery-like client that we can write in rust"

Target metrics: cold startup time, transactions per second across 3 load types: empty/router/cpu_heavy. Empty = noop. Router = routes things around (io). CPU_heavy = computes made-up rpg-like stats.

User's sequencing: "(1) raw-TS(V8) baseline → (2) Perry empty + CPU kernel → (3) datastore workloads. V8 vs Perry, full suite."

**This orchestration covers (2): empty + cpu_heavy, V8 vs Perry.** Router (IO/datastore) is deferred to phase (3) because it requires Perry BSATN arg decoding (M3 milestone work not yet done).

## Constraints and decisions

1. **Scope: empty + cpu_heavy only.** Router requires Perry BSATN arg decoding (`bytes_source_read` import + decode in the C shim), which is M3 work. The harness will be architected to support adding it later.
2. **Consolidated mode** (Research → Architect → Implement). One agent, one continuous context, freeform phasing.
3. **Reuse the module infrastructure + server; build greenfield the Rust client.** The existing Criterion in-process bench is not applicable — different measurement topology.
4. **SpacetimeDB WS protocol** for the client. HTTP for publish.
5. **Multi-reducer Perry shim extension** — extend `format_stdb_abi_shim_c` from single-reducer (`id==0`) to a switch/cascade + multi-entry describe blob.
6. **Stock SpacetimeDB v2.0.1 server** via `docker-compose.yml` or direct binary at `bin/spacetime-2.0.1`.

## Reuse audit summary

(Full audit: `00-reuse-audit.md`)

| candidate | verdict | justification |
|---|---|---|
| `CompiledModule` + `perry_artifacts_dir` + `benchmarks-ts` sources | extend | Module compilation infra (V8 compile, Perry `from_prebuilt`), existing `empty` reducer, need new cpu_heavy reducer |
| `docker-compose.yml` + `bin/spacetime-2.0.1` | reuse | Server infrastructure — publish to and hammer this server |
| Perry ABI shim (`spacetimedb.rs:123-234`) | extend | Single-reducer → multi-reducer dispatch (switch on id, multi-entry describe) |
| SpacetimeDB Criterion bench (`crates/bench/`) | not applicable | In-process micro-bench, fundamentally different topology |
| Perry-fork `benchmarks/` | not applicable | Benchmarks native executables, not STDB modules |
| Pre-built `.wasm` artifacts | reuse | Perry-compiled objects at repo root (`empty_ts.o`, `numk_ts.o`) |

## Required reading

1. `docs/orchestrate/perry-e2e-bench/00-reuse-audit.md` — full reuse audit with file:line citations.
2. `_vendor/perry-fork/crates/perry/src/commands/compile/spacetimedb.rs` — the Perry→SpacetimeDB compile command. Contains `format_stdb_abi_shim_c` (the C shim generator), `find_wasm32_runtime_archive`, `collect_user_function_exports`. This is the code to extend for multi-reducer dispatch.
3. `_vendor/SpacetimeDB-fork/modules/benchmarks-ts/src/synthetic.ts` — existing TS module with `empty` reducer. Source for the E2E module's empty reducer.
4. `_scratch/m2-spike/stdb_abi_shim.c` — hand-written shim from M2 spike. Shows the proven ABI pattern (MODULE_DEF blob, `__describe_module__`, `__call_reducer__`).
5. `_scratch/m2-verify/spike.ts` — the TS source that was compiled by Perry for the M2 spike. Shows how user functions are exported for Perry compilation.
6. `docker-compose.yml` — server infrastructure.
7. `_vendor/SpacetimeDB-fork/crates/testing/src/modules.rs:162-191` — `CompiledModule::compile` and `from_prebuilt` for understanding the build paths.
8. `docs/orchestrate/perry-stdb-poc/14-perry-bench-design.md` — prior architect design for the synthetic bench phase. Relevant patterns: the thin-wrapper TS module, the bypass wiring, the integer xorshift kernel.
9. `docs/orchestrate/perry-stdb-poc/16-perry-number-verify.md` — verified first numbers + side notes on module size and shadow-stack overhead.

## Open questions / unresolved forks (resolve from code + canon)

- **SpacetimeDB client protocol for reducer calls:** is it HTTP REST, WebSocket, or the SDK's binary WS protocol? The artillery client needs to use whatever the server accepts. Investigate the `spacetime call` CLI command and the SDK client protocol.
- **Cold startup measurement boundary:** is "cold startup" measured as time from `spacetime publish` completing to first successful reducer call? Or from server process start? Or module instantiation? The handoff says "cold startup time" without specifying the boundary — pick the most meaningful one (likely publish-to-first-call, which includes module compilation/instantiation on the server side).
- **CPU-heavy kernel for Perry:** the synthetic bench used a 100k xorshift mix. For E2E, should it be the same kernel or something more representative ("computes some made-up rpg-like stats")? The user said "rpg-like stats" — this suggests character stat computation (attack/defense/damage formulas). Pure integer math, no tables, no args needed. Design the kernel.
- **Concurrency level for TPS measurement:** how many concurrent connections? The artillery client needs a configurable concurrency level. Pick a reasonable default (e.g. 1, 4, 16 connections).
- **Multi-reducer describe blob format:** the current shim has a hand-built single-reducer BSATN blob. Extending to multiple reducers requires understanding the `RawModuleDef::V10` format for N reducers. Investigate the binary format from `_scratch/abi-probe/decode.py` and/or the Rust serialization in `crates/lib/src/db/raw_def/`.
