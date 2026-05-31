# 09b — M2 spike independent verification

This is the adversarial re-verification of doc 09's central kill-criterion claim (doc 07 §4 B2/B3): that the forked Perry produced a `.wasm` the **stock** SpacetimeDB v2.0.1 server genuinely loads and runs. The verifier did not write the spike code. The verdict is **confirmed-loaded**: a module rebuilt this session by the forked `perry` binary, published to the running stock server under a fresh database name, instantiated with no ABI/import/validation error, decoded into the expected one-reducer schema, and its reducer returned `HTTP 200` with a server-measured execution duration. Every load-bearing M2-spike claim reproduced; no discrepancies.

All artifacts of this verification live under `/mnt/archive4/DEV/mmodb/_scratch/m2-verify/`. The spike's own `_scratch/m2-spike/` was empty at verification time (ephemeral to the spike session), so everything below was produced fresh from source, not read back from the spike's outputs.

## 1. The fork is at the claimed state, and the ABI shape is codegen-emitted, not a pasted binary

The working tree `/mnt/archive4/DEV/mmodb/_vendor/perry-fork` is on branch `feat/target-spacetimedb`, HEAD `42ae9659` ("feat(target): emit STDB ABI shim for --target spacetimedb (mmodb M2 spike)"), one commit ahead of `origin/feat/target-spacetimedb` — consistent with the spike's `branch_pushed: false`. The M2 commit touches exactly one file, `crates/perry/src/commands/compile/spacetimedb.rs` (+163/-17); the M1 commit `03661376` carries the triple/reactor/short-circuit plumbing (`helpers.rs:310` `"spacetimedb" => wasm32-unknown-unknown`, `entry.rs:74` `is_wasm_reactor`, `compile.rs:4752` short-circuit to `link_spacetimedb_wasm`), all present at HEAD.

The ABI shape is **codegen-emitted through the Perry link step, not a hand-pasted `.wasm` or `.o`**. The mechanism is a fixed C source string `STDB_ABI_SHIM_C` (`spacetimedb.rs:73`) held in the Rust source — never an external binary checked into the tree. At link time `compile_abi_shim` (`spacetimedb.rs:133`) writes that C to a tempfile and compiles it with the same `clang` the codegen path discovers (`perry_codegen::linker::find_clang`, `spacetimedb.rs:134`) using the identical flags the per-module object compile uses (`clang -c -O3 -fno-math-errno -target wasm32-unknown-unknown`, `spacetimedb.rs:153-162`), and `link_spacetimedb_wasm` (`spacetimedb.rs:250`) prepends that shim object to the user `perry_fn_*` objects in one `wasm-ld --no-entry --gc-sections` invocation with no `--allow-undefined` (`spacetimedb.rs:287-295`). So `perry compile spike.ts -o module.wasm --target spacetimedb` emits the whole module end-to-end with no manual build step. This satisfies the brief's acceptance condition for a spike-stage shim: the `.wasm` flows through Perry's own spacetimedb link step.

The codegen-vs-shim split the spike claimed is accurate and honestly disclosed in the source comments (`spacetimedb.rs:64-72`):

- **Genuine codegen capability** — the export names `__describe_module__`/`__call_reducer__`, their exact non-NaN-boxed wasm signatures, the `spacetime_10.0` import-namespace selection (clang `import_module`/`import_name`, `spacetimedb.rs:82`), and the addressable static `.rodata` byte buffer (B3). These are the three doc-04 walls and they are proven on the stock host.
- **Hand-shim that M2-proper must absorb** — the 34-byte BSATN `RawModuleDef::V10` is hand-built for the fixed `noop()` reducer (`spacetimedb.rs:87-99`), and `__call_reducer__` is a no-op returning `0` (`spacetimedb.rs:114-122`).

One narrower follow-on the C-shim route does **not** prove, correctly flagged by the spike: that Perry's own HIR→LLVM lowering can emit `export_name`/`import_module` attributes on functions it generates (an LLVM-attribute pass or `.ll` post-process). The shim being a C source compiled by Perry's clang is the spike shortcut; it proves the wasm *shape* the eventual codegen/TS-runtime must hit, not that Perry's IR emitter can author that shape itself.

## 2. Independently rebuilt module — the dump

`spike.ts` (`/mnt/archive4/DEV/mmodb/_scratch/m2-verify/spike.ts`) is a trivial `export function spikeAdd(a: number, b: number): number { return a + b; }`. Compiled with the rebuilt fork binary (`/mnt/archive4/DEV/mmodb/_vendor/perry-fork/target/release/perry`, version `0.5.1046`):

```
$ perry compile spike.ts -o module.wasm --target spacetimedb
  auto-optimize: built .../release/libperry_runtime.a (57.8 MB)
  auto-optimize: built .../release/libperry_stdlib.a (81.3 MB)
Linking freestanding wasm32 (spacetimedb) → module.wasm
  (exports: __describe_module__, __call_reducer__, perry_fn_spike_ts__spikeAdd, perry_fn_spike_ts__spikeAdd_i64)
```

The result is a **770-byte** module (matching the spike's claimed size exactly), sha256 `86870e4b031704cce7a4790e77e611751ea1897a19ba7c2785bfd293493579dd`. `wasm-tools validate` (wasm-tools 1.251.0) passes. The full `wasm-tools print`:

```wat
(module $module.wasm
  (type (;0;) (func (param i32 i32 i32) (result i32)))                          ;; bytes_sink_write
  (type (;1;) (func (param i32)))                                               ;; __describe_module__
  (type (;2;) (func (param i32 i64 i64 i64 i64 i64 i64 i64 i32 i32) (result i32))) ;; __call_reducer__
  (type (;3;) (func (param i64 i64) (result i64)))                              ;; spikeAdd i64 specialization
  (type (;4;) (func (param f64 f64) (result f64)))                              ;; spikeAdd f64 NaN-box ABI
  (import "spacetime_10.0" "bytes_sink_write" (func $bytes_sink_write (type 0)))
  (table (;0;) 1 1 funcref)
  (memory (;0;) 2)
  (global $__stack_pointer (mut i32) i32.const 65536)
  (export "memory" (memory 0))
  (export "__describe_module__" (func $__describe_module__))
  (export "__call_reducer__" (func $__call_reducer__))
  (export "perry_fn_spike_ts__spikeAdd_i64" (func $perry_fn_spike_ts__spikeAdd_i64))
  (export "perry_fn_spike_ts__spikeAdd" (func $perry_fn_spike_ts__spikeAdd))
  (func $__describe_module__ (type 1) (param i32) ... call $bytes_sink_write ... )
  (func $__call_reducer__ (type 2) (param i32 i64 i64 i64 i64 i64 i64 i64 i32 i32) (result i32)
    i32.const 0)
  (func $perry_fn_spike_ts__spikeAdd_i64 (type 3) (param i64 i64) (result i64) local.get 1 local.get 0 i64.add)
  (func $perry_fn_spike_ts__spikeAdd (type 4) (param f64 f64) (result f64)
    local.get 1 i64.trunc_sat_f64_s local.get 0 i64.trunc_sat_f64_s i64.add f64.convert_i64_s)
  (data $.rodata (i32.const 65536)
    "\02\02\00\00\00\03\01\00\00\00\04\00\00\00noop\00\00\00\00\01\02\00\00\00\00\04\0a\00\00\00\00"))
```

Each criterion from the brief's step 2, checked against the artifact:

- **`__describe_module__` is `(param i32)` with no result** — type 1, matching `DESCRIBE_MODULE_SIG` (`wasm_common.rs:145`). PASS.
- **`__call_reducer__` is `(param i32 i64 i64 i64 i64 i64 i64 i64 i32 i32) (result i32)`** — type 2, matching `CALL_REDUCER_SIG` (`wasm_common.rs:146`). PASS.
- **`memory` exported under the exact name `"memory"`.** PASS.
- **Imports are ONLY `spacetime_10.0::bytes_sink_write` `(i32 i32 i32)->i32`.** `wasm-tools objdump` reports the imports section at 1 count; `wasm-tools print | rg '(import' | rg -v spacetime_10` is empty — no `rt`, `ffi`, `env`, or WASI namespace. PASS. (Any import outside `spacetime_10.x` would be an automatic refutation; none exists.)
- **No `(start)` section** — reactor shape via `--no-entry`. PASS.
- **The BSATN def sits in `.rodata` at fixed offset `i32.const 65536`**, and `__describe_module__`'s loop reads `MODULE_DEF[written]` from that base and drains it via `bytes_sink_write` — the addressable static memory of B3. PASS.

The 34 `.rodata` bytes decode byte-for-byte to the doc-02 §iv gold layout:

```
hex:  02020000000301000000040000006e6f6f7000000000010200000000040a00000000
gold: 02020000000301000000040000006e6f6f7000000000010200000000040a00000000   MATCH
```

`--gc-sections` dropped `perry_module_init` and all `js_*` runtime references — the integer-typed `spikeAdd` never reaches the runtime, so the module is freestanding, exactly as M1 predicted for a non-runtime-touching function.

**B4 spot-check (NaN-canonicalization).** A disassembly grep for the canonicalizing-arithmetic class `f64.(add|sub|mul|div|neg|abs|copysign|min|max|sqrt|ceil|floor|trunc|nearest)` returns empty; the only `f64.` instruction in the module is `f64.convert_i64_s` in the `spikeAdd` f64-ABI shim, which produces a genuine numeric f64 from an integer and carries no NaN-box tag. The doc-08 §4 reading holds for this integer kernel. As the spike correctly states, B4 on a boxed-value kernel remains unproven and is only compilable once the wasm32 runtime is linked.

## 3. Publish / load / call transcript — fresh stock v2.0.1 database

The 2.0.1 CLI was extracted fresh from the running image per doc 04 §5: `docker cp $(docker create clockworklabs/spacetime:v2.0.1):/opt/spacetime/spacetimedb-cli ./bin/spacetime-2.0.1`. `--version` reports `spacetimedb tool version 2.0.1; spacetimedb-lib version 2.0.1` (commit `a4d29da`). The running server is `clockworklabs/spacetime:v2.0.1` (container `mmodb-spacetimedb-1`, up); `GET /v1/ping` returns `200`. The `--bin-path` escape hatch is grounded at `publish.rs:216` (`.long("bin-path")`) with the "(WASM) Skipping build" path at `publish.rs:545`.

Published to a **fresh, never-before-used** database name (timestamp-suffixed so this is not a stale deploy): `m2verify1780253443`.

```
$ ./bin/spacetime-2.0.1 publish --bin-path module.wasm --server http://localhost:3000 m2verify1780253443 -y
We have logged in directly to your target server.
(WASM) Skipping build. Instead we are publishing module.wasm
Uploading to http://localhost:3000 => http://localhost:3000
Checking for breaking changes...
Publishing module...
Created new database with name: m2verify1780253443, identity: c200c922fefda06866147187a88b7c44f212a838c8b1de4d11b890a75bf56102
```

The auth was a server-issued login (the CLI logged directly into the target server; a global-auth token would have returned `401 InvalidSignature`, the doc-03/04 gotcha).

**Load confirmation.** `spacetime logs m2verify1780253443` shows exactly `INFO: Database initialized` — no `NotDetected` ABI error, no unknown-import instantiation failure, no required-export validation error. The stock Wasmtime loader instantiated the module and ran publish-time describe (a malformed def or a bad export signature fails there).

**Schema decode.** `spacetime describe m2verify1780253443 --json` returns exactly the def the shim emitted, proving the host decoded the hand-built `.rodata` BSATN:

```json
{ "typespace": { "types": [] }, "tables": [],
  "reducers": [ { "name": "noop", "params": { "elements": [] }, "lifecycle": { "none": [] } } ],
  "types": [], "misc_exports": [], "row_level_security": [] }
```

**Reducer call.** The HTTP call endpoint, with the server-issued bearer token and `Content-Type: application/json`:

```
$ curl -i -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
      --data '[]' http://localhost:3000/v1/database/m2verify1780253443/call/noop
HTTP/1.1 200 OK
spacetime-energy-used: 2
spacetime-execution-duration-micros: 5
content-length: 0
```

`__call_reducer__` was invoked on the stock fuel-metered sync lane and returned `0`; the server billed energy and reported the execution duration — the exact gate doc 07 M0 specified. (`spacetime call m2verify1780253443 noop` via the CLI also returned cleanly; the HTTP form is shown because it surfaces the execution-duration header. A first HTTP attempt without `Content-Type` returned `415 Unsupported Media Type` — a curl-invocation detail, not a module fault; the server had already authenticated the identity.)

## 4. Verdict per criterion

| Criterion (brief step) | Result | Evidence |
|---|---|---|
| Fork at claimed branch/HEAD, ABI shape codegen-emitted not pasted | PASS | `feat/target-spacetimedb` @ `42ae9659`; shim is `STDB_ABI_SHIM_C` C source compiled by Perry's `find_clang` and linked by Perry's `wasm-ld` (`spacetimedb.rs:73,133,250`) |
| Module rebuilt independently via forked perry | PASS | `perry 0.5.1046`, 770 B, sha256 `86870e4b…`, exit 0 |
| `wasm-tools validate` passes | PASS | exit 0 |
| `__describe_module__ (i32)->()` | PASS | type 1 |
| `__call_reducer__ (i32 i64×7 i32 i32)->i32` | PASS | type 2 |
| `memory` exported | PASS | `(export "memory" (memory 0))` |
| imports ONLY under `spacetime_10.x` | PASS | one import `spacetime_10.0::bytes_sink_write`; zero others |
| no `(start)` | PASS | absent; `--no-entry` reactor |
| BSATN def matches doc-02 gold | PASS | byte-identical, 34 B at `.rodata` offset 65536 |
| B4 no canonicalizing f64 op (integer kernel) | PASS (kernel-scoped) | only `f64.convert_i64_s`; boxed-value B4 still open |
| Published to FRESH stock v2.0.1 db | PASS | `m2verify1780253443`, "Created new database" |
| Instantiated, no ABI/import/export error | PASS | `INFO: Database initialized` |
| Schema decoded to expected def | PASS | one reducer `noop`, no params |
| Reducer callable, server-measured duration | PASS | `HTTP 200`, `spacetime-execution-duration-micros: 5`, `energy-used: 2` |

**Overall: confirmed-loaded.** The kill-criterion (B2/B3) does not fire. The forked Perry produced a module the stock server genuinely loads and runs, reproduced on a fresh database the verifier chose. The spike's `status: loaded-and-callable` / `server_accepted: true` / `reducer_callable: true` / `wasm_shape_correct: true` all reproduce.

## 5. Discrepancies

None material. The spike's claims reproduce exactly, including the 770-byte size, the byte-exact BSATN def, the single `spacetime_10.0` import, the two exactly-typed dunders, and the `HTTP 200 + execution-duration` call result. The one nuance worth stating plainly is not a discrepancy but a scope boundary already disclosed by the spike: what is proven loadable is a hand-built fixed `noop` def with a no-op `__call_reducer__`, so "the stock host loads and runs a Perry-toolchain-produced SpacetimeDB module" is confirmed, while "Perry generates the def from a user schema and dispatches a real reducer" is the unproven remainder (the spike's `m2_remaining` list), and "Perry's HIR→LLVM can itself emit the `export_name`/`import_module` attributes" is the narrower follow-on the C-shim route deliberately does not exercise.

## Side notes / observations / complaints

- **The verification reproduced the spike's own footguns, which is itself a confidence signal.** The auto-optimize step rebuilt the 57.8 MB + 81.3 MB host archives the spacetimedb link ignores (doc 08 §6 / doc 09 side note) — confirmed live in the build log, harmless latency for the spike, a "the logs are lying about which runtime is in play" hazard for M2/M4. The CLI/server version split is real: the extracted `./bin/spacetime-2.0.1` is the only CLI that decodes a V10 def against this server, and there is no checked-in extraction script, so every future session re-extracts it by hand. Worth landing doc 04 §5's `build-and-publish.sh` so this is not rediscovered.

- **The `.wasm` is byte-deterministic across a clean rebuild from source** (sha256 `86870e4b…`, 770 B). That is a useful property: the spike's artifact and the verifier's independent rebuild are the same bytes, which means the publish/load/call result is attributable to the toolchain, not to a one-off artifact that happened to be lying around. (The spike's `_scratch/m2-spike/` was in fact empty at verification time, so there was nothing to accidentally reuse — everything here is fresh.)

- **The no-op `__call_reducer__` returning `i32.const 0` is the honest center of the spike's scope.** A `noop` reducer that does nothing and returns success is exactly what a no-op `__call_reducer__` will report regardless of whether dispatch is wired — so the `HTTP 200` proves the ABI *call path* (the host can invoke the export, the export returns the success errno, the host bills energy and measures duration), not that any user TypeScript ran. This is precisely what M0 was scoped to prove and the spike says so; the verifier flags it only so no reader over-reads the `200` as "user reducer logic executed." The first real user-logic call is gated on the M2 dispatch + runtime-link work.

- **B4 is genuinely untested where it matters.** The spike, doc 08, and this verification all converge on the same honest statement: the integer kernel compiles to `i64.add` with an `f64.convert_i64_s` ABI shim and zero canonicalizing ops, so it cannot exercise a NaN-boxed pointer/string moving through arithmetic. The real B4 test needs a reducer that churns boxed values, which only compiles once the wasm32 `libperry_runtime.a` is linked (the spike's stated long pole, ~15 shell-module build errors with a green core). Reading this spike's clean B4 result as "B4 closed" would be the over-read the negative-space discipline warns against.

- **Server-issued login mutated the user's real CLI config.** Attempting an isolated `HOME` did not redirect the CLI — it writes `/home/midori/.config/spacetime/cli.toml` (XDG), so the verification's server-local token landed in the user's actual config. Non-destructive (a `login --server-issued` token for localhost), but a future harness wanting true isolation must set `XDG_CONFIG_HOME`, not `HOME`. Noted so it is not a surprise.
