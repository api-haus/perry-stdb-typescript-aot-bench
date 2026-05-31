# 12 — Bench-arm audit (STDB fork side): grounding Perry-vs-V8 numbers

Read-only reuse audit of the SpacetimeDB fork toward the goal "Perry vs V8 benchmark numbers on STDB synthetic benchmarks." Every `file:line` below was verified by `Read` or `git show` at current HEAD (`46338e626`). Reducer-name and `host_type` tokens were confirmed by reading the actual source and the `git diff`, not quoted from grep output (per the output-fidelity caveat).

## Repo + path facts (verified)

- **Fork repo (audit target):** `/mnt/archive4/DEV/mmodb/_vendor/SpacetimeDB-fork`. Branch `feat/perry-release-engine`, HEAD `46338e626`. (The brief's path is correct; an earlier confusion in this session was my own — `cd` resets between bash calls, so use `git -C` / absolute paths.)
- **Docs:** the orchestration docs are in the `mmodb` superproject root at `/mnt/archive4/DEV/mmodb/docs/orchestrate/perry-stdb-poc/`, NOT inside the fork. This is a separate git repo (branch `main`); that is why doc 11c shows as `??` untracked there. This audit is written to that superproject docs dir, as the brief specifies.
- Sibling `/mnt/archive4/DEV/mmodb/_vendor/SpacetimeDB` is the upstream reference copy, not the fork — do not confuse them.

All `crates/...` and `modules/...` paths below are relative to the fork.

---

## Q4 — Current uncommitted working-tree state (FIRST-HAND, AUTHORITATIVE)

The brief flagged a contradiction: the handoff said the synthetic.ts fix is committed; doc 11c said it is NOT. **Both were right at their own time; they describe different moments.** Resolved with `git`:

- **HEAD = `46338e626`** "Fix benchmarks-ts reducer names: drop explicit names so SnakeCase matches harness." `git show --stat` confirms it touched **only** `modules/benchmarks-ts/src/synthetic.ts` (44 insertions, 114 deletions — it deletes ~40 `{ name: '…' }` option objects and reformats the no-arg reducers). **The fix IS COMMITTED now.** `synthetic.ts` is clean in the working tree.
- doc 11c was written when the fix was still working-tree-only (its `git status` showed `synthetic.ts` modified). It has since been committed as `46338e626`. doc 11c is therefore *stale*, not *wrong* — a textbook journals-not-canon case. The handoff reflects the post-commit state.
- **The TS-arm wiring is committed:** `df92a1d5b` "bench: wire TypeScript arm into generic + special criterion entry points" is HEAD~1.
- **The ONLY uncommitted changes are the three TEMP-LOCAL C# comment-outs**, `git diff` verified verbatim:
  - `crates/bench/benches/generic.rs:35-36` and `:42-43` — the two `bench_suite::<…SpacetimeModule<Csharp>>(c, true/false).unwrap();` lines, each commented out under `// TEMP-LOCAL (revert before commit): C# wasi runtime pack uninstallable without root; skip so it doesn't panic-abort the TS arm.`
  - `crates/bench/benches/special.rs:~32` — the `custom_benchmarks::<Csharp>(c);` line, same comment.
  - Diff stat: `generic.rs | 6 ++++--`, `special.rs | 3 ++-`. doc 11c's "three TEMP-LOCAL C# comment-outs" is **exactly accurate**.
- **No stashes. Nothing else uncommitted.**

**Bottom line:** fix committed, wiring committed; working tree carries only the three throwaway C#-disable comment-outs.

---

## Candidate / reuse table (all rows verified at HEAD)

| candidate | covers / partial / gap | location (file:line) | reuse-or-extend note |
|---|---|---|---|
| `ModuleLanguage` trait + `Rust`/`Csharp`/`TypeScript`/`Cpp` marker impls | partial — the abstraction a Perry arm implements | `crates/testing/src/modules.rs:343-347` (trait), `:378-390` (`TypeScript` impl, `NAME="typescript"`, compiles `"benchmarks-ts"`) | Add `pub struct TypeScriptPerry; impl ModuleLanguage { NAME="typescript-perry"; get_module() → CompiledModule::compile("benchmarks-ts", …) }`. Trait reused unchanged. |
| `CompiledModule::compile` build funnel | partial — both arms ride it | `crates/testing/src/modules.rs:162-177` | Calls `spacetimedb_cli::build(module_path, Some("src"), debug, None)` → `(path, host_type)`; `host_type.parse()` at `:174`; reads bytes lazily at `:183-187`. Format-agnostic on bytes. The `.expect("Module compilation failed")` at `:170` is the panic seam (see fail-fast note). |
| `spacetimedb_cli::build` — **host_type decided by LANGUAGE, not magic bytes** | covers — the host_type contract | `crates/cli/src/tasks/mod.rs:13-58`; decision at `:30-34`: `if lang == Javascript → ("Js")`, `else if debug → ("Wasm")`, `else → wasm-opt; ("Wasm")` | **Decisive for Q3.** A Perry arm must make `build` return `"Wasm"` for the TS source. Since the branch keys on `ModuleLanguage::Javascript`, Perry needs either a new `ModuleLanguage` variant or an `--engine` parameter that flips the returned tag to `"Wasm"`. There is NO magic-byte inference here — my earlier guess was wrong; the tag is language-driven. |
| `CompiledModule.host_type` → native vs V8 load | covers — the load path Perry rides | `crates/testing/src/modules.rs:152` (`host_type: HostType` field); consumed by `load_module(config, …)` (called at `spacetime_module.rs:71`) and `extract_schema` (`modules.rs:192`) | Rust/C#/Cpp already produce `HostType::Wasm` and load via the native (Wasmtime) host in-process. A Perry `.wasm` with `host_type=Wasm` rides the identical path. (The exact Wasmtime `make_actor` line lives in `crates/core/src/host/`; not re-pinned this pass — the reuse does not depend on the inner line, only on `host_type=Wasm` selecting it.) |
| Bench arm invocation + Criterion group naming | partial — arm invocation + the name-filter handle | `crates/bench/src/spacetime_module.rs:48-51` (`name()` → `format!("stdb_module/{}", L::NAME)`); `crates/bench/benches/generic.rs:52` appends `/mem`\|`/disk` | A Perry arm appears as Criterion group `stdb_module/typescript-perry`. The filter substring for the killer probe / narrowing is built from this (Q5/Q6). |
| Criterion entry points | partial — where a Perry `bench_suite::<…>` line goes | `crates/bench/benches/generic.rs:31-45`, `crates/bench/benches/special.rs` | Adding `bench_suite::<spacetime_module::SpacetimeModule<TypeScriptPerry>>(c, true/false)` next to the existing `<TypeScript>` lines is the entire bench-side wiring once the marker exists. |
| `modules/benchmarks-ts/src/synthetic.ts` | covers — the single shared module source | committed at `46338e626`; reducers now have NO explicit `{ name }`, so canonical names derive via host `convert_case` SnakeCase | Same source compiles under both V8 and Perry. Engine choice lives in the build invocation, not the `.ts`. |
| `build_javascript` (TS→JS bundle) | partial — the M4 `--engine perry` hook point | `crates/cli/src/tasks/javascript.rs:44-294` | tsc `--noEmit` if present (`:51-65`), rolldown bundle `src/index.ts` → `dist/bundle.js` (`:73-293`), returns the `.js` path. Does NOT set host_type (that is `mod.rs`'s job). A Perry path forks at `mod.rs:23-28`/`:30` or inside here. |

**Top reuse recommendation:** the chain `host_type=Wasm` field (`modules.rs:152`) → native in-process Wasmtime load (`load_module`, same as Rust/C#) IS the load-bearing reuse, and `spacetimedb_cli::build`'s language→tag decision (`mod.rs:30-34`) is the single contract a Perry build must satisfy (return `"Wasm"`). The Perry arm needs **no host change and no new `HostType` variant** — it needs (1) a build route that emits a `\0asm` wasm32 from `benchmarks-ts` and returns the `"Wasm"` tag, and (2) a one-marker `ModuleLanguage` impl + one `bench_suite::<…>` line per entry point. Greenfield is NOT justified; this is a thin extension of three existing seams.

---

## Q1 — How a language arm is built, loaded, and called (verified)

1. **Selection:** `bench_suite::<spacetime_module::SpacetimeModule<L>>(c, in_memory)` in `generic.rs:31-45` / `special.rs`. `SpacetimeModule<L: ModuleLanguage>` is `crates/bench/src/spacetime_module.rs:30-36`.
2. **Build (lazy, cached):** `SpacetimeModule::build` (`spacetime_module.rs:55-86`) calls `L::get_module()` (`modules.rs:378-390` for TS), a `lazy_static` `CompiledModule::compile("benchmarks-ts", COMPILATION_MODE)` (`modules.rs:385` → `:162-177`). `compile` calls `spacetimedb_cli::build(&module_path(name), Some("src"), debug, None)` (`modules.rs:164-169`) and stores the returned `(path, host_type)` (`:171-176`); bytes are read lazily in `program_bytes()` (`:183-187`).
3. **host_type decision (the crux):** inside `spacetimedb_cli::build` (`mod.rs:13-58`), `detect_module_language` runs (`:19`), then `mod.rs:30-34`: **JavaScript → `"Js"`; everything else → `"Wasm"`** (release path runs `wasm-opt` first, `:35-56`). So `host_type` is **language-determined**, parsed into `HostType` at `modules.rs:174`. Rust/C#/Cpp get `"Wasm"`; TS gets `"Js"`.
4. **Load:** `spacetime_module.rs:71` calls `L::get_module().load_module(config, Some(&path))` — an in-process host start (artifacts cached under `crates/bench/.spacetime`, `:66-70`). `HostType::Wasm` selects the native Wasmtime runtime; `HostType::Js` selects embedded V8. **This native-wasm path already exists and is exercised by Rust/C# every run.**
5. **Call:** `BenchDatabase` methods (`spacetime_module.rs`, e.g. `create_table` at `:88`, and the reducer-dispatch methods below it) invoke reducers by snake_case name; `generic.rs` drives `empty` (`:148-162`), `insert_bulk` (`:164-202`), `update_bulk` (`:204-240`), `iterate` (`:242-272`), `filter` (`:274-330`).

The Perry arm rides this entire chain unchanged provided `compile` returns `host_type="Wasm"` for the Perry-built `benchmarks-ts`.

## Q2 — What a Perry `ModuleLanguage` impl needs (verified)

Smallest wiring that lets `crates/bench` call a Perry-compiled module:

1. **One marker impl** mirroring `modules.rs:378-390`: `pub struct TypeScriptPerry; impl ModuleLanguage { const NAME = "typescript-perry"; fn get_module() { lazy_static!{ … CompiledModule::compile("benchmarks-ts", COMPILATION_MODE) } } }`.
2. **A build route that returns `host_type="Wasm"` for the TS source.** This is the only non-trivial part, because `spacetimedb_cli::build` currently returns `"Js"` for any JavaScript-detected project (`mod.rs:30-31`). Three shapes (architect's call, see Borderline):
   - (a) **Pre-built artifact bypass (smallest):** give `TypeScriptPerry::get_module()` its own `CompiledModule` constructor that does NOT call `spacetimedb_cli::build` at all — point it at a Perry-produced `benchmarks-ts.wasm` on disk and hardcode `host_type = HostType::Wasm`. Zero CLI changes. Gets a number soonest.
   - (b) **New `ModuleLanguage` enum arm in the CLI:** add e.g. `ModuleLanguage::TypeScriptPerry` so `mod.rs:23-34` routes to a Perry builder and returns `"Wasm"`. Larger, but is the real product path.
   - (c) **`--engine perry` parameter** threaded into `build`/`build_javascript` (M4 surface, Q3).
3. **One `bench_suite::<…>` line per entry point** (`generic.rs`, `special.rs`).

`CompiledModule::compile` itself needs no change for shapes (b)/(c); for (a) you bypass it. It is byte-format-agnostic (it just `fs::read`s the artifact, `modules.rs:183-187`).

## Q3 — The `--engine perry` (M4) surface (verified)

- **`crates/cli/src/tasks/mod.rs:13-58`** is THE host_type decision point. `pub fn build(project_path, lint_dir, build_debug, features) -> anyhow::Result<(PathBuf, &'static str)>`. Language detected at `:19`; per-language builder dispatched at `:23-28`; **the `&'static str` host-type tag set at `:30-34`** (`"Js"` for Javascript, `"Wasm"` otherwise). An `--engine perry` either (i) adds a new `ModuleLanguage` arm here, or (ii) is a parameter that, when set, routes the Javascript-detected project to a Perry builder and forces the tag to `"Wasm"`. Note the existing TODO at `mod.rs:12`: "Replace the returned `&'static str` with a copy of `HostType`."
- **`crates/cli/src/tasks/javascript.rs:44-294`** (`build_javascript`) is what the JS path does today: optional tsc typecheck, rolldown bundle to `dist/bundle.js`, returns that path. It does NOT set host_type. A Perry path would invoke the Perry toolchain (emit wasm32) instead of/in addition to the rolldown bundle, and the `"Wasm"` tag is set by the caller (`mod.rs`), not here.
- **`crates/bindings-typescript`** is where a Perry lowering co-lives (the SDK `benchmarks-ts` compiles against, per `package.json` `"spacetimedb": "workspace:^"`). Not on the critical path for a *first number* if the pre-built-artifact route (Q2a) is used; it IS on the M4-proper path. Not deep-read this pass — flag for the design phase.

**Contract, precisely:** the Perry build path must make `spacetimedb_cli::build` (or its bypass) return `host_type="Wasm"` plus a path to a `\0asm` wasm32 artifact. There is no separate host_type plumbing beyond that tag — the bench `load_module` and the production host both branch on the parsed `HostType`.

## Q5 — Finishing the V8 datastore baseline (grounded)

The V8 `generic` datastore numbers (`insert_bulk`/`iterate`/`filter`/`update_bulk`) were never captured (doc 11c: run interrupted mid-sqlite; only `sqlite_mem` artifacts exist). Minimal sequence:

1. **The reducer-name fix is already committed** (`46338e626`) — no commit step needed.
2. **Keep the TEMP-LOCAL C# comment-outs in place for the run** (do NOT commit them). They are required: `bench_suite::<…>(c, …).unwrap()` (`generic.rs:32-44`) and `CompiledModule::compile`'s `.expect("Module compilation failed")` (`modules.rs:170`) mean an enabled-but-broken C# arm **panics the whole bench binary** before the TS arm runs — yielding ZERO TS numbers. With C# instantiated before TS in both entry points, the comment-outs are load-bearing, not cosmetic.
3. **Narrow the run with a Criterion name-filter.** The TS module group id is `stdb_module/typescript` (`spacetime_module.rs:50`) with `/mem` appended (`generic.rs:52`), i.e. `stdb_module/typescript/mem`. Criterion's trailing positional is a substring/regex filter on the benchmark id, so `cargo bench -p spacetimedb-bench --bench generic -- "stdb_module/typescript"` runs ONLY the TS arm's benchmarks and skips the sqlite/stdb_raw/rust prefix (the ~50-min cost). doc 11c's name-filter side-note is **confirmed** against the actual id construction. (Per doc 11 §Reproduction, the package scope `-p spacetimedb-bench` is required — `crates/bench` is not a default-run member.)

(Per the hard rules I did NOT run `cargo bench`.)

## Q6 — The killer probe (cheapest falsification of the name fix) (grounded)

The killer probe is the **first table reducer dispatch**: the first `db.insert_bulk(table_id, …)` (`generic.rs:181-199`, which calls the module's `insert_bulk_<table>` reducer). If the host's SnakeCase derivation of the `insert_bulk_unique_0_u32_u64_str` export does not produce exactly `insert_bulk_unique_0_u_32_u_64_str` (the harness builds the call name via `to_case(Case::Snake)`, `spacetime_module.rs:96-97`), it 404s and the name analysis is wrong. The committed fix removed the explicit camelCase `name:`, so the match now rests entirely on the host deriving snake_case from the export identifier (doc 11c verified the byte-match statically against `convert_case 0.6.0`; this probe is the missing live confirmation).

Cheapest way to run JUST this without the ~50-min suite:
- **Narrowest Criterion filter:** `cargo bench -p spacetimedb-bench --bench generic -- "stdb_module/typescript/mem/insert_bulk"`. The benchmark id is `format!("insert_bulk/{table_params}/load={load}/count={count}")` (`generic.rs:173`) inside the `stdb_module/typescript/mem` group, so this substring matches the first table reducer. Module compiles once, first dispatch surfaces a 404 in seconds, not 50 min.
- **Even cheaper if it exists:** a single `#[test]` that does `load_module` + one `call_reducer`. I did not find a dedicated one this pass; the impl phase should grep `crates/testing`/`crates/core` for a `#[test]` doing `load_module` + a single reducer call before falling back to the bench filter.

---

## Borderline calls

- **Q2/Q3: which of the three Perry-build shapes (pre-built artifact bypass / new `ModuleLanguage` arm / `--engine perry` parameter)?** Real architecture fork for the design phase — NOT pre-decided here. The pre-built-artifact bypass (Q2a) is strictly smallest (no CLI change, hardcode `host_type=Wasm`) and gets a number soonest; the `--engine perry` parameter is the eventual M4 product surface. The goal is "numbers," which argues for the bypass first. Flip condition: if M4 wants the bench arm to exercise the *real* Perry CLI path (so the benchmark also validates the build pipeline), the bypass is insufficient and shape (b)/(c) is required from the start.

- **host_type is language-tagged, not byte-inferred (correcting a likely assumption).** `spacetimedb_cli::build` returns `"Js"`/`"Wasm"` purely from `detect_module_language` (`mod.rs:30-34`) — there is NO `\0asm` magic-byte sniff in this path. So "emit a `.wasm` and inference handles it" is FALSE here: a Perry build that still detects as `Javascript` would be tagged `"Js"` and loaded under V8 even if its bytes are wasm. The Perry path MUST force the `"Wasm"` tag. This is load-bearing for the design — do not assume byte inference.

- **The exact native Wasmtime instantiation `file:line`** (inside `crates/core/src/host/`) was not re-pinned this pass. The reuse verdict (`covers`) does not depend on it — it depends only on `host_type=Wasm` selecting the native path, which Rust/C# already prove. Flip condition: none for the verdict; re-Read only if the architect needs to quote the `make_actor` line.

- **Whether a single-reducer `#[test]` exists for the Q6 killer probe.** I did not exhaustively search. If one exists it beats the bench filter. Flip condition: a grep for `load_module` + `call_reducer` in test modules.

---

## Side notes / observations / complaints

- **doc 11c is stale, not wrong.** Its "synthetic.ts fix uncommitted" claim was true when written; the fix is now committed as `46338e626` (HEAD). Its TEMP-LOCAL-C#-comment-outs claim and its `convert_case` byte-match analysis are both confirmed accurate. Treat it as a correct journal that time moved past — exactly the journals-not-canon hazard. The handoff reflects the newer state.

- **Foundation is sound for wiring a Perry arm.** The three seams (`ModuleLanguage` marker trait, the `spacetimedb_cli::build` language→host_type tag, the `host_type`-driven native-vs-V8 load) are clean and already carry Rust/C#/TS. Nothing rotten; no refactor needed before adding Perry. The one real smell is the fail-fast `.unwrap()`/`.expect()` chain below.

- **Harness fail-fast fragility — confirmed, and it is load-bearing for Q5.** `generic.rs:32-44` invokes each arm as `bench_suite::<…>(c, …).unwrap()`, and `CompiledModule::compile` panics via `.expect("Module compilation failed")` (`modules.rs:170`). A single failing arm therefore aborts the entire bench binary, taking down every later arm in the same process. Because C# precedes TS in both entry points, the C# wasi-pack gap would kill the TS arm too — which is precisely why the TEMP-LOCAL comment-outs exist and must stay for the run. A robust multi-arm suite would degrade a failed arm to a skip (collect-and-report) rather than panic; doc 11/11b/11c all flag this. Out of scope for getting numbers, but it WILL bite again the first time the Perry arm fails to compile on a given machine — budget for it.

- **The host_type contract has a known rough edge.** `mod.rs:12` carries a TODO to replace the `&'static str` host-type tag with a real `HostType`. The Perry M4 work touches exactly this return; whoever adds the Perry tag should consider doing that TODO at the same time rather than threading another stringly-typed `"Wasm"`/`"Js"`/`"PerryWasm"?` literal. Minor, but it is the seam Perry modifies.

- **The brief's required-reading docs are richly grounded and largely hold up at HEAD** — I cross-checked their load-bearing `file:line` claims against the source and they match (e.g. `spacetime_module.rs:96-97` `to_case(Case::Snake)`; `modules.rs:378-390` `TypeScript` impl; `generic.rs` TS wiring). The only drift is doc 11c's timing-relative committed-ness claim, addressed above. doc 10 §5's "verified in `_vendor/SpacetimeDB`" header refers to the upstream copy, but the fork mirrors it — claims transfer.
