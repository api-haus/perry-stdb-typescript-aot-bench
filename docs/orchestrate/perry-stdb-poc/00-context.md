# Perry × SpacetimeDB PoC — shared context

## The experiment (user's words)

> Extend the SpacetimeDB TypeScript SDK with a **Perry** compilation step. Deliver a PoC: a fork of the SpacetimeDB TypeScript module, a docker-compose with the SpacetimeDB server, a SpacetimeDB module written in TypeScript that can be compiled with Perry, and a simple benchmarking harness comparing **TypeScript raw performance vs Perry-compiled** in a SpacetimeDB module setting.

Investigation axes the user named: (1) Perry→WASM compilation, (2) SpacetimeDB TS→WASM compilation, (3) Perry+SpacetimeDB TS compilation.

## What Perry is (corrected by user)

**Perry** = `https://github.com/PerryTS/perry` (npm `@perryts/perry`). A **native TypeScript compiler in Rust** (SWC parser + LLVM codegen). It compiles TS straight to native binaries AND has a **`--target wasm`** output. NOT Porffor (Porffor `https://github.com/CanadaHonk/porffor` is a separate JS-based AOT compiler the user linked only as a reference point). Perry supports a far larger TS surface than Porffor (classes, generics, async/await, closures, GC, BigInt, RegExp). Decorators are the one documented unsupported feature.

- CLI: `perry compile src/main.ts -o out`, `perry compile --target wasm ...`, `perry run .`, `perry check`, `perry init`.
- Local checkout: `/mnt/archive4/DEV/mmodb/_vendor/perry` (full Rust source). WASM codegen crate: `_vendor/perry/crates/perry-codegen-wasm`. WASM tests: `_vendor/perry/tests/wasm/`, `_vendor/perry/tests/wasm_runtime/`. WASM type stubs: `_vendor/perry/types/perry/webassembly/`.

## What SpacetimeDB does (confirmed against source, not docs)

- **Official TS modules are JS-on-V8, NOT WASM.** `crates/cli/src/tasks/javascript.rs` bundles the TS module into a single JS chunk with **rolldown** (`dist/*.js`). The host **embeds V8** — `Cargo.toml:337` pins `v8 = "=145.0.0"` + `deno_core_icudata`. The bundled JS runs in a V8 isolate inside the host; host capabilities are exposed to JS (see `crates/bindings-typescript/src/server/sys.d.ts`).
- **Rust/C#/C++ modules are native WASM**, loaded by Wasmtime. The WASM module ABI is in `crates/bindings-sys/src/lib.rs`:
  - Host **imports** namespaced `spacetime_10.0` … `spacetime_10.5` (`#[link(wasm_import_module = "spacetime_10.0")]` at line 21, and 10.1–10.5 at 594/623/648/788/868). Includes table ops, datastore insert/scan, bytes sources/sinks, console_log, etc.
  - Module **exports** the host calls: `__describe_module__(description: BytesSink)` and `__call_reducer__(...) -> i16` (declared ~`bindings-sys/src/lib.rs:961`; Rust runtime implements them in `crates/bindings/src/rt.rs:991` and `:1049`).
  - BSATN serialization (module def + values) lives in `crates/sats`.
- **The TS server SDK** is `crates/bindings-typescript` (npm package `spacetimedb`; `@clockworklabs/spacetimedb-sdk` deprecated since 1.4.0). Module-side lib is `src/server/` (`runtime.ts`, `reducers.ts`, `schema.ts`, `db_view.ts`, `sys.d.ts`, `console.ts`, `polyfills.ts`). Authoring API (`spacetimedb/server`: `schema`, `table`, `t`, `.reducer`) documented in `_vendor/SpacetimeDB/skills/typescript-server/SKILL.md`.

## The central feasibility question

Official TS path = JS on embedded V8. Experiment = AOT-compile the **same** TS module source with Perry into a **freestanding WASM module** that satisfies SpacetimeDB's **native** module ABI (the same contract Rust/C# hit), then run it on Wasmtime with no V8 in the loop, and benchmark a CPU-bound reducer against the V8 path.

For that to work, Perry's `--target wasm` must be able to: (a) declare WASM **imports from arbitrary module namespaces** with exact names/signatures (`spacetime_10.0`/`table_id_from_name`, etc.); (b) **export** functions with exact names + WASM signatures (`__describe_module__`, `__call_reducer__`); (c) emit a **reactor/freestanding** module (no mandatory WASI `_start`, `memory` exported) acceptable to SpacetimeDB's Wasmtime config; (d) let us hand-author (in TS Perry can compile) the BSATN module-def bytes + reducer-arg marshalling. If any of (a)–(d) is impossible, document the wall and the fallback (e.g. a raw-compute Perry-WASM vs V8 micro-benchmark clearly labelled as a proxy, or a thin hand-written WASM shim wrapping Perry output).

## Environment facts

- Local: node v26.1.0, npm 11.14.1, bun 1.3.14, docker 29.5.1 + compose v5.1.4, rustc/cargo 1.95, wasm-pack 0.14.
- Local `spacetime` CLI is **1.11.1** (`~/.local/share/spacetime/bin/1.11.1`). Target server is **2.0.1** (released 2026-02-24). Docker image `clockworklabs/spacetime` (`docker run -p 3000:3000 clockworklabs/spacetime start`). **Version mismatch matters** — pin the image tag and use a matching CLI (run the CLI from inside the container, or install 2.0.1) for build/publish fidelity. The cloned repo is at default-branch HEAD (post-2.0); reading the ABI there is fine, but module builds should target the running server version.
- Working dir: `/mnt/archive4/DEV/mmodb` (not a git repo yet). Vendored clones in `_vendor/`.

## Source-of-truth hierarchy (binding)

1. The code itself at `file:line` in `_vendor/SpacetimeDB` and `_vendor/perry`.
2. Research/official docs (`spacetimedb.com/docs`, Perry README) — for intent.
3. This orchestration's own docs (`docs/orchestrate/perry-stdb-poc/`) — working memory.

Verify every load-bearing claim against code. Each deliverable doc ends with a `## Side notes / observations / complaints` section.
