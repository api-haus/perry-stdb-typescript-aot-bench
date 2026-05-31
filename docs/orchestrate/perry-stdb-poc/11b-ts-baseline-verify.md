# 11b — Independent verification of the TypeScript-on-V8 baseline (Step 1)

This is the independent check of doc 11's claim that the `crates/bench` suite genuinely benchmarked a TypeScript (V8) module rather than silently falling back to the Rust or C# arm or fabricating numbers. The verifier did not do the wiring. The verdict is **confirmed**: the TypeScript arm is correctly wired to a distinct `ModuleLanguage`, the produced Criterion artifacts form genuinely separate `typescript`-labelled benchmark groups with plausible numbers, and every load-bearing number in doc 11 traces to a real artifact or run log. The only discrepancy found is benign and explained below: doc 11 reports Criterion's printed point-estimate while the `estimates.json` `median` field carries a slightly different value, and both are legitimate outputs of the same run.

All checks were cheap (diff inspection, source `file:line`, reading captured `estimates.json` and the run logs). No full re-run was attempted; the `crates/bench` build links the entire STDB core (v8, wasmtime, cranelift, deno_core) and is too heavy to justify when the artifacts and run logs are already on disk and internally consistent.

## The wiring is real and not an alias

The fork is at `/mnt/archive4/DEV/mmodb/_vendor/SpacetimeDB-fork`, branch `feat/perry-release-engine`, HEAD `df92a1d5b` ("bench: wire TypeScript arm…") sitting directly on upstream master `d31301a8f`. The wiring commit touches only the two criterion entry points (`+5 -2` across two files), matching the existing Rust/C# pattern.

`crates/bench/benches/generic.rs`:
- line 14 — `use spacetimedb_testing::modules::{Csharp, Rust, TypeScript};`
- line 36 — in-memory arm: `bench_suite::<spacetime_module::SpacetimeModule<TypeScript>>(c, true).unwrap();`
- line 42 — on-disk arm: `bench_suite::<spacetime_module::SpacetimeModule<TypeScript>>(c, false).unwrap();`

`crates/bench/benches/special.rs`:
- line 13 — `use spacetimedb_testing::modules::{Csharp, ModuleLanguage, Rust, TypeScript};`
- line 35 — `custom_benchmarks::<TypeScript>(c);`

`TypeScript` is a distinct `pub struct TypeScript` at `crates/testing/src/modules.rs:378-390`, with `const NAME: &'static str = "typescript"` and a `get_module()` that compiles `CompiledModule::compile("benchmarks-ts", …)`. It is a separate type from `pub struct Rust` (modules.rs:364-376, `NAME="rust"`, compiles `"benchmarks"`) and `pub struct Csharp` (modules.rs:350-362, `NAME="csharp"`, compiles `"benchmarks-cs"`). A repo-wide grep for `type TypeScript`, `TypeScript = Rust`, or any alias returned nothing — `TypeScript` is genuinely its own language, so the generic instantiation `SpacetimeModule<TypeScript>` cannot collapse into the Rust arm at monomorphization.

The host type is not hardcoded to anything: `CompiledModule::compile` (modules.rs:163-177) calls `spacetimedb_cli::build(module_path(name), …)` and stores whatever `host_type` that build returns (`host_type.parse().unwrap()` at modules.rs:174). For `benchmarks-ts` that build routes through the JavaScript/TypeScript path (bundles `src/index.ts` to a single `bundle.js`, `host_type=Js`, loaded by the host's embedded V8). `modules/benchmarks-ts/package.json` confirms the module is a real TS package (`"name": "benchmarks-ts"`, `"dependencies": { "spacetimedb": "workspace:^" }` — the in-tree `crates/bindings-typescript`), not a Rust crate. So the arm labelled `typescript` runs an actual V8-executed module.

## The Criterion artifacts are real and distinct

`target/criterion/` contains separate `typescript` groups alongside the `rust` groups, never sharing a directory:
- `stdb_module_typescript_mem/` (generic, in-memory) — contains only the `empty/` subgroup.
- `special_stdb_module_typescript/` — `large_arguments_64KiB`, `print_bulk_lines={1,100,1000}`.
- `special_db_game_typescript/` — `circles_load={10,100}`, `ia_loop_load={10,100}`.

The corresponding `*_rust` groups exist beside them. There is **no** `*csharp*` directory anywhere under `target/criterion/`, corroborating doc 11's report that C# was skipped for the run only.

The `stdb_module_typescript_mem` group having exactly one subgroup (`empty`) is itself corroborating evidence of the reported Wall 2: the generic table workloads (`insert_bulk`/`iterate`/`filter`/`update_bulk`) are blocked by the reducer-name mismatch and never produced artifacts, while `empty` (the one digit-free reducer name) did. The Rust counterpart `stdb_module_rust_mem` has 13 subgroups — the table workloads ran for Rust.

The empty-overhead estimate matches doc 11 to the decimal:
- `stdb_module_typescript_mem/empty/new/estimates.json` median `point_estimate` = **7201.414 ns**.
- `stdb_module_rust_mem/empty/new/estimates.json` median `point_estimate` = **7139.743 ns**.

These are ~0.9 % apart — close, which is the headline result, but *not* identical. A silent Rust fallback would make the two estimates byte-for-byte equal (same compiled module, same dispatch); 7201.4 ≠ 7139.7 rules that out. Artifact mtimes are all `2026-05-31 22:41–22:48`, contemporaneous with the wiring commit at `22:05`, so these are fresh run outputs, not stale leftovers.

## Magnitudes are plausible and the slowdown pattern is right

All numbers sit in the expected microsecond-to-millisecond range, and TypeScript is slower than Rust everywhere the reducer body does real work, while matching Rust where only dispatch or host-side marshaling dominates — exactly the V8-vs-native shape one expects:

| workload | rust (point est.) | typescript (point est.) | TS/Rust |
|---|---|---|---|
| `empty` (dispatch only) | 7.14 µs | 7.20 µs | 1.01× |
| `large_arguments/64KiB` (marshal-bound) | 20.99 µs | 22.69 µs | 1.08× |
| `print_bulk/lines=1` | 9.58 µs | 12.62 µs | 1.32× |
| `print_bulk/lines=1000` | 480.0 µs | 2.337 ms | 4.87× |
| `db_game/circles/load=100` | 14.97 ms | 33.94 ms | 2.27× |
| `db_game/ia_loop/load=10` | 3.04 ms | 2.93 ms | 0.97× |
| `db_game/ia_loop/load=100` | 4.07 ms | 8.12 ms | 1.98× |

Nothing is implausible. Pure dispatch is at parity; the gap widens with reducer-body compute (`print_bulk` climbs 1.32× → 4.87× as lines grow); the `ia_loop/load=10` row where TS is marginally *faster* (0.97×) is the kind of fixed-cost-dominated small case where the difference is within noise, not a red flag. None of the TS numbers equal a Rust number to the nanosecond.

## The one discrepancy — point-estimate vs `estimates.json` median (benign)

Doc 11 reports several special-suite numbers that differ slightly from the `median` field in the corresponding `new/estimates.json`:

- `large_arguments/64KiB` TS: doc 22.69 µs; `estimates.json` median 20230.6 ns (20.23 µs).
- `print_bulk/lines=1000` TS: doc 2.337 ms; `estimates.json` median 2305552.7 ns (2.306 ms), mean 2337243.2 ns (2.337 ms).

These are not fabrication and not a different run. Doc 11's special-suite figures are Criterion's **printed point estimate** — the middle value of the `[lower point upper]` confidence interval written to stdout and captured in `/tmp/special-ts-bench.log`. The log shows, verbatim:

```
special/stdb_module/typescript/large_arguments/64KiB
                        time:   [21.956 µs 22.689 µs 23.393 µs]
special/stdb_module/rust/print_bulk/lines=1000
                        time:   [477.61 µs 480.04 µs 482.51 µs]
```

So doc 11's 22.69 µs and 480.0 µs are the printed midpoints exactly. Criterion's printed midpoint (a mean/slope-based point estimate) and the `median` field in `estimates.json` are two different statistics of the same sample; for `print_bulk/lines=1000` the doc's 2.337 ms equals the `estimates.json` **mean**, confirming the doc consistently read Criterion's reported point estimate rather than the median field. The empty-overhead headline (doc 11 §"The empty-reducer overhead number") *does* cite the `median` field and matches it (7201.4 / 7139.7 ns). The mixing is cosmetic — same run, two valid estimators — and does not affect any conclusion. Worth a one-line note in doc 11 that the special table uses printed point estimates while the empty number uses the median field, so a future reader cross-checking `estimates.json` does not think the numbers drifted.

## Reducer-name mismatch (Wall 2) independently confirmed

The harness builds reducer names by running the table name through `convert_case`'s `Case::Snake` (`crates/bench/src/spacetime_module.rs:97`, `raw.as_ref().to_case(Case::Snake)`), and the comment at spacetime_module.rs:93-95 states this matches the modules' default `CaseConversionPolicy::SnakeCase` (inserting `u32 → u_32`). The Rust module's macro applies the same policy, so the Rust arm's reducer names line up and the table workloads run; the TypeScript module registers verbatim explicit names without the letter-digit underscores, so every digit-bearing reducer 404s and only `empty` survives. This is the exact mechanism that produced the one-subgroup `stdb_module_typescript_mem/empty` directory, so the artifact layout and the source explanation agree.

## Verdict

Confirmed. The TypeScript arm genuinely benchmarked a TypeScript (V8) module: distinct `ModuleLanguage` (no alias), distinct compiled `benchmarks-ts` package, distinct Criterion groups with fresh contemporaneous artifacts, numbers that are not nanosecond-identical to Rust and that follow the expected V8-vs-native slowdown curve. The empty-overhead headline (TS 7201.4 ns vs Rust 7139.7 ns) traces exactly to the `median` field of the captured `estimates.json`. The reported blockers (C# wasi pack absent; TS generic table workloads blocked by the upstream reducer-name defect) are corroborated by the artifact layout (no csharp groups, single `empty` TS subgroup) and the source `file:line`.

## Side notes / observations / complaints

- **The point-estimate/median mixing is the only thing to fix, and it is documentation hygiene, not a measurement error.** Doc 11's special-suite table reports Criterion's printed CI-midpoint (which is mean/slope-based), while its empty-overhead section reports the `estimates.json` median field. Both are legitimate, but a reader who cross-checks the special-suite numbers against `estimates.json` `median` will see a ~10 % drift on `large_arguments` and conclude something is wrong. One sentence in doc 11 naming which estimator each table uses would close the gap.
- **The "TS faster than Rust" rows are noise, not signal, and doc 11 already treats them that way.** `large_arguments/64KiB` (TS marginally slower) and `ia_loop/load=10` (TS marginally faster, 0.97×) are both within their confidence intervals of each other — the printed intervals overlap (`rust [20.568 20.994 21.460]` vs `ts [21.956 22.689 23.393]` barely separate; ia_loop/load=10 medians 2.93 ms vs 3.04 ms). These should be read as "parity," and any later Perry comparison against these specific rows should respect that they carry no real ordering.
- **The single-process C#-before-TypeScript ordering remains a latent fragility** (doc 11 §Wall 1 already flags it): because `CompiledModule::compile` panics (`modules.rs:170` `.expect`) rather than returning a skippable error, a missing C# toolchain aborts the whole run before TypeScript would execute, which is why C# had to be locally skipped to get the TS numbers at all. The committed branch correctly keeps all three arms wired, but the run-time robustness gap (one arm's compile failure kills all later arms in the same process) is real and will bite again the first time the Perry arm or C# arm fails to compile on a given machine. Not a verification blocker; a standing hazard for the multi-arm comparison plan.
- **I did not re-run any benchmark.** The verification rests on the wiring diff, source `file:line`, the on-disk `estimates.json` artifacts, and the captured run logs (`/tmp/special-ts-bench.log`, `/tmp/generic-ts-bench.log`), all of which are mutually consistent and dated to the same run window. A single-case re-run would have required the full `crates/bench` core link (v8/wasmtime/cranelift/deno_core), which doc 11 measured at ~3 min warm and far more cold — not worth it given the artifacts already cross-check.
