# 11 — Raw-TypeScript-on-V8 baseline (Step 1, no Perry)

This is the control arm every later Perry number is compared against: `benchmarks-ts` compiled the normal way (rolldown to a single `bundle.js`, `host_type=Js`, loaded by the host's embedded V8) and benchmarked through SpacetimeDB's own `crates/bench` suite on the same Criterion clock as the Rust and C# arms. No Perry is involved. The work happened in the synced fork `api-haus/SpacetimeDB` at `/mnt/archive4/DEV/mmodb/_vendor/SpacetimeDB-fork`, on branch `feat/perry-release-engine` cut off `master` (HEAD `d31301a8`, upstream master, ~2.3.0).

The headline result is that the TypeScript-on-V8 `empty`-reducer call overhead is essentially identical to Rust (about 7.2 µs vs 7.1 µs), the CPU/marshaling workloads in the `special` suite ran end-to-end for TypeScript, and the synthetic datastore table workloads in the `generic` suite are blocked for the TypeScript arm by a reducer-name mismatch in the upstream `benchmarks-ts` module source (not by the wiring).

## The wiring diff (file:line)

The `TypeScript` language is already a defined `ModuleLanguage` (`crates/testing/src/modules.rs:378-390`: `NAME="typescript"`, `get_module()` lazily compiles the `benchmarks-ts` module via `CompiledModule::compile`). The only change needed was adding it to the two criterion entry points' run lists, matching the existing Rust/C# pattern exactly. Committed as `df92a1d5b`.

`crates/bench/benches/generic.rs`:
- line 14 — import: `use spacetimedb_testing::modules::{Csharp, Rust, TypeScript};`
- line 36 — in-memory arm: `bench_suite::<spacetime_module::SpacetimeModule<TypeScript>>(c, true).unwrap();`
- line 42 — on-disk arm: `bench_suite::<spacetime_module::SpacetimeModule<TypeScript>>(c, false).unwrap();`

`crates/bench/benches/special.rs`:
- line 13 — import: `use spacetimedb_testing::modules::{Csharp, ModuleLanguage, Rust, TypeScript};`
- line 35 — `custom_benchmarks::<TypeScript>(c);`

`TypeScript` is not aliased to `Rust`: it is the distinct `pub struct TypeScript` whose `L::NAME == "typescript"` (producing the `stdb_module/typescript` / `special/db_game/typescript` Criterion labels) and whose `get_module()` calls `CompiledModule::compile("benchmarks-ts", …)`. The labels in the results below confirm a genuinely separate compiled module ran.

## How benchmarks-ts was made buildable in-tree

`SpacetimeModule::<TypeScript>::build` calls `L::get_module()`, which calls `CompiledModule::compile("benchmarks-ts", …)` (`crates/bench/src/spacetime_module.rs:71` → `crates/testing/src/modules.rs:385`), which calls `spacetimedb_cli::build(module_path("benchmarks-ts"), …)`. For a JavaScript/TypeScript module that routes to `build_javascript` (`crates/cli/src/tasks/javascript.rs:44`), which (a) optionally runs `node_modules/.bin/tsc --noEmit` if present, then (b) bundles `./src/index.ts` with rolldown into `./dist/bundle.js`, marking `spacetime:sys*` external and resolving everything else through the package's `exports` map.

`benchmarks-ts` depends on `spacetimedb` (`workspace:^`, `modules/benchmarks-ts/package.json`), which is the in-tree `crates/bindings-typescript` package. Its `./server` subpath export resolves to `./dist/server/index.mjs` (the package's `exports` map keys all point under `dist/`), so the in-tree SDK must be built before the module can bundle. The repo is a pnpm workspace (`package.json` `packageManager: pnpm@10.16.0`; `pnpm-workspace.yaml` lists `modules/benchmarks-ts` and `crates/bindings-typescript`). Two prerequisite steps, run once:

1. `pnpm install --frozen-lockfile` at the repo root — resolves the workspace and symlinks `modules/benchmarks-ts/node_modules/spacetimedb` to `../../../crates/bindings-typescript`. (47 s; exit 0.)
2. `pnpm --filter spacetimedb run build` — runs the SDK's `build:js` (tsup) then `build:types` (tsc), producing `crates/bindings-typescript/dist/`, including `dist/server/index.mjs`. (~a few seconds per chunk; exit 0.)

With those in place, the module builds. Verified standalone, decoupled from the bench harness:

```
./target/debug/spacetimedb-cli build -p modules/benchmarks-ts
# → "Build finished successfully."  →  modules/benchmarks-ts/dist/bundle.js (829 KB)
```

The one warning printed during the build, `tsc not found in node_modules`, is non-fatal by design (`javascript.rs:66-71` prints it and continues): `typescript` is a dev-dependency of the workspace root, not of `benchmarks-ts` itself, so the per-module `node_modules/.bin/tsc` is absent and the `--noEmit` type-check step is skipped. The rolldown bundle (which does the actual lowering) still runs and resolves `spacetimedb/server` correctly. `wasm-opt` is also absent on this machine, but it is irrelevant to the TypeScript arm (it only touches the release Wasm path at `tasks/mod.rs:39`, and the JS arm returns at `tasks/mod.rs:30-31` before reaching it).

## Results — Rust vs TypeScript median times

All medians are Criterion `point_estimate`s read from `target/criterion/**/new/estimates.json` (in nanoseconds there; converted to friendly units here). All arms ran in-memory (`build(true)`) on the same machine, same process, same clock. C# did not run locally — see the wall below — so the C# column is left empty rather than fabricated.

### `special` suite (CPU / marshaling / game-like; ran fully for both arms)

| workload | rust | csharp | typescript | TS/Rust |
|---|---|---|---|---|
| `large_arguments/64KiB` | 20.99 µs | (not run) | 22.69 µs | 1.08× |
| `print_bulk/lines=1` | 9.58 µs | (not run) | 12.62 µs | 1.32× |
| `print_bulk/lines=100` | 56.81 µs | (not run) | 237.0 µs | 4.17× |
| `print_bulk/lines=1000` | 480.0 µs | (not run) | 2.337 ms | 4.87× |
| `db_game/circles/load=10` | 15.11 ms | (not run) | 36.11 ms | 2.39× |
| `db_game/circles/load=100` | 14.98 ms | (not run) | 34.02 ms | 2.27× |
| `db_game/ia_loop/load=10` | 3.044 ms | (not run) | 2.940 ms | 0.97× |
| `db_game/ia_loop/load=100` | 4.082 ms | (not run) | 8.076 ms | 1.98× |

### `generic` suite (synthetic datastore; `empty` ran for both, table workloads ran only for Rust)

| workload (`u32_u64_str`, `mem`) | rust | csharp | typescript |
|---|---|---|---|
| `empty` (call overhead) | 7.14 µs | (not run) | 7.20 µs |
| `insert_bulk/unique_0/load=2048/count=256` | 208.4 µs | (not run) | blocked |
| `insert_bulk/btree_each_column/load=2048/count=256` | 330.9 µs | (not run) | blocked |
| `iterate/unique_0/count=256` | 25.83 µs | (not run) | blocked |
| `update_bulk/unique_0/load=2048/count=256` | 249.2 µs | (not run) | blocked |
| `filter/string/index/load=2048/count=256` | 27.79 µs | (not run) | blocked |

For orientation, the `generic` suite also produced the non-module baselines on the same run: `sqlite/mem/empty` is absent (sqlite has no empty reducer), `stdb_raw/mem/iterate/u32_u64_str/unique_0/count=256` was 520.7 ns and `stdb_raw/.../insert_bulk/unique_0/...` 100.3 µs — i.e. the raw datastore arm is the floor, the Rust module arm adds the reducer-dispatch + BSATN-marshaling overhead on top, and the TypeScript module arm would add V8 execution on top of that once unblocked.

## The empty-reducer overhead number

`stdb_module/typescript/mem/empty` median is **7201.4 ns** (≈ 7.2 µs), against `stdb_module/rust/mem/empty` at **7139.7 ns** (≈ 7.1 µs) — a ~0.9 % difference, i.e. statistically indistinguishable. `empty` touches no datastore and does no compute, so this isolates the reducer-dispatch path: argument decode, the `__call_reducer__` round-trip, and the commit. The V8 arm pays essentially the same dispatch cost as the native Rust arm here; the gap that shows up in the `print_bulk` and `circles` rows is V8 *execution* cost on a non-trivial reducer body, not dispatch overhead.

This is far below the `~20,000 ns` figure noted historically at `spacetime_module.rs:39`; that comment predates current dispatch and is a stale ceiling, not the current floor.

## Observations — how much slower is V8-TS than Rust, per workload

- **Pure dispatch (`empty`): no penalty.** ~7.2 µs both arms.
- **Marshaling-dominated (`large_arguments/64KiB`): ~1.08×.** A 64 KiB argument is dominated by host-side BSATN transfer, which both arms share, so V8 barely shows.
- **Reducer-body work scales the penalty.** `print_bulk` goes from 1.32× at one line to 4.87× at a thousand lines: as the V8-executed body does more (string formatting + per-line host log calls), the JIT'd JS falls progressively further behind native Rust. The `circles` game workload sits at ~2.3-2.4× and `ia_loop` ranges 0.97× (load=10, where fixed costs dominate and TS is marginally ahead) to 1.98× (load=100).
- **Steady-state, the V8 arm is within a single-digit multiple of Rust on these workloads** — consistent with doc 07 §5's honest expectation (competitive-to-worse steady state, the real wins elsewhere). This is the V8 baseline; the Perry-AOT arm will be measured against exactly these `typescript` rows on the same clock.

## Reproduction commands

From `/mnt/archive4/DEV/mmodb/_vendor/SpacetimeDB-fork` on branch `feat/perry-release-engine`:

```bash
# one-time TS prerequisites
pnpm install --frozen-lockfile
pnpm --filter spacetimedb run build          # builds crates/bindings-typescript/dist (incl. dist/server)

# (optional) confirm the TS module bundles standalone
cargo build -p spacetimedb-cli --bin spacetimedb-cli
./target/debug/spacetimedb-cli build -p modules/benchmarks-ts   # → dist/bundle.js

# the benchmarks (release profile; full STDB core links — heavy first build)
cargo bench -p spacetimedb-bench --bench special                 # CPU/marshaling/game workloads
cargo bench -p spacetimedb-bench --bench generic                 # empty + synthetic datastore (default sizes)
# RUN_ONE_MILLION=true cargo bench -p spacetimedb-bench --bench generic   # large-sweep variant (NOT run here)
```

Note the `-p spacetimedb-bench` scope: `crates/bench` is not a default-run member, so `cargo bench --bench special` from the workspace root fails with `no bench target named 'special' in default-run packages`. Criterion writes `target/criterion/<group>/<bench>/new/estimates.json`; the empty-reducer estimates are at `target/criterion/stdb_module_{rust,typescript}_mem/empty/new/estimates.json`, and the special workloads at `target/criterion/special_stdb_module_typescript/*/new/estimates.json` and `target/criterion/special_db_game_typescript/*/new/estimates.json`. Raw run logs were captured at `/tmp/special-ts-bench.log` and `/tmp/generic-ts-bench.log`.

## The two walls (documented, not worked around in the committed branch)

### Wall 1 — C# arm: missing `wasi-wasm` runtime pack (blocks the C# column locally)

`custom_benchmarks::<Csharp>` (and the C# arm in `generic.rs`) panic at module compilation:

```
NETSDK1084: There is no application host available for the specified RuntimeIdentifier 'wasi-wasm'.
  [modules/benchmarks-cs/benchmarks-cs.csproj]
thread 'main' panicked at crates/testing/src/modules.rs:170:10:
Module compilation failed: command ["dotnet","publish","-c","Release","-v","quiet"] exited with code 1
```

`dotnet` 8.0.421 is installed and `dotnet workload list` reports `wasi-experimental` (manifest 8.0.27/8.0.100) is installed, but `/usr/share/dotnet/packs` contains no wasi pack and `dotnet restore -r wasi-wasm` does not auto-fetch it — the `Microsoft.NET.Runtime.WebAssembly.Wasi` runtime pack (which provides the `wasi-wasm` apphost) is absent. This is a host-toolchain gap, independent of the wiring and independent of the TypeScript arm. Because C# is instantiated before TypeScript in both entry points and the failure is a `panic` (not a recoverable error), it aborts the whole process before the TypeScript arm runs. To obtain the TypeScript numbers above, the C# instantiation was temporarily skipped *for the run only* (a local edit, reverted before committing — the committed branch keeps all three arms wired). Installing the runtime pack (`dotnet workload install wasi-experimental` against a SDK with the matching band, or fetching the `Microsoft.NET.Runtime.WebAssembly.Wasi` pack) would let the C# column fill in with no code change.

### Wall 2 — TypeScript generic table workloads: reducer-name mismatch in the module source

The TypeScript `empty` ran, but the first table reducer the harness called panicked:

```
Error … function":"insert_bulk_unique_0_u_32_u_64_str","message":"External attempt to call nonexistent reducer"
Caused by: no such reducer
```

Root cause, grounded:
- The harness builds reducer names from `table_id.snake_case` via `format!("insert_bulk_{}", …)` (`spacetime_module.rs:152`), and `create_table` sets `snake_case` by running the table name through `convert_case`'s `Case::Snake` (`spacetime_module.rs:96-97`), which inserts underscores at letter-digit boundaries: `u32` → `u_32`. So the harness calls `insert_bulk_unique_0_u_32_u_64_str`. The comment at `spacetime_module.rs:93-95` states this is deliberate — it matches the modules' default `CaseConversionPolicy::SnakeCase`.
- The Rust module's `#[spacetimedb::reducer]` macro applies that same SnakeCase policy, so the Rust module actually registers `insert_bulk_unique_0_u_32_u_64_str` — matching the harness. That is why the Rust arm runs.
- The TypeScript module passes an explicit `{ name: 'insert_bulk_unique_0_u32_u64_str' }` to `spacetimedb.reducer(...)` (`modules/benchmarks-ts/src/synthetic.ts:124` and ~40 sibling reducers). At `crates/bindings-typescript/src/server/reducers.ts:87-92`, an explicit `opts.name` is recorded verbatim as `canonicalName` with no case conversion. So the TypeScript module registers the literal `insert_bulk_unique_0_u32_u64_str` (no letter-digit underscores), which the harness never asks for. `empty` (no digits) is the one name that survives the mismatch, which is exactly the one TypeScript generic workload that ran.

This is a defect in the upstream `benchmarks-ts` module source — its 40-odd explicit reducer names omit the letter-digit underscores the harness mandates — not a defect in the wiring or the harness. Fixing it (renaming every digit-bearing reducer in `synthetic.ts` to the `u_32_u_64` form, and verifying the table accessors and reducer bodies still line up) is a separate module-source correction; it was deliberately not bundled into this baseline task to keep the change to "wire the arm" and avoid a 40-rename diff with its own correctness surface. With that rename, the TypeScript `insert_bulk` / `update_bulk` / `iterate` / `filter` rows would fill in the same way the `special` rows already did.

## Side notes / observations / complaints

- **The `empty`-overhead parity is the genuinely interesting early signal.** Doc 10 flagged `empty` as the soonest-measurable comparison and doc 07 §5 framed cold-start/dispatch as the real Perry win. The V8 arm already matching Rust on pure dispatch (~7.2 µs) means the dispatch path is *not* where V8 loses — V8 loses in reducer-body *execution* (the `print_bulk`/`circles` rows). That sharpens what the Perry-AOT arm has to beat: not dispatch (already cheap), but the JIT'd body-execution cost, and the cold-start the steady-state Criterion median hides entirely. The steady-state Criterion numbers here say nothing about cold start; doc 07 §5's cold-start claim needs a separate cold-call measurement, which this suite's warm medians cannot provide.
- **The `benchmarks-ts` reducer-name defect means the upstream TypeScript arm has, as far as I can tell, never actually run in `crates/bench`.** It compiles and `empty` dispatches, but the very first table reducer 404s. Either upstream never wired `TypeScript` into the entry points (consistent with doc 10's "defined but not wired" finding — so the mismatch was never exercised), or they ran it differently. Worth a one-line upstream issue note; for our purposes the rename is a known, bounded fix.
- **The full `crates/bench` build is as heavy as doc 10 §warned.** It links the entire STDB core: v8 145, wasmtime 39, cranelift, deno_core, sled, rusqlite, openssl-src, libgit2 — the bench profile build was ~3 min after a warm dependency download, and the dependency download itself pulled v8/wasmtime/etc. cold. Budget this for every later Perry arm; the TS bundle build, by contrast, is seconds.
- **C# being instantiated before TypeScript in both entry points is a fragility:** a panic in an earlier arm's module compile takes down all later arms in the same process. If the suite is meant to be robustly multi-language, `CompiledModule::compile`'s `.expect("Module compilation failed")` (`modules.rs:170`) should arguably degrade to skipping that one arm rather than aborting the whole run. Not in scope here; noted because it is the mechanism that made the C# toolchain gap also block TypeScript.
- **`wasm-opt` and per-module `tsc` are both absent on this machine** and both are non-fatal for the TypeScript arm, but they would matter for other arms: `wasm-opt` for the Rust/C#/Perry release Wasm (it silently continues unoptimized), and `tsc` for catching TS type errors before the bundle (skipped, so a type-broken module would bundle anyway and only fail at describe/run time).
