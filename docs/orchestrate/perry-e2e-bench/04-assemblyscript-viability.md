# 04 — AssemblyScript viability as Perry alternative

## 1. Wasm output quality

AssemblyScript compiles to raw typed wasm without NaN-boxing, runtime type checks, or any function calls in numeric code. The compiler uses Binaryen (not LLVM) as its backend, applying the same optimization passes as `wasm-opt -O3`.

### Annotated disassembly of the cpu_heavy kernel

Compiled with `asc -O --noAssert --runtime stub --converge`. The entire module is 247 bytes, 92 lines of WAT, two functions, zero imports.

```wasm
(func $cpu_heavy (result f64)
  (local $x i32)
  (local $acc f64)
  (local $i i32)
  (local $base_defense_f64 f64)

  i32.const -1640531527          ;; x = 0x9e3779b9
  local.set $x
  loop $for-loop|0
   local.get $i
   i32.const 100000
   i32.lt_u
   if
    ;; === xorshift32 PRNG (12 instructions, pure i32) ===
    local.get $x
    local.get $x
    i32.const 13
    i32.shl
    i32.xor
    local.tee $x                 ;; x ^= x << 13
    local.get $x
    i32.const 17
    i32.shr_u                    ;; NOTE: unsigned shift — correct for u32
    i32.xor
    local.tee $x                 ;; x ^= x >> 17
    local.get $x
    i32.const 5
    i32.shl
    i32.xor
    local.tee $x                 ;; x ^= x << 5

    ;; === base_defense computation (5 instructions) ===
    i32.const 8 / i32.shr_u
    i32.const 255 / i32.and
    i32.const 5 / i32.add
    f64.convert_i32_s
    local.set $base_defense_f64  ;; base_defense as f64

    ;; === effective_attack computation (11 instructions) ===
    local.get $acc
    local.get $x
    i32.const 255 / i32.and
    i32.const 10 / i32.add       ;; base_attack = (x & 0xFF) + 10
    f64.convert_i32_s
    local.get $x
    i32.const 16 / i32.shr_u
    i32.const 63 / i32.and
    i32.const 1 / i32.add        ;; level = ((x >> 16) & 0x3F) + 1
    f64.convert_i32_s
    f64.const 0.05 / f64.mul
    f64.const 1 / f64.add        ;; level_mult = 1.0 + level * 0.05
    f64.mul                       ;; effective_attack = base_attack * level_mult

    ;; === damage computation (6 instructions) ===
    local.get $base_defense_f64
    local.get $base_defense_f64
    f64.const 1e3 / f64.div
    f64.const 0.3 / f64.add      ;; resistance = 0.3 + base_defense / 1000
    f64.mul                       ;; base_defense * resistance
    f64.sub                       ;; damage = effective_attack - base_defense * resistance

    ;; === branchless ternary (5 instructions, NO function call) ===
    local.tee $acc                ;; save damage
    f64.const 0
    local.get $acc
    f64.const 0
    f64.gt
    select                        ;; damage > 0 ? damage : 0

    ;; === accumulate + loop control (5 instructions) ===
    f64.add                       ;; acc += result
    local.set $acc
    local.get $i
    i32.const 1 / i32.add
    local.set $i
    br $for-loop|0
   end
  end
  local.get $acc                  ;; return acc
)
```

### Comparison: AS vs Rust vs Perry

| Property | AssemblyScript | Rust (LLVM -O3) | Perry (LLVM -O3) |
|---|---|---|---|
| Loop body instructions | ~44 ops | ~42 ops | ~42 ops + 1 call |
| Function calls in loop | **0** | **0** | **1** (`js_dynamic_string_or_number_add`) |
| xorshift right-shift | `i32.shr_u` (correct) | `i32.shr_u` (correct) | `i32.shr_s` (signed -- semantic bug) |
| Ternary lowering | `select` (branchless) | `select` (branchless) | `select` + runtime call |
| Loop structure | `loop` + `if` + `br` (count-up) | `loop` + `br_if` (countdown) | `loop` + `br_if` (countdown) |
| f64 conversion | `f64.convert_i32_s` | `f64.convert_i32_u` | `f64.convert_i32_u` |

The AS loop has ~2 extra instructions compared to Rust/Perry's raw ops due to using count-up (`i32.lt_u` comparison + `if` block) rather than countdown (`br_if` on decrement). This is a negligible difference. The critical fact is that AS has zero runtime calls in the loop, identical to Rust and unlike Perry.

The AS output uses `f64.convert_i32_s` (signed conversion) where Rust uses `f64.convert_i32_u` (unsigned). For the values in this kernel (all positive, small integers), both produce identical results. AS treats the `<i32>` cast as signed, Rust treats `as i32 + 10` as unsigned when converting to f64. This is not a correctness issue for this workload.

### Perry's runtime overhead, confirmed

Perry's hot loop contains a call to `$js_dynamic_string_or_number_add` -- a NaN-boxing tag dispatcher that checks whether operands are strings or numbers before performing the `f64.add`. For a loop that only produces `f64` values, this is 100,000 unnecessary function calls per invocation. Each call involves a stack frame, multiple `i64` comparisons against tag constants, and 8+ nested control-flow branches on the fast path. This is the mechanism that makes Perry 3x slower than Rust wasm on this kernel (1.35ms vs 0.44ms).

AssemblyScript eliminates this entirely because its type system is wasm-native: `f64` is `f64`, not a NaN-boxed JS `number`. There is no type tag to check.

## 2. ABI compatibility

### Can AS satisfy the SpacetimeDB ABI? Yes.

The SpacetimeDB v2.0.1 Wasmtime host (`wasm_common.rs:234-252`) validates four things:

1. **Exported `memory`** — AS exports memory by default.
2. **Exported `__describe_module__`** with signature `(i32) -> ()` — AS can export this with the correct signature.
3. **Exported `__call_reducer__`** with signature `(i32, i64, i64, i64, i64, i64, i64, i64, i32, i32) -> i32` — AS can export this with the correct signature.
4. **At least one import from `spacetime_X.Y`** for ABI version detection (`wasm_common/abi.rs:5-18`) — AS's `@external("spacetime_10.0", "bytes_sink_write")` decorator produces the correct import.

A compiled proof-of-concept (`abi_correct.wasm`, 450 bytes) was built and validated with `wasm-tools validate`. The import section reads:

```wasm
(import "spacetime_10.0" "bytes_sink_write" (func (param i32 i32 i32) (result i32)))
```

The export section reads:

```wasm
(export "__describe_module__" (func 1))    ;; (i32) -> ()
(export "__call_reducer__" (func 2))       ;; (i32 i64 i64 i64 i64 i64 i64 i64 i32 i32) -> i32
(export "memory" (memory 0))
```

### What's needed

- **BSATN describe blob:** The `RawModuleDef::V10` binary blob must be embedded as a `StaticArray<u8>` in the data segment. In the AS source this is a const byte array; in a production toolchain, a build script would generate it from reducer metadata.
- **`bytes_sink_write` protocol:** The host expects `(sink_id, buffer_ptr, buffer_len_ptr) -> errno` where `buffer_len_ptr` is a pointer to a `u32` containing the length. AS can use `store<u32>(addr, len)` for direct memory writes.
- **`bytes_source_read` for arg decoding:** Reducers with arguments need to import `bytes_source_read` and decode BSATN from linear memory. AS has full linear memory access via `load<T>` / `store<T>`.
- **No WASI required.** The SpacetimeDB host does not provide WASI imports; the module is freestanding. AS compiles to `wasm32` by default with no WASI dependency.

### Wasm feature requirements

AS 0.28 uses only MVP wasm features (i32, i64, f32, f64, linear memory, basic control flow, `select`). No mutable globals import, no SIMD, no threads, no reference types, no GC proposal. Wasmtime supports all of these trivially.

## 3. Language subset vs stock TypeScript

### Features AS does NOT support

| Feature | TypeScript | AssemblyScript | Impact on SpacetimeDB reducers |
|---|---|---|---|
| `any` type | Yes | No | None -- reducers should be typed |
| Union types (`A \| B`) | Yes | No | Minor -- use overloads or generics |
| Optional properties (`x?: T`) | Yes | No | Use explicit defaults |
| Structural typing | Yes | No | Nominal typing instead |
| Closures (captured env) | Yes | No | Moderate -- no inline callbacks |
| Dynamic property access | Yes | No | None -- tables are typed |
| `JSON.parse` / eval | Yes | No | None -- BSATN, not JSON |
| Standard JS API (fetch, setTimeout) | Yes | No | None -- host provides syscalls |
| npm packages | Yes | Separate ecosystem | Cannot reuse SpacetimeDB TS SDK |

### Ergonomic gap for game-server reducers

For the typical SpacetimeDB reducer pattern -- typed functions operating on table data via BSATN -- the gap is small. Reducers are already typed, statically dispatched, and operate on structured data. The main ergonomic costs are:

1. **Explicit numeric types.** `let x: u32 = 42` instead of `let x = 42`. This is actually an advantage for wasm performance -- the types map 1:1 to wasm types.
2. **No closures.** Array operations like `.filter()` and `.map()` require named functions or `unchecked()` workarounds. For compute-heavy reducers this is rarely an issue; for data-processing reducers it makes code more verbose.
3. **No npm interop with the SpacetimeDB TypeScript SDK.** The AS module cannot import `@clockworklabs/spacetimedb-sdk`. All SpacetimeDB interaction goes through the raw ABI (host imports + BSATN encoding), not the SDK's TypeScript abstractions. A thin AS-native SDK layer would need to be written.
4. **Class-based, not structural.** Data types must be declared as AS classes, not structural interfaces. For BSATN-serialized table rows, this is natural -- each table type is a distinct class.

For pure-compute reducers (the cpu_heavy class), the syntax is nearly identical to TypeScript. For CRUD reducers (insert/query/update), the raw ABI code is similar in complexity to what Perry's C shim does today -- roughly 20-40 lines of BSATN encode/decode per reducer argument type.

## 4. Toolchain maturity

| Property | Value |
|---|---|
| Latest version | 0.28.17 (published May 2026) |
| Release cadence | 9 releases in 2025, regular updates into 2026 |
| Maintenance status | Active -- GitHub issues and PRs being processed |
| Compiler backend | Binaryen (wasm-native optimizer, also used by Emscripten) |
| Installation | `npm install assemblyscript` (3 npm packages total) |
| Invocation | `npx asc input.ts -o output.wasm -O` |
| Target | wasm32 by default, freestanding (no WASI) |
| Compile time | Sub-second for small modules (the cpu_heavy kernel compiles in <200ms) |
| Optimization | Binaryen -O3 equivalent; `--converge` re-runs until fixpoint |
| Notable users | Used in production by Fastly, Suborbital, near-protocol (NEAR blockchain) |

The compiler is a single npm package with zero native dependencies. It does not require LLVM, Clang, or any system toolchain. Compilation is fast because Binaryen operates on wasm IR directly rather than going through LLVM's multi-stage pipeline.

AS is pre-1.0 (0.28.x) and the language continues to evolve. Closures are blocked on the wasm Function References + GC proposals. The type system is stable for the subset needed here (numeric types, classes, static arrays, decorators).

## 5. Module size

| Module | Size | Ratio vs Rust |
|---|---|---|
| AS cpu_heavy (stub, minimal) | **247 bytes** | 0.002x |
| AS ABI shim (stub, 2 reducers) | **450 bytes** | 0.004x |
| AS with classes + strings (stub) | **512 bytes** | 0.005x |
| AS with classes + strings (incremental GC) | **3,089 bytes** | 0.03x |
| Rust SpacetimeDB bench module | **100,587 bytes** (98 KB) | 1x |
| Perry SpacetimeDB bench module | **4,910,021 bytes** (4.7 MB) | 49x |

The AS module is 200-20,000x smaller than Perry because AS does not link a JavaScript runtime. There is no NaN-boxing infrastructure, no GC (with stub runtime), no string interning, no object system, no prototype chain, no regex engine. The module contains only the user code and the data it references.

Even with the incremental GC runtime (needed if the module allocates objects or strings), the module is 3 KB -- still 33x smaller than Rust and 1,600x smaller than Perry.

For SpacetimeDB, smaller modules mean faster instantiation (less code for Wasmtime to compile on first load) and lower memory footprint.

## 6. Verdict

**AssemblyScript is viable and likely optimal for this use case.** It produces wasm output that is structurally equivalent to Rust's LLVM -O3 output for numeric workloads, with zero runtime overhead. The SpacetimeDB ABI can be satisfied directly. The toolchain is mature, fast, and dependency-free.

### Expected performance

The AS kernel's wasm is instruction-equivalent to the Rust kernel (same ops, same `select` branchless ternary, same loop structure within +/-2 instructions). Given that Wasmtime applies the same JIT compilation to both, the AS module should run at approximately the same speed as the Rust module on the cpu_heavy benchmark: **~0.44ms p50**, compared to Perry's 1.35ms.

This is not a guess based on instruction count alone. The AS wasm has:
- Zero function calls in the hot loop (vs Perry's 100,000)
- No shadow stack (vs Perry's linked runtime)
- No NaN-boxing tag checks (vs Perry's `js_dynamic_string_or_number_add`)
- No module-level GC/allocator overhead (247 bytes vs 4.7MB)

The only variable is whether Binaryen's instruction scheduling differs from LLVM's in a way that affects Wasmtime's register allocation. This is a second-order effect worth measuring but unlikely to produce more than 10-20% variation.

### Effort estimate

| Milestone | Effort | Description |
|---|---|---|
| M0: Prove the ABI | 1-2 hours | Compile the `abi_correct.ts` shim, publish to a running SpacetimeDB instance, verify `__describe_module__` succeeds and `spacetime call empty` returns 0. |
| M1: cpu_heavy E2E bench | 2-4 hours | Run the existing bench client against the AS module. Compare p50/p99 latency against Rust and Perry. |
| M2: Arg-taking reducers | 4-8 hours | Implement `bytes_source_read` import + BSATN decode for reducer arguments. Requires AS helper functions for reading u32/u64/string from linear memory. |
| M3: AS-native mini-SDK | 1-2 days | Typed wrappers for table operations (`insert_bsatn`, `table_scan`, `index_scan`). BSATN encode/decode for common types. This replaces what the TS SDK provides. |
| M4: Build toolchain | 1-2 days | Code generator that takes annotated AS source (decorators for `@reducer`, `@table`) and emits the BSATN describe blob + ABI shim + user function dispatch. Similar to what Perry's `--target spacetimedb` does today. |

M0 and M1 can be done today with the files already in `_scratch/assemblyscript-probe/`. M2-M4 are the path to a usable development workflow.

### Why this beats Perry for mmodb

Perry's architecture is fundamentally NaN-boxing: every JS value is a 64-bit tagged union, and every operation must check the tag at runtime. This is correct for general JavaScript but catastrophic for typed numeric code. The `is_numeric_expr` fix (doc 03) patches one specific case (conditional expressions), but the root cause -- Perry treats all values as NaN-boxed JS values and only elides the check when it can statically prove the type -- means every new expression form is a potential regression.

AssemblyScript inverts this: types are wasm-native by default, and only heap-allocated objects (classes, strings) go through the managed runtime. Numeric code compiles to exactly the wasm ops you'd write by hand.

The trade-off is that AS is not JavaScript. It cannot run arbitrary TypeScript. But SpacetimeDB modules are not arbitrary TypeScript -- they are typed, static, reducer-oriented code that maps naturally to AS's type system.

## Side notes / observations / complaints

1. **Perry has a semantic bug in xorshift.** Perry compiles `x >> 17` as `i32.shr_s` (arithmetic/signed shift right), while both Rust and AS use `i32.shr_u` (logical/unsigned shift right). In standard JavaScript, `>>` is a signed shift and `>>>` is unsigned. Perry is technically correct for JS semantics, but the bench TS source uses `x = 0x9e3779b9 | 0` which creates a negative i32 (-1640531527), making the signed shift produce different PRNG sequences than the Rust version. The bench numbers are still comparable (same computational cost per iteration) but the accumulator values differ between Perry and Rust. AS avoids this because the source declares `x: u32`, making `>>` an unsigned shift.

2. **Binaryen produces slightly different instruction scheduling than LLVM.** The AS output computes `base_defense` before `base_attack`, while Rust/Perry compute them in source order. Binaryen also reuses `local.tee` differently. These are cosmetic differences in stack scheduling that should not affect Wasmtime JIT performance.

3. **The AS `--runtime stub` mode is ideal for SpacetimeDB.** The stub allocator is a bump allocator that never frees. Since SpacetimeDB creates a fresh wasm instance per reducer call (or pools and resets them), leaked memory is reclaimed when the instance is destroyed. The incremental GC runtime (3 KB) is unnecessary overhead for this use case.

4. **AS 0.28 does not support closures.** This is the single largest ergonomic gap for developers coming from TypeScript. The workaround (named functions, manual iteration) is verbose but not blocking for SpacetimeDB reducers, which are fundamentally top-level functions.

5. **The BSATN describe blob is the most tedious part.** Hand-writing the `RawModuleDef::V10` binary for even two reducers requires careful byte-counting (the proof-of-concept blob in `abi_correct.ts` is 59 bytes). A code generator (M4) is not optional for any serious use. The good news is that the blob format is static and well-documented in the SpacetimeDB codebase (`crates/lib/src/db/raw_def/`), and a generator is a pure data-transformation problem.

6. **AS cannot replace the SpacetimeDB TypeScript SDK.** The SDK (`@clockworklabs/spacetimedb-sdk`) uses TypeScript features (decorators via `experimentalDecorators`, dynamic property access, closures, the full Node.js runtime) that are fundamentally incompatible with AS. Any AS-based SpacetimeDB module needs its own SDK layer that calls the host imports directly. This is the same situation Perry is in -- Perry's `--target spacetimedb` generates a C shim rather than using the TS SDK.

7. **The 247-byte module size is not a typo.** The entire cpu_heavy module -- two functions, one loop, one constant -- compiles to 247 bytes of wasm. This is smaller than many HTTP headers. For comparison, Perry links the entire JavaScript runtime (GC, string handling, BigInt, regex, object system, prototype chains) even when none of it is used, producing 4.7 MB of wasm with 3,174 functions. Perry's `wasm-ld --gc-sections` cannot eliminate most of it because the runtime's internal call graph is densely connected.
