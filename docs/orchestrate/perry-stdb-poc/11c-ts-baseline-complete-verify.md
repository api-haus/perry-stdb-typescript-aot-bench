# 11c — Independent verification of the TS-baseline "completion" claim

This is an independent verifier's audit of the completion agent's claim that the TypeScript generic-table workloads were unblocked and run. I did not perform the fix. The headline finding is split: the reducer-name fix is genuinely byte-correct and I confirmed it against the actual `convert_case` crate and the host-side validation code, but the benchmark never produced any TypeScript table-workload numbers — the run was interrupted while still inside the sqlite arm, and `target/criterion/` contains only `sqlite_mem`. The completion agent's own `partial` status and its "NONE CAPTURED YET" report are therefore accurate and contain no fabricated medians.

## Verdict summary

- **Reducer-name fix: confirmed correct (byte-exact).** The names the host registers match the names the harness calls, verified at the byte level.
- **TS table workloads ran: refuted.** No `stdb_module_typescript*` Criterion group exists; the bench stopped mid-sqlite. Zero TS (and zero Rust, zero special) module medians were produced this run.
- **No fabrication.** doc-11 was not edited, no TS table numbers were invented anywhere, and the committed branch still keeps all three arms wired.

## What the fix actually is (and why it differs from doc-11's prediction)

doc-11 §"Wall 2" predicted the fix would be "renaming every digit-bearing reducer in `synthetic.ts` to the `u_32_u_64` form" — i.e. editing the explicit `{ name: 'insert_bulk_unique_0_u32_u64_str' }` strings to carry the letter-digit underscores. The implemented fix is the opposite and cleaner move: it **deletes the explicit `{ name: … }` option from every reducer** (`modules/benchmarks-ts/src/synthetic.ts`, the diff removes ~40 such options and reformats the no-arg reducers like `empty`, `iterate_*`, `count_*`, `clear_table_*`). With no explicit override, the canonical reducer name is re-derived from the export binding name by the module's default `SnakeCase` policy, using the same `convert_case` transform the harness uses — so both sides converge on the `u_32` form without anyone hand-typing the underscores.

This is a better fix than the doc predicted (it cannot drift, because the same `to_case(Case::Snake)` runs on both sides), but it is a *different* correctness surface than doc-11's root-cause write-up described, so it warranted independent re-grounding rather than trusting the doc.

## The name-match check, grounded at file:line

The match hinges on one fact: the explicit-name path and the case-conversion path produce different strings for digit-bearing names, and removing the explicit name switches the module from the former to the latter.

Harness side (what gets called):
- The reducer name is `format!("insert_bulk_{}", table_id.snake_case)` and siblings (`crates/bench/src/spacetime_module.rs:152` insert_bulk, `:163` update_bulk, `:173` iterate, `:191` filter `filter_{}_by_{}`).
- `table_id.snake_case` is the raw table name `{style}_{T::name()}` (`crates/bench/src/schemas.rs:163-167`, e.g. `unique_0_u32_u64_str`) run through `.to_case(Case::Snake)` (`spacetime_module.rs:96-97`). The comment at `spacetime_module.rs:93-95` states this deliberately matches the modules' default SnakeCase policy.

Module/host side (what gets registered):
- Removing `{ name: … }` means `opts.name` is `null`, so the SDK records only `sourceName: exportName` and pushes **no** entry into `explicitNames` (`crates/bindings-typescript/src/server/reducers.ts:77-95`; the `explicitNames` push is gated on `opts?.name != null` at `:87`). `exportName` is the JS export binding name from `Object.entries(exports)` (`crates/bindings-typescript/src/server/schema.ts:192-200`), i.e. the literal `insert_bulk_unique_0_u32_u64_str`.
- With no explicit override, host-side schema validation derives the canonical name: `validate_reducer_def` calls `self.core.resolve_function_ident(source_name)` (`crates/schema/src/def/validate/v10.rs:621`), which (no override present) falls to `resolve_identifier_with_case` → `convert(source_name, SnakeCase)` (`crates/schema/src/def/validate/v9.rs:630-643`), and `convert` for `SnakeCase` is exactly `identifier.to_case(Case::Snake)` (`v9.rs:1477-1485`). The default policy is `SnakeCase` (`crates/bindings-typescript/src/lib/schema.ts:200`; `ValidationCase` mapping at `v10.rs:65-72`).
- The SDK's own `toSnakeCase` (`crates/bindings-typescript/src/lib/util.ts:125-130`) only inserts underscores before capitals and does **not** add letter-digit underscores — but it is not on this path; the host's Rust `convert_case` is. Confirming this mattered: the SDK path would have left `u32` intact and the fix would have failed.

Both sides therefore call the identical `convert_case` (`Case::Snake`), pinned to the same workspace version: `convert_case = "0.6.0"` (`Cargo.toml:180`), used by both `crates/bench/Cargo.toml:58` and `crates/schema/Cargo.toml:35` via `convert_case.workspace = true`. Two callers of one transform cannot disagree.

I verified the transform empirically against the real `convert_case 0.6.0` crate rather than trusting the digit-boundary claim (the `u32 → u_32` rendering is exactly the corruption-danger identifier the task flagged). Feeding the actual fixed export-binding names through `"…".to_case(Case::Snake)`:

| harness call (`insert_bulk_` + table snake_case) | host canonical (`convert(source_name, Snake)`) | match |
|---|---|---|
| `insert_bulk_unique_0_u_32_u_64_str` | `insert_bulk_unique_0_u_32_u_64_str` | yes |
| `insert_bulk_btree_each_column_u_32_u_64_str` | `insert_bulk_btree_each_column_u_32_u_64_str` | yes |
| `insert_bulk_unique_0_u_32_u_64_u_64` | `insert_bulk_unique_0_u_32_u_64_u_64` | yes |
| `iterate_unique_0_u_32_u_64_str` | `iterate_unique_0_u_32_u_64_str` | yes |
| `update_bulk_unique_0_u_32_u_64_str` | `update_bulk_unique_0_u_32_u_64_str` | yes |
| `filter_unique_0_u_32_u_64_str_by_name` | `filter_unique_0_u_32_u_64_str_by_name` | yes |
| `empty` | `empty` | yes |

Filter column names (`id`, `name`, `age`, `x`, `y`) carry no digits and pass through unchanged, so `filter_{table}_by_{col}` lines up on both sides. I also Read the fixed `synthetic.ts:39-83` directly to confirm the explicit-name option object is gone and the surviving `name:` occurrences are all the `name: t.string()` param-field and `p.name` field-access kind, never a reducer-name option.

## Criterion-group evidence — the workloads did NOT run

The decisive negative evidence:

- `find target/criterion -maxdepth 1 -mindepth 1 -type d` returns exactly one group: `sqlite_mem`. There is **no** `stdb_module_typescript_mem`, no `stdb_module_rust_mem`, no `special_*`, no `db_game_*`. So there are no `insert_bulk`/`iterate`/`filter`/`update_bulk` subgroups for the TypeScript (or even the Rust) module arm — empty or otherwise — and no `estimates.json` medians to read for them.
- The only `estimates.json` files present (14 total) are under `sqlite_mem/*`. The TS arm runs *after* sqlite/stdb_raw/rust in `generic.rs`, so the absence of even the rust group confirms the run never advanced past the sqlite arm.
- The run log `/tmp/ts-bench-full.log` is 80 lines: build finished in 1m39s (`:20`), `generic` started, and the last benchmark recorded is still `sqlite/mem/insert_bulk/u32_u64_u64/btree_each_column/…` (`:78-81`) — mid-sqlite. No process is still running (`ps` shows no cargo/criterion/bench). The run was interrupted; it did not complete, error out cleanly, or reach the module arms.

The completion agent's claim is consistent with this: it reported `status: partial`, `table_results: ["NONE CAPTURED YET …"]`, and listed "BENCH NOT FINISHED … still in the sqlite arm (only 2 time: lines)" as a blocker. That matches the on-disk reality. **No magnitude sanity-check against the Rust arm is possible**, because neither the Rust module arm nor the TypeScript module arm produced any numbers this run; the only fresh numbers are sqlite (e.g. `sqlite/mem/empty` 219 ns, `sqlite/mem/insert_bulk/u32_u64_str/unique_0/…` ~50.8 µs), which are the non-module baseline floor, not a module comparison.

## Other claims, checked

- **`csharp_ran: false`** — confirmed. The working tree comments out the C# arm at three sites, each marked `// TEMP-LOCAL (revert before commit)`: `crates/bench/benches/generic.rs` (the in-memory and on-disk C# `bench_suite` calls) and `crates/bench/benches/special.rs` (the `custom_benchmarks::<Csharp>` call). These produce the `unused import: Csharp` warnings seen in the log (`:2-19`).
- **`branch_pushed: false` / not committed** — confirmed. `git status --porcelain` shows three unstaged modifications: `crates/bench/benches/generic.rs`, `crates/bench/benches/special.rs`, `modules/benchmarks-ts/src/synthetic.ts`. The committed HEAD (`df92a1d5b`, "bench: wire TypeScript arm …") keeps **all three arms wired** (`git show HEAD:…/generic.rs` shows both `Csharp` and `TypeScript` calls present, no TEMP-LOCAL), and `git show HEAD:…/synthetic.ts` still contains 12 `name: 'insert…'` explicit options — i.e. the synthetic.ts fix is genuinely only in the working tree, not committed. The TEMP-LOCAL skips are run-only working-tree state, exactly as the agent and doc-11 Wall 1 state.
- **doc-11 not updated** — confirmed. Its `generic` table still marks the TS rows `blocked` (`11-ts-v8-baseline.md:62-66`); no fabricated TS table medians were inserted.

## Discrepancies / caveats

- **The committed `dist/bundle.js` was stale at audit time.** Before this audit, `modules/benchmarks-ts/dist/bundle.js` still contained the pre-fix code (`insert_unique_0_u32_u64_str = spacetimedb.reducer({` with the object-option form). I rebuilt it from the fixed source via `./target/debug/spacetimedb-cli build -p modules/benchmarks-ts` ("Build finished successfully") to confirm the source bundles, but note the bench harness rebuilds the module itself via `CompiledModule::compile`, so a stale `dist/` would not have affected a real bench run. Flagging it only so nobody reads the committed `dist/bundle.js` as evidence of the registered names — it is a build artifact, not source of truth, and `dist/` is not the fix.
- **The name match is proven by code + the real `convert_case` crate, not by a live end-to-end dispatch.** I did not run the module under the host to observe `insert_bulk_unique_0_u_32_u_64_str` actually dispatching, because that requires the ~50-min bench (or building `spacetimedb-standalone`, which `spacetimedb-cli generate -j` needs and which is absent). The proof here is: identical `convert_case 0.6.0` `Case::Snake` on both sides, with the explicit-name override removed so the case path is taken. This is a strong static proof but is one notch short of an observed green table-workload run. The remaining risk is not in the name (that is closed) but in anything else the table reducers touch (BSATN arg shapes, table-accessor lowering) that only an actual run would exercise — the same surface doc-11 flagged as "a separate correctness surface."

## Recommendation

The name fix is correct and safe to keep. To finish: revert the three TEMP-LOCAL C# comment-outs, finish the (interrupted) `cargo bench -p spacetimedb-bench --bench generic --bench special` so the `stdb_module_typescript_mem/{insert_bulk,iterate,filter,update_bulk}` groups actually populate, then fill doc-11's `blocked` cells from the resulting `estimates.json` and commit the synthetic.ts fix. The first table reducer to dispatch is the killer probe — if it 404s again, the name analysis here is wrong; if it returns, the rest of the table arm follows.

## Side notes / observations / complaints

- **The implemented fix is strictly better than the one the brief/doc anticipated, and the divergence is instructive.** doc-11's root-cause section reasoned entirely about the explicit-`opts.name`-verbatim path (`reducers.ts:87-92`) and concluded the fix was "add the underscores to the 40 explicit names." The actual fix removed the explicit names so the host's `convert_case` does the work — which is the same transform the harness uses, making drift impossible. A verifier who trusted doc-11's predicted fix shape would have checked the wrong thing (looking for `u_32` literals in the explicit names) and found them absent, possibly mis-flagging a correct fix as incomplete. This is a concrete instance of the journals-not-canon rule: doc-11's *mechanism* claim was a hypothesis, and the implementation chose a different, better mechanism.
- **The SDK `toSnakeCase` is a near-miss trap.** `crates/bindings-typescript/src/lib/util.ts:125-130` does not insert letter-digit underscores; only the host-side Rust `convert_case` does. If the canonical name had been computed SDK-side instead of host-side, this fix would silently produce `u32` names and fail identically to the original bug. The fix happens to be correct because the case conversion is a host-side validation step (`v9.rs`/`v10.rs`), not an SDK step. Worth knowing if anyone later "optimizes" by moving case conversion into the SDK.
- **The harness's panic-on-first-failed-arm fragility (doc-11 side-note, `modules.rs:170`) is what makes this whole thing brittle.** Because C# is instantiated before TypeScript and a failed module compile is a `panic`, the only way to get TS numbers locally is the TEMP-LOCAL comment-out — which then must be remembered-to-be-reverted before commit, a manual step with no guard. The cleaner long-term move is the one doc-11 already flagged: make `CompiledModule::compile` degrade a single failed arm to a skip rather than aborting the process.
- **An interrupted ~50-min bench with `--bench generic --bench special` is an expensive way to get blocked at the sqlite arm.** If only the TS table medians are wanted, narrowing the Criterion filter (Criterion accepts a benchmark-name filter argument) to just the `stdb_module/typescript` groups would skip the sqlite/stdb_raw/rust prefix entirely and cut the iteration loop dramatically — relevant for the next attempt, since the table reducers are the only open question.
