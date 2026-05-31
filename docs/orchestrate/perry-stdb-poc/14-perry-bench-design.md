# 14 — Perry-vs-V8 first-number: implementation design

Design for M2-proper: turn Perry's no-op `__call_reducer__` into a real dispatcher, wire a Perry arm into `crates/bench`, add a pure-integer CPU kernel that runs on BOTH arms, and specify the adversarial verification that proves the measured Perry cost is the real dispatched body.

Grounding: load-bearing `file:line` below were verified against the working tree AND the git blobs at the two fork HEADs this session (`perry-fork` `42ae9659`, `SpacetimeDB-fork` `46338e626`). The shim file was read clean in full (337 lines, working-tree sha == HEAD-blob sha `38553985…`). The STDB-fork files were re-dumped via `git show HEAD:<path>` to `/tmp/*` and read from there. The transcript channel corrupted/dropped reads repeatedly this session (documented RTK/HARNESS hazard) — every identifier and line number below is from a read that rendered clean; the one fact I could NOT get a clean read of is flagged explicitly in Assumptions (the inner body of `load_module`/host-type detection in `modules.rs`), and the design is built so it does not depend on that fact.

## delegate-architect findings (2026-06-01)

## Design

### 0. Three facts that shape the work (corrected against the inherited audits)

The inherited audits carry line numbers from an EARLIER revision of `spacetimedb.rs` (they cite `:114-122`, `:85-99`, `:287-295`; HEAD is 337 lines and the same content sits at the HEAD lines below). Re-anchored at HEAD:

1. **The gap is exactly `__call_reducer__` (`spacetimedb.rs:114-122` at HEAD).** It accepts the full STDB signature, `(void)`-casts every param, and `return 0;`. No dispatch, no `extern` of any `perry_fn_*`, no call. Everything else (wasm32 triple, reactor, named typed dunders, the one `spacetime_10.0::bytes_sink_write` import, the real 34-byte `RawModuleDef::V10` for `noop`, integer-arithmetic codegen) is present and server-verified (docs 09/09b). Confirmed by a clean full read of the shim at HEAD.

2. **The link uses NO `--allow-undefined` (`spacetimedb.rs:287`).** `link_spacetimedb_wasm` emits `cmd.arg("--no-entry").arg("--gc-sections")` and nothing else; the long error string at `:319-323` explicitly states an undefined `js_*` is a hard link error and the signal to link the wasm32 runtime archive, NOT to pass `--allow-undefined`. So the audit's "designed circuit-breaker" is REAL and present: if the CPU kernel pulls in a `js_*` symbol, **the link fails hard with `undefined symbol: js_*`** — it does not silently create a host import. This is the falsifying observation the kernel-amputation decision-branch keys on (V1 below). (An earlier pass of mine mis-read corrupted grep output as `--allow-undefined` present; the clean read shows it is absent. Trust `:287`.)

3. **The host_type constraint is real and the bypass satisfies it by construction.** `spacetimedb_cli::build` tags host_type by LANGUAGE, not by magic bytes (`crates/cli/src/tasks/mod.rs:30-34`: `Javascript → "Js"`, else `"Wasm"`). A Perry build routed through the normal JS detection would be tagged `"Js"` and run under V8 even with wasm bytes. The chosen wiring (the pre-built-artifact bypass, §5) **does not call `spacetimedb_cli::build` at all** — it constructs a `CompiledModule` with `host_type = HostType::Wasm` set directly. So the constraint is satisfied without touching the CLI or relying on any detection. (`crates/testing/src/lib.rs:75-76` confirms `host_type` is a stored field parsed from the `"wasm"`/`"js"` tag and consumed at load; setting it directly is the same value the native Rust/C# arms carry.) Whether `load_module` ALSO byte-checks is irrelevant — see Assumptions.

### 1. Scope and milestone phasing — ONE milestone, two workloads

Resolved from the reducer-call mechanism: the bench invokes reducers by NAME. `empty_transaction` calls `call_reducer_binary("empty", &[].into())` (`spacetime_module.rs:139-145`); the `special` workloads call by literal name too (`special.rs:51` `"fn_with_1_args"`, `:58` `"print_many_things"`, `:84` `"run_game_circles"`). With a single reducer in the describe blob, the host dispatches it at `id == 0`. If the CPU kernel **bakes constants in and takes no args** (chosen, §4), then empty-dispatch and the kernel are the SAME code change — dispatch-on-id calling one `perry_fn_*` — differing only in the compiled body and the reducer name in the def. Arg-decode (`bytes_source_read` + a BSATN integer decoder) is the only thing that would split this into two milestones; the no-arg kernel keeps it out of the critical path. So M2-proper = {dispatch + describe-name} applied per workload, in one pass.

Ordered deliverables: (1) `empty` dispatch — smallest delta, proves the dispatch+describe+bench+load chain on a body that GC's to nothing; (2) CPU kernel — same chain, non-trivial body that survives `--gc-sections`, the AOT-vs-JIT discriminator.

### 2. The dispatch change in `__call_reducer__` (perry-fork)

File: `_vendor/perry-fork/crates/perry/src/commands/compile/spacetimedb.rs`. `STDB_ABI_SHIM_C` is the `const &str` at `:73-123`; `__call_reducer__` body at `:114-122`; `compile_abi_shim` at `:133-176`; `link_spacetimedb_wasm` at `:250-337`, which collects `perry_fn_*` exports via `collect_user_function_exports` at `:210-242` BEFORE linking.

The mangled user symbol is `perry_fn_<prefix>__<name>`, `prefix` = sanitized source-file basename, from `scoped_fn_name` (`crates/perry-codegen/src/codegen/helpers.rs:82-83`). For `cpu_kernel.ts` exporting `mix`, the symbol is `perry_fn_cpu_kernel__mix`; for `empty.ts` exporting `empty`, `perry_fn_empty__empty`. (M2's spike confirmed `spike.ts`→`perry_fn_spike_ts__spikeAdd`, doc 09 §2 — note the `_ts` in the prefix; the exact basename-sanitization is observed from the symbol table, never recomputed, so the impl reads the actual `perry_fn_*` name out of `collect_user_function_exports` rather than guessing.)

**Chosen shape: templated shim.** `STDB_ABI_SHIM_C` is `const` today; the dispatch symbol depends on the user's file+function, which `link_spacetimedb_wasm` already discovers. So:
- Convert `STDB_ABI_SHIM_C` from a `const &str` into a function that FORMATS the C source, injecting the `extern` declaration of the discovered `perry_fn_*` symbol and the dispatch body.
- `link_spacetimedb_wasm` already computes `user_exports` at `:273` and `compile_abi_shim` at `:268`. Today it compiles the shim BEFORE collecting exports — reorder so `collect_user_function_exports` runs first, then `compile_abi_shim(shim_src)` receives the formatted source built from that export list. `compile_abi_shim` (`:133-176`) is otherwise unchanged: it writes the string to a tempfile and clangs it with `-O3 -fno-math-errno -target wasm32-unknown-unknown`.

Dispatch body shape (single reducer, no args):
```c
extern long long perry_fn_<prefix>__<name>(void);   // injected; result type matched to codegen (see below)

__attribute__((export_name("__call_reducer__")))
i32 __call_reducer__(u32 id, i64 s0,i64 s1,i64 s2,i64 s3, i64 c0,i64 c1, i64 ts, u32 args, u32 err) {
    (void)s0;(void)s1;(void)s2;(void)s3;(void)c0;(void)c1;(void)ts;(void)args;(void)err;
    if (id == 0) {
        volatile long long sink = perry_fn_<prefix>__<name>();  // volatile sink defeats -O3 dead-call elision
        (void)sink;
        return 0;
    }
    return -1;   // unknown reducer id
}
```

Notes:
- **No arg decode, no `bytes_source_read`** for the first number — `empty` and the no-arg kernel ignore `args`. The M2-proper doc-comment (`spacetimedb.rs:64-72`) promising `bytes_source_read` stays a TODO; declaring that second import is deferred to the args milestone (M3-ward).
- **Result type / `volatile` sink is load-bearing.** M1 showed integer functions codegen with an `i64` result (`add` → `(result i64)`, doc 08 §3); Perry also emits an f64 NaN-box-ABI variant. The shim should `extern`-declare and call the **i64 specialization** (`perry_fn_*_i64` if both are emitted — M2 showed both `spikeAdd` and `spikeAdd_i64` exported) and assign its result to a `volatile` local so clang `-O3` + `--gc-sections` cannot prove the call dead and elide it. Without the sink, an unused-result pure call can be deleted, silently reproducing the no-op and a flattering number. **Impl: `wasm-tools print` the user object first, read the actual exported fn name(s) and result type, match the `extern` decl.**

### 3. The describe blob (perry-fork)

File: same shim, `MODULE_DEF[]` at `:87-99` (the name bytes `0x6e 0x6f 0x6f 0x70` = "noop" at `:92`, preceded by length `0x04` and the V10 framing verified byte-for-byte in doc 09b §2). `__describe_module__` drains it at `:102-112`.

**Resolved: ship dispatch against a fixed-name def; NO schema walk now.** The bench resolves reducers by exact name-match: it calls `call_reducer(reducer_name, ...)` against the loaded module's registered reducers (`spacetime_module.rs:139-145` for `empty`). A single reducer means the host dispatches it at `id == 0`. So the def only needs the right NAME:
- `empty` arm: edit `MODULE_DEF[]` so the reducer name is `"empty"` — change the name bytes `noop`(4)→`empty`(5) and the preceding length byte `0x04`→`0x05`. The 34-byte `noop` blob is the known-good template; re-derive any surrounding V10 length/count fields from it (the framing is decoded and gold-verified in doc 09b §2, so the only logical deltas are the name length and bytes — but the impl MUST re-decode with `spacetime describe --json` after editing; see Assumptions).
- kernel arm: same edit, name = whatever the bench calls it (§5 picks `cpu_mix`).
- Full schema generation from typed reducer metadata is M3 work, off the first-number path.

**Three-place coupling (impl + side-notes):** the describe-blob NAME, the bench CALL string, and (via index 0) the shim DISPATCH must agree. Cleanest first-number shape: TWO separate Perry compiles producing TWO `.wasm` files, each a single-reducer module with its own one-reducer def. Do NOT put both reducers in one module for the first number — that needs id-branching + a two-reducer def + ordering agreement, all deferrable.

### 4. The CPU kernel TS

**Chosen kernel: a fixed-iteration integer xorshift mixer, constants baked in, no args, returns i64.** Illustrative (impl writes the real file):
```ts
export function mix(): bigint {
  let x = 0x9e3779b97f4a7c15n;
  for (let i = 0n; i < 100000n; i = i + 1n) {
    x = x ^ (x << 13n);
    x = x ^ (x >> 7n);
    x = x ^ (x << 17n);
    x = x + 0x2545f4914f6cdd1dn;
  }
  return x;
}
```
Why this shape:
- **Pure integer, no allocation/strings/objects/arrays** — the M1-proven amputation envelope (`add` → `i64.add`, zero imports, doc 08 §3). Xorshift is shifts + xors + add on one scalar, exactly the op family M1 proved stays in wasm value ops and never reaches the runtime, so `--gc-sections` drops `perry_module_init` and its `js_*` refs (doc 08 §2).
- **`bigint` literals (`n` suffix), not `number`.** NaN-box hazard guard (doc 08 §4 / B4): a value flowing through `number` (double) context can route through boxing helpers that pull a `js_*` symbol. `bigint` keeps the loop typed i64 end-to-end. **This is the single most important amputation decision.** If the impl uses `number` + `Math`/`>>>`, double coercion risks a `js_*` import. With NO `--allow-undefined`, that surfaces as a HARD LINK ERROR (`undefined symbol: js_*`) — the circuit-breaker (V1).
- **Fixed iteration baked in (no args)** — drops arg-decode (§1), one milestone.
- **Non-trivial duration** — 100k×4 i64 ops dominates the ~7µs call overhead, so a GC'd-away empty call is detectable as a duration anomaly (V3), not just by disasm.

**Where the kernel TS lives — the two arms compile DIFFERENTLY (apples-to-apples care, see §6).** The V8 arm compiles the `spacetimedb` SDK module at `modules/benchmarks-ts/`, where reducers are `spacetimedb.reducer(() => {...})` and the canonical name derives from the `export const` binding via the SDK's SnakeCase policy (`synthetic.ts:39` `export const empty = spacetimedb.reducer(() => {});`; doc 11 §Wall-2 details the name derivation). Perry's `--target spacetimedb` does NOT process the SDK's `reducer()` registration — it mangles EXPORTED PLAIN FUNCTIONS to `perry_fn_*` (`collect_user_function_exports` scans for `perry_fn_*`; `scoped_fn_name` builds them from exported fn names; `spacetimedb.rs` has zero SDK-reducer handling). So the same physical `.ts` cannot feed both arms unchanged. Decision-branch:
- **(4a) shared kernel-logic file + thin wrappers (CHOSEN).** Put the loop in `modules/benchmarks-ts/src/cpu_kernel.ts` exporting `export function mix(): bigint { ... }`. The V8 arm adds a reducer in `synthetic.ts` (or a new file re-exported by `index.ts`): `export const cpu_mix = spacetimedb.reducer(() => { mix(); });`, importing `mix` from `./cpu_kernel`. The Perry arm compiles `cpu_kernel.ts` directly (its exported `mix` becomes `perry_fn_cpu_kernel__mix`). The MEASURED arithmetic is byte-identical TS in both arms; only the registration wrapper differs, and that wrapper is call-overhead the `empty` row isolates. Genuinely apples-to-apples for the compute.
- (4b) two hand-synced files — REJECTED (drift; violates the "defined ONCE" criterion).

Reducer naming: the V8 wrapper `export const cpu_mix = ...` registers (via SnakeCase, no digits) as `cpu_mix` — the impl confirms the exact registered name with `spacetime describe` on the built V8 bundle, then names the Perry def and the bench call string to match.

### 5. Bench wiring (SpacetimeDB-fork)

**Chosen wiring shape: (a) pre-built-artifact bypass** — a `TypeScriptPerry`-family `ModuleLanguage` impl pointing at a Perry-built `.wasm`, NO CLI change. Rationale in Decisions. The bypass is safe AND fast: it sets `host_type = HostType::Wasm` directly (§0 fact 3), so it satisfies the force-Wasm constraint without the CLI's language tag and without depending on byte detection.

Concrete changes, all in `_vendor/SpacetimeDB-fork`:

1. **`CompiledModule::from_prebuilt(name, path)` constructor** in `crates/testing/src/modules.rs` (next to `compile` at `:162-177`). `compile` shells `spacetimedb_cli::build` and stores `{name, path, host_type: tag.parse(), program_bytes: OnceLock}` (`:171-176`). `from_prebuilt` stores the same struct with `host_type: HostType::Wasm` and the given path, WITHOUT shelling the build. `load_module` reads `self.path` and uses `self.host_type` (field at `:152`), so a directly-stored path loads identically to a built one.

2. **Marker impls** alongside `TypeScript` (`modules.rs:378-390`). Two prebuilt arms (one `.wasm` per workload, §3 coupling):
   ```rust
   pub struct TypeScriptPerryEmpty;
   impl ModuleLanguage for TypeScriptPerryEmpty {
       const NAME: &'static str = "typescript-perry";
       fn get_module() -> &'static CompiledModule {
           lazy_static::lazy_static! { static ref MODULE: CompiledModule =
               CompiledModule::from_prebuilt("benchmarks-ts-perry-empty".into(), perry_empty_wasm_path()); }
           &MODULE
       }
   }
   // TypeScriptPerryMix: NAME = "typescript-perry", get_module → from_prebuilt(..., perry_mix_wasm_path())
   ```
   `NAME = "typescript-perry"` makes the Criterion group `stdb_module/typescript-perry` (from `format!("stdb_module/{}", L::NAME)`, `spacetime_module.rs:50`) — the sibling of the V8 `stdb_module/typescript`. Both perry markers share the same `NAME` because they appear in different bench binaries (empty in `generic`, mix in `special`), so the group keys don't collide.
   `perry_*_wasm_path()`: resolve to committed artifacts under the repo, e.g. `crates/bench/artifacts/perry/{empty,cpu_kernel}.wasm`, with an env-var override for CI.

3. **`crates/bench/benches/generic.rs`** — register the Perry empty arm next to the TS arm (`generic.rs:36`/`:42` are the in-memory/on-disk TS lines; import is `:14`):
   ```rust
   bench_suite::<spacetime_module::SpacetimeModule<TypeScriptPerryEmpty>>(c, true).unwrap();   // after the TS true line
   bench_suite::<spacetime_module::SpacetimeModule<TypeScriptPerryEmpty>>(c, false).unwrap();  // after the TS false line
   ```
   `empty` runs because `bench_suite` always calls `empty(&mut g, &mut db)` (`generic.rs:54`). The table workloads (`table_suite`, `:56-57`) will call `insert_bulk_*` etc., which the single-reducer Perry module does NOT have → `reducer_id_by_name`/dispatch fails. **This panics the arm (fail-fast `.unwrap()`).** Two ways to handle, decision-branch (resolve at impl):
   - **(5a) preferred:** add the Perry empty arm via a NARROWER entry that runs ONLY `empty` (a small `perry_empty_suite` that builds the DB and calls `empty(&mut g, &mut db)` without `table_suite`), so the single-reducer module is never asked for a table reducer. Cleanest; no panic.
   - (5b) accept that the Criterion `empty` filter completes BEFORE the table workloads in iteration order and read the `empty` number from `target/criterion` even though the binary later panics — fragile, depends on bench ordering; not recommended.
   Pick 5a.

4. **`crates/bench/benches/special.rs`** — add the `cpu_mix` workload (NOT in the stock suite, doc 10 §28). `custom_module_benchmarks` (`special.rs:45-61`) is the natural home: add a `group.bench_function("cpu_mix", ...)` calling `m.module.call_reducer_binary("cpu_mix", &[].into())`. Register both arms next to the TS line (`:35`):
   ```rust
   custom_benchmarks::<TypeScript>(c);          // calls cpu_mix on the SDK module
   custom_benchmarks::<TypeScriptPerryMix>(c);  // calls cpu_mix on the Perry module
   ```
   BUT `custom_benchmarks` also runs `custom_db_benchmarks` (`circles`/`ia_loop`, `:42`/`:63-106`) which call game reducers the single-reducer Perry module lacks → panic. So for the Perry arm, add a NARROWER entry (`custom_module_benchmarks` only, or a dedicated `perry_cpu_suite`) that runs ONLY `cpu_mix`. Same fail-fast reasoning as 5a. The V8 arm keeps the full `custom_benchmarks`.
   Group keys: `special/stdb_module/typescript/cpu_mix` and `special/stdb_module/typescript-perry/cpu_mix` (from `format!("special/{}", SpacetimeModule::<L>::name())`, `special.rs:46`).

5. **Keep the three TEMP-LOCAL C# comment-outs** (`generic.rs` two sites at the C# `true`/`false` lines, `special.rs` `custom_benchmarks::<Csharp>(c);`) — verified verbatim in the working-tree diff this session. Uncommitted, load-bearing (a failing C# arm panics the whole binary before TS/Perry runs). Do NOT revert, do NOT commit.

**How the Perry `.wasm` is produced and kept in sync** (the bypass's one real hazard, flagged by the STDB audit): a documented, committed build step regenerating the artifacts from the SAME source the V8 arm compiles:
- A `make`/`just` target under `crates/bench/` running `perry compile modules/benchmarks-ts/src/cpu_kernel.ts --target spacetimedb -o crates/bench/artifacts/perry/cpu_kernel.wasm` (and the equivalent `empty.ts`). Document the exact command in the bench README / milestone doc so the artifact can't silently go stale vs the TS source. (A `build.rs` that rebuilds on source change is cleaner but adds a `perry` binary dependency to the bench build — defer; a documented `make perry-artifacts` suffices for the first number.)
- Sync verification (V5): the `mix` source the V8 arm compiled is byte-identical to the source the artifact was built from (trivial under 4a — same file); re-running `perry compile` reproduces the committed `.wasm` (Perry builds are byte-deterministic, doc 09b §SideNotes, sha256 `86870e4b…`).

### 6. Why the two arms diverge at compile (apples-to-apples justification)

V8 arm: `modules/benchmarks-ts/` → `spacetime build --lang typescript` (via `build_javascript`, rolldown to `dist/bundle.js`) → `host_type=Js` → embedded V8 runs the SDK-registered `cpu_mix` reducer, which calls `mix()`. Perry arm: `cpu_kernel.ts` → `perry compile --target spacetimedb` → wasm32 `.wasm` (`perry_fn_cpu_kernel__mix` + shim dispatch) → `host_type=Wasm` (set directly by the bypass) → Wasmtime runs the dispatched `mix`. Both execute the IDENTICAL `mix` source (§4a); the delta measured is AOT-wasm vs V8-JIT on the same arithmetic on one Criterion clock. The registration-wrapper difference (SDK `reducer()` vs Perry shim dispatch) is call-overhead the `empty` row independently quantifies — subtract to isolate pure compute.

### 7. Commands (the probe + the run)

Prerequisites (the two walls, doc 11): from `_vendor/SpacetimeDB-fork` root, `pnpm install --frozen-lockfile` then `pnpm --filter spacetimedb run build` (without the built `spacetimedb` TS package the V8 arm fails to compile and the whole bench binary panics). Plus the Perry artifacts built (`make perry-artifacts`, §5).

- **Cheapest first-dispatch confirmation — NOT a Rust test.** No dedicated single-reducer `#[test]` exists in `crates/testing`/`crates/bench` (verified by listing: only the two bench binaries + `standalone_integration_test.rs` + `special_db`-style suites). Perry's already-proven M2 probe is more direct and isolates dispatch from ALL bench plumbing: `perry compile cpu_kernel.ts --target spacetimedb -o k.wasm`, then `spacetime publish --bin-path k.wasm` + `spacetime call <db> cpu_mix` against a stock v2.0.1 server (docs 09/09b — note the extracted `./bin/spacetime-2.0.1` is the only CLI that decodes a V10 def). **Run this BEFORE wiring the bench** — it confirms the dispatched body executes (the M2 `noop` returned 200 with `execution-duration-micros`, so a `cpu_mix` with a real body should show a materially larger duration than a `noop`).
- **Bench empty (after wiring):** `cargo bench -p spacetimedb-bench --bench generic -- "stdb_module/typescript-perry/.*empty"` (Criterion trailing positional is a substring/regex filter). Fail-fast `.unwrap()` IS the smoke test.
- **Bench kernel:** `cargo bench -p spacetimedb-bench --bench special -- "typescript-perry/cpu_mix"`
- **Full comparison:** `cargo bench -p spacetimedb-bench --bench generic -- "stdb_module/typescript"` (matches both `typescript` and `typescript-perry`) and `... --bench special -- "cpu_mix"`.
- Numbers land at `target/criterion/stdb_module_typescript_perry_*/...` (sibling of the V8 arm's `target/criterion/stdb_module_typescript_mem/empty`, doc 11).

### 8. Ordered implementation plan

1. (perry-fork) Write Perry build inputs: `empty.ts` (`export function empty(): void {}`) and `cpu_kernel.ts` (the bigint xorshift `mix`). [Perry inputs only; the V8-arm reducer wrappers are separate, §4a.]
2. (perry-fork) Refactor `spacetimedb.rs`: reorder so `collect_user_function_exports` runs before shim compile; turn `STDB_ABI_SHIM_C` into a formatter injecting `extern <i64> perry_fn_X(void);` + `if (id==0){ volatile ... = perry_fn_X(); return 0; }`. Edit `MODULE_DEF[]` per build to name the single reducer (`empty`, then `cpu_mix`) — two hardcoded variants selected by source, or a localized name-substitution into the known-good 34-byte template.
3. (probe) `perry compile` each input; `wasm-tools print` to confirm V1/V2; `spacetime publish`+`call` to confirm dispatch (§7).
4. (SpacetimeDB-fork) Add `from_prebuilt` to `CompiledModule`; add `TypeScriptPerryEmpty`/`TypeScriptPerryMix` markers; commit the `.wasm` artifacts + the `make perry-artifacts` target.
5. (SpacetimeDB-fork) Add the V8-arm `cpu_mix` reducer wrapper (imports `mix` from `cpu_kernel.ts`); add the `cpu_mix` workload to `special.rs`; register the Perry arms via narrow `empty`-only / `cpu_mix`-only entries (5a) in `generic.rs`/`special.rs`.
6. (run) Prereqs (`pnpm`), build artifacts, run the probe, then the bench filters, then the full comparison.
7. (verify) Hand to a fresh-eyes verifier with the V1–V5 spec.

## Verification spec (adversarial — built from the artifact's decision points)

Central failure mode (both audits + negative-space pt 6): dispatch wired wrong / kernel GC'd away ⇒ the bench silently times an empty call and reports a flattering AOT number. Checks below are built from the wasm's own observable decision points, NOT from inputs the implementer imagined, and MUST be run by an agent that did not write the shim change.

- **V1 — amputation (import list + link).** `perry compile cpu_kernel.ts --target spacetimedb` must LINK CLEAN (no `--allow-undefined`, `spacetimedb.rs:287`). `wasm-tools print k.wasm`: assert the import section contains ONLY `spacetime_10.0::bytes_sink_write`. ANY `js_*` import — or a hard `undefined symbol: js_*` LINK FAILURE — means the kernel pulled in the runtime ⇒ **circuit-breaker: STOP and surface** (the wasm32 runtime archive is not green, 15 shell errors, doc 08 §6). Falsifying observations: (a) `wasm-ld` exits non-zero with `undefined symbol: js_*`; (b) a `js_*` import line in `wasm-tools print`.
- **V2 — dispatch is real and survived `--gc-sections`.** In `wasm-tools print` of `__call_reducer__`: assert the body `call`s `perry_fn_cpu_kernel__mix` (or its `_i64` specialization) and that that function is PRESENT in the module (defined, not GC'd). For `empty`: `__call_reducer__` calls `perry_fn_empty__empty`. If `__call_reducer__` is just `i32.const 0` (the M2 `noop` shape, doc 09b §2), dispatch did not wire.
- **V3 — the body executed (duration + cross-check).** The kernel loop must dominate ~7µs call overhead: assert the Perry `cpu_mix` Criterion mean is materially > the Perry `empty` mean. A `cpu_mix` indistinguishable from `empty` ⇒ the loop was elided (`-O3` deleted the unused-result call) — confirm the `volatile` sink (§2). Cross-check: the SAME `mix` under the V8 arm must ALSO show `cpu_mix` >> `empty`; if V8's gap exists but Perry's doesn't, Perry elided the body. Pre-bench cross-check: the `spacetime call cpu_mix` probe (§7) shows `execution-duration-micros` materially larger than the M2 `noop`'s.
- **V4 — host_type is Wasm.** Assert (test-only) that the loaded Perry `CompiledModule.host_type == HostType::Wasm`, OR confirm by construction: the bypass sets it directly (§0 fact 3) AND `wasm-tools validate k.wasm` passes (real wasm, first 4 bytes `\0asm`). A Perry number produced under `HostType::Js` would be meaningless; assert explicitly so a future CLI-path change can't regress silently.
- **V5 — source parity (apples-to-apples).** Confirm the `mix` compiled into the Perry artifact is byte-identical to the `mix` the V8 arm calls (trivial under §4a — same file). Re-run `perry compile`, confirm the committed `.wasm` reproduces (deterministic, doc 09b). Closes the bypass's staleness hazard.

A number is reportable as REAL only after V1–V5 pass. V2+V3 are the anti-"GC'd empty call" gate; V1 the anti-"secretly needs the runtime archive" gate; V4 the anti-"ran under V8" gate; V5 the anti-"measured different source" gate.

## Decisions & rejected alternatives

- **Wiring: pre-built-artifact bypass (a), not `--engine perry` (c) or a new CLI `ModuleLanguage` arm (b).** Chose (a): (i) user decision "de-risk synthetic first — number soonest"; (ii) the bypass sets `host_type = HostType::Wasm` directly, satisfying the force-Wasm constraint with zero CLI surface and zero dependency on the language-tag/byte-detection path; (iii) the goal is a trustworthy number, which the bypass delivers minimally. Rejected (c) `--engine perry`: the eventual product surface (user said CLI edits are permissible) but threading an engine flag through `build`/`build_javascript` + callers is strictly more code/risk for the SAME number; repoint the bench at it later. Rejected (b): more routing for no first-number benefit. **Flip:** if the orchestrator decides the bench must ALSO validate the real `perry compile` CLI invocation (not just the artifact), (a) is insufficient and (c) becomes mandatory.
- **Templated shim, not a fixed const symbol.** Chose templating because the dispatch symbol is `perry_fn_<basename>__<fn>` and is already discovered by `collect_user_function_exports` (`:210-242`). Rejected hardcoding one fixed symbol name: brittle, forces one fixed filename+fn, and discards the working discovery machinery. **Flip:** if the impl constrains the first number to one literal filename, a hardcoded symbol const is a smaller diff — acceptable shortcut, but it throws away discovery code.
- **Fixed-name describe blob (one-array edit), not a schema walk.** Chose the stand-in: the bench resolves by exact name-match, a single reducer dispatches at `id==0`, and the 34-byte `noop` blob is a gold-verified template needing only a name edit. Rejected generating the def from typed metadata: M3 work, far larger, no single-reducer benefit. **Flip:** multiple reducers in ONE Perry module (not needed — two `.wasm` files, §3) would force index/order agreement and start paying off the schema walk.
- **No-arg, constants-baked kernel ⇒ ONE milestone.** Chose baking constants to drop `bytes_source_read` + the BSATN decoder off the path (§1). Rejected a seed/count arg: marginally more "realistic" but splits the milestone for no first-number value — the compute dominates regardless. **Flip:** if the orchestrator wants the kernel to exercise marshaling, args return and it's two milestones.
- **`bigint`/i64 xorshift, not `number`/double.** Chose `bigint` to stay in M1's proven amputation envelope and dodge the NaN-box-through-arithmetic hazard (doc 08 §4). Rejected `number` math (`Math`/`>>>`/double-coerced indexing): higher risk of a `js_*` boxing helper surviving GC, which under NO `--allow-undefined` is a hard LINK FAILURE (V1). **Flip:** V1 showing the `bigint` kernel STILL pulls a `js_*` (e.g. Perry boxes bigints) ⇒ circuit-breaker, runtime archive on the path, reorder the milestone.
- **Shared `mix` source + thin wrappers (4a), not two synced files (4b).** Chose 4a for "defined ONCE" and provably identical measured arithmetic. Rejected 4b (drift) and "same file feeds both" (impossible: Perry compiles plain exported functions; the V8 SDK needs a `spacetimedb.reducer()` registration — `spacetimedb.rs` has zero SDK-reducer handling).
- **`volatile` result sink in the shim dispatch.** Chose it: the kernel returns a value the shim otherwise discards; clang `-O3` (`compile_abi_shim:155`) + `--gc-sections` could prove the call dead and delete it, silently reproducing the no-op + the flattering number. **Flip:** if Perry emits the reducer with an optimizer-opaque side effect, the sink is belt-and-suspenders — keep it; it's one line and the exact guard V3 checks.
- **Narrow per-workload bench entries (5a), not the full `bench_suite`/`custom_benchmarks` on the Perry arm.** Chose narrow entries because the single-reducer Perry module lacks the table/game reducers the full suites call, and the fail-fast `.unwrap()` chain (`generic.rs:32-44`, `modules.rs:170`, `spacetime_module.rs` reducer lookups) panics the whole binary on the first missing reducer. Rejected running the full suite and reading the `empty`/`cpu_mix` number before the panic (5b): fragile, ordering-dependent. **Flip:** once the Perry module carries the full reducer set (M3), it rides the standard suites unchanged.

## Assumptions made

- **The 34-byte `noop` `RawModuleDef::V10` blob is editable by a localized name-bytes + length-byte change without recomputing a checksum/total-length field the change invalidates.** The V10 framing is decoded and gold-verified in doc 09b §2, so the logical deltas are the name length byte and the name bytes; but the impl MUST verify by `spacetime describe --json` on the edited module decoding to `{"reducers":[{"name":"empty"|"cpu_mix",...}]}`. If V10 encodes a total length/count that shifts when the name grows by one byte, bump those too — mechanical, but verify against a real decode.
- **Perry emits the kernel reducer as a callable `perry_fn_<basename>__<fn>` with a stable, inspectable i64 result (plus an f64 NaN-box variant).** Confirmed for arithmetic generally (M1 §3, M2 `spikeAdd`/`spikeAdd_i64`), but the EXACT exported name(s) and result type of the chosen `mix` must be read off `wasm-tools print` of the user object before writing the `extern` decl (§2). If `mix` returns boxed/NaN-boxed, the extern decl and V1 both change.
- **`CompiledModule` can gain `from_prebuilt` storing a path + `host_type=HostType::Wasm` without shelling `spacetimedb_cli::build`, and `load_module` loads such a module identically.** Inferred from `compile` (`modules.rs:162-177`) only setting `{name, path, host_type, program_bytes}` and the field being consumed at `:152`/`:192`/`:270`. **I could NOT get a clean read of the inner `load_module` body this session (transcript drop).** The design is built so it does not depend on whether `load_module` ALSO byte-checks: setting `host_type=Wasm` directly is the same value the native arms carry, and the native wasm load path is exercised every run by Rust/C#. Impl verifies by running the empty arm.
- **The bench dispatches a single reducer at `id == 0`.** Inferred from the host resolving the bench's call-by-name against the describe-decoded reducer list, with one reducer ⇒ index 0. Confirm via the publish+call probe (§7) that `id==0` dispatches (it did for M2's single `noop`).
- **The V8-arm `cpu_mix` wrapper registers under the name `cpu_mix`** (SnakeCase of the `export const cpu_mix` binding, no digits to perturb). Confirm with `spacetime describe` on the built V8 bundle; if the SDK derives a different canonical name, match the Perry def + bench call to it.
- **`pnpm install` + `pnpm --filter spacetimedb run build` still succeed at HEAD** (doc 11's two walls). Not re-run (design-only). A failure there is a prerequisite breakage independent of this design.
- **`perry compile <file>.ts --target spacetimedb -o <out>.wasm` accepts an output path and compiles a single TS file end-to-end** (docs 08/09 ran exactly this for `spike.ts`/`add.ts`). Assumed the same for `empty.ts`/`cpu_kernel.ts`.

## Side notes / observations / complaints

- **My own first pass mis-read corrupted grep output and asserted two FALSE "corrections" (bench byte-detects host_type; `--allow-undefined` present). The clean reads contradict both.** The shim at HEAD has NO `--allow-undefined` (`:287`), so the audits' circuit-breaker is real and load-bearing — an undefined `js_*` is a HARD LINK ERROR, which is exactly the falsifying observation V1 keys on. And I never got a clean read of `load_module`'s host-type detection, so I do NOT assert byte-magic; I made the design independent of it by setting `host_type=Wasm` directly in the bypass. This is itself a negative-space-pt-7 cautionary tale: corrupted tool output nearly became canon. The defense that worked: re-grounding load-bearing facts against the clean full read of the shim and the `git show HEAD` blobs, and refusing to assert the one fact I couldn't read cleanly.
- **The audits' line numbers are pervasively from an earlier `spacetimedb.rs` revision.** HEAD is 337 lines; the audits cite `:73-123`/`:85-99`/`:114-122`/`:287-295` from a predecessor. The CONTENT matches at the HEAD lines I cite. Impl: trust THIS doc's numbers, re-Read before editing.
- **Foundation is sound for THIS milestone — do not refactor first.** The C-shim is a deliberate negative-space choice (sidesteps teaching Perry's HIR→LLVM backend the wasm `export_name`/`import_module` lowering). For a first number it's the right altitude: dispatch is ~10 lines of templated C, and the measured arithmetic goes through Perry's REAL codegen, not the shim. Agree with the 12-perry audit: no rot warrants a refactor before the number.
- **The C-shim-vs-native-codegen fork is real but correctly deferred.** When M3 needs a schema walk to generate dispatch + describe from typed reducer metadata, "keep generating richer C" vs "move dunder emission into the LLVM backend" becomes live (doc 09b §18). The templated-shim step here nudges toward "richer C" — a step DOWN that fork, not neutral. Flagging so M3 decides deliberately rather than inheriting a C codegen path by accident.
- **The biggest residual risk is V1 (kernel amputation), and it's only knowable after compile.** I specified the kernel to maximize amputation odds (bigint, no arrays/objects), but whether Perry's bigint lowering stays in i64 ops or routes through a runtime helper is only knowable from `perry compile` + `wasm-tools print`. With NO `--allow-undefined`, a missed `js_*` is a clean hard link failure (good — it's loud), but it reorders the milestone hard (the wasm32 runtime archive is not green, 15 shell errors). This is the one place I'd expect a possible circuit-breaker.
- **Apples-to-apples is subtler than "run the same .ts."** Perry compiles plain exported functions; the V8 SDK needs `spacetimedb.reducer()` registration. They CANNOT share one source unchanged. The shared-logic-file + thin-wrapper design (4a) is the best available — the COMPUTE is identical, the REGISTRATION differs and is exactly what `empty` measures. The honest framing for the orchestrator: "same arithmetic, different reducer-registration shell," not "byte-identical module."
- **The fail-fast bench is a real trap for the Perry arm.** `bench_suite`/`custom_benchmarks` call table/game reducers the single-reducer Perry module lacks; the `.unwrap()` chain panics the whole binary. Hence the narrow per-workload entries (5a). This is the same fragility doc 11/12 flagged for the C# arm — it WILL bite the Perry arm the first time someone wires it into the full suite. A robust suite would degrade a missing-reducer arm to a skip; out of scope, but budget for it.
- **Two separate Perry `.wasm` files (empty + kernel), not one two-reducer module** — cleanest first-number shape; sidesteps id-branching, two-reducer def, ordering agreement. A multi-reducer Perry module is where the schema walk + a real dispatch table earn their keep (M3).
- **No dedicated single-reducer `#[test]` exists** in `crates/testing`/`crates/bench` (verified by listing). The cheapest dispatch probe is Perry's already-proven `spacetime publish`+`call` path (docs 09/09b), which isolates dispatch from all bench plumbing. Recommend the impl run that BEFORE wiring the bench; the bench filter is the timed-number step, not the first-dispatch smoke test.
- **Output-fidelity hazard, live and severe this session.** The transcript dropped a large fraction of reads/echoes in a sustained window (documented HARNESS quirk), and earlier corrupted grep identifiers (the source of my two false corrections). I re-grounded every load-bearing fact via clean `Read`s of source files and `git show HEAD:<path>` blobs, and explicitly flagged the one fact I could not read cleanly (the `load_module` body) rather than guessing. A future agent re-reading these files who sees different content should suspect the transcript, not the code; trust the git blobs at `perry-fork 42ae9659` / `SpacetimeDB-fork 46338e626`, and the shim working-tree sha `38553985…`.
