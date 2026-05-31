# 03 — Official TypeScript module baseline (the control arm)

This documents the official TypeScript-on-V8 module path end-to-end: how a TS module registers tables and reducers and how those are dispatched on V8, how the CLI bundles and publishes the module, how the host loads the bundle into a V8 isolate, a minimal working module that was actually built and published against a SpacetimeDB v2.0.1 server, a validated per-reducer timing method, and the version strategy. Every load-bearing claim is anchored to a `file:line` under `_vendor/SpacetimeDB` or to an artifact built during this investigation.

The headline fact, already in `00-context.md`, is reconfirmed here against running code: an official TS module is **plain JavaScript executed in an embedded V8 isolate**, not WASM. The "ABI" between the module and the host is a set of ES-module imports (`spacetime:sys@2.0`) and a default-exported schema object, resolved entirely inside V8 — there is no WASM import namespace, no `__describe_module__`/`__call_reducer__` WASM export, and no Wasmtime in the loop for this path.

## (i) How a TS module registers and dispatches on V8

### The authoring surface and what it builds

`spacetimedb/server` (`crates/bindings-typescript/src/server/index.ts:1`) re-exports the `schema`, `table`, and `t` builders. The user calls `schema({ table1, table2, ... })` (`schema.ts:615`), which constructs a `SchemaInner` (`schema.ts:57`) — the live registry holding `moduleDef`, `reducers: Reducer[]`, `views`, `procedures`, `httpHandlers`, and the typespace. Each `spacetimedb.reducer(params, fn)` call (`schema.ts:252`) does not register anything immediately; it returns a `ReducerExport` callable carrying two symbol-keyed hooks, `[exportContext]` and `[registerExport]` (`reducers.ts:34`). Registration is deferred until the host asks for it.

### `spacetime:sys@2.0` is an ES module, not a WASM import

`sys.d.ts:1` declares `declare module 'spacetime:sys@2.0'`. This is the single channel through which JS reaches host capabilities. It declares two kinds of members:

- **Free functions** the JS runtime calls into: `table_id_from_name`, `datastore_insert_bsatn`, `datastore_table_scan_bsatn`, `datastore_index_scan_point_bsatn`, `row_iter_bsatn_advance`, `console_log`, `console_timer_start`/`end`, `identity`, `get_jwt_payload`, `procedure_start_mut_tx`/`commit`/`abort`, etc. (`sys.d.ts:51-120`). `runtime.ts:62` merges the `@2.0` and `@2.1` namespaces into a single `sys` object that the rest of the runtime calls (e.g. `sys.datastore_insert_bsatn(...)` at `runtime.ts:634`, `sys.table_id_from_name(...)` at `runtime.ts:566`).
- **The hook contract** in the other direction: `register_hooks(hooks: ModuleHooks)` (`sys.d.ts:49`) and the `ModuleHooks` interface (`sys.d.ts:15`) whose members `__describe_module__`, `__call_reducer__`, `__call_view__`, `__call_procedure__`, `__call_http_handler__` are the V8-side equivalents of the WASM module exports. The default-exported schema object carries these behind the `moduleHooks` symbol (`sys.d.ts:9`).

These host functions are **synchronous, BSATN-bytes-in/handle-out** calls. The data crossing the boundary is BSATN-serialized `ArrayBuffer`s plus integer handles (table ids, iterator ids), never JS objects — the same wire format the WASM modules use. That serialization is implemented in JS via `BinaryWriter`/`BinaryReader` (`runtime.ts:21`) feeding `AlgebraicType.makeSerializer`/`makeDeserializer` (`runtime.ts:572`).

### Producing the module definition from the schema object

The host obtains the `ModuleDef` by invoking the schema's `[moduleHooks]` method (`schema.ts:187`). That method walks every named export of the user's module (`Object.entries(exports)`), checks each is a `ModuleExport`, and calls its `[registerExport](registeredSchema, name)` (`schema.ts:200`). For a reducer, `registerExport` runs `registerReducer` (`reducers.ts:55`), which: registers the params as an `AlgebraicType` in the typespace (`reducers.ts:73`), pushes a reducer record onto `ctx.moduleDef.reducers` with `sourceName = exportName`, `params`, fixed `okReturnType = Product([])` and `errReturnType = String` (`reducers.ts:77-85`), and appends the JS function to `ctx.reducers` (`reducers.ts:110`). **The reducer's index in `ctx.reducers` is its `reducerId`** — this positional correspondence is the entire dispatch table. After all exports register, `resolveSchedules`/`resolveHttpRoutes` run and `makeHooks(schema)` returns a `ModuleHooksImpl` (`schema.ts:202-204`).

`ModuleHooksImpl.__describe_module__()` (`runtime.ts:377`) serializes `RawModuleDef.V10(schema.rawModuleDefV10())` with a `BinaryWriter` and returns the BSATN bytes. This is the exact byte payload a WASM module would write into the `__describe_module__` `BytesSink`; here it is just a `Uint8Array` return value.

### Reducer dispatch — the V8-side `__call_reducer__`

`ModuleHooksImpl.__call_reducer__(reducerId, sender, connId, timestamp, argsBuf)` (`runtime.ts:394`) is the dispatch core:

1. `deserializeArgs = this.#reducerArgsDeserializers[reducerId]` — per-reducer arg deserializers are precomputed once in the constructor from `schema.moduleDef.reducers.map(({params}) => ProductType.makeDeserializer(...))` (`runtime.ts:352`).
2. Reset a shared `BINARY_READER` over `argsBuf` and deserialize the args (`runtime.ts:403`).
3. Reset a cached, reused `ReducerCtx` object (avoids per-call allocation) with the sender Identity, Timestamp, and ConnectionId (`runtime.ts:407`).
4. `callUserFunction(moduleCtx.reducers[reducerId], ctx, args)` (`runtime.ts:413`) — index straight into the reducers array and call the user function. `callUserFunction` is a thin named wrapper (`runtime.ts:301`) whose only purpose is to give the host a stack-frame marker so `crates/core/src/host/v8/error.rs` can truncate backtraces.

The `ctx.db` view is lazily built once (`runtime.ts:357`) by `makeTableView` (`runtime.ts:562`), which resolves each table's `table_id` via `sys.table_id_from_name` and wires `insert`/`delete`/`iter`/index accessors to the corresponding `sys.datastore_*` calls.

### How the host bridges to all of this (Rust side, `crates/core`)

- **Bundle is loaded as an ES module.** `eval_user_module` (`crates/core/src/host/v8/mod.rs:1819`) compiles the bundle string as a V8 module via `eval_module` → `compile_module` → `module.instantiate_module(scope, resolve_sys_module)` → `module.evaluate` (`mod.rs:1787-1796`), then returns the module namespace object (its exports).
- **`spacetime:sys@N.M` imports are resolved by a host callback**, not from disk. `resolve_sys_module` (`crates/core/src/host/v8/syscall/mod.rs:30`) intercepts every `import` specifier, strips `spacetime:`, parses the `@major.minor` version, and returns a synthetic V8 module: `(2,0) => v2::sys_v2_0(scope)`, `(2,1) => v2::sys_v2_1(scope)` (`syscall/mod.rs:63-64`). Those synthetic modules expose the free functions backed by Rust syscalls in `syscall/v2.rs`.
- **Hooks are pulled from the default export.** `startup_instance_worker` (`mod.rs:1185`) calls `eval_user_module` then `get_hooks` (`syscall/mod.rs:124`). For a v2 module `get_hooks_from_default_export` (`syscall/v2.rs:379`) reads the `SpacetimeDB.moduleHooks.v2` symbol off the default export (`syscall/v2.rs:436`), **calls it** with the exports object as argument (`syscall/v2.rs:395` — this is the JS-side `[moduleHooks](exports)` that triggers all `registerExport` calls), and caches the returned `__describe_module__`, `__call_reducer__`, `__call_view__`, etc. as `Local<Function>` handles in a `HookFunctions` struct (`syscall/v2.rs:420-432`).
- **Reducer execution.** `V8Instance::call_reducer` (`mod.rs:1875`) wraps `call_call_reducer` in `common_call`. `common_call` (`mod.rs:1943`) opens a fresh `HandleScope` and `TryCatch`, starts the timer with `env.start_funcall(...)` (`mod.rs:1986`), runs the call, then `env.finish_funcall()` yields `timings.total_duration` (`mod.rs:2034`). `v2::call_call_reducer` (`syscall/v2.rs:441`) serializes `reducer_id`, `sender` (u256), `conn_id` (u128), `timestamp`, and the reducer-args ArrayBuffer to JS values and calls the cached `__call_reducer__` function (`syscall/v2.rs:464`). A non-`undefined` return is an error (reducers must return void, `syscall/v2.rs:467`). A thrown `SenderError` becomes `ExecutionError::User` (`syscall/v2.rs:473`).
- **`HostType::Js` routing.** `host_controller.rs:728` dispatches a `Js`-tagged program to `runtimes.v8.make_actor(...)`; `Wasm` programs go to `runtimes.wasmtime.make_actor(...)` (`host_controller.rs:718`). The two paths are fully separate runtimes inside the same host.

## (ii) The build/publish pipeline (rolldown → JS → V8)

### Language detection

`detect_module_language` (`crates/cli/src/util.rs:250`) picks the language by sentinel file: `Cargo.toml` → Rust, `*.csproj` → C#, **`package.json` → Javascript** (`util.rs:270`), `CMakeLists.txt` → C++. A TS module is therefore identified purely by the presence of `package.json`; there is no `spacetime.toml` requirement for the module itself.

### The build (`build_javascript`, `crates/cli/src/tasks/javascript.rs:44`)

1. **Type-check.** If `node_modules/.bin/tsc` exists, run `tsc --noEmit` (`javascript.rs:52`). This is the only step that shells out to Node; it is type-checking only and emits nothing. If `tsc` is missing it prints a warning and continues.
2. **Bundle with rolldown.** A `Bundler` is configured (`javascript.rs:73`) with: `input: ["./src/index.ts"]` (fixed entry, `javascript.rs:74`); `file: "./dist/bundle.js"` (single fixed output, `javascript.rs:91`); `format: Esm` (`javascript.rs:92`); `external: Regex("spacetime:sys.*")` so the `spacetime:sys@*` imports are left in the output unbundled (`javascript.rs:79`); `platform: Browser` to avoid Node polyfill injection (`javascript.rs:81`); `minify: false` (`javascript.rs:147`); `sourcemap: Inline` (`javascript.rs:76`); TypeScript transform with `only_remove_type_imports` (`javascript.rs:192`). `preserve_modules: false` + a single `file` give exactly one output chunk.
3. **Post-bundle validation.** It finds the single entry chunk named `bundle.js` (`javascript.rs:262`), scans `output_chunk.imports` for `spacetime:sys@maj.min` specifiers (`javascript.rs:267`), ensures the module imports exactly one major version (`javascript.rs:274`) and at least one (else "your module doesn't import the `spacetimedb/server` package at all", `javascript.rs:280`), and for `maj == 2` asserts the bundle has a `default` export (`javascript.rs:287` — "you haven't exported your schema. You must `export default schema(...)`").
4. Returns `project_path/dist/bundle.js` (`javascript.rs:293`).

`tasks::mod.rs:26` calls `build_javascript`; `mod.rs:30` tags the result host type `"Js"` (and crucially **skips the `wasm-opt` pass** that release WASM builds get at `mod.rs:39`).

### The publish

`publish.rs:544-549` selects `(path_to_program, host_type)`: a `--js-file` flag publishes a prebuilt bundle directly as `"Js"`, otherwise the build above runs. `program_bytes = fs::read(path_to_program)` (`publish.rs:569`) reads the bundle as raw bytes and `builder.body(program_bytes)` (`publish.rs:639`) PUT/POSTs them to `/v1/database/<name>?host_type=Js` (`publish.rs:637`). **The bundle's JS source text is the program** — there is no compilation to bytecode client-side; V8 compiles it on the server at module-load time (`eval_user_module`).

So the full chain is: `src/index.ts` → `tsc --noEmit` (check) → rolldown single ESM chunk `dist/bundle.js` → HTTP body with `host_type=Js` → host stores it → on instantiation V8 compiles+evaluates the bundle, resolves `spacetime:sys@2.0` to host syscall modules, calls the default export's `[moduleHooks]` to register reducers and extract `__call_reducer__`.

## (iii) A minimal working module + project layout (built and published)

Built at `/mnt/archive4/DEV/mmodb/_scratch/ts-baseline/perry-baseline/`. The build succeeded ("Build finished successfully.") and `dist/bundle.js` (690537 bytes, single chunk) was published to a running v2.0.1 server as database `perrybase` (identity `c200997176d137a85dc56afd3b11339624dd54268b5636f94c1a381ecd6a7840`).

### Layout (exactly what the CLI expects)

```
perry-baseline/
  package.json        # presence => Javascript module; depends on spacetimedb@2.0.1 + devDep typescript
  tsconfig.json       # noEmit; ESNext target/module; bundler resolution (copied from modules/benchmarks-ts)
  src/index.ts        # entry — fixed name required by build_javascript (input: ./src/index.ts)
  node_modules/       # npm install: provides .bin/tsc and the spacetimedb runtime to bundle in
  dist/bundle.js      # produced by `spacetime build` (do not hand-edit)
```

No `spacetime.toml` is needed for a single-module project; `publish -p <dir> <name>` is sufficient.

### `package.json`

```json
{
  "name": "perry-baseline",
  "version": "1.0.0",
  "type": "module",
  "license": "ISC",
  "dependencies": { "spacetimedb": "2.0.1" },
  "devDependencies": { "typescript": "^5.6.0" }
}
```

Pin `spacetimedb` to the server version (2.0.1). `typescript` is a real dev-dependency because the build runs `tsc --noEmit`; without it the build prints a warning and skips type-checking but still bundles.

### `tsconfig.json`

Copied verbatim from `modules/benchmarks-ts/tsconfig.json` (`target: ESNext`, `module: ESNext`, `moduleResolution: bundler`, `isolatedModules: true`, `noEmit: true`, `lib: ["ES2021","dom"]`). These are the SpacetimeDB-required options.

### `src/index.ts` — one table + one CPU-bound reducer

```typescript
import { schema, table, t } from 'spacetimedb/server';

const result = table(
  { name: 'result', public: true },
  { id: t.u32().primaryKey(), iters: t.u32(), checksum: t.u64() }
);

const spacetimedb = schema({ result });
export default spacetimedb;

// Deterministic CPU kernel: xorshift64*-style integer mixing over `iters` rounds.
// No std clock / Math.random / Date — fully deterministic from args.
function mix(seed: bigint, iters: number): bigint {
  let h = seed;
  const MASK = (1n << 64n) - 1n;
  for (let i = 0; i < iters; i++) {
    h ^= (h >> 12n) & MASK;
    h = (h ^ ((h << 25n) & MASK)) & MASK;
    h ^= h >> 27n;
    h = (h * 0x2545f4914f6cdd1dn) & MASK;
  }
  return h;
}

export const burn = spacetimedb.reducer(
  { iters: t.u32() },
  (ctx, { iters }) => {
    const checksum = mix(0x9e3779b97f4a7c15n, iters);
    const existing = ctx.db.result.id.find(0);
    const row = { id: 0, iters, checksum };
    if (existing) ctx.db.result.id.update(row);
    else ctx.db.result.insert(row);
  }
);
```

The persisted `checksum` is the workload's observable side effect; it stops V8 from dead-code-eliminating the loop and lets the harness assert determinism across runs. Verified: `burn(5000000)` produced `checksum = 16560010572856351403`, persisted into the `result` table (read back via `spacetime sql`).

### Bundle facts confirmed by inspection of `dist/bundle.js`

- Exactly one output file in `dist/` (single chunk).
- Exactly two top-level `import` statements, both `from "spacetime:sys@2.0"` (`import * as _syscalls2_0` and `import { moduleHooks }`) — the only externals; everything else (the `spacetimedb/server` runtime, the `headers-polyfill`, etc.) is inlined.
- Tail line: `export { burn, spacetimedb as default };` — the schema is the default export, `burn` is a named export (which is what `[moduleHooks]` iterates to register).
- The `mix` kernel is transpiled to JS with BigInt math intact (`0x9e37...` rendered as `11400714819323198485n`); types stripped; inline base64 sourcemap appended.

## (iv) Concrete reducer-performance measurement method (validated)

The canonical per-call timing channel is the **HTTP reducer-call endpoint response header**, not logs.

- **Endpoint.** `POST /v1/database/<name_or_identity>/call/<reducer>` (`crates/client-api/src/routes/database.rs:1487`), `Authorization: Bearer <token>`, body = JSON array of positional reducer args (e.g. `[2000000]`).
- **Timing header.** On a reducer success the route attaches `TypedHeader(SpacetimeExecutionDurationMicros(result.execution_duration))` and `SpacetimeEnergyUsed(result.energy_used)` (`database.rs:205-206`). The wire header names are `spacetime-execution-duration-micros` and `spacetime-energy-used`.
- **What the duration measures.** `execution_duration` for the V8 path is the `total_duration` captured tightly around the JS call by `env.start_funcall(...)` / `env.finish_funcall()` in `common_call` (`mod.rs:1986`, `mod.rs:2034`). It is host-side wall-clock around the reducer invocation (arg deserialization + user function + DB syscalls), excluding HTTP/connect/disconnect overhead.

**Validated against the running server** (calls to `perrybase.burn`, duration in micros from the header):

| iters | duration (µs) |
|------:|--------------:|
| 100000 | 11170 |
| 2000000 | 230854 (cold) |
| 8000000 | 660442 |

The signal scales monotonically and near-linearly with the workload — clean, real CPU work.

**Repeatability (10× `burn(2000000)`, µs):** `229727 163023 166686 164726 169889 174813 169273 164470 167648 164516`. First call is ~40% slower (V8 JIT warmup on the fresh isolate); steady state ~164-175µs·1e3 with ~6% spread.

**Harness implications:**
- Drive the loop over HTTP and read the `spacetime-execution-duration-micros` header per call; this is server-measured, so it excludes client/network jitter. `spacetime call` (CLI) does not surface the timing to stdout, so HTTP is the method of choice.
- Discard warmup iterations (the first call to a freshly-instantiated isolate JITs the kernel). Report a steady-state distribution (median + spread), not a single number — per negative-space point 5, vary nothing silently and report the distribution.
- `spacetime-energy-used` is always `0` on this build because energy accounting is stubbed (`crates/core/src/host/v8/budget.rs:127` `duration_to_budget → FunctionBudget::ZERO`). Do not use energy as a metric; use the duration header.
- Make the workload deterministic and CPU-bound *inside* the reducer using only `ctx` for any nondeterminism. Std clocks and `Math.random` are unavailable in modules (`Math.random` is actively deleted, `crates/core/src/host/v8/builtins/delete_math_random.js`); deterministic RNG must come from `ctx.random` (`runtime.ts:272`, seeded from `ctx.timestamp` via `makeRandom`, `rng.ts:82`). The `mix` kernel above uses neither — its only input is the `iters` arg — so it is the cleanest CPU probe. For an apples-to-apples Perry comparison, the *same* `mix` kernel must run on both arms.

## (v) Version strategy

- **Local `spacetime` CLI is 1.11.1** (`~/.local/share/spacetime/bin/current` → `1.11.1`). Its `build` has no `--module-path` flag and predates JS-module support — it cannot build a TS module. Do not use it for this PoC.
- **Target server is v2.0.1**, and the matching CLI ships inside the `clockworklabs/spacetime:v2.0.1` Docker image (note the **`v` prefix** — `2.0.1` is *not* a valid tag; `latest` currently resolves to `v2.3.0`). Confirmed tag list pulled from Docker Hub.
- **The Docker image contains no Node** (`node: not found`), so the in-container `spacetime build` fails at the `tsc --noEmit` step with `/usr/bin/env: 'node': No such file or directory`. Running the CLI *inside* the container is therefore not viable for building TS modules.
- **Working strategy (used here):** extract the v2.0.1 CLI binary from the image and run it on the host, where Node v26 is available.
  ```bash
  cid=$(docker create clockworklabs/spacetime:v2.0.1)
  docker cp "$cid":/opt/spacetime/spacetimedb-cli ./bin/spacetime-2.0.1
  docker rm "$cid"
  ./bin/spacetime-2.0.1 --version   # => spacetimedb tool version 2.0.1
  ```
  The binary is a dynamically-linked glibc ELF and runs natively on the host (CachyOS/glibc). Build with `./bin/spacetime-2.0.1 build`; publish with `./bin/spacetime-2.0.1 publish --server <local> -p . <name> -y`.
- **Run the server from the image:** `docker run -d --name <c> -p <hostport>:3000 clockworklabs/spacetime:v2.0.1 start`. Pin the `v2.0.1` tag in docker-compose.
- **npm package `spacetimedb@2.0.1`** is published and contains the `./server` entrypoint (`dist/server/index.mjs`) but **no CLI binary** — so the module's `node_modules` come from npm, but the build tool comes from the image. Pin `spacetimedb` in `package.json` to the server version to keep `__describe_module__` BSATN and the syscall ABI in lockstep with the host.
- **Auth gotcha:** a stale `spacetimedb_token` in `~/.config/spacetime/cli.toml` signed by a different server fails pre-publish with `401 InvalidSignature`. Fix with `spacetime logout` then `spacetime login --server-issued-login <server>` (anonymous server-issued identity), which is fine for a local benchmark server.

## Side notes / observations / complaints

- **The V8 CPU budget / timeout is entirely stubbed.** `budget.rs:112` `budget_to_duration → Duration::MAX`, `budget.rs:127` `duration_to_budget → ZERO`, and the actual timeout-thread in `with_timeout_and_cb_every` (`budget.rs:33-39`) is commented out with `TODO(v8): This currently leads to UB as there are bugs in the v8 crate`. So a V8 reducer has **no gas cap** today and can run arbitrarily long. Good for an unthrottled CPU benchmark (no fuel-metering overhead skewing the V8 arm), but it means the V8 arm has *zero* per-instruction accounting cost — when comparing against a Perry/WASM arm running under Wasmtime, check whether the WASM arm has fuel metering enabled, or the comparison silently charges the WASM arm for gas the V8 arm never pays (a silent confound — negative-space point 5).
- **Reducer dispatch is by positional index, with cached args deserializers and a reused `ReducerCtx`.** `runtime.ts:352`/`:407` mean the V8 path is already aggressively optimized for the hot call: no per-call allocation of the ctx, deserializers built once at startup. A fair Perry arm should be allowed equivalent setup (precomputed deserializers) rather than re-parsing the module def per call.
- **First-call JIT warmup is large and real** (~40% here). Any benchmark that calls a reducer a handful of times will be dominated by warmup. This is intrinsic to V8 (TurboFan tiering) and is itself a legitimate axis to report — "cold reducer latency" vs "warm steady-state" are different stories, and a JIT'd language vs an AOT Perry/WASM module will differ most exactly here. Consider reporting both cold and warm explicitly rather than averaging them into one misleading mean.
- **The bundle is shipped as source text, not bytecode.** The 690 KB `bundle.js` is recompiled by V8 on every isolate (re)creation (heap-limit retirement rebuilds the isolate, `mod.rs:1627`). Startup/compile time is part of `make_actor`, not part of per-reducer `execution_duration`, so it does not pollute the reducer timing — but it is a real cost the WASM arm pays differently (Wasmtime compiles once).
- **`spacetime call` (CLI) hides timing.** It only prints an UNSTABLE warning and the reducer's stdout-equivalent; the execution-duration is HTTP-header-only. The harness must speak HTTP directly (or parse the header some other way). This is mildly annoying but unambiguous.
- **Reducers cannot return values yet** (`reducers.ts:83` hardcodes `okReturnType = Product([])`; `syscall/v2.rs:467` rejects any non-`undefined` return). So a benchmark cannot read a computed result out of the reducer return — it must persist to a table and read back via SQL, or rely on the timing header alone. The `result` table in the minimal module exists for exactly this reason.
- The context doc says the image is `clockworklabs/spacetime` run as `... start`; that resolves to `:latest` = **v2.3.0**, not the stated 2.0.1 target. To actually hit 2.0.1 you must pin `:v2.0.1`. Flagging because "the target server is 2.0.1" and "docker run clockworklabs/spacetime start" are inconsistent as written.
