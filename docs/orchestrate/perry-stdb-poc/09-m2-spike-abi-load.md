# 09 — M2 make-or-break spike: forked Perry → freestanding wasm32 → stock SpacetimeDB loads and runs it

This is the project's central kill-criterion probe (doc 07 §4, B2/B3). The question is binary: can the forked Perry's LLVM path emit a `.wasm` that the **stock** SpacetimeDB v2.0.1 server accepts as a native module and that exposes a callable reducer? The answer is **yes**. A module produced end-to-end by the rebuilt `perry --target spacetimedb` was published to the running stock server, instantiated with no ABI/import/validation error, decoded into the expected one-reducer schema, and its reducer returned success with the server emitting `spacetime-execution-duration-micros`.

B2 (named/typed dunder exports + a chosen `spacetime_10.x` import namespace) and B3 (addressable static linear memory for BSATN) are **resolved green** at the mechanism level. What remains is M2-proper lowering work — generating the BSATN def from the user module's schema and dispatching `__call_reducer__` into the user's reducers through the runtime — not a new wall. The kill-criterion does not fire; the sound path is viable on Perry's current LLVM architecture.

Every claim below is grounded in code at `file:line` on branch `feat/target-spacetimedb` or in an artifact this session built, published, and inspected.

## 1. The codegen change (file:line)

One file changed: `crates/perry/src/commands/compile/spacetimedb.rs` (the freestanding-wasm32 link step introduced in M1). Two additions and one modification to the existing `link_spacetimedb_wasm`.

- **`spacetimedb.rs:73` — `STDB_ABI_SHIM_C`.** A fixed C source the `--target spacetimedb` path emits as its ABI boundary. It declares the one `spacetime_10.0::bytes_sink_write` import via clang `import_module`/`import_name` attributes (`spacetimedb.rs:82` — the C++ `abi.h:24` mechanism), holds the verified 34-byte BSATN `RawModuleDef::V10` for one no-arg reducer `noop` as a `static const u8[]` (`spacetimedb.rs:87` — a `.rodata` data segment, hence a known linear-memory address), and defines the two reactor dunders with `export_name` attributes: `__describe_module__` draining the def to the description `BytesSink` via a `bytes_sink_write` loop (`spacetimedb.rs:102`) and a no-op `__call_reducer__` returning 0 (`spacetimedb.rs:114`).
- **`spacetimedb.rs:133` — `compile_abi_shim`.** Compiles the shim to a freestanding wasm32 `.o` using the same `clang` the codegen path discovers (`perry_codegen::linker::find_clang`), with the identical flags the per-module object compile uses: `clang -c -O3 -fno-math-errno -target wasm32-unknown-unknown`.
- **`spacetimedb.rs:250` — `link_spacetimedb_wasm` modified.** It now compiles the shim (`spacetimedb.rs:268`), prepends the shim object to the link inputs (`spacetimedb.rs:291`), and exports the two dunders (`STDB_DUNDER_EXPORTS`, `spacetimedb.rs:128`) on top of the user `perry_fn_*` exports. The user-function set is no longer required to be non-empty — a reducer-only module dispatches through the dunders and need export no `perry_fn_*` directly. The reactor link flags are unchanged from M1: `wasm-ld --no-entry --gc-sections`, no `--allow-undefined`.

The codegen pipeline upstream of the link step (`.ll` → `clang -c --target=wasm32-unknown-unknown` → `.o`) and the M1 triple/reactor plumbing (`helpers.rs:300` triple map, `entry.rs:84` `is_wasm_reactor`) were not touched. The native compile path is unaffected — a native `console.log` program still compiles and runs (`is_wasm_reactor` stays false for native triples; verified this session).

### Codegen vs hand-shim — the honest split

The brief allows a codegen-emitted shim for the spike provided the `.wasm` is produced by the Perry toolchain and the shim/codegen boundary is documented. It is.

- **Produced by the Perry toolchain.** The shim `.c` is authored by the `--target spacetimedb` target, compiled by Perry's own `find_clang`, and linked by Perry's own `wasm-ld` invocation alongside the user's compiled `perry_fn_*` objects. There is no external build step; `perry spike.ts -o module.wasm --target spacetimedb` emits the whole module.
- **What is genuine codegen capability (the load-bearing B2/B3 results).** The export names `__describe_module__`/`__call_reducer__`, their exact non-NaN-boxed wasm signatures `(i32)->()` and `(i32 i64×7 i32 i32)->i32`, the `spacetime_10.0` import namespace selection, and the addressable static `.rodata` byte buffer at a fixed offset. These are exactly the three doc-04 walls (named/typed dunders, chosen import namespace, addressable memory) and they are proven to work through the clang attribute mechanism on the stock host.
- **What is hand-shim and M2-proper must absorb.** The 34-byte BSATN def is hand-built for the fixed `noop()` reducer — M2-proper generates it from the user module's `registerReducer`/`schema()` walk (doc 06 M3). The `__call_reducer__` body is a no-op — M2-proper reads args via `bytes_source_read`, decodes BSATN per the reducer's `params`, dispatches to the user's `perry_fn_*` reducer, and writes errors to the error sink. These are lowering work over the same proven mechanism, not a different capability.

## 2. The emitted module (`wasm-tools` dump)

`perry spike.ts -o module.wasm --target spacetimedb` (where `spike.ts` exports a trivial `spikeAdd(a, b)`) produces a 770-byte module. `wasm-tools validate` passes. Trimmed `wasm-tools print`:

```wat
(module
  (type (;0;) (func (param i32 i32 i32) (result i32)))   ;; bytes_sink_write
  (type (;1;) (func (param i32)))                         ;; __describe_module__
  (type (;2;) (func (param i32 i64 i64 i64 i64 i64 i64 i64 i32 i32) (result i32))) ;; __call_reducer__
  (type (;3;) (func (param i64 i64) (result i64)))        ;; user spikeAdd (i64 specialization)
  (type (;4;) (func (param f64 f64) (result f64)))        ;; user spikeAdd (f64 NaN-box ABI)
  (import "spacetime_10.0" "bytes_sink_write" (func $bytes_sink_write (type 0)))
  (memory (;0;) 2)
  (export "memory" (memory 0))
  (export "__describe_module__" (func $__describe_module__))
  (export "__call_reducer__" (func $__call_reducer__))
  (export "perry_fn_spike_ts__spikeAdd_i64" (func ...))
  (export "perry_fn_spike_ts__spikeAdd" (func ...))
  (func $__describe_module__ (type 1) (param i32) ...)
  (func $__call_reducer__ (type 2) (param i32 i64 i64 i64 i64 i64 i64 i64 i32 i32) (result i32) ...)
  (data $.rodata (i32.const 65536)
    "\02\02\00\00\00\03\01\00\00\00\04\00\00\00noop\00\00\00\00\01\02\00\00\00\00\04\0a\00\00\00\00"))
```

Confirmed against the doc-02 contract:

- **`__describe_module__`** is type 1 = `(param i32)` with no result — matches `DESCRIBE_MODULE_SIG` (`wasm_common.rs:145`).
- **`__call_reducer__`** is type 2 = `(param i32 i64 i64 i64 i64 i64 i64 i64 i32 i32) (result i32)` — matches `CALL_REDUCER_SIG` (`wasm_common.rs:146`).
- **`memory`** is exported under the exact name `"memory"`.
- **Imports are ONLY `spacetime_10.0::bytes_sink_write` `(i32 i32 i32)->i32`** — one import, in the `spacetime_10.x` namespace, satisfying both the marshalling need and ABI detection (`determine_spacetime_abi`, `abi.rs:5`). A grep for any import outside `spacetime_10` returns empty: no `rt`, no `ffi`, no `env`, no WASI.
- **No `(start)` section** — reactor shape (`--no-entry`), the host calls the dunders on demand.
- **The BSATN def sits in `.rodata` at the fixed offset `i32.const 65536`** — the addressable static memory (B3) the shim's `bytes_sink_write` loop reads from; the 34 bytes match the doc-02 §iv gold layout exactly (`02 02000000 03 01000000 04000000 6e6f6f70 00000000 01 0200000000 04 0a 00000000`).

`--gc-sections` dropped `perry_module_init` and all `js_*` runtime references, because the user `spikeAdd` is integer-typed and never reaches the runtime — so this spike module is freestanding, exactly as M1 predicted for a non-runtime-touching function. (A runtime-touching reducer is where M2 must link the wasm32 `libperry_runtime.a`; see §4.)

## 3. Publish / load / call transcript (stock v2.0.1 server)

The local `spacetime` CLI is **1.11.1** (V9 ABI) and would not decode a V10 def. Per doc 04 §5 the v2.0.1 CLI was extracted from the running image — `docker cp $(docker create clockworklabs/spacetime:v2.0.1):/opt/spacetime/spacetimedb-cli ./bin/spacetime-2.0.1` (the in-image path `/opt/spacetime/spacetimedb-cli` was confirmed; `/usr/local/bin/spacetime` is a symlink to it). `./bin/spacetime-2.0.1 --version` reports `2.0.1`.

Auth (doc 03/04 gotcha): a global-auth login returns `401 InvalidSignature` against a local server, so `spacetime logout` then `login --server-issued-login http://localhost:3000` (the server is the positional arg for this subcommand on 2.0.1, not a `--server` flag) issues a server-local token.

Publish of the Perry-produced module via the `--bin-path` escape hatch (`publish.rs:213-232`, decoupled from the TS toolchain):

```
$ ./bin/spacetime-2.0.1 publish --bin-path _scratch/m2-spike/module.wasm \
      --server http://localhost:3000 m2perry -y
(WASM) Skipping build. Instead we are publishing _scratch/m2-spike/module.wasm
Uploading to http://localhost:3000 => http://localhost:3000
Checking for breaking changes...
Publishing module...
Created new database with name: m2perry, identity: c20094452dcc...
```

Load confirmation — `spacetime logs m2perry` shows `INFO: Database initialized` with **no `NotDetected` ABI error, no unknown-import instantiation failure, no required-export validation error**. The server instantiated the module in its stock Wasmtime loader and ran it through publish-time describe (a malformed def or a bad export signature fails here).

Schema decode — `spacetime describe m2perry --json` returns exactly the def the shim emitted, proving the host decoded the hand-built BSATN bytes:

```json
{ "tables": [], "reducers": [ { "name": "noop", "params": { "elements": [] }, "lifecycle": { "none": [] } } ], "types": [], "misc_exports": [], "row_level_security": [] }
```

Reducer call — `spacetime call m2perry noop` returns exit 0. The HTTP call endpoint confirms success and the server-measured execution header:

```
$ curl -i -X POST -H "Authorization: Bearer $TOKEN" --data '[]' \
      http://localhost:3000/v1/database/m2perry/call/noop
HTTP/1.1 200 OK
spacetime-energy-used: 2
spacetime-execution-duration-micros: 5
content-length: 0
```

`__call_reducer__` was invoked on the stock fuel-metered sync lane and returned 0; the server billed energy and reported the execution duration — the exact gate doc 07 M0 specified.

(The same transcript was first run on a raw hand-authored prototype shim published as `m2probe`, isolating the publish/auth/load gate from the Perry build; it returned the identical 200 + `execution-duration-micros: 4`. The `m2perry` run above is the one produced end-to-end by the Perry toolchain.)

## 4. What M2-proper still needs

The spike isolates B2/B3 from the runtime shell-amputation deliberately; the rest of M2 is the bulk of doc 07 §3 M2 and remains:

- **BSATN def generation from the user schema.** The 34-byte def is hand-built for `noop`. M2-proper walks the user module's reducer/table registrations and serializes the full `RawModuleDef::V10` (doc 06 M3). The serialization can run in-module (emit the bytes into a data segment at codegen time, as the shim does) or be assembled at describe time; the spike proves the data-segment route works.
- **`__call_reducer__` dispatch into user reducers.** The no-op must become: read args via `bytes_source_read` (sized by `bytes_source_remaining_length`), decode BSATN per the reducer's `params` `ProductType`, call the user's `perry_fn_*` reducer (the spike shows those are exported and addressable), and on error write a UTF-8 message to the error `BytesSink` and return `HOST_CALL_FAILURE`. This pulls in `bytes_source_read` (a second `spacetime_10.x` import) and the runtime value model.
- **Linking the wasm32 `libperry_runtime.a`.** The spike's reducer touches no runtime, so `--gc-sections` keeps the module freestanding. A real reducer that churns NaN-boxed values references `js_*` symbols, which (with no `--allow-undefined`, by design) becomes a hard `undefined symbol` link error until the wasm32 runtime archive is linked. That archive currently builds with ~15 shell-module errors and a green core (doc 05 §3 / doc 08 §6); the shell amputation (doc 07 §3 M2 A2) is the long pole.
- **B4 on a boxed-value kernel.** The spike's user function is integer-typed (M1 §4 showed the integer path compiles to `i64.add`, never a canonicalizing `f64.*`). A reducer moving NaN-boxed objects/strings through code LLVM cannot prove numeric is the real B4 test, and only a runtime-linked M2 reducer can compile one.
- **Full TS lowering of the ABI boundary in the SpacetimeDB fork (M3).** The shim is C today. The product replaces `sys.d.ts` with `spacetime_10.x` import declarations and writes the BytesSource/BytesSink drain loops and dunder dispatch in the TS runtime (doc 06 §3 / doc 07 §3 M3). The spike proves the wasm shape those will need to hit.

The negative-space line: nothing here required a host change, a relaxed import allow-list, or a `PerryWasm` host_type (doc 07 §1.1). The stock server loaded a freestanding Perry-produced wasm with one `spacetime_10.x` import exactly as it loads a Rust/C#/C++ module. The make-or-break unknown is resolved green.

## Side notes / observations / complaints

- **The clang `export_name`/`import_module` attribute mechanism is the whole ballgame, and it is cheap.** Doc 07 §4 rated B2 HIGH risk and budgeted a focused 2-week spike against the kill-criterion. The mechanism itself took one C file and validated on the first isolated `clang`/`wasm-ld` probe — the same way M1's wasm emission worked first try. The risk in B2 was never "can clang name a typed export" (the C++ binding has done it for years); it was "is Perry's LLVM path the kind of pipeline where you can inject such a thing." Because Perry's path is `.ll`-text → shell-out `clang` → shell-out `wasm-ld` (not inkwell), injecting a separately-compiled shim object into the existing `wasm-ld` invocation is trivial. The architecture that looked like the liability is what made the fix a 200-line link-step addition.

- **The shim being C rather than emitted `.ll` is a deliberate spike shortcut and should be called out as the one thing M2/M3 changes.** A C source compiled by `find_clang` is honest (it is the Perry toolchain's own clang, and the C++ binding precedent is literally C/C++), but the product wants the dunders' bodies to be Perry codegen output that dispatches into the user's lowered reducers, with the import declarations and drain loops authored in the TS runtime (M3). The spike proves the wasm *shape* the eventual codegen/TS must hit; it does not prove Perry's HIR→LLVM lowering can itself emit `export_name`/`import_module` attributes on a function it generates. That is a narrower follow-on (an LLVM-attribute pass or an `.ll` post-process), and it is the one place the "codegen-emitted shim" framing is doing real lifting — worth an explicit M2 sub-task rather than assuming the C-shim route is the final form.

- **The CLI/server version split is a live footgun for every future session.** The host CLI is 1.11.1 (V9); the server and the def layout are 2.0.1/V10. A 1.11.1 `describe`/`generate` against a V10 module silently fails to decode. The extracted `./bin/spacetime-2.0.1` is the only CLI that matches the running server and MUST be used for all publish/describe/call/logs against it. Anyone who reaches for the PATH `spacetime` will get confusing decode errors that look like a module bug but are a CLI-version bug. The `bin/` extraction should be a checked-in script (doc 04 §5's `build-and-publish.sh`) so this is not rediscovered each session.

- **`--gc-sections` dropping the runtime "for free" is the same load-bearing surprise doc 08 flagged, and it will bite at the first runtime-touching reducer.** The spike stays freestanding only because its user function is integer-typed and unreachable from `js_*`. The moment `__call_reducer__` actually decodes args and dispatches, the link will demand the wasm32 `libperry_runtime.a` or fail with `undefined symbol: js_*`. That failure is the *designed* signal (the link refusing to invent a host import), not a regression — but whoever does the dispatch work should expect it on the first try and read it as "link the archive," never "add `--allow-undefined`."

- **Auto-optimize still rebuilds the 57 MB + 81 MB host archives on a spacetimedb build that ignores both** (doc 08 §6 already flagged this). For the spike it is harmless latency. For M2/M4 it is wasted work and, worse, a confusing signal — the build logs say "built libperry_runtime.a (host)" while the spacetimedb target needs the *wasm32* archive. Gating `build_optimized_libs` off for the spacetimedb target (or pointing it at the wasm32 runtime build) is worth doing before the M2 dispatch work, so the logs stop lying about which runtime is in play.

- **No version bump / CHANGELOG entry was made on the fork.** Per the fork's CLAUDE.md the maintainer folds version+changelog at merge time, and this is spike work on a feature branch, not a `main` landing. The commit is code-only on `feat/target-spacetimedb`.
