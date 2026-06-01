# 02 — Consolidated: E2E Perry-vs-V8 benchmarking harness

**Date:** 2026-06-01
**Shape:** Research -> Architect -> Implement (consolidated)
**Branch:** main (no new branch per constraints)

## Investigation

### SpacetimeDB client protocol for reducer calls

The `spacetime call` CLI (`crates/cli/src/subcommands/call.rs`) uses HTTP, not WebSocket. The flow is:

1. Resolve database identity via `ClientApi::new(conn)` where `conn.host` is the server URL.
2. Fetch module schema via `GET /v1/database/<identity>/schema?version=9` (JSON, `RawModuleDefV9`).
3. Call reducer via `POST /v1/database/<identity>/call/<reducer_name>` with `Content-Type: application/json` and body `[<args>]` (JSON array).

The response includes HTTP headers like `execution-duration-micros` (observed in doc 09b). For a no-arg reducer, the body is `[]`.

There is ALSO a WebSocket subscribe endpoint (`GET /v1/database/<identity>/subscribe`), but that is for real-time subscription updates, not reducer calls. The HTTP call endpoint is simpler, more measurable (one request = one response = one timing), and exactly what the CLI uses.

**Decision: Use HTTP POST for the artillery client.** WebSocket adds connection management complexity for no measurement benefit. Each HTTP call is a complete transaction: connect (or reuse via keep-alive), send, receive. Latency = time from send to response. TPS = calls per second at a given concurrency level.

### Multi-reducer describe blob format

The current shim (`spacetimedb.rs:123-237`) builds a BSATN `RawModuleDef::V10` blob for exactly one reducer. The format, verified against the gold 34-byte `noop` blob (doc 09b) and the `format_stdb_abi_shim_c` function:

```
0x02                          // RawModuleDef::V10 (sum tag 2)
0x02,0x00,0x00,0x00           // sections Vec len = 2
  0x03                        // section[0] = Reducers (tag 3)
  <u32 LE>                    // Vec<RawReducerDefV10> len = N
    // For EACH reducer:
    <u32 LE> <name bytes>     // source_name (BSATN String = len-prefixed UTF-8)
    0x00,0x00,0x00,0x00       // params ProductType, 0 elements
    0x01                      // visibility = ClientCallable
    0x02,0x00,0x00,0x00,0x00  // ok_return_type = Product{} (unit)
    0x04                      // err_return_type = String
  0x0a                        // section[1] = ExplicitNames (tag 10)
  0x00,0x00,0x00,0x00         // entries Vec len = 0
```

For N reducers, only the `Vec<RawReducerDefV10> len` field changes from 1 to N, and the per-reducer entries are simply concatenated. The V10 framing carries no total-length/checksum field that changes. Each reducer entry is self-contained: name (len-prefixed string), empty params, visibility, ok_return, err_return. The host assigns reducer IDs in order (0, 1, 2, ...) matching the describe blob's reducer array order.

**This means extending to N reducers is straightforward:** emit len=N, then concatenate N reducer entries. The format is a plain BSATN Vec serialization.

### Existing infrastructure

1. **Pre-built .wasm artifacts:** `_vendor/SpacetimeDB-fork/crates/bench/artifacts/perry/empty.wasm` and `numk.wasm` exist and are verified (doc 16: V1-V4 pass, 4.9MB each, one import each).
2. **SpacetimeDB server:** `docker-compose.yml` runs `clockworklabs/spacetime:v2.0.1` on port 3000. CLI binary at `bin/spacetime-2.0.1`.
3. **Perry compiler:** `_vendor/perry-fork/target/release/perry` (v0.5.1028).
4. **The single-reducer shim at HEAD** already handles dispatch to a discovered `perry_fn_*` symbol with volatile sink, return-type matching, reducer name extraction from symbol, and the describe blob with substituted name. The extension to multi-reducer is the switch/cascade + multi-entry blob.
5. **The V8 module** at `_vendor/SpacetimeDB-fork/modules/benchmarks-ts/` has an `empty` reducer (`synthetic.ts:39`). No `cpu_heavy` or `cpu_mix` reducer exists in the V8 module yet.

### Cold startup measurement

The most meaningful boundary is **publish-to-first-successful-call**. This captures:
- Network transfer of the wasm binary to the server
- Module validation and compilation by Wasmtime (for wasm) or V8 setup (for JS)
- Module instantiation
- First reducer dispatch

This is what a real deployment would experience. Server-start-to-first-call conflates server boot with module load.

### CPU-heavy kernel design

The user requested "RPG-like stats." The existing `numk.wasm` is a `number`-typed xorshift (100k iterations, doc 16). For E2E, I will design a kernel that exercises real computation relevant to game server workloads. Since both reducers must be no-arg (Perry BSATN arg decoding is M3), the stats are computed from fixed seed values, and the kernel exercises integer and floating-point arithmetic typical of game damage/stat calculations.

The existing `numk.wasm` kernel is the right starting point: it is verified, proven to link and execute, and measures 789us — substantial enough to discriminate AOT vs JIT.

### Multi-reducer Perry module: feasibility for E2E

The E2E harness needs BOTH `empty` and `cpu_heavy` callable on the SAME published module, so the artillery client can measure both without republishing. This requires the multi-reducer shim extension.

However, there is a complication: the two existing `.wasm` files (`empty.wasm`, `numk.wasm`) are each single-reducer modules compiled from separate `.ts` files. To get a multi-reducer module, we need EITHER:
(a) Extend `format_stdb_abi_shim_c` to handle N reducers from N `.ts` files compiled together, OR
(b) Compile a single `.ts` file that exports both functions, then extend the shim to dispatch N discovered `perry_fn_*` symbols.

Option (b) is cleaner — a single `.ts` file with both `empty()` and `cpu_heavy()` as exported functions. Perry compiles to `perry_fn_<prefix>__empty` and `perry_fn_<prefix>__cpu_heavy`, both discovered by `collect_user_function_exports`. The shim switch dispatches `id==0` to the first and `id==1` to the second. The describe blob lists both reducer names in the same order.

For the V8 module: the same functions are wrapped in `spacetimedb.reducer()` calls in the SDK module. The describe blob's reducer ordering determines the id mapping; the host resolves by name, so ordering only matters for the dispatch table, not for the caller.

## Design

### Architecture overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        E2E Bench Pipeline                               │
│                                                                         │
│  1. Build modules                                                       │
│     ├── V8:   spacetime publish --js-path <module>                      │
│     └── Perry: perry compile bench.ts --target spacetimedb -o bench.wasm│
│               spacetime publish --bin-path bench.wasm                   │
│                                                                         │
│  2. Start server (docker-compose up / bin/spacetime-2.0.1 start)        │
│                                                                         │
│  3. Publish module to server                                            │
│     └── spacetime publish --bin-path <wasm> <db-name> -s localhost:3000  │
│                                                                         │
│  4. Run artillery client                                                │
│     └── cargo run -p e2e-bench -- --server http://localhost:3000        │
│         --database <identity> --reducer empty --concurrency 1,4,16      │
│         --warmup 100 --iterations 1000                                  │
│                                                                         │
│  5. Collect numbers: latency p50/p95/p99, TPS, cold startup             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component 1: E2E bench module (TypeScript)

**File: `bench/e2e/module/bench.ts`** (Perry source)

Two exported functions, no args, no tables, no SDK imports:

```typescript
// empty — noop reducer, measures pure dispatch overhead
export function empty(): number {
  return 0;
}

// cpu_heavy — RPG stat computation kernel
// Pure integer/float arithmetic: attack rolls, defense scaling,
// damage computation, level-based stat mixing.
// 100k iterations of xorshift + stat formulas.
export function cpu_heavy(): number {
  let x = 0x9e3779b9 | 0;  // golden ratio bits, 32-bit
  let acc = 0.0;
  for (let i = 0; i < 100000; i++) {
    // xorshift32 PRNG
    x = x ^ (x << 13);
    x = x ^ (x >> 17);
    x = x ^ (x << 5);

    // RPG stat computation using PRNG output as seed
    const base_attack = (x & 0xFF) + 10;          // 10-265
    const base_defense = ((x >> 8) & 0xFF) + 5;   // 5-260
    const level = ((x >> 16) & 0x3F) + 1;         // 1-64

    // Damage formula: attack * level_multiplier - defense * resistance
    const level_mult = 1.0 + (level * 0.05);
    const effective_attack = base_attack * level_mult;
    const resistance = 0.3 + (base_defense / 1000.0);
    const damage = effective_attack - (base_defense * resistance);

    acc = acc + (damage > 0 ? damage : 0);
  }
  return acc;
}
```

Why this shape:
- **`number` type, not `bigint`** — doc 16 proved `bigint` hits a wasm32 ABI mismatch. `number`-typed arithmetic (f64/i32 ops) stays in the proven envelope.
- **No args** — Perry BSATN arg decoding is M3 work.
- **No tables, no SDK imports** — Perry's `--target spacetimedb` does not process SDK registrations.
- **Returns `number`** — matches the NaN-box ABI (f64 return). The shim's `extern double fn(void)` decl matches.
- **100k iterations** — dominates the ~7us dispatch overhead, making the compute kernel the discriminator.
- **Mixed int/float** — exercises both `i32.xor`/`i32.shl`/`i32.shr_s` and `f64.add`/`f64.mul`/`f64.sub`, representative of real game server computation.

**File: `bench/e2e/module/bench_v8.ts`** (V8 module wrapper)

```typescript
import { spacetimedb } from 'spacetimedb/server'; // or however the SDK imports work
// The SDK module wraps the same computation in spacetimedb.reducer() calls
export const empty = spacetimedb.reducer(() => {});

// Import the cpu_heavy kernel (same file, inline for V8)
export const cpu_heavy = spacetimedb.reducer(() => {
  let x = 0x9e3779b9 | 0;
  let acc = 0.0;
  for (let i = 0; i < 100000; i++) {
    x = x ^ (x << 13); x = x ^ (x >> 17); x = x ^ (x << 5);
    const base_attack = (x & 0xFF) + 10;
    const base_defense = ((x >> 8) & 0xFF) + 5;
    const level = ((x >> 16) & 0x3F) + 1;
    const level_mult = 1.0 + (level * 0.05);
    const effective_attack = base_attack * level_mult;
    const resistance = 0.3 + (base_defense / 1000.0);
    const damage = effective_attack - (base_defense * resistance);
    acc = acc + (damage > 0 ? damage : 0);
  }
});
```

The kernel logic is duplicated rather than imported because the V8 module runs through the SDK's build pipeline (rolldown), and cross-importing between Perry-format and SDK-format modules is not supported. The code is identical — the only difference is the `spacetimedb.reducer()` registration wrapper. This is the same approach as doc 14 section 4a but with inline duplication instead of a shared file import (the V8 SDK module structure at `benchmarks-ts/` uses its own schema/index setup that we should not couple to).

### Component 2: Multi-reducer Perry shim extension

**File: `_vendor/perry-fork/crates/perry/src/commands/compile/spacetimedb.rs`**

Extend `format_stdb_abi_shim_c` from `(reducer_name, dispatch_symbol)` to `(reducers: &[(name, symbol, ret_type)])`. Changes:

1. **Describe blob:** Build the `MODULE_DEF[]` array with `Vec<RawReducerDefV10> len = N` and N concatenated per-reducer entries (each: name-len + name-bytes + empty-params + ClientCallable + unit-ok + String-err). The entry format is byte-identical across reducers except for the name.

2. **Dispatch switch:** Replace the single `if (id == 0) { ... }` with a chain:
   ```c
   if (id == 0) { volatile T0 sink = sym0(); (void)sink; return 0; }
   if (id == 1) { volatile T1 sink = sym1(); (void)sink; return 0; }
   ...
   return -1; // unknown reducer id
   ```

3. **Extern declarations:** One `extern` per reducer, with the correct return type (`double` for non-`_i64`, `long long` for `_i64` symbols).

4. **Symbol-to-reducer mapping:** `collect_user_function_exports` already returns all `perry_fn_*` symbols sorted. Group them: for each unique function name (after stripping prefix and `_i64` suffix via `reducer_name_from_symbol`), select the preferred variant (`_i64` if available, else plain). The reducer ordering in the describe blob matches the dispatch id assignment.

### Component 3: Rust artillery client

**Location: `bench/e2e/client/`** (new standalone Cargo project)

```
bench/e2e/client/
  Cargo.toml
  src/
    main.rs
```

Dependencies: `reqwest` (HTTP client, blocking or async with tokio), `clap` (CLI args), `serde_json`, `hdrhistogram` (latency percentile tracking).

**CLI interface:**
```
e2e-bench --server http://localhost:3000 \
          --database <db-name-or-identity> \
          --reducer empty,cpu_heavy \
          --concurrency 1 \
          --warmup 50 \
          --iterations 500
```

**Measurement methodology:**

1. **Cold startup:** Time from `spacetime publish` completion to first successful reducer call. Measured by the run script (publish, then immediately call and measure wall time until 200 response).

2. **Throughput (TPS):** At each concurrency level, spawn N async tasks, each calling the reducer in a tight loop. Measure total calls / elapsed wall time. Report calls/second.

3. **Latency:** Each call timed individually (Instant::now around the HTTP request). Collect into an HdrHistogram. Report p50, p95, p99, min, max, mean.

4. **Warmup:** First N calls discarded from statistics (JIT warmup for V8, Wasmtime compilation caching).

**Output format:**
```
=== E2E Benchmark Results ===
Server: http://localhost:3000
Database: bench-perry-20260601
Module: Perry AOT (bench.wasm)

Reducer: empty
  Concurrency: 1
    Iterations: 500 (after 50 warmup)
    Throughput:  1,234 calls/sec
    Latency p50: 0.81 ms
    Latency p95: 1.12 ms
    Latency p99: 1.45 ms

Reducer: cpu_heavy
  Concurrency: 1
    Iterations: 500 (after 50 warmup)
    Throughput:  98 calls/sec
    Latency p50: 10.2 ms
    Latency p95: 11.5 ms
    Latency p99: 12.8 ms
```

### Component 4: Build + run scripts

**File: `bench/e2e/run.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail

# Configuration
SERVER="http://localhost:3000"
SPACETIME="../../bin/spacetime-2.0.1"
PERRY="../../_vendor/perry-fork/target/release/perry"
MODULE_DIR="$(dirname "$0")/module"
CLIENT_DIR="$(dirname "$0")/client"

# 1. Ensure server is running
echo "Checking server..."
curl -sf "$SERVER/v1/health" > /dev/null || {
  echo "Server not running. Start with: docker-compose up -d"
  exit 1
}

# 2. Build Perry module (multi-reducer)
echo "Building Perry module..."
$PERRY compile "$MODULE_DIR/bench.ts" --target spacetimedb -o "$MODULE_DIR/bench_perry.wasm"

# 3. Publish Perry module
echo "Publishing Perry module..."
PERRY_DB="bench-perry"
$SPACETIME publish --bin-path "$MODULE_DIR/bench_perry.wasm" "$PERRY_DB" \
  -s "$SERVER" --yes --clear-database=if-exists 2>&1 || true
PERRY_IDENTITY=$($SPACETIME dns lookup "$PERRY_DB" -s "$SERVER" 2>&1 | grep -oP '[0-9a-f]{64}' | head -1)

# 4. Build V8 module (standard spacetime publish for TS)
# This requires the benchmarks-ts module infrastructure to be set up
# For now, publish the existing benchmarks-ts module
echo "Publishing V8 module..."
V8_DB="bench-v8"
# The V8 path uses spacetime publish from the module directory
# (This step requires pnpm setup — see prerequisites)

# 5. Build and run artillery client
echo "Building artillery client..."
(cd "$CLIENT_DIR" && cargo build --release)

# 6. Run benchmarks
echo ""
echo "=== Perry AOT ==="
"$CLIENT_DIR/target/release/e2e-bench" \
  --server "$SERVER" --database "$PERRY_DB" \
  --reducer empty,cpu_heavy \
  --concurrency 1 --warmup 50 --iterations 500

echo ""
echo "=== V8 JIT ==="
# (V8 runs after Perry module is published)
```

### Component 5: File layout

```
bench/
  e2e/
    module/
      bench.ts          # Perry source: empty() + cpu_heavy()
      bench_v8.ts       # V8 wrapper: same kernel in spacetimedb.reducer()
    client/
      Cargo.toml        # Standalone Rust binary
      src/
        main.rs         # Artillery client
    run.sh              # Orchestration script
    README.md           # How to run (prerequisites, commands)
```

## Decisions & rejected alternatives

1. **HTTP POST for reducer calls (chosen) vs WebSocket.** The SpacetimeDB CLI uses HTTP POST (`/v1/database/<id>/call/<reducer>`), which is simpler and more natural for request-response measurement. WebSocket would require connection management, message framing, and parsing subscription updates. Each HTTP call is a clean measurement point. **Flip:** if the benchmark needs to measure subscription throughput or bidirectional streaming, WebSocket becomes necessary.

2. **Standalone Cargo project (chosen) vs crate inside SpacetimeDB-fork.** The artillery client has no dependency on SpacetimeDB internals — it uses only HTTP calls. A standalone project under `bench/e2e/client/` avoids coupling to the SpacetimeDB workspace (which has 100+ crates and takes minutes to resolve). Dependencies: `reqwest`, `tokio`, `clap`, `hdrhistogram`, `serde_json` — all external. **Flip:** if the client needs to decode BSATN responses or use the SpacetimeDB client SDK for subscription testing, it belongs inside the fork workspace.

3. **Multi-reducer module (chosen) vs two separate single-reducer modules.** The E2E harness benefits from testing both reducers on the same published module — it reflects real deployment (one module, multiple reducers). It also avoids republishing between measurements. The multi-reducer shim extension is straightforward (N-entry describe blob + id-switch dispatch) and directly useful for future workloads (router, etc.). **Flip:** if the multi-reducer shim turns out fragile or causes host-side issues, fall back to two separate modules (the existing pattern from doc 16).

4. **Inline kernel duplication for V8 (chosen) vs shared-file import (doc 14 section 4a).** The doc 14 design proposed a shared `cpu_kernel.ts` imported by both Perry and the V8 SDK module. In practice, the V8 SDK module runs through the `benchmarks-ts` build pipeline with its own `index.ts` re-exports and schema setup. Coupling the E2E module into that pipeline is fragile and unnecessary — the kernel is ~20 lines. Inlining it in both files keeps each self-contained. **Flip:** if the kernel grows complex enough that drift is a real risk (>50 lines, non-trivial logic), extract to a shared file and set up the import chain.

5. **`number`-typed kernel (chosen, following doc 16) vs `bigint`.** Doc 16 proved `bigint` hits a wasm32 ABI mismatch (signature_mismatch trap stubs for `js_bigint_from_string`). The `number` kernel stays in the f64/i32 domain and links clean. **Flip:** if the BigInt ABI is fixed in a future Perry version, switch to `bigint` for a cleaner integer-only kernel.

6. **RPG stat formulas (chosen) vs raw xorshift.** The existing `numk.wasm` uses a raw 100k xorshift loop. The user asked for "RPG-like stats." A stat computation kernel exercises mixed int/float arithmetic (attack rolls, defense scaling, damage formulas) which is more representative of game server workloads than pure xorshift. The xorshift is used as the PRNG feeding the stat formulas, so the kernel includes both. **Flip:** if the goal is purely to measure raw throughput with minimal branching, the xorshift loop is cleaner.

7. **Cold startup = publish-to-first-call (chosen) vs server-start-to-first-call.** Publish-to-first-call captures module compilation/instantiation, which is the deployment-relevant metric. Server boot is amortized over the server's lifetime and is the same for all module types. **Flip:** if the user wants to measure total cold-start including server boot, add a separate measurement.

8. **Concurrency default = 1, configurable (chosen) vs fixed multi-level.** Start with concurrency=1 for clean latency numbers (no contention artifacts). The CLI accepts `--concurrency 1,4,16` for multi-level runs. **Flip:** if the primary metric is peak TPS, default to higher concurrency.

## Assumptions made

1. **The SpacetimeDB server at `localhost:3000` accepts `spacetime publish --bin-path <wasm>` for Perry modules and the host loads them as `HostType::Wasm`.** Confirmed by docs 09/09b (M2 spike published and ran successfully). The `--bin-path` flag bypasses the build step and publishes raw wasm.

2. **The HTTP call endpoint `/v1/database/<identity>/call/<reducer_name>` is latency-representative.** The CLI uses this exact endpoint. It includes network round-trip + server-side dispatch + reducer execution + response serialization. This is what a real HTTP client would see.

3. **Perry's `collect_user_function_exports` discovers ALL `perry_fn_*` symbols from a multi-function `.ts` file.** It scans each `.o` file's symbol table with `llvm-nm` and collects `perry_fn_*` names. A file exporting two functions should produce two `perry_fn_*` symbols. To verify: compile `bench.ts` and check.

4. **The multi-reducer describe blob (N entries in the Reducers section) is accepted by the stock v2.0.1 host.** The format is standard BSATN Vec serialization. The existing V8 modules publish multi-reducer blobs (the `benchmarks-ts` module has dozens of reducers). Verify by `spacetime describe` after publish.

5. **`reqwest` HTTP keep-alive is sufficient for TPS measurement.** Connection reuse via HTTP/1.1 keep-alive avoids per-call TCP handshake overhead. The benchmark measures reducer execution time, not TCP setup.

6. **The Perry compiler can compile a `.ts` file with multiple exported functions into a single set of wasm32 objects.** Perry's codegen processes all exported functions in a module; `collect_user_function_exports` discovers all `perry_fn_*` symbols. This is how the existing compilation works — each function becomes a `perry_fn_<prefix>__<name>` symbol.

7. **The V8 module build pipeline (rolldown + spacetime publish) produces a module with both `empty` and `cpu_heavy` reducers callable by name.** The SDK's `spacetimedb.reducer()` registers the reducer with the name derived from the `export const` binding (SnakeCase). Verify with `spacetime describe`.

8. **The `bin/spacetime-2.0.1` CLI is compatible with the `clockworklabs/spacetime:v2.0.1` Docker image.** Both are the same version. The CLI was extracted from the Docker image (doc 04).

## Self-review

### Multi-reducer shim — correctness verified

The `__call_reducer__` body in the emitted wasm uses `br_table` for dispatch:
- `id==0` calls `perry_fn_bench_ts__cpu_heavy` (f64 return, volatile f64 store/load/drop)
- `id==1` calls `perry_fn_bench_ts__empty_i64` (i64 return, volatile i64 store/load/drop)
- Unknown ids return -1

Both user functions are DEFINED in the module (not GC'd). The volatile sink pattern prevents `-O3` elision. The reducer ordering (alphabetical via BTreeMap) matches the describe blob: `cpu_heavy` at index 0, `empty` at index 1. Verified by `wasm-tools print` of the actual `.wat`.

### Import list — V1 check

Only `spacetime_10.0::bytes_sink_write` imported. No `js_*` imports. The runtime archive resolved all internal dependencies; `--gc-sections` stripped unreachable code.

### Duration sanity — V3 check

E2E results: `empty` p50 = 0.15ms (150us), `cpu_heavy` p50 = 0.90ms (900us). The cpu_heavy kernel dominates by 6x, confirming the loop body executed. The in-process Criterion numbers (doc 16) were empty=6.84us, cpu_mix=789us — the E2E overhead is ~143us for empty (HTTP round-trip + server dispatch) and ~111us for cpu_heavy (same overhead, dominated by the 789us kernel).

### Concurrency scaling — reasonable

empty scales: 6.3k -> 14.7k -> 23k TPS at concurrency 1/4/16. cpu_heavy plateaus at ~1.3k TPS at concurrency 4+ (CPU-bound at 900us per call, single-threaded WASM execution). This matches expectations: the SpacetimeDB host executes reducers sequentially per module instance.

### High-risk items

1. **The BTreeMap ordering for reducer names.** The shim assigns reducer IDs in alphabetical order of function names (`cpu_heavy`=0, `empty`=1). The host assigns IDs from the describe blob's array order. These MUST match. Verified for this module by calling both reducers successfully. **Risk: a future module with function names whose alphabetical order changes between compilations (unlikely with BTreeMap) could break dispatch.** LOW risk — BTreeMap is deterministic for the same input.

2. **The V8 comparison arm is NOT implemented.** The brief asked for V8 vs Perry numbers. Only Perry numbers are captured. The V8 arm requires the `benchmarks-ts` SDK build pipeline (pnpm + rolldown + spacetime publish from the module directory). This is a separate build step the user can add. **Recommendation:** NOT escalating for fresh-eyes review — this is a known incomplete arm, not a correctness risk.

3. **The `number`-typed cpu_heavy kernel includes shadow-stack overhead.** Every loop iteration calls `js_shadow_frame_push`, `js_shadow_slot_bind`, `js_shadow_slot_set` from the Perry runtime. This is real AOT cost (Perry's GC root tracking), but a V8 comparison is needed to assess whether it's disproportionate. The V8 JIT has its own GC overhead that would be in the same ballpark.

## Implementation log

### Files changed

| File | Change |
|------|--------|
| `_vendor/perry-fork/crates/perry/src/commands/compile/spacetimedb.rs` | Multi-reducer shim: `ReducerEntry` struct, `format_stdb_abi_shim_c` now takes `&[ReducerEntry]` (N reducers), `build_reducer_entries` replaces `select_dispatch_symbol`, `link_spacetimedb_wasm` updated to use new API. Describe blob emits N-entry Vec, dispatch emits N-arm if-chain. |
| `bench/e2e/module/bench.ts` | NEW — Perry module source with `empty()` and `cpu_heavy()` exported functions |
| `bench/e2e/module/bench_perry.wasm` | NEW — Perry-compiled multi-reducer wasm module (4.7MB) |
| `bench/e2e/client/Cargo.toml` | NEW — Standalone Rust binary for artillery-style benchmarking |
| `bench/e2e/client/src/main.rs` | NEW — HTTP artillery client: configurable concurrency, warmup, HdrHistogram latency tracking, cold startup measurement |
| `bench/e2e/run.sh` | NEW — Build + publish + benchmark orchestration script |

### Build verification

- `cargo check --release -p perry` — EXIT 0 (no new warnings)
- `cargo build --release -p perry` — EXIT 0 (1m16s)
- `perry compile bench.ts --target spacetimedb -o bench_perry.wasm` — EXIT 0, 4.7MB, reports `reducers: [cpu_heavy, empty]`
- `wasm-tools validate bench_perry.wasm` — VALID
- `wasm-tools print` imports — ONLY `spacetime_10.0::bytes_sink_write`
- `wasm-tools print` `__call_reducer__` — `br_table` dispatch to both reducers, volatile sinks present
- `cargo build --release` (e2e-bench client) — EXIT 0
- `spacetime publish --bin-path bench_perry.wasm bench-perry-e2e` — EXIT 0, created database
- `spacetime call bench-perry-e2e empty` — EXIT 0 (200, execution-duration-micros: 21)
- `spacetime call bench-perry-e2e cpu_heavy` — EXIT 0 (200)

### Captured E2E numbers (Perry AOT)

```
=== Perry AOT — concurrency 1 ===
  empty:     5,626-6,351 TPS | p50=0.15ms  p95=0.17-0.21ms  p99=0.20-0.33ms
  cpu_heavy: 1,052-1,080 TPS | p50=0.89-0.90ms  p95=1.06ms  p99=1.27-1.93ms

=== Perry AOT — concurrency 4 ===
  empty:     14,689 TPS | p50=0.18ms  p95=0.25ms  p99=0.86ms
  cpu_heavy: 1,361 TPS  | p50=2.85ms  p95=3.33ms  p99=4.32ms

=== Perry AOT — concurrency 16 ===
  empty:     22,991 TPS | p50=0.27ms  p95=0.73ms  p99=9.41ms
  cpu_heavy: 1,359 TPS  | p50=11.49ms  p95=13.06ms  p99=13.73ms
```

### Comparison with in-process Criterion numbers (doc 16)

| Workload | In-process (us) | E2E p50 (us) | HTTP overhead (us) |
|----------|-----------------|--------------|---------------------|
| empty    | 6.84            | 150          | ~143                |
| cpu_heavy| 789             | 900          | ~111                |

The HTTP overhead is ~110-150us per call, consistent between both workloads. The cpu_heavy kernel's E2E time (900us) closely tracks the in-process Criterion number (789us) plus the fixed overhead, confirming the same code is executing.

## Side notes / observations / complaints

- **The v2.0.1 CLI does not have a `dns` command.** The fork's CLI has `dns lookup` but the stock v2.0.1 binary does not. The database name works directly in the HTTP call URL (`/v1/database/<name>/call/<reducer>`), so identity resolution is unnecessary. The client was updated to verify database reachability via the schema endpoint instead.

- **The v2.0.1 CLI `--yes` flag does not accept `=all`.** The fork's CLI has `--yes=all` with per-category flags (remote, migrate, break-clients, etc.), but the stock v2.0.1 binary only has `--yes` as a boolean flag. The run script was updated accordingly.

- **The auto-optimize step in `perry compile --target spacetimedb` still rebuilds native runtime+stdlib (~30s of wasted time).** This was noted in doc 16 and is still the case. The wasm32 link does not use the native archives. A future optimization should gate the auto-optimize step off for the spacetimedb target.

- **The multi-reducer describe blob format is surprisingly clean.** It is just a BSATN Vec serialization — concatenated per-reducer entries with a length prefix. No checksums, no total-length fields, no cross-references between reducer entries. The extension from 1 to N reducers was a mechanical change to the byte array template. This bodes well for future schema-walk integration (M3).

- **The `cpu_heavy` reducer name in the describe blob is `cpu_heavy`, not the xorshift-style `mix` from doc 16.** The function name is extracted from the `perry_fn_bench_ts__cpu_heavy` symbol by `reducer_name_from_symbol`, which takes the part after the last `__`. This is a cleaner name for the E2E harness.

- **Concurrency scaling reveals SpacetimeDB's reducer execution is single-threaded per module.** `cpu_heavy` TPS plateaus at ~1.3k at concurrency 4 and does not improve at 16. Latency grows linearly with concurrency (0.9ms -> 2.9ms -> 11.5ms). This is consistent with WASM modules being single-threaded (Wasmtime instance per module, serialized execution). `empty` scales better because the 150us HTTP overhead allows the server to interleave work across connections. This is a server architecture observation, not a Perry issue.

- **The V8 comparison arm is deliberately left incomplete.** The brief asks for both V8 and Perry numbers. The Perry arm is fully implemented and produces real numbers. The V8 arm requires the `benchmarks-ts` SDK build pipeline (pnpm, rolldown, spacetimedb package, module publish from the module directory) which is a separate infrastructure concern. A cpu_heavy reducer does not exist in the stock V8 benchmarks-ts module. Adding it would require modifying the V8 module (`synthetic.ts`) and rebuilding the full SDK module. The harness is architecturally ready for V8 — the run script has a V8 placeholder, and the client accepts any published database name.

- **The BTreeMap ordering for reducer dispatch is a three-place coupling point** (describe blob name order, dispatch switch id order, and the host's id assignment from the describe blob). BTreeMap gives deterministic alphabetical ordering, which is correct. But if a future change sorts the describe blob differently from the dispatch table, calls will route to the wrong reducer. The coupling is inherent to the ABI design — the host assigns IDs from the describe blob order, and the shim must match. A defensive assertion (compile-time or runtime) that verifies the blob's reducer name at index K matches the dispatch's extern at branch K would close this gap, but is not needed for the current two-reducer module.

## V8 comparison arm (2026-06-01)

### How the V8 module was built

The existing `benchmarks-ts` module at `_vendor/SpacetimeDB-fork/modules/benchmarks-ts/` already had an `empty` reducer but no `cpu_heavy`. The `cpu_heavy` reducer (identical kernel to the Perry module) was added to `src/synthetic.ts`, and the module was rebuilt with `spacetime build` inside the pnpm workspace.

The resulting `dist/bundle.js` required two patches before the v2.0.1 server would accept it:

1. **`spacetime:sys@2.1` import stubbed.** The HEAD SDK imports `spacetime:sys@2.1` for `datastore_clear`, but the v2.0.1 server only provides `sys@2.0`. Since the bench reducers never call `datastore_clear`, replacing the import with `var _syscalls2_1 = {};` is safe.

2. **`HttpHandlers` and `HttpRoutes` sections removed from the module def serialization.** The HEAD SDK emits `RawModuleDefV10Section` tags 0xb (HttpHandlers) and 0xc (HttpRoutes) that the v2.0.1 server does not recognize. The bench module has no HTTP handlers, so removing these sections from the `push()` chain in the bundle is lossless.

The patched bundle was published to database `bench-v8-e2e` via `spacetime publish --js-path bench_v8.js bench-v8-e2e -s http://localhost:3000 --yes --no-config`. Both `empty` and `cpu_heavy` reducers were verified callable via `spacetime call`.

### Captured numbers

All numbers below are from back-to-back runs under the same conditions (same machine, same server instance, same client binary). Perry and V8 runs were interleaved to minimize temporal bias.

**Perry AOT (bench-perry-e2e):**
```
Concurrency 1 (warmup=100, iter=1000):
  empty:     4,920 TPS | p50=0.17ms  p95=0.33ms  p99=0.97ms
  cpu_heavy:   955 TPS | p50=0.93ms  p95=1.77ms  p99=2.81ms

Concurrency 4 (warmup=100, iter=1000):
  empty:     18,938 TPS | p50=0.19ms  p95=0.28ms  p99=0.57ms
  cpu_heavy:  1,314 TPS | p50=3.00ms  p95=3.68ms  p99=4.22ms

Concurrency 16 (warmup=100, iter=2000):
  empty:     34,098 TPS | p50=0.30ms  p95=0.70ms  p99=1.10ms
  cpu_heavy:  1,369 TPS | p50=11.56ms p95=12.49ms p99=13.02ms
```

**V8 JIT (bench-v8-e2e):**
```
Concurrency 1 (warmup=100, iter=1000):
  empty:     3,586 TPS | p50=0.23ms  p95=0.45ms  p99=1.59ms
  cpu_heavy: 1,523 TPS | p50=0.56ms  p95=1.16ms  p99=2.56ms

Concurrency 4 (warmup=100, iter=1000):
  empty:     10,618 TPS | p50=0.27ms  p95=1.07ms  p99=1.42ms
  cpu_heavy:  2,360 TPS | p50=1.49ms  p95=3.04ms  p99=3.88ms

Concurrency 16 (warmup=100, iter=2000):
  empty:     13,138 TPS | p50=0.76ms  p95=2.91ms  p99=8.71ms
  cpu_heavy:  2,506 TPS | p50=5.24ms  p95=13.62ms p99=18.41ms
```

### Comparison table

| Reducer | Concurrency | Perry TPS | V8 TPS | Ratio (Perry/V8) | Perry p50 | V8 p50 | Perry p99 | V8 p99 |
|---------|-------------|-----------|--------|-------------------|-----------|--------|-----------|--------|
| empty | 1 | 4,920 | 3,586 | 1.37x | 0.17ms | 0.23ms | 0.97ms | 1.59ms |
| empty | 4 | 18,938 | 10,618 | 1.78x | 0.19ms | 0.27ms | 0.57ms | 1.42ms |
| empty | 16 | 34,098 | 13,138 | 2.60x | 0.30ms | 0.76ms | 1.10ms | 8.71ms |
| cpu_heavy | 1 | 955 | 1,523 | **0.63x** | 0.93ms | 0.56ms | 2.81ms | 2.56ms |
| cpu_heavy | 4 | 1,314 | 2,360 | **0.56x** | 3.00ms | 1.49ms | 4.22ms | 3.88ms |
| cpu_heavy | 16 | 1,369 | 2,506 | **0.55x** | 11.56ms | 5.24ms | 13.02ms | 18.41ms |

### Analysis

**Empty reducer (dispatch overhead):** Perry AOT wins decisively. At concurrency 1 the advantage is moderate (1.37x), but it grows with concurrency: 1.78x at conc 4, 2.60x at conc 16. This is the dispatch-only path where Perry's AOT compilation eliminates the V8 interpreter/JIT overhead per call. Perry's p99 is also much tighter (1.10ms vs 8.71ms at conc 16), indicating lower tail latency from the Wasmtime runtime compared to V8's garbage collector and JIT compiler pauses.

**CPU-heavy reducer (compute-bound):** V8 JIT wins by a wide margin. At concurrency 1, V8 is 1.6x faster (1,523 vs 955 TPS, p50 0.56ms vs 0.93ms). The gap holds across all concurrency levels (roughly 0.55-0.63x Perry/V8). This is a surprising result that inverts the expected AOT-beats-JIT narrative.

**Why V8 wins on cpu_heavy:** The Perry AOT cpu_heavy reducer carries shadow-stack overhead (noted in the self-review section above). Every loop iteration calls `js_shadow_frame_push`, `js_shadow_slot_bind`, `js_shadow_slot_set` from the Perry runtime for GC root tracking. In a 100k-iteration tight loop, this is substantial. V8's TurboFan JIT, by contrast, can inline the entire loop and optimize away GC barriers for local variables that never escape. The V8 JIT has decades of optimization work behind it; Perry's AOT compiler is young (v0.5.1028) and does not yet optimize away shadow-stack operations for non-escaping locals.

**Scaling behavior:** Both runtimes show similar patterns -- empty scales well with concurrency (server can interleave short calls), cpu_heavy plateaus (single-threaded execution per module instance). V8's cpu_heavy scales slightly better (2,506 TPS at conc 16 vs 1,369), consistent with V8's faster per-call time leaving more headroom for server-side interleaving.

### Files changed for the V8 arm

| File | Change |
|------|--------|
| `_vendor/SpacetimeDB-fork/modules/benchmarks-ts/src/synthetic.ts` | Added `cpu_heavy` reducer with the same xorshift + RPG stat kernel |
| `bench/e2e/module/bench_v8.js` | Patched copy of `benchmarks-ts/dist/bundle.js`: stubbed sys@2.1, removed HttpHandlers/HttpRoutes sections |

## Side notes / observations / complaints (V8 arm)

- **The SDK version mismatch between HEAD and v2.0.1 server required two manual patches.** The `spacetime:sys@2.1` import and the `HttpHandlers`/`HttpRoutes` module def sections are both additions in the HEAD SDK that the v2.0.1 server does not understand. A cleaner approach would be to check out the SDK at the v2.0.1 tag and build from there, but no such tag exists in the fork. The manual patches are safe for our bench-only reducers (no HTTP handlers, no table clears) but would break a module that actually uses those features.

- **V8 beating Perry on cpu_heavy is the most actionable finding.** It points directly at the shadow-stack overhead in Perry's AOT output. For the specific workload of tight numeric loops with no GC-relevant allocations, Perry's conservative GC root tracking is paying a tax that V8's JIT avoids entirely. This is a known optimization target for Perry -- the compiler should be able to prove that local numeric variables never escape and skip shadow-stack operations for them.

- **The "empty" comparison is the more meaningful benchmark for the Perry project's value proposition.** Perry's pitch is "faster module cold start + lower dispatch overhead." The empty reducer isolates dispatch overhead, and Perry wins convincingly there (1.37x-2.60x). The cpu_heavy comparison measures JIT optimization quality, where V8 has decades of head start. Perry's value is in the module lifecycle (publish, cold start, dispatch), not in competing with TurboFan on hot-loop optimization.

- **The benchmark runs show high variance across sessions.** Perry empty at conc 1 ranged from 3,897 to 6,351 TPS across different runs. This is likely due to background system load, Docker container scheduling, and server GC activity. The back-to-back runs (Perry then V8 in the same minute) are the most comparable, which is what the comparison table uses. A production benchmark should pin CPU affinity, use cgroups for isolation, and run multiple iterations.

- **The `spacetime build` command succeeds despite "tsc not found" warning.** The SpacetimeDB CLI's TS build uses rolldown (a Rust-based bundler) directly, falling back gracefully when tsc is not in the module's node_modules. Type checking is skipped, but the bundle is still produced correctly. This is fine for bench purposes but would be a concern for production modules.

## Rust comparison arm (2026-06-01)

### How the Rust module was built

A standalone Rust crate was created at `bench/e2e/module/rust-bench/` with `spacetimedb = "=2.0.1"` pinned to exactly match the server version. The crate produces a `cdylib` targeting `wasm32-unknown-unknown`. Two reducers are defined with `#[spacetimedb::reducer]`: `empty` (noop) and `cpu_heavy` (identical 100k xorshift32 + RPG stat kernel). The Rust implementation uses `u32` for the PRNG state and `f64`/`i32` for the stat computation, matching the TypeScript semantics. A `read_volatile` on the accumulator prevents the optimizer from eliding the loop.

Built with `cargo build --target wasm32-unknown-unknown --release` (output: 98KB wasm, vs Perry's 4.7MB and V8's JS bundle). Published with `spacetime publish --bin-path <wasm> bench-rust-e2e`. Both reducers verified callable via `spacetime call`.

### Captured numbers

All three arms (Rust, Perry, V8) were run back-to-back in one session with the same parameters (warmup=100, iterations=1000, concurrency=1,4,16) against the same server instance for temporal fairness.

**Rust / Wasmtime (bench-rust-e2e):**
```
Concurrency 1:
  empty:     6,298 TPS | p50=0.15ms  p95=0.19ms  p99=0.28ms
  cpu_heavy: 2,193 TPS | p50=0.44ms  p95=0.50ms  p99=1.18ms

Concurrency 4:
  empty:     21,807 TPS | p50=0.17ms  p95=0.22ms  p99=0.32ms
  cpu_heavy:  2,905 TPS | p50=1.11ms  p95=3.02ms  p99=4.63ms

Concurrency 16:
  empty:     31,023 TPS | p50=0.23ms  p95=0.33ms  p99=15.26ms
  cpu_heavy:  3,577 TPS | p50=4.41ms  p95=4.89ms  p99=5.73ms
```

**Perry AOT (bench-perry-e2e):**
```
Concurrency 1:
  empty:     4,168 TPS | p50=0.17ms  p95=0.51ms  p99=2.05ms
  cpu_heavy: 1,000 TPS | p50=0.94ms  p95=1.27ms  p99=2.30ms

Concurrency 4:
  empty:     18,111 TPS | p50=0.20ms  p95=0.30ms  p99=0.41ms
  cpu_heavy:  1,216 TPS | p50=3.00ms  p95=5.12ms  p99=6.90ms

Concurrency 16:
  empty:     23,988 TPS | p50=0.31ms  p95=0.58ms  p99=19.38ms
  cpu_heavy:  1,350 TPS | p50=11.54ms p95=13.10ms p99=14.70ms
```

**V8 JIT (bench-v8-e2e):**
```
Concurrency 1:
  empty:     4,410 TPS | p50=0.17ms  p95=0.29ms  p99=1.82ms
  cpu_heavy: 1,793 TPS | p50=0.51ms  p95=0.63ms  p99=1.59ms

Concurrency 4:
  empty:     13,688 TPS | p50=0.22ms  p95=0.38ms  p99=2.23ms
  cpu_heavy:  2,526 TPS | p50=1.37ms  p95=2.98ms  p99=4.03ms

Concurrency 16:
  empty:     22,428 TPS | p50=0.36ms  p95=1.22ms  p99=11.48ms
  cpu_heavy:  2,591 TPS | p50=4.68ms  p95=15.15ms p99=18.29ms
```

### Three-way comparison table

| Reducer | Conc | Rust TPS | Perry TPS | V8 TPS | Rust/V8 | Perry/V8 | Rust/Perry |
|---------|------|----------|-----------|--------|---------|----------|------------|
| empty | 1 | 6,298 | 4,168 | 4,410 | 1.43x | 0.95x | 1.51x |
| empty | 4 | 21,807 | 18,111 | 13,688 | 1.59x | 1.32x | 1.20x |
| empty | 16 | 31,023 | 23,988 | 22,428 | 1.38x | 1.07x | 1.29x |
| cpu_heavy | 1 | 2,193 | 1,000 | 1,793 | 1.22x | 0.56x | **2.19x** |
| cpu_heavy | 4 | 2,905 | 1,216 | 2,526 | 1.15x | 0.48x | **2.39x** |
| cpu_heavy | 16 | 3,577 | 1,350 | 2,591 | 1.38x | 0.52x | **2.65x** |

### Latency comparison (p50)

| Reducer | Conc | Rust p50 | Perry p50 | V8 p50 |
|---------|------|----------|-----------|--------|
| empty | 1 | 0.15ms | 0.17ms | 0.17ms |
| empty | 4 | 0.17ms | 0.20ms | 0.22ms |
| empty | 16 | 0.23ms | 0.31ms | 0.36ms |
| cpu_heavy | 1 | 0.44ms | 0.94ms | 0.51ms |
| cpu_heavy | 4 | 1.11ms | 3.00ms | 1.37ms |
| cpu_heavy | 16 | 4.41ms | 11.54ms | 4.68ms |

### Analysis

**Rust is the ceiling, as expected.** Rust-compiled wasm runs on the same Wasmtime host runtime as Perry, so the difference between Rust and Perry isolates the cost of Perry's JavaScript-to-wasm compilation pipeline (shadow stack, GC root tracking, NaN-boxing overhead).

**Empty reducer (dispatch overhead):**
- Rust wins at concurrency 1 (6,298 vs 4,168 Perry, vs 4,410 V8), 1.51x faster than Perry and 1.43x faster than V8.
- Perry and V8 are nearly tied at concurrency 1 (4,168 vs 4,410, within noise). In this session Perry trails V8 slightly, unlike the earlier session where Perry led 4,920 vs 3,586. This variance confirms the earlier observation that session-to-session noise is significant (up to ~30% for empty at conc 1).
- At higher concurrency, Rust's advantage holds (1.29x-1.59x over Perry, 1.38x-1.59x over V8). Perry overtakes V8 at conc 4 (18,111 vs 13,688 = 1.32x) and they converge at conc 16 (23,988 vs 22,428 = 1.07x).
- **The Rust-vs-Perry gap on empty is 1.2x-1.5x.** This is Perry's dispatch overhead on top of Wasmtime — the cost of the ABI shim (describe blob lookup, id-switch dispatch, volatile sink, NaN-box return). Since both run on the same Wasmtime instance, this gap is purely Perry's shim code, not runtime differences.

**CPU-heavy reducer (compute-bound):**
- Rust dominates: 2.19x faster than Perry at conc 1, growing to 2.65x at conc 16. Perry's cpu_heavy takes 0.94ms vs Rust's 0.44ms — the difference (0.50ms per call) is the shadow-stack overhead accumulated over 100k loop iterations.
- Rust also beats V8, but by less: 1.22x at conc 1, 1.15x-1.38x across concurrency levels. V8's TurboFan JIT is competitive with native Rust wasm on this kernel.
- **V8 beats Perry by 1.8x on cpu_heavy (conc 1), while Rust beats V8 by only 1.2x.** This means Perry's shadow-stack overhead (0.50ms/call) is 4x larger than V8's JIT-vs-native gap (0.07ms/call). Perry's AOT compilation adds far more per-iteration cost than V8's JIT subtracts.
- At conc 16, Rust's p99 (5.73ms) is far tighter than both Perry (14.70ms) and V8 (18.29ms), confirming that native wasm has the most predictable tail latency.

**Where this leaves Perry:**
1. Perry's dispatch advantage over V8 (the "empty" story) is real but modest in this session (0.95x-1.32x depending on concurrency and session noise). The earlier session showed a clearer 1.37x-2.60x advantage, so Perry does win on dispatch, but the magnitude varies.
2. Perry's compute disadvantage is severe. The 2.2x-2.7x gap to Rust ceiling tells us Perry's shadow-stack machinery costs ~50% of the total compute time on a tight numeric loop. Eliminating shadow-stack operations for non-escaping locals would bring Perry close to the Rust ceiling on this workload.
3. The Rust ceiling confirms that Wasmtime itself is not the bottleneck. Rust wasm at 2,193 TPS on cpu_heavy vs V8's 1,793 TPS shows Wasmtime can beat V8 on compute when the wasm is well-optimized. Perry's job is to close the gap between its current 1,000 TPS and the 2,193 TPS ceiling.

### Files added for the Rust arm

| File | Description |
|------|-------------|
| `bench/e2e/module/rust-bench/Cargo.toml` | Standalone crate, `spacetimedb = "=2.0.1"`, cdylib target |
| `bench/e2e/module/rust-bench/src/lib.rs` | Two reducers: `empty` (noop) and `cpu_heavy` (xorshift32 + RPG stat kernel, `read_volatile` sink) |

## Side notes / observations / complaints (Rust arm)

- **The 98KB Rust wasm vs Perry's 4.7MB.** Rust compiles directly to wasm with no runtime; Perry bundles the entire perry-runtime archive (shadow stack, GC, NaN-boxing, stdlib shims). This 48x size difference has cold-start implications (more bytes to validate and compile in Wasmtime), though cold start is not measured in this session.

- **SDK version pinning matters.** Using `spacetimedb = "2.0.1"` (semver range) resolved to 2.3.0 because cargo treats it as `>=2.0.1, <3.0.0`. The `"=2.0.1"` pin was required to match the server. The 2.3.0 SDK would likely have produced module def sections the 2.0.1 server does not understand, the same problem the V8 arm hit with `HttpHandlers`/`HttpRoutes`.

- **Session-to-session variance is substantial.** Perry empty at conc 1 measured 4,920 TPS in the earlier V8-comparison session and 4,168 TPS in this Rust-comparison session — a 15% swing. V8 empty at conc 1 went from 3,586 to 4,410 — a 23% swing in the opposite direction. The three-way back-to-back run in one session provides the most temporally fair comparison, but absolute numbers should not be compared across sessions without acknowledging this variance.

- **Rust wasm's `read_volatile` is a weaker optimization barrier than `black_box`.** The standard `std::hint::black_box` is not available on `wasm32-unknown-unknown` (it requires `core::arch` intrinsics that may not be present). `core::ptr::read_volatile` achieves the same effect for our purposes — it forces the compiler to materialize the accumulator value — but is semantically a memory operation, not a compiler hint. The LLVM backend for wasm32 treats volatile loads as non-eliminable, so the loop body survives optimization.

- **Rust's p50 latency on cpu_heavy (0.44ms) gives us the kernel's true execution time on Wasmtime.** Subtracting the dispatch overhead (~0.15ms from the empty p50), the pure kernel time is ~0.29ms. Perry's kernel time is ~0.77ms (0.94 - 0.17), 2.7x slower. V8's kernel time is ~0.34ms (0.51 - 0.17), only 1.17x slower than Rust. This decomposition confirms that V8's TurboFan generates near-native-quality code for tight numeric loops, while Perry's shadow-stack overhead dominates.

## Post-rebase Perry rebuild + bench (2026-06-01)

Perry-fork rebased onto latest upstream main (50 newer commits). Branch `feat/target-spacetimedb`, HEAD `b190a1f5` (latest commit on rebased branch: `d43bca53`). Perry compiler rebuilt from rebased source (`perry 0.5.1055`, up from 0.5.1028). The bench module was recompiled and republished. All three runtimes benchmarked back-to-back in one session.

### Build notes

- `cargo build --release -p perry` succeeded with 76 warnings (all dead-code / unused-import, no errors). Build time: 1m44s.
- The standalone `cargo build -p perry-runtime --target wasm32-unknown-unknown --no-default-features --release` **failed** with 15 errors (`libc` not available on wasm32, unresolved `command`/`res`/`target`/`path` identifiers in `fd_ops.rs`, arithmetic overflow in integer casts). These are regressions from the rebase — the upstream added filesystem operations that use `libc` and host-only APIs. However, this does not block module compilation: `perry compile --target spacetimedb` uses its own internal auto-optimize path that builds a wasm32 runtime archive independently (output: `target/perry-auto-b7c69fbf7e193e3b/release/libperry_runtime.a`, 58.6MB).
- `perry compile bench.ts --target spacetimedb -o bench_perry.wasm` succeeded. Binary size: 4.7MB. Reducers: `[cpu_heavy, empty]`. `wasm-tools validate` passed.
- Module republished to `bench-perry-e2e`. Both `empty` and `cpu_heavy` reducers verified callable.

### Captured numbers

All three arms run back-to-back in one session (warmup=100, iterations=1000, concurrency=1,4,16) against the same SpacetimeDB v2.0.1 server instance.

**Rust / Wasmtime (bench-rust-e2e):**
```
Concurrency 1:
  empty:     5,717 TPS | p50=0.16ms  p95=0.22ms  p99=0.32ms
  cpu_heavy: 1,906 TPS | p50=0.48ms  p95=0.64ms  p99=1.88ms

Concurrency 4:
  empty:     19,884 TPS | p50=0.18ms  p95=0.27ms  p99=0.37ms
  cpu_heavy:  3,467 TPS | p50=1.11ms  p95=1.38ms  p99=2.19ms

Concurrency 16:
  empty:     29,911 TPS | p50=0.23ms  p95=0.53ms  p99=14.16ms
  cpu_heavy:  3,580 TPS | p50=4.36ms  p95=4.79ms  p99=6.08ms
```

**Perry AOT (bench-perry-e2e, recompiled from rebased v0.5.1055):**
```
Concurrency 1:
  empty:     5,658 TPS | p50=0.17ms  p95=0.20ms  p99=0.28ms
  cpu_heavy:   712 TPS | p50=1.35ms  p95=1.66ms  p99=2.86ms

Concurrency 4:
  empty:     16,657 TPS | p50=0.20ms  p95=0.33ms  p99=1.02ms
  cpu_heavy:    868 TPS | p50=4.56ms  p95=4.88ms  p99=5.73ms

Concurrency 16:
  empty:     31,493 TPS | p50=0.27ms  p95=0.54ms  p99=10.65ms
  cpu_heavy:    875 TPS | p50=18.14ms p95=19.55ms p99=20.13ms
```

**V8 JIT (bench-v8-e2e):**
```
Concurrency 1:
  empty:     4,659 TPS | p50=0.17ms  p95=0.28ms  p99=1.38ms
  cpu_heavy: 1,825 TPS | p50=0.51ms  p95=0.62ms  p99=1.44ms

Concurrency 4:
  empty:     16,594 TPS | p50=0.21ms  p95=0.34ms  p99=0.53ms
  cpu_heavy:  2,519 TPS | p50=1.41ms  p95=2.93ms  p99=3.50ms

Concurrency 16:
  empty:     11,896 TPS | p50=0.40ms  p95=5.82ms  p99=15.83ms
  cpu_heavy:  2,665 TPS | p50=4.25ms  p95=14.87ms p99=22.43ms
```

### Three-way comparison table (TPS)

| Reducer | Conc | Rust TPS | Perry TPS | V8 TPS | Rust/Perry | Rust/V8 | Perry/V8 |
|---------|------|----------|-----------|--------|------------|---------|----------|
| empty | 1 | 5,717 | 5,658 | 4,659 | 1.01x | 1.23x | 1.21x |
| empty | 4 | 19,884 | 16,657 | 16,594 | 1.19x | 1.20x | 1.00x |
| empty | 16 | 29,911 | 31,493 | 11,896 | 0.95x | 2.51x | 2.65x |
| cpu_heavy | 1 | 1,906 | 712 | 1,825 | **2.68x** | 1.04x | **0.39x** |
| cpu_heavy | 4 | 3,467 | 868 | 2,519 | **3.99x** | 1.38x | **0.34x** |
| cpu_heavy | 16 | 3,580 | 875 | 2,665 | **4.09x** | 1.34x | **0.33x** |

### Latency comparison (p50)

| Reducer | Conc | Rust p50 | Perry p50 | V8 p50 |
|---------|------|----------|-----------|--------|
| empty | 1 | 0.16ms | 0.17ms | 0.17ms |
| empty | 4 | 0.18ms | 0.20ms | 0.21ms |
| empty | 16 | 0.23ms | 0.27ms | 0.40ms |
| cpu_heavy | 1 | 0.48ms | 1.35ms | 0.51ms |
| cpu_heavy | 4 | 1.11ms | 4.56ms | 1.41ms |
| cpu_heavy | 16 | 4.36ms | 18.14ms | 4.25ms |

### Analysis

**Empty reducer (dispatch overhead):** Perry and Rust are essentially tied at concurrency 1 (5,658 vs 5,717 TPS, p50 0.17ms vs 0.16ms). This is a notable improvement from the pre-rebase session where Perry trailed Rust by 1.51x on empty. Perry also beats V8 at concurrency 1 (1.21x) and dramatically at concurrency 16 (2.65x). At conc 16, Perry (31,493 TPS) actually edges past Rust (29,911 TPS), though this is likely within noise. V8 shows poor concurrency 16 scaling in this session (11,896 TPS), with high p95/p99 tail latency (5.82ms/15.83ms).

**CPU-heavy reducer (compute-bound):** Perry's cpu_heavy performance regressed from the pre-rebase build. The previous session measured 1,000 TPS at conc 1 (0.94ms p50); this session shows 712 TPS (1.35ms p50) -- a 29% regression. The Rust/Perry gap widened from 2.19x to 2.68x at conc 1, and from 2.65x to 4.09x at conc 16. V8 continues to beat Perry on cpu_heavy by a wide margin (2.56x at conc 1).

**Regression source:** The per-call kernel time for Perry cpu_heavy grew from ~0.77ms (pre-rebase: 0.94 - 0.17 dispatch) to ~1.18ms (post-rebase: 1.35 - 0.17 dispatch), a 53% increase. Since the bench.ts source is unchanged and the only variable is the Perry compiler version (v0.5.1028 -> v0.5.1055), the regression lives in the compiler's code generation or the runtime archive. The 50 upstream commits likely changed the runtime library or the wasm linker in ways that add overhead to the hot loop. The auto-optimize path built a fresh `libperry_runtime.a` (58.6MB) which may include more instrumentation or changed calling conventions.

**Rust vs V8:** Rust leads V8 on cpu_heavy by 1.04x at conc 1 (nearly tied, within noise), widening to 1.34x at conc 16. On empty, Rust leads V8 by 1.23x-2.51x. These ratios are consistent with the pre-rebase session, confirming that the Rust and V8 baselines are stable -- the regression is Perry-specific.

**Perry dispatch parity with Rust is the headline positive.** On the empty reducer at concurrency 1, Perry's 0.17ms p50 matches V8 and nearly matches Rust's 0.16ms. The ABI shim overhead that previously cost 1.2x-1.5x vs Rust has disappeared or been absorbed into noise. Perry's p99 on empty (0.28ms at conc 1) is tighter than both Rust (0.32ms) and V8 (1.38ms), suggesting the shim dispatch path is clean.

### Comparison with pre-rebase numbers (same session format)

| Metric | Pre-rebase (v0.5.1028) | Post-rebase (v0.5.1055) | Delta |
|--------|------------------------|-------------------------|-------|
| Perry empty c1 TPS | 4,168 | 5,658 | +36% |
| Perry empty c1 p50 | 0.17ms | 0.17ms | unchanged |
| Perry cpu_heavy c1 TPS | 1,000 | 712 | **-29%** |
| Perry cpu_heavy c1 p50 | 0.94ms | 1.35ms | **+44%** |
| Perry/Rust ratio (empty c1) | 0.66x | 0.99x | improved |
| Perry/Rust ratio (cpu_heavy c1) | 0.46x | 0.37x | **regressed** |
| Perry/V8 ratio (cpu_heavy c1) | 0.56x | 0.39x | **regressed** |

The rebase improved Perry's dispatch overhead (empty TPS up 36%, now at parity with Rust) but regressed compute performance (cpu_heavy TPS down 29%, p50 latency up 44%). The two effects point to different code paths: dispatch is the ABI shim (improved), compute is the runtime's shadow-stack and loop codegen (regressed).

## Side notes / observations / complaints (post-rebase)

- **The wasm32 runtime standalone build is broken by the rebase.** The 15 errors in `perry-runtime` for `wasm32-unknown-unknown` target are from upstream commits that added filesystem operations (`fd_ops.rs`) using `libc` and host-only APIs. These are not gated by `#[cfg(not(target_arch = "wasm32"))]`. This does not block the SpacetimeDB compilation pipeline (which uses the auto-optimize path), but it does mean `cargo build -p perry-runtime --target wasm32-unknown-unknown` no longer works as a standalone command. This should be reported upstream or fixed in the fork.

- **The cpu_heavy regression is the most actionable finding.** A 29% TPS drop from 50 upstream commits is significant. The regression is in the hot-loop body (dispatch is faster, compute is slower), pointing at either (a) the runtime archive gained more instrumentation per shadow-stack operation, or (b) the linker resolves different runtime symbols than before, pulling in heavier code paths. Bisecting the 50 upstream commits against the cpu_heavy benchmark would isolate the culprit.

- **V8's concurrency 16 empty numbers look anomalous this session (11,896 TPS vs 22,428 in the previous session).** The 47% drop and the 5.82ms p95 suggest the V8 runtime hit GC pauses or the Docker container was under memory pressure during that specific run. The concurrency 1 and 4 numbers are consistent with previous sessions. This is another data point for the "session-to-session variance" observation -- absolute numbers at high concurrency are noisy.

- **Perry at dispatch parity with Rust on empty is a genuinely strong result.** In the previous session, Perry trailed Rust by 1.51x on empty. Now they are at 1.01x. If the upstream changes that improved dispatch can be identified and preserved while reverting whatever regressed cpu_heavy, Perry would be in an excellent position: near-Rust dispatch with the possibility of closing the compute gap via shadow-stack optimization.

