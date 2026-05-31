# mmodb — Perry-accelerated SpacetimeDB TypeScript modules

This project speeds up SpacetimeDB server modules written in TypeScript by adding an ahead-of-time compilation path: develop the module in TypeScript against the normal SpacetimeDB toolchain, then compile it with [Perry](https://github.com/PerryTS/perry) into a native WebAssembly module for release builds. The MMO server logic is authored in TypeScript; release builds trade the V8 interpreter for an AOT-compiled WASM module with no JIT warmup.

## The core idea

SpacetimeDB's official TypeScript modules do not compile to WebAssembly. The CLI bundles `src/index.ts` into a single JavaScript chunk with rolldown, and the database host runs that bundle on an embedded V8 isolate (`crates/cli/src/tasks/javascript.rs`; `v8 = "=145.0.0"` in the host `Cargo.toml`). Rust, C#, and C++ modules instead compile to a native WebAssembly module loaded by Wasmtime, against the stable, language-agnostic ABI in `crates/bindings-sys/src/lib.rs` (host imports namespaced `spacetime_10.0`–`10.5`; module exports `__describe_module__` and `__call_reducer__`).

The architecturally sound way to make TypeScript fast is therefore to compile it to a freestanding WASM module that satisfies that same native ABI — exactly as Rust/C#/C++ already do — and let the stock SpacetimeDB host load it unchanged. That is the path this project takes.

## Architecture (committed)

```
TypeScript module source (src/index.ts)
        │
        ├── DEV build ───→ rolldown → single JS → embedded V8        (fast iteration, unchanged)
        │
        └── RELEASE build ─→ Perry (forked) → freestanding wasm32 ──→ host_type=Wasm module
                                  hits spacetime_10.x ABI                      │
                                                                               ▼
                                                              STOCK SpacetimeDB server (Wasmtime)
                                                              — core/host NEVER modified
```

The SpacetimeDB **core/host is never forked.** A `PerryWasm` host type (teaching the database to load Perry's JS-host WASM) was considered and rejected as an architectural hack: it would fork the database core and smuggle a JavaScript-runtime-equivalent back into the host. The fork surface is only (1) Perry's codegen and (2) the SpacetimeDB *TypeScript module* (one extra release option).

## The two forks

- **[api-haus/perry](https://github.com/api-haus/perry)** — fork of `PerryTS/perry`. Adds a freestanding `wasm32-unknown-unknown` target to Perry's LLVM backend (today the only WASM path is a browser/JS-host one that imports a 211-function `rt` runtime), ports the `perry-runtime` core (GC + JSValue + builtins) to wasm32, and adds the ABI plumbing (chosen import namespace/signatures, exact-named exports, a linear-memory byte primitive for BSATN).
- **[api-haus/SpacetimeDB](https://github.com/api-haus/SpacetimeDB)** — fork of `clockworklabs/SpacetimeDB`. Adds the single "compile with Perry for release" option to the TypeScript module toolchain (`crates/bindings-typescript` + `crates/cli`), lowering the existing `spacetimedb/server` API (`schema`/`table`/`reducer`/`ctx.db`) onto the `spacetime_10.x` imports, mirroring how the C#/C++ bindings lower to the same ABI. The Perry fork is embedded here.

## Status

Investigation and the canonical plan are complete; **M1 done + verified** (freestanding `wasm32` via the LLVM pipeline); and **the M2 make-or-break spike has passed, independently verified** — the project's central risk is retired. A 770-byte module produced end-to-end by the forked Perry toolchain (named/typed `__describe_module__`/`__call_reducer__` dunders, `spacetime_10.0` import-namespace selection, addressable static BSATN buffer, all via genuine codegen) **publishes to the stock v2.0.1 server, instantiates, and the reducer is callable** (`api-haus/perry` branch `feat/target-spacetimedb`). What remains in M2-proper is follow-through, not unknowns: generating the BSATN module def from the user schema, real `__call_reducer__` dispatch, linking the `wasm32` runtime archive (the shell-amputation long pole), then M3 (move the ABI shim into the TS runtime / SDK) and M4 (the `--engine perry` release flag). See `docs/orchestrate/perry-stdb-poc/`:

- `00-context.md` — recon facts and source-of-truth hierarchy.
- `01-perry-wasm.md` — Perry's current `--target wasm` is a JS-host artifact (211 `rt` imports, index-named exports), unusable for the native ABI as-is.
- `02-stdb-abi.md` — the exact native WASM module ABI, reproduced against real built Rust modules.
- `03-stdb-ts-baseline.md` — the official TypeScript→V8 path and how to benchmark it.
- `04-feasibility-and-design.md` — why the literal "Perry as a drop-in SpacetimeDB module" is not buildable without a Perry codegen fork, and the decision to fork.
- `05-perry-runtime-wasm-port.md` — the `perry-runtime` → wasm32 port surface (blockers + fixes).
- `06-stdb-sdk-fork-surface.md` — the TypeScript-module release-option fork surface.
- `07-fork-plan.md` — the canonical milestone plan.
- `08-m1-llvm-wasm32.md` — M1: the LLVM→`wasm32` freestanding target (what changed, the wasm dump, what M2 inherits).
- `08b-m1-verify.md` — independent verification of M1 (reproduced with a different module).
- `09-m2-spike-abi-load.md` — M2 make-or-break spike: the ABI shape emitted by the Perry toolchain, published to the stock server, loaded + callable (with the explicit codegen-vs-shim split and what M2-proper must absorb).
- `09b-m2-verify.md` — independent verification of the M2 spike (re-published to a fresh DB).

## Layout

- `docs/orchestrate/perry-stdb-poc/` — investigation and plan (working memory; the code at `file:line` is the source of truth).
- `_vendor/` — read-only shallow reference clones of upstream Perry and SpacetimeDB (git-ignored).
- `_scratch/` — build/probe artifacts (git-ignored).
