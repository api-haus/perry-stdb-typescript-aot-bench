# SpacetimeDB native WASM module ABI — the contract Perry output must satisfy

This is the target contract a freestanding `.wasm` must hit to be loadable and callable as a SpacetimeDB **native** module (the same contract Rust/C#/C++ modules hit, distinct from the V8/JS path). Every claim is grounded in code at `file:line` under `/mnt/archive4/DEV/mmodb/_vendor/SpacetimeDB` or in a built/inspected artifact under `/mnt/archive4/DEV/mmodb/_scratch/abi-probe`.

The repo is at HEAD `spacetimedb-lib 2.3.0`, ABI major version **10**, host-implemented minor **10.5** (`crates/core/src/host/wasmtime/wasmtime_module.rs:58`, `crates/lib/src/lib.rs:51`). The local CLI is `1.11.1`; see the version caveat in section (vi).

## Empirical anchors

Two real Rust modules were built to `wasm32-unknown-unknown` against the vendored `spacetimedb` bindings crate (path dep on `crates/bindings`, which is `2.3.0`), then inspected with `wasm-tools 1.220.0` and a custom wasmtime-39 harness that runs `__describe_module__` and captures the bytes written to the description sink.

- `minimal-mod` — one reducer `noop(ctx)`, no table. Artifact: `_scratch/abi-probe/minimal-mod/target/wasm32-unknown-unknown/release/minimal_mod.wasm`. Module def = **34 bytes**, fully decoded below.
- `rust-mod` — reducers `add(ctx, id: u64, n: u64)` (CPU-bound loop) and `log_it(ctx, msg: String)`, plus a `counter` table with a primary key. Artifact: `_scratch/abi-probe/rust-mod/target/wasm32-unknown-unknown/release/abi_probe_module.wasm`. Module def = **247 bytes**.

The dump harness is `_scratch/abi-probe/dumpdef` (wasmtime 39, stubs the 7 imports, runs preinits in alphabetical order, calls `__describe_module__(1)`, captures the sink). The decoder is `_scratch/abi-probe/decode.py`.

## (i) Required exports — exact WASM signatures

The host's `FuncNames::check_required` (`crates/core/src/host/wasm_common.rs:234`) rejects the module at load time unless ALL of the following are present and exactly typed. Signatures are validated structurally against `StaticFuncSig` constants in the same file; a mismatch is a hard `ValidationError` (`wasm_common.rs:170`).

| Export | WASM signature | Constant | Required? |
|---|---|---|---|
| `memory` | a `memory` export named exactly `"memory"` | `check_required` line 239-241; `Mem::extract` `wasmtime/mod.rs:298` | **Yes** |
| `__call_reducer__` | `(param i32 i64 i64 i64 i64 i64 i64 i64 i32 i32) (result i32)` | `CALL_REDUCER_SIG` `wasm_common.rs:146` | **Yes** |
| `__describe_module__` | `(param i32) (result )` — one i32 param, no result | `DESCRIBE_MODULE_SIG` `wasm_common.rs:145` | **Yes** |

The i32 `__call_reducer__` parameters are: reducer id; sender identity as 4×i64 (little-endian `[u8;32]` split); connection id as 2×i64 (little-endian `[u8;16]`); timestamp i64 (micros since epoch); args `BytesSource` id (i32); error `BytesSink` id (i32). Result i32 is the `i16` errno widened: `0` = success, `HOST_CALL_FAILURE` (with an error message written to the error sink) = user error. Source-side definition: `crates/bindings/src/rt.rs:1049`; host caller and `CallReducerType` type: `wasmtime_module.rs:495`.

The single i32 param of `__describe_module__` is the description `BytesSink` id; the module writes a BSATN `RawModuleDef` to it. Source: `rt.rs:991`; host caller `extract_descriptions` `wasmtime_module.rs:586`.

Optional exports (looked up, used only if present — absence is fine):
- `__setup__` `(param i32) (result i32)` — `INIT_SIG` `wasm_common.rs:144`; run once after preinits, may write an error to its sink. `wasmtime_module.rs:379`.
- `__preinit__*` `(param) (result)` — zero functions named with this prefix, run in sorted order before `__setup__`. Validated in `update_from_general` `wasm_common.rs:228`; collected and sorted `module_host_actor.rs:382-384`; called `wasmtime_module.rs:369`.
- `__call_view__` `(i32, i64×4, i32, i32) -> i32`, `__call_view_anon__` `(i32, i32, i32) -> i32`, `__call_procedure__` (same shape as `__call_reducer__`), `__call_http_handler__` `(i32, i64, i32, i32, i32, i32) -> i32` — `wasmtime_module.rs:522/543/556`. Only needed if the module declares views/procedures/HTTP handlers.

The real Rust module additionally exports `__data_end` and `__heap_base` globals — these are LLVM/`wasm-ld` artifacts, ignored by the host. Extra exports are tolerated.

## (ii) Imports the module may use — exact WASM signatures, grouped by namespace

The host links exactly the functions in the `abi_funcs!` macro (`crates/core/src/host/wasm_common.rs:405-453`), via `Linker::func_wrap` per entry (`wasmtime_module.rs:81-110`). Key facts about the import contract:

- **The module need not import all of them.** A module imports only the subset it calls; the others stay defined-but-unused in the linker. The minimal module imports just 5; the table module imports 7.
- **Unknown imports are rejected.** wasmtime's `Linker::instantiate` fails if the module imports any function the linker did not define. The linker defines ONLY the `spacetime_X.Y` functions below — there is **no WASI, no `env`, no other namespace**. Any import outside this set is a hard instantiation failure (`module_host_actor.rs:387-389`). This is the single most load-bearing constraint for Perry: its WASM backend must emit imports under these exact module/field names and no others (no implicit WASI `fd_write`, no `env.memcpy`, etc.), or supply those itself in-module.
- **ABI version is detected from the imports.** `determine_spacetime_abi` (`abi.rs:5`) scans func imports, strips the `spacetime_` prefix, parses `major.minor`, and takes the max minor within one major. The module MUST import at least one `spacetime_10.Y` function or detection fails with `NotDetected` (`abi.rs:55`). Then `verify_supported` requires `host(10.5) >= module` (`abi.rs:34`, host value `wasmtime_module.rs:58`). Mixing two majors is rejected (`abi.rs:27`).

On `wasm32`, every Rust `*const u8` / `*mut u8` / `usize` lowers to a WASM `i32`; `u16`/`i16`/`u32`/`i32` returns lower to `i32`; only the few `u64`/`i64` params stay `i64`. The signatures below are the actual lowered WASM types, taken from the type table of the built artifact (`wasm-tools print`) cross-checked against the Rust `extern "C"` declarations in `crates/bindings-sys/src/lib.rs`.

### `spacetime_10.0` (core ABI — `bindings-sys/src/lib.rs:21`)
| Function | WASM signature | Rust decl |
|---|---|---|
| `table_id_from_name` | `(i32 name_ptr, i32 name_len, i32 out) -> i32` | `:41` |
| `index_id_from_name` | `(i32, i32, i32) -> i32` | `:72` |
| `datastore_table_row_count` | `(i32 table_id, i32 out) -> i32` | `:87` |
| `datastore_table_scan_bsatn` | `(i32 table_id, i32 out_rowiter) -> i32` | `:104` |
| `datastore_index_scan_range_bsatn` | `(i32, i32, i32, i32, i32, i32, i32, i32, i32) -> i32` | `:169` |
| `datastore_delete_by_index_scan_range_bsatn` | `(i32×8, i32 out) -> i32` | `:233` |
| `datastore_delete_all_by_eq_bsatn` | `(i32 table_id, i32 rel_ptr, i32 rel_len, i32 out) -> i32` | `:286` |
| `row_iter_bsatn_advance` | `(i32 iter, i32 buf_ptr, i32 buf_len_ptr) -> i32` | `:323` (returns `i16`) |
| `row_iter_bsatn_close` | `(i32 iter) -> i32` | `:335` |
| `datastore_insert_bsatn` | `(i32 table_id, i32 row_ptr, i32 row_len_ptr) -> i32` | `:370` |
| `datastore_update_bsatn` | `(i32 table_id, i32 index_id, i32 row_ptr, i32 row_len_ptr) -> i32` | `:413` |
| `bytes_sink_write` | `(i32 sink, i32 buf_ptr, i32 buf_len_ptr) -> i32` | `:455` |
| `bytes_source_read` | `(i32 source, i32 buf_ptr, i32 buf_len_ptr) -> i32` | `:520` (returns `i16`) |
| `console_log` | `(i32 level, i32 target_ptr, i32 target_len, i32 file_ptr, i32 file_len, i32 line, i32 msg_ptr, i32 msg_len)` no result | `:543` |
| `console_timer_start` | `(i32 name_ptr, i32 name_len) -> i32` | `:565` |
| `console_timer_end` | `(i32 timer_id) -> i32` | `:581` |
| `identity` | `(i32 out_ptr)` no result | `:590` |
| `volatile_nonatomic_schedule_immediate` | `(i32, i32, i32, i32)` no result | `:430` (unstable) |

### `spacetime_10.1` (`:594`)
| `bytes_source_remaining_length` | `(i32 source, i32 out) -> i32` | `:619` (returns `i16`) |

### `spacetime_10.2` (`:623`)
| `get_jwt` | `(i32 connection_id_ptr, i32 out_source) -> i32` | `:644` |

### `spacetime_10.3` (procedures, async — `:648`)
`procedure_start_mut_tx (i32 out)->i32`, `procedure_commit_mut_tx ()->i32`, `procedure_abort_mut_tx ()->i32` (sync); `procedure_sleep_until (i64)->i64` and `procedure_http_request (i32,i32,i32,i32,i32)->i32` are async-only — on the main reducer lane they are linked as sync stubs that trap if called (`wasmtime_module.rs:112-142`). Not needed for a CPU-bound reducer benchmark.

### `spacetime_10.4` (`:788`)
`datastore_index_scan_point_bsatn (i32 index_id, i32 point_ptr, i32 point_len, i32 out)->i32` (`:829`); `datastore_delete_by_index_scan_point_bsatn` same shape (`:860`).

### `spacetime_10.5` (`:868`)
`datastore_clear (i32 table_id, i32 out)->i32` (`:885`).

### Minimal subset for the named tasks
- register/describe a module: export `__describe_module__` + write to the sink via `bytes_sink_write`.
- call a reducer: export `__call_reducer__`; read args via `bytes_source_read` (+ `bytes_source_remaining_length` to size the buffer), write any error string via `bytes_sink_write`.
- `console_log`: `spacetime_10.0::console_log`.
- table id: `spacetime_10.0::table_id_from_name`.
- insert (bsatn): `spacetime_10.0::datastore_insert_bsatn`.
- row iter: `datastore_table_scan_bsatn` → `row_iter_bsatn_advance` → `row_iter_bsatn_close`.

A purely CPU-bound reducer that never touches the datastore needs only `__describe_module__`, `__call_reducer__`, `memory`, `bytes_sink_write`, and at least one `spacetime_10.Y` import for ABI detection (`bytes_source_read`/`bytes_source_remaining_length` are the natural ones, used to read args).

## The BytesSink / BytesSource protocol

Both are opaque `u32` host-side handle ids passed in as i32. The module never sees the bytes directly; it pulls/pushes through the two syscalls. Reference implementations: `read_bytes_source_into` and `write_to_sink` in `crates/bindings/src/rt.rs:1338` and `:1392`.

**Reading reducer args (BytesSource).** `bytes_source_read(source, buf_ptr, buf_len_ptr)` reads up to `*buf_len_ptr` bytes from the host buffer into WASM memory at `buf_ptr`, sets `*buf_len_ptr` to the count actually written, and returns `0` while bytes remain or `-1` when the source is exhausted (and then destroyed). `bytes_source_remaining_length(source, out)` writes the remaining length so the module can size its buffer in one shot. Special value: `source == 0` (`BytesSource::INVALID`) means empty args — do not call read (`rt.rs:1307`, `bindings-sys/src/lib.rs:924`).

**Returning the module def / errors (BytesSink).** `bytes_sink_write(sink, buf_ptr, buf_len_ptr)` writes up to `*buf_len_ptr` bytes from `buf_ptr` to the host sink, sets `*buf_len_ptr` to bytes accepted, returns `0` on success; the module loops until the slice is drained (`rt.rs:1392`). `__describe_module__` writes the whole BSATN `RawModuleDef` this way (`rt.rs:1013`). `__call_reducer__` writes a UTF-8 error message to the error sink iff it returns `HOST_CALL_FAILURE` (`rt.rs:1104`); on success it writes nothing and returns `0`.

The i16 return convention: the syscalls return `u16`/`i16` (a zero `errno` = success; `-1` = exhausted, for read-style calls). The dunder exports return i32: `__describe_module__` returns nothing, `__call_reducer__` returns `0` (ok) or the `HOST_CALL_FAILURE` errno. The host decodes that code in `handle_result_sink_code` (`wasmtime_module.rs:189`): `0` → bytes are the result, `HOST_CALL_FAILURE` → bytes are a user error string, anything else → "unknown return code".

## (iii) Host loader constraints

From `crates/core/src/host/wasmtime/mod.rs` and `wasmtime_module.rs`, with feature requirements confirmed by `wasm-tools validate` on the artifact.

- **Reactor, not command.** No `_start`, no `main`. The host instantiates and then calls the dunder exports on demand. Confirmed: the built artifact has no `_start` export and no WASI imports.
- **`memory` export required**, named exactly `"memory"` (`Mem::extract` `mod.rs:298`, `check_required` `wasm_common.rs:239`). The host reads/writes module memory directly through this export.
- **No WASI, no extra import namespaces.** The linker (`Linker::new` then only `abi_funcs!` `func_wrap`s; `mod.rs:72-76`, `wasmtime_module.rs:81-108`) defines only `spacetime_10.0..10.5`. There is no `wasi_snapshot_preview1`, no `env`. A module importing anything else fails instantiation. This is the gate Perry's WASM backend must pass: it must not emit a libc/WASI-dependent runtime that imports host functions outside this set.
- **Fuel metering is ON.** `consume_fuel(true)` (`mod.rs:93`). Each reducer call resets the store fuel to the function budget (`prepare_store_for_call` `wasmtime_module.rs:892`, default `120_000_000_000_000` `energy.rs:135`). Fuel is consumed per WASM instruction; a CPU-bound reducer burns fuel proportional to instruction count and **traps if it exhausts the budget**. For benchmarking, this is a real ceiling — a tight loop of billions of iterations can run out. The benchmark should size work under the budget or note that both the V8 path and the WASM path are billed the same energy model. Fuel remaining is read back into `ExecutionStats` (`wasmtime_module.rs:941`), so per-call fuel cost is observable and is itself a clean comparison metric.
- **Epoch interruption is ON** but non-fatal here. `epoch_interruption(true)` (`mod.rs:94`); a 10 ms epoch ticker (`mod.rs:29,37`) increments the engine epoch. The deadline callback only logs "Wasm has been running for …" and resumes (`wasmtime_module.rs:354-363`), so it does not kill a long reducer; it just warns. Deadline is set to `EPOCH_TICKS_PER_SECOND` (1 s) per call.
- **Cranelift at `OptLevel::Speed`** (`mod.rs:92`); optional perfmap profiling behind a `perfmap` cargo feature (`mod.rs:113`). A wasmtime code cache is used if a data dir is given (`mod.rs:116`).
- **Two engines.** A sync engine for reducers/views and an async engine for procedures (`mod.rs:51-55`). A CPU-bound reducer runs on the sync lane via `TypedFunc::call` (`call_sync_typed_func` `wasmtime_module.rs:223`).
- **WASM feature set.** The artifact validates under `mvp,mutable-global,sign-extension,multi-value,reference-types,bulk-memory`. The host uses wasmtime 39 defaults (no features explicitly disabled in `wasmtime_config`), so SIMD/multi-value/reference-types/bulk-memory are all accepted. Perry output using any of those is fine; it must export a single linear `memory`.

## (iv) Minimal ModuleDef BSATN layout (hand-emittable)

The module writes a BSATN-encoded `RawModuleDef` to the describe sink (`rt.rs:1000` wraps it as `RawModuleDef::V10`). BSATN rules, from `crates/sats/src/bsatn/ser.rs`:
- integers/floats: little-endian, native width (`ser.rs:78-133`).
- `bool`: 1 byte (`ser.rs:74`).
- sum/enum variant: 1-byte `u8` tag, then the variant payload (`ser.rs:153`).
- product/struct: fields concatenated in declared order, no length prefix (`ser.rs:146`).
- `Vec`/array and `String`/bytes: `u32` LE length prefix, then elements/bytes (`ser.rs:137,142`).
- `Option<T>`: it is a sum — **`Some` = tag `0` then the value, `None` = tag `1`** (`ser/impls.rs:116`). (Counterintuitive; do not assume None=0.)

Relevant tag tables:
- `RawModuleDef`: `V8BackCompat = 0`, `V9 = 1`, `V10 = 2` (`crates/lib/src/lib.rs:165`). Emit **`2`**.
- `RawModuleDefV10` = product `{ sections: Vec<RawModuleDefV10Section> }` (`v10.rs:37`). Sections may appear in any order and are optional.
- `RawModuleDefV10Section` tags, in declaration order (`v10.rs:51`): `Typespace=0, Types=1, Tables=2, Reducers=3, Procedures=4, Views=5, Schedules=6, LifeCycleReducers=7, RowLevelSecurity=8, CaseConversionPolicy=9, ExplicitNames=10, HttpHandlers=11, HttpRoutes=12`.
- `RawReducerDefV10` = product `{ source_name: str, params: ProductType, visibility: FunctionVisibility, ok_return_type: AlgebraicType, err_return_type: AlgebraicType }` (`v10.rs:301`). `FunctionVisibility`: `Private=0, ClientCallable=1` (`v10.rs:323`). `ProductType` = `Vec<ProductTypeElement>`, each element = `{ name: Option<str>, algebraic_type: AlgebraicType }`.
- `AlgebraicType` tags (`crates/sats/src/algebraic_type.rs:24`): `Ref=0, Sum=1, Product=2, Array=3, String=4, Bool=5, I8=6, U8=7, I16=8, U16=9, I32=10, U32=11, I64=12, U64=13, I128=14, U128=15, I256=16, U256=17, F32=18, F64=19`. The unit type is `Product` with 0 elements (`02 00000000`).

**Verified gold layout — the 34-byte `minimal_mod` def** (one reducer `noop(ctx)`, no args, no table). Every byte accounted for by `decode.py`:

```
02                          RawModuleDef::V10                 (sum tag 2)
02 00 00 00                 sections: Vec, len = 2
  03                        section[0] = Reducers             (sum tag 3)
  01 00 00 00               Vec<RawReducerDefV10>, len = 1
    04 00 00 00 6e6f6f70     source_name = "noop"             (str len 4)
    00 00 00 00              params = ProductType, 0 elements
    01                       visibility = ClientCallable
    02 00 00 00 00           ok_return_type = Product{} (unit) (tag 2, 0 elems)
    04                       err_return_type = String          (tag 4)
  0a                        section[1] = ExplicitNames        (sum tag 10)
  00 00 00 00               entries: Vec, len = 0
```

That is the smallest module def the host accepts: it registers exactly one client-callable reducer `noop` taking no args, returning `Result<(), String>`. To hand-emit a reducer with args, expand `params`: e.g. one `u64` arg named `n` is `01000000` (1 elem) + `00` (name Some) + `01000000 6e` ("n") + `0d` (U64). The reducer id passed to `__call_reducer__` is the index into the `Reducers` section vector (id 0 = first reducer).

A table additionally needs a `Typespace` section (tag 0) holding the row `Product` type, a `Tables` section (tag 2) with a `RawTableDefV10` referencing it by `AlgebraicTypeRef`, and a `Types` section (tag 1) naming it for codegen. The `rust-mod` 247-byte dump (reducers section fully decoded, table/typespace present) is the worked example; raw hex is in section (v). For the PoC's CPU-bound benchmark, **no table is required** — a reducer-only module def suffices, and is the recommended minimal target.

## (v) Real-Rust-module WASM dump (reference target)

### `minimal_mod.wasm` — one reducer, no table

Imports (5):
```
spacetime_10.0  bytes_source_read              (i32 i32 i32) -> i32
spacetime_10.0  bytes_sink_write               (i32 i32 i32) -> i32
spacetime_10.0  console_log                    (i32×8)
spacetime_10.1  bytes_source_remaining_length  (i32 i32) -> i32
spacetime_10.2  get_jwt                        (i32 i32) -> i32
```
Exports:
```
memory                                   (memory 0)
__call_reducer__                         (i32 i64 i64 i64 i64 i64 i64 i64 i32 i32) -> i32
__describe_module__                      (i32)
__call_view__                            (i32 i64 i64 i64 i64 i32 i32) -> i32
__call_view_anon__                       (i32 i32 i32) -> i32
__describe_module__                      (i32)
__preinit__00_panic_hook                 ()
__preinit__15_init_log                   ()
__preinit__20_register_describer_noop    ()
__data_end / __heap_base                 (global)  -- linker artifacts, ignored
```
Module def BSATN (34 bytes): `02020000000301000000040000006e6f6f7000000000010200000000040a00000000`

### `abi_probe_module.wasm` — two reducers + one table

Imports (7): the five above plus `spacetime_10.0::table_id_from_name (i32 i32 i32)->i32` and `spacetime_10.0::datastore_insert_bsatn (i32 i32 i32)->i32` (pulled in by the table insert). Exports add `__preinit__20_register_describer_{add,counter,log_it}`.

Module def BSATN (247 bytes):
```
020500000003020000000300000061646402000000000200000069640d00010000006e0d
01020000000004060000006c6f675f69740100000000030000006d736704010200000000
040a010000000007000000636f756e74657207000000636f756e746572000100000002 02
000000000200000069640d000500000076616c75650d010101000000000000000700000043
6f756e7465720000000001020100000007000000636f756e7465720000000001000000000
0010000000014000000636f756e7465725f69645f6964785f627472656500020000006964
000100000000000100000001000100000000000000000001000000000000
```
Decoded `Reducers` section (verified): reducer[0] `add(id: U64, n: U64) -> Result<(), String>` ClientCallable; reducer[1] `log_it(msg: String) -> Result<(), String>` ClientCallable. The remaining sections present are `ExplicitNames`, `Types`, `LifeCycleReducers`, `Tables`, and `Typespace` (the `counter` product type `{id: U64, value: U64}` and its index `counter_id_idx_btree`). The exact byte boundaries of the table/typespace sections were not all hand-verified (the decoder confirmed the reducer and minimal-module sections end-to-end); the 34-byte minimal def above is the fully-verified hand-emit target.

## Checklist for a Perry shim author

1. Emit a **reactor** WASM (no `_start`), exporting a single linear `memory` under the name `"memory"`.
2. Export `__describe_module__` as `(param i32) (result )` and `__call_reducer__` as `(param i32 i64 i64 i64 i64 i64 i64 i64 i32 i32) (result i32)` — the seven i64s are sender[0..3], conn_id[0..1], timestamp; the trailing two i32s are the args source id and the error sink id (see section (i)).
3. Import host functions **only** from `spacetime_10.0..10.5` with the exact field names and signatures in section (ii). Emit at least one `spacetime_10.Y` import so ABI detection succeeds. Do **not** emit WASI or any other import namespace; if Perry's runtime needs libc-like services, satisfy them in-module (bundled), never as host imports.
4. In `__describe_module__`, build the BSATN `RawModuleDef::V10` bytes (section iv) and push them to the sink id (the i32 param) via `bytes_sink_write` until drained.
5. In `__call_reducer__`, if the args `BytesSource` (9th param) is non-zero, pull args via `bytes_source_read` (optionally sized by `bytes_source_remaining_length`); decode BSATN per the reducer's `params` `ProductType`; run the reducer; return `0`, or write a UTF-8 message to the error `BytesSink` (10th param) and return `HOST_CALL_FAILURE`.
6. Stay within wasmtime defaults: linear memory only, no threads needed; SIMD/bulk-memory/reference-types are permitted. Mind the per-call **fuel budget** for CPU-bound work.
7. Build/publish against the **server version you run** (see caveat below), not necessarily 2.3.0.

## (vi) Version caveats

- The vendored repo and the `crates/bindings` used for the empirical anchors are **2.3.0**, emitting `RawModuleDef::V10` and importing up to `spacetime_10.5`. ABI major is 10.
- The local CLI is **1.11.1**. A 1.11.1 server implements an older host ABI and decodes `RawModuleDef::V9` (or `V8BackCompat`), NOT V10 — a 2.3.0-built module will not load on a 1.11.1 server, and `spacetime generate`/`describe` from 1.11.1 against a 2.3.0-built wasm will fail to decode the def. The PoC must pin the server image and a matching CLI/bindings version. If targeting the 1.11.x line, the section tags, the `RawModuleDef` variant (`V9 = 1`), and the reducer-def shape differ from V10 documented here — re-derive against `crates/lib/src/db/raw_def/v9.rs` at the matching tag. If targeting 2.0+/2.3.0 (what this doc covers), the V10 layout above applies. Either way, **the import namespaces and the two required dunder export signatures are stable across 10.x** and are the durable part of the contract.
- The `dumpdef` harness used wasmtime 39 (the repo's pinned version) and successfully instantiated + described both modules outside the SpacetimeDB host, which independently confirms the import/export contract is satisfiable by a bare wasmtime `Linker` with these 7 stubs.

## Side notes / observations / complaints

- The "minimal subset for ABI detection" has a sharp edge: a module that imports **zero** `spacetime_*` functions is rejected with `NotDetected`, even if it correctly exports the two dunders. A pure-compute reducer that never reads args could in principle avoid all imports — so the shim must deliberately import at least one (e.g. `bytes_source_read`) purely to advertise its ABI version. Worth a code comment in the shim.
- `Option` encoding is `Some=0 / None=1`, the reverse of the intuitive guess and the reverse of Rust discriminant order. This bit me while decoding (first pass mis-decoded the whole def). Any hand-emitter or hand-decoder will trip on it; flag it loudly.
- The host does NOT reject extra exports or extra unused linked imports; it only enforces the required set and signatures, the single-major rule, and "no undefined imports." So Perry can over-export freely (its own helpers, `__data_end`-style globals) without trouble.
- Fuel is the one runtime knob that could distort a benchmark: it is on by default, billed per instruction, reset per call. A fair V8-vs-WASM comparison should either disable fuel for the bench build or compare the fuel/energy stat directly rather than wall-clock alone, because the V8 path is metered by a different mechanism. Decompose before trusting wall-clock.
- `spacetime init --lang rust` needs a TTY and errored under the non-interactive harness ("not a terminal"); I hand-wrote the crate with a path dep on `crates/bindings` instead, which is actually a cleaner anchor (no network, exact vendored bindings). The macro API changed at 2.x: `#[table(name = ...)]` now wants a string literal and a separate `accessor =` identifier; the old `name = ident` form errors with a migration hint. A Perry TS module mirroring the official TS authoring API (`table({name:'counter'}, {...})`) maps to this V10 shape, but the TS path normally compiles to JS-on-V8 — the whole point of the experiment is to bypass that and hit this native ABI directly.
- Decoding the full 247-byte table def by hand is genuinely fiddly (ColList, index-algorithm enums, default-values, constraints all have their own shapes). I verified the reducer-only path completely and recommend the PoC use a **reducer-only** module def for the benchmark; tables add encoding surface with no benefit to a CPU-bound comparison.
