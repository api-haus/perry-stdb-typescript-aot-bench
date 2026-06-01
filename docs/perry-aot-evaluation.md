# Perry AOT evaluation — verdict and E2E benchmark results

This document summarizes the evaluation of Perry as an AOT compiler for SpacetimeDB TypeScript modules. The goal was to determine whether Perry could accelerate TypeScript release builds by compiling them to wasm32 instead of running them through V8's JIT.

**Verdict: Perry is not viable for accelerating TypeScript compute workloads. Write hot modules in Rust.**

## The experiment

An E2E benchmarking harness was built to compare three compilation paths for SpacetimeDB modules, all running on a stock SpacetimeDB v2.0.1 server:

- **Rust** (native wasm32 via the SpacetimeDB Rust SDK) — the Wasmtime performance ceiling
- **V8** (stock TypeScript SDK, JIT-compiled by V8's TurboFan) — the baseline
- **Perry AOT** (TypeScript compiled to wasm32 via Perry's SWC → LLVM pipeline) — the candidate

Two reducers were benchmarked:
- `empty` — noop, isolates dispatch overhead
- `cpu_heavy` — 100k iterations of xorshift32 feeding RPG stat formulas (attack/defense/damage computation), isolates compute performance

A Rust HTTP artillery client (`bench/e2e/client/`) called each reducer at concurrency 1, 4, and 16, measuring TPS and latency percentiles via HdrHistogram.

## Results

### Three-way comparison (same-session back-to-back runs)

| Reducer | Conc | Rust TPS | Perry TPS | V8 TPS | Rust/Perry | Perry/V8 |
|---------|------|----------|-----------|--------|------------|----------|
| empty | 1 | 5,717 | 5,658 | 4,659 | 1.01x | **1.21x** |
| empty | 4 | 19,884 | 16,657 | 16,594 | 1.19x | 1.00x |
| empty | 16 | 29,911 | 31,493 | 11,896 | 0.95x | **2.65x** |
| cpu_heavy | 1 | 1,906 | 712 | 1,825 | **2.68x** | **0.39x** |
| cpu_heavy | 4 | 3,467 | 868 | 2,519 | **3.99x** | **0.34x** |
| cpu_heavy | 16 | 3,580 | 875 | 2,665 | **4.09x** | **0.33x** |

### Latency (p50)

| Reducer | Conc | Rust | Perry | V8 |
|---------|------|------|-------|----|
| empty | 1 | 0.16ms | 0.17ms | 0.17ms |
| cpu_heavy | 1 | 0.48ms | 1.35ms | 0.51ms |

### Pure kernel time (cpu_heavy p50 minus empty p50)

| Runtime | Kernel time | vs Rust |
|---------|------------|---------|
| Rust | 0.32ms | 1.0x |
| V8 | 0.34ms | 1.06x |
| Perry | 1.18ms | 3.7x |

## Why Perry loses on compute

Perry uses NaN-boxing: every JavaScript value is a tagged 64-bit float, and every operation checks the tag at runtime. The root cause was identified by disassembling the compiled wasm:

- **Zero shadow-stack calls** in the module (contrary to initial hypothesis — `--gc-sections` eliminates them for numeric-only code)
- **One unnecessary `js_number_coerce` call per loop iteration** (100k calls total), caused by a missing `Expr::Conditional` case in Perry's `is_numeric_expr` type analysis (`perry-codegen/src/type_analysis.rs:589-673`)
- The coercion function is in a separately-compiled runtime archive, opaque to LLVM's optimizer — it cannot be inlined or DCE'd

Even fixing this specific gap, Perry's NaN-boxing architecture means every value passes through tag-check dispatch. V8's TurboFan solves this with speculative optimization and deoptimization guards, producing near-native code for tight numeric loops (only 1.06x behind Rust). Perry's conservative static approach cannot compete.

## Where Perry does win

Perry achieves dispatch parity with native Rust on the empty reducer (5,658 vs 5,717 TPS — essentially tied) and beats V8 by 1.21x–2.65x on dispatch overhead. Perry's tail latency is also tighter (p99 0.28ms vs V8's 1.38ms at concurrency 1 on empty). This advantage is real but only matters for workloads dominated by many tiny reducer calls with negligible compute per call.

## Alternatives considered

**AssemblyScript** was investigated as an alternative AOT path. It compiles a TypeScript-like language to wasm with a real type system (no NaN-boxing). The same cpu_heavy kernel compiles to 247 bytes of pure i32/f64 wasm ops — structurally identical to Rust's LLVM -O3 output, zero runtime calls. An ABI shim proof-of-concept (450 bytes) was built with correct SpacetimeDB exports/imports. However, the expected performance gain over V8 is only ~17% (Rust ceiling vs V8: 1,906 vs 1,825 TPS), which does not justify the effort of building a SpacetimeDB AS SDK.

## Decision

Write SpacetimeDB modules in Rust. The Rust wasm path is the Wasmtime performance ceiling, the SDK is mature, and the module size is 98KB (vs Perry's 4.7MB). No TypeScript AOT compiler — Perry, AssemblyScript, or otherwise — can beat V8's TurboFan by enough on compute to justify the engineering investment. V8 is within 6% of native Rust on the cpu_heavy kernel; the remaining gap is not worth chasing with a custom compiler toolchain.

## Artifacts

- `bench/e2e/` — the E2E benchmarking harness (module sources, Rust artillery client, build scripts)
- `bench/e2e/module/rust-bench/` — Rust benchmark module (the template for future modules)
- `docs/orchestrate/perry-e2e-bench/` — detailed investigation logs, wasm disassembly analysis, AssemblyScript viability study
- `_vendor/perry-fork/` — Perry fork with multi-reducer `--target spacetimedb` support (branch `feat/target-spacetimedb`, rebased onto upstream main)
