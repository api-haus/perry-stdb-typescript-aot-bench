# 12 — Benchmark readiness audit: the Perry fork half

Audit target: can a Perry-compiled SpacetimeDB module **execute a real reducer body** so it can be benchmarked against the V8 arm? Scope is the Perry fork at `/mnt/archive4/DEV/mmodb/_vendor/perry-fork`, branch `feat/target-spacetimedb`, HEAD `42ae9659` (working tree clean, one commit ahead of `origin`). The upstream reference clone is `/mnt/archive4/DEV/mmodb/_vendor/perry` (read-only).

Grounding note: this session's tool-output channel corrupted large file reads repeatedly (RTK/harness fidelity hazard). Every `file:line` below was re-grounded against the **git-committed blob** at HEAD via `git show HEAD:<path>` decoded through base64, with line numbers cross-checked. The one file that fully rendered through the `Read` tool — `crates/perry/src/commands/compile/spacetimedb.rs` (338 lines) — is the spine of this audit and was read in full and clean.

## Headline

The benchmark gap is **not** in codegen of arithmetic, the triple, the link mechanism, or the describe blob — all of that works and is server-verified. The gap is one thing: **`__call_reducer__` is a no-op that never dispatches into user code.** The reducer body never runs, by design of the M2 spike.

Two corrections to the framing the brief inherited from a journal:
1. There is **no separate hand-built `module.cpp`/`abi.h`**. The "spike" is a fixed C source string `STDB_ABI_SHIM_C` (`spacetimedb.rs:73-123`) embedded in the Rust CLI, written to a tempfile and compiled by Perry's own clang at link time (`compile_abi_shim`, `spacetimedb.rs:133-176`). The `.wasm` is produced end-to-end by `perry compile foo.ts --target spacetimedb`. (No `docs/stdb-spike/` directory exists.)
2. The describe blob is a **real, server-verified 34-byte `RawModuleDef::V10`** for one no-arg reducer `noop` (`spacetimedb.rs:85-99`), not a placeholder. Doc 09 §3 published a Perry-emitted module to a stock v2.0.1 server; `spacetime describe --json` decoded it to `{"reducers":[{"name":"noop","params":{"elements":[]}, ...}]}`. Doc 09b independently rebuilt the identical 770-byte module (sha256 `86870e4b…`) and re-published it to a fresh database. The codegen path **has** been run end-to-end against a server — for `noop`.

So the codegen path emits a real, loadable, callable SpacetimeDB module today. What it cannot do is run the user's reducer body: `__call_reducer__` returns `0` without dispatching (`spacetimedb.rs:114-122`). The first real Perry number requires turning that no-op into a dispatcher that calls the user's `perry_fn_*`, and (because the def is hand-built for the fixed name `noop`) generating the describe blob from the user's actual reducer name/params instead of the hardcoded `noop`.

## Gap table

| Capability needed for a benchmarkable Perry module | exists / partial / missing | file:line | note |
|---|---|---|---|
| `--target spacetimedb` → freestanding wasm32 triple | **exists** | `crates/perry-codegen/src/codegen/helpers.rs:310` (`"spacetimedb" => Some("wasm32-unknown-unknown")`) | M1; verified |
| wasm reactor shape (no `_start`/`main`) | **exists** | `crates/perry-codegen/src/codegen/entry.rs:84-85` (`is_wasm_reactor` joins `is_dylib`) | M1; verified |
| short-circuit to the spacetimedb link step | **exists** | `crates/perry/src/commands/compile.rs:4752-4753` → `spacetimedb::link_spacetimedb_wasm(...)` | placed before `find_runtime_library`; M1 |
| user-fn codegen (arithmetic kernel) → wasm32 | **exists** | mangling `perry_fn_{prefix}__{name}` at `helpers.rs:82-83` (`scoped_fn_name`); M1 §3: `add` → `i64.add` | the CPU-kernel *body* compiles; M1 emitted valid `i64.add`, zero imports |
| named typed `__describe_module__` / `__call_reducer__` exports | **exists** | shim `spacetimedb.rs:102,114`; export flags `spacetimedb.rs:128` + `:287-289` | clang `export_name`; sigs `(i32)->()` and `(i32 i64×7 i32 i32)->i32` server-verified (doc 09 §2) |
| `spacetime_10.0` host import present (ABI detection) | **exists** | `spacetimedb.rs:82-83` (`import_module("spacetime_10.0")`, `bytes_sink_write`) | the ONE import; server did not reject with `NotDetected` |
| valid `RawModuleDefV9/V10` describe blob | **exists (hardcoded for `noop`)** | static `MODULE_DEF[]` `spacetimedb.rs:85-99`; drained by `__describe_module__` `:102-112` | real, server-decoded — but hand-built for the fixed name `noop`, NOT generated from the user's schema |
| **empty-reducer dispatch** (call user fn, return) | **missing** | `spacetimedb.rs:114-122` (`__call_reducer__` is `(void)`-casts + `return 0;`) | no dispatch on `id`; no `extern` decl of any `perry_fn_*`; no call. This is THE gap. |
| describe blob generated from the **user's** reducer(s) | **missing** | hardcoded `noop` at `spacetimedb.rs:92`; no schema walk in this file | for the user's `empty`, the name/params must come from the module, not the literal `noop` |
| **arg decode** (`bytes_source_read` → buf → BSATN) | **missing** | `bytes_source_read` is NOT declared in the shim — named only in the doc-comment `spacetimedb.rs:68` as M2-proper work | needed only for reducers that take args |
| error sink write on failure | **missing** | `err_sink` param accepted then `(void)`-discarded `spacetimedb.rs:118,120` | no `bytes_sink_write` to the error path |
| **CPU-kernel execution** (xorshift/mix loop runs) | **missing (blocked on dispatch)** | same no-op `spacetimedb.rs:114-122` | the kernel *compiles* (arithmetic row); it cannot *run* — dispatch never calls it |
| **wasm32 `perry-runtime` archive link** | **missing / not wired; archive not green** | host `.a` exists in `target/release/`; a `wasm32-unknown-unknown` target dir exists; but per doc 08 §6 / doc 05 §3 the wasm32 runtime build reaches **15 shell-module errors, core green**. `link_spacetimedb_wasm` never adds any archive (`spacetimedb.rs:279-295`) | no `--allow-undefined` (`:287`) ⇒ an undefined `js_*` is a hard link error = the designed "link the archive" signal |

## Answers to the 6 questions

### 1. What `--target spacetimedb` emits today

End-to-end, all verified at HEAD:
- `helpers.rs:310` maps `spacetimedb` → `wasm32-unknown-unknown`.
- `entry.rs:84-85` makes any `wasm32` triple a reactor (`is_dylib`), suppressing `main`/`_start`.
- Object compile is the unchanged native LLVM path with the wasm32 triple: `clang -c -O3 -fno-math-errno <f>.ll -o <f>.o -target wasm32-unknown-unknown` (M1 §1).
- `compile.rs:4752` short-circuits to `spacetimedb::link_spacetimedb_wasm` *before* native runtime-lib resolution (`find_runtime_library`, which would error for wasm32).
- `link_spacetimedb_wasm` (`spacetimedb.rs:250-337`): compiles the ABI shim (`compile_abi_shim`, `:133-176`), scans the user objects for `perry_fn_*` symbols via `llvm-nm --defined-only` (`collect_user_function_exports`, `:210-242`), then links shim-object + user-objects with `wasm-ld --no-entry --gc-sections --export=__describe_module__ --export=__call_reducer__ [--export=perry_fn_*]` and **no `--allow-undefined`** (`:287-295`).

The shim (`STDB_ABI_SHIM_C`, `:73-123`) provides: the one `spacetime_10.0::bytes_sink_write` import (`:82-83`); a static 34-byte `RawModuleDef::V10` for `noop` in `.rodata` (`:85-99`); `__describe_module__` draining that def to the description sink (`:102-112`); and a no-op `__call_reducer__` (`:114-122`). So the doc claim is **confirmed**: named typed dunders + a `spacetime_10.0` import + an addressable static BSATN def, all real and server-verified (doc 09 §2-3). The one correction the gap table records: the def is hardcoded for `noop`, not generated from the user's schema.

### 2. The no-op `__call_reducer__` — what it does and does not do

`__call_reducer__` (`spacetimedb.rs:114-122`) accepts the full STDB signature `(u32 id, i64 sender_0..3, i64 conn_0..1, i64 timestamp, u32 args_source, u32 err_sink)`, `(void)`-casts every parameter, and `return 0;`. It reports success **without dispatching on `id`, without reading args, without calling any `perry_fn_*`, without touching `err_sink`.**

A real dispatch ("M2-proper") needs, in order:
- **Dispatch on `id`** — map the reducer index to the user's `perry_fn_<prefix>__<name>` and call it. *Missing entirely.* The symbols exist and are discoverable (`:210-242`) but the shim never `extern`-declares nor calls them. For `empty`: this is the *whole* requirement.
- **Read args** — `bytes_source_read(args_source, …)`. *Missing entirely* — the import is **not even declared** in the shim (named only in the M2-proper doc-comment, `:68`). Adding it introduces a second `spacetime_10.x` import.
- **BSATN-decode args** into the kernel's params. *Missing entirely.*
- **Write errors to `err_sink`**. *Missing* — `err_sink` is discarded (`:120`).

Status: dispatch = missing; arg read = not even declared; arg decode = missing; error sink = missing. Only the *signature* and the *describe-to-sink* drain (`:102-112`, a real `bytes_sink_write` loop) exist.

### 3. Can a Perry-compiled module execute a real reducer body?

**No — for any workload — today.** The `return 0;` short-circuits before any user code, so even `empty` (no args, no datastore, no compute) does not run the user's body. Per-workload gap:

- **`empty`**: needs (a) "dispatch on `id`, call `perry_fn_empty`" in `__call_reducer__`, and (b) the describe blob to carry the user's reducer name/params instead of the hardcoded `noop` (`:92`). No arg decode, no runtime archive, no datastore. Smallest delta to a real number (doc 10 line 27). The `empty` body is trivial; it GC's down to nothing under `--gc-sections` exactly like M1's `add`, so it stays shell-amputated.
- **CPU kernel** (xorshift/mix, arithmetic only): the *arithmetic codegens fine* (M1 §3: integer arithmetic → `i64.add`, zero imports). Gaps: (a) dispatch (as `empty`); (b) **arg decode** *if* the kernel takes a seed/iteration-count arg — declare `bytes_source_read`, read, and write a 2-integer BSATN decoder; (c) the **wasm32 runtime archive only if the kernel touches rt** — a pure-integer loop with no allocation/strings/objects should *not*, so it stays shell-amputated like M1/M2. If the kernel bakes its constants in and takes no args, arg-decode drops and the CPU kernel collapses to the same gap as `empty` plus a non-trivial body.

### 4. The wasm32 `perry-runtime` archive

A wasm32 `libperry_runtime.a` is **not built green**: `target/` contains the *host* `libperry_runtime.a` (`target/release/deps/…`) and a `wasm32-unknown-unknown` target dir exists, but per doc 08 §6 / doc 05 §3 the wasm32 runtime build reaches **15 errors, all in shell modules** (`child_process`, `geisterhand_registry`, `fs` syscalls; E0425/E0433) with the core green. The shell amputation is the long pole. (A runtime-port diff artifact exists at `docs/orchestrate/perry-stdb-poc/artifacts/perry-runtime-wasm32-port.diff` — Cargo.toml/Cargo.lock + module edits — i.e. the port is in-progress, not landed-and-building.)

The link step **never pulls in any archive**: `link_spacetimedb_wasm` (`:279-295`) adds only the user objects + the shim object, with **no `--allow-undefined`** (`:287`). So the documented design holds — an undefined `js_*` is a *hard link error*, the signal that the archive must be linked — but the wiring to link it on that signal is absent. Runtime surface a CPU kernel touches: ideally **nothing** (Perry's integer specialization keeps a numeric loop off the value model / GC). It needs the archive only if the kernel allocates, builds strings, or churns boxed objects. So: **a CPU integer kernel can stay shell-amputated and needs no runtime archive**; the archive becomes load-bearing at M3 (datastore, allocation).

### 5. Minimal gap to the FIRST real Perry number

For **`empty` dispatch** (measurable against V8's 7.20 µs call overhead; doc 10 line 40 also cites a ~20,000 ns stock `empty` baseline at `spacetime_module.rs:39`), the smallest concrete missing pieces:
- In `STDB_ABI_SHIM_C` `__call_reducer__` (`spacetimedb.rs:114-122`): `extern`-declare the user reducer and replace `return 0;` with a dispatch-on-`id` that calls `perry_fn_<prefix>__<name>`. Symbols are already discovered (`:210-242`).
- The describe blob (`MODULE_DEF[]`, `:85-99`) must carry the user's reducer name/params, not the literal `noop` (`:92`). Today it is a fixed C array string; making it user-driven means generating those bytes from the module's reducer registration (the same data-segment route the spike proved works).
- The codegen path already publishes/loads/calls end-to-end for `noop` (doc 09b), so no new verification *mechanism* is needed — but the `empty`-with-real-dispatch module must be re-published and called to confirm the dispatched body actually executes and the timing is real.

Next increment, **CPU kernel**: the above, plus (if the kernel takes args) declaring `bytes_source_read` + a minimal BSATN integer decoder, plus the kernel TS. No runtime archive if integer-only. Arithmetic codegen is already proven (M1 §3).

I am **not** designing the fix — the above is the gap as concrete anchored missing pieces.

### 6. Can Perry's HIR→LLVM emit the ABI attrs directly?

**Current mechanism is the C shim only.** The dunders, the `export_name`/`import_module` attrs, and the `spacetime_10.0` import are authored as **C source compiled by clang** (`STDB_ABI_SHIM_C` → `compile_abi_shim`, `spacetimedb.rs:73-176`), not emitted by Perry's own HIR→LLVM backend. Emitting `wasm import_module`/`export_name` as LLVM attributes directly (the doc-07 B2 "native path") is **not present** — it is the explicitly-deferred follow-through, and both doc 09 §SideNotes and doc 09b §18 flag it as the one thing the C-shim route does NOT prove. Reporting current state only, as instructed.

## Borderline calls

Genuine open questions for the architect, **not pre-decided**:

- **Does generating the describe blob from the user's schema land on the critical path for the FIRST `empty` number, or can dispatch ship against a still-hardcoded def?** A real `empty` benchmark needs the dispatched body to run; the describe blob mostly governs *registration/decode*. One could ship dispatch while keeping the def hardcoded to a single reducer named `empty` (a one-line edit to `:92`) and get a number, deferring the general schema walk to M3. **What would flip it:** whether the benchmark harness requires the reducer to be named/shaped exactly as the V8 arm's `empty`, or tolerates a fixed-name stand-in. If a stand-in is acceptable, the schema-walk work drops out of the first-number path entirely.

- **Does the CPU kernel genuinely stay shell-amputated, or does some innocuous TS construct pull in `js_*`?** M1 proved a *trivial* `add` GC's clean. A xorshift loop with array indexing, modulo, or a local accumulator *might* route through a runtime symbol LLVM cannot prove away (M1 §4 / doc 05 B4 — the NaN-box-through-arithmetic hazard is invisible on integer kernels but the kernel choice decides it). **What would flip it:** compiling the actual kernel TS with `--target spacetimedb` and reading `wasm-ld` output — a clean link = amputated; an `undefined symbol: js_*` = the unbuilt wasm32 archive is suddenly on the critical path. This single observation reorders the whole CPU-kernel milestone, because the archive is *not green* (15 shell errors).

- **Is "M2-proper" one milestone or two?** Doc 10 treats `empty`-dispatch and CPU-kernel as separate increments. If the chosen kernel takes no args and stays amputated, they collapse into one change (dispatch + a non-trivial body + a fixed-name def). **What would flip it:** the kernel's argument shape — args present ⇒ two milestones (arg-decode is its own chunk); args baked in ⇒ one.

## Side notes / observations / complaints

- **The foundation is sound enough to build the benchmark milestone on — do not restructure first.** The C-shim approach is a deliberate negative-space choice: it sidesteps teaching Perry's HIR→LLVM backend the wasm `export_name`/`import_module` attribute lowering (a real backend change) by letting clang author the four ABI symbols and linking them alongside the user objects. For a *first benchmark number* this is the right altitude — the dispatch logic is ~10 lines of C added to `__call_reducer__`, and the arithmetic being benchmarked already goes through Perry's real codegen. The shim is glue, not the measured code. No rot warrants a refactor before the benchmark milestone.

- **The C-shim-vs-native split IS a latent fork in the road, just not now.** While `__call_reducer__` is hand-authored C, the dispatch table is C-side and decoupled from Perry's symbol/schema knowledge — fine for a fixed reducer set, awkward once M3's schema walk must generate dispatch + the describe blob from typed reducer metadata. At that point the architect faces "keep generating richer C" vs "move dunder emission into the LLVM backend (question 6)." An M3 decision; flagging so it is not stumbled into. doc 09b §18 already names it.

- **The benchmark MUST run the codegen-emitted module, and the measured cost must be the dispatched user body — not the shim.** Today the shim *is* effectively the whole module (the user fn is GC'd out for `noop`). Once dispatch lands, confirm via `wasm-tools print` that `__call_reducer__` actually `call`s the `perry_fn_*` and that the function survived `--gc-sections`. A subtle failure mode: dispatch wired wrong, kernel GC'd away, benchmark silently times an empty call and reports a flattering AOT number. Build the verification adversarially (call the reducer, assert an observable side effect or a non-trivial duration), not "it linked."

- **Tooling state:** `wasm-tools` IS present (`~/.cargo/bin/wasm-tools`) — good, exports/sigs are inspectable. The wasm32 Rust target dir exists but the runtime does not build green for it (15 shell errors). Whoever does the CPU-kernel-with-runtime increment needs the shell amputation finished first; whoever does `empty`/integer-kernel does not.

- **Two corrections to the inherited brief framing, for the orchestrator's awareness.** The brief (echoing an earlier journal) described a hand-built `module.cpp`/`abi.h` and asked whether the describe blob is a `0x00` placeholder and whether `bytes_source_read` is "declared but unused." None of those match HEAD: there is no separate `.cpp` (the spike is the `STDB_ABI_SHIM_C` string in `spacetimedb.rs`), the describe blob is a real server-verified def, and `bytes_source_read` is not declared at all. These are not contradictions in the code — they are drift between the brief's recollection and the committed source. The single real gap is exactly as the brief's *core* question framed it: `__call_reducer__` dispatch.

- **Output-fidelity hazard this session (meta).** The harness tool-output path corrupted/dropped large reads of `spacetimedb.rs` and the docs repeatedly — `grep -c` once reported 100 non-blank lines for a 302-line blob; base64 chunks arrived truncated or substituted. Every anchor above was re-derived from `git show HEAD:<path>` and the one clean full `Read` of `spacetimedb.rs`. If a future agent re-reads these files and sees different content, suspect the transcript, not the code; trust the git blob at `42ae9659`.
