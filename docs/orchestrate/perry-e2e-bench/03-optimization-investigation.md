# Perry cpu_heavy optimization investigation

## 1. LLVM optimization level: -O3, confirmed

Perry uses `-O3` at every stage of the compilation pipeline. There are two compilation paths, both at maximum optimization:

**Per-module path (what `--target spacetimedb` uses):**
The `.ll` text IR is compiled to `.o` via `clang -c -O3 -fno-math-errno -target wasm32-unknown-unknown`. The flag is hardcoded at `perry-codegen/src/linker.rs:67`:
```rust
let mut clang_args = vec!["-c".to_string(), "-O3".to_string()];
```

The SpacetimeDB ABI shim (the `__describe_module__` / `__call_reducer__` C source) is also compiled with `-O3` at `perry/src/commands/compile/spacetimedb.rs:280`:
```rust
.arg("-O3")
```

**Whole-program bitcode-link path (NOT used by spacetimedb target, but available via `PERRY_LLVM_BITCODE_LINK=1`):**
This path runs `opt -O3` on the linked bitcode at `linker.rs:683`, then `llc -O3 -filetype=obj` at `linker.rs:703`. Both at -O3.

The spacetimedb target resolves to triple `wasm32-unknown-unknown` at `codegen/helpers.rs:310`. The optimization level is not the problem.

## 2. Wasm disassembly analysis: the hot loop

The `perry_fn_bench_ts__cpu_heavy` function starts at line 255 of the wasm text. The complete function body is 76 wasm instructions, with a single `loop` block containing the hot path. Here is the annotated hot loop:

```wasm
(func $perry_fn_bench_ts__cpu_heavy (result f64)
  (local i32 i32 f64 f64)           ;; x, i, acc, temp
  i32.const -1640531527              ;; x = 0x9e3779b9 (golden ratio seed)
  local.set 0
  i32.const 100000                   ;; i = 100000 (countdown)
  local.set 1
  f64.const 0x0p+0                   ;; acc = 0.0
  local.set 2
  loop                               ;; @1: main loop
    local.get 2                      ;; push acc (for f64.add at end)

    ;; === xorshift32 PRNG (13 instructions, pure i32) ===
    local.get 0                      ;; x
    i32.const 13 / i32.shl           ;; x << 13
    local.get 0 / i32.xor           ;; x ^= x << 13
    local.tee 0
    i32.const 17 / i32.shr_s        ;; x >> 17
    local.get 0 / i32.xor           ;; x ^= x >> 17
    local.tee 0
    i32.const 5 / i32.shl           ;; x << 5
    local.get 0 / i32.xor           ;; x ^= x << 5
    local.tee 0

    ;; === level computation + level_mult (7 instructions) ===
    i32.const 16 / i32.shr_u        ;; x >> 16
    i32.const 63 / i32.and          ;; & 0x3f
    i32.const 1 / i32.add           ;; level = ... + 1
    f64.convert_i32_u                ;; (f64)level
    f64.const 0.05 / f64.mul        ;; level * 0.05
    f64.const 1.0 / f64.add         ;; level_mult = 1.0 + level * 0.05

    ;; === base_attack (4 instructions) ===
    local.get 0                      ;; x
    i32.const 255 / i32.and         ;; & 0xff
    i32.const 10 / i32.add          ;; base_attack = (x & 0xff) + 10
    f64.convert_i32_u                ;; (f64)base_attack

    ;; === effective_attack (1 instruction) ===
    f64.mul                          ;; effective_attack = base_attack * level_mult

    ;; === base_defense + resistance (6 instructions) ===
    local.get 0                      ;; x
    i32.const 8 / i32.shr_u         ;; x >> 8
    i32.const 255 / i32.and         ;; & 0xff
    i32.const 5 / i32.add           ;; base_defense = ((x >> 8) & 0xff) + 5
    f64.convert_i32_u                ;; (f64)base_defense
    local.tee 3                      ;; save to local 3

    ;; === resistance (3 instructions) ===
    f64.const 1000.0 / f64.div      ;; base_defense / 1000
    f64.const 0.3 / f64.add         ;; resistance = 0.3 + base_defense / 1000

    ;; === damage (2 instructions) ===
    local.get 3 / f64.mul           ;; base_defense * resistance
    f64.sub                          ;; damage = effective_attack - base_defense * resistance

    ;; === ternary: damage > 0 ? damage : 0 (5 instructions) ===
    local.tee 3                      ;; save damage
    f64.const 0.0                    ;; push 0.0 (else value)
    local.get 3                      ;; push damage (for comparison)
    f64.const 0.0                    ;; push 0.0
    f64.gt                           ;; damage > 0 ?
    select                           ;; branchless: pick damage or 0.0

    ;; === THE BOTTLENECK: unnecessary js_number_coerce ===
    call $js_number_coerce           ;; <-- 100k calls, each ~20ns overhead

    ;; === accumulate + loop control ===
    f64.add                          ;; acc += ...
    local.set 2                      ;; store acc
    local.get 1                      ;; i
    i32.const -1 / i32.add          ;; i--
    local.tee 1
    br_if 0                          ;; if i != 0, goto @1
  end
  local.get 2                        ;; return acc
)
```

**Shadow-stack calls: ZERO.** There is not a single `js_shadow_frame_push`, `js_shadow_frame_pop`, or `js_shadow_slot_set` call in the entire function, nor anywhere in the 1M-line wasm module. The `--gc-sections` linker flag in the spacetimedb path (`spacetimedb.rs:513`) garbage-collects the entire shadow-stack machinery (and indeed the entire GC) because `cpu_heavy` never allocates heap objects. The shadow-stack hypothesis is ruled out for this benchmark.

**One function call in the hot loop: `js_number_coerce`.** This is the sole performance bottleneck.

## 3. Root cause: missing `Expr::Conditional` case in `is_numeric_expr`

The call chain is:

1. The TS source computes `damage > 0 ? damage : 0` (an `Expr::Conditional`).
2. This conditional is the right-hand operand of `acc + (...)` (an `Expr::Binary { op: Add }`).
3. At `binary.rs:195-207`, the Add lowering asks `is_numeric_expr(ctx, right)`. If the right operand is not provably numeric, it wraps it in `js_number_coerce(value)` before the `fadd`.
4. `is_numeric_expr` (`type_analysis.rs:589-673`) has no arm for `Expr::Conditional`. The default case at line 672 returns `false`.
5. Therefore the add path wraps the conditional result -- which is always a plain `f64` (`damage` or `0.0`) -- in a call to `js_number_coerce`.

The `js_number_coerce` function (`perry-runtime/src/builtins/numbers.rs:245`) is a NaN-box tag dispatcher. For a plain f64 that is not a NaN-box sentinel, it falls through a chain of tag checks (undefined, null, bool, string, int32, bigint, pointer) to the final `else` branch at line 325: `value` -- returning the input unchanged. In the wasm, this function:
- Allocates a 48-byte stack frame (`global.get $__stack_pointer; i32.const 48; i32.sub`)
- Performs `i64.reinterpret_f64` and multiple 64-bit comparisons against tag constants
- Has 9 nested `block`/`br_if` control-flow levels
- On the fast path (plain f64), takes the 8th branch exit

Even the fast path costs approximately 10-20 wasm instructions per call, plus the function-call overhead itself (frame setup/teardown, spills). At 100k iterations, this is 100k unnecessary function calls adding approximately 0.3-0.5ms to a function that Rust wasm does in 0.44ms total.

## 4. The compilation pipeline

The pipeline for `--target spacetimedb`:

```
bench.ts → SWC parse → AST → perry-hir lower → HIR
  → perry-codegen compile_module → LLVM IR (.ll text)
    → clang -c -O3 --target=wasm32-unknown-unknown → .o (relocatable wasm)
      → wasm-ld --no-entry --gc-sections → bench_perry.wasm
```

With `libperry_runtime.a` (pre-built for `wasm32-unknown-unknown`) linked in by wasm-ld.

**Where the problem is introduced:** At the codegen stage (`perry-codegen`), when `compile_module` lowers `Expr::Binary { op: Add, ... }` at `expr/binary.rs:195-207`. The `is_numeric_expr` predicate fails to recognize `Expr::Conditional` as numeric, so the codegen wraps the conditional's result in a `call @js_number_coerce` before the `fadd`.

**Why LLVM cannot optimize it away:** The `js_number_coerce` function body is in `libperry_runtime.a`, compiled separately. In the per-module compilation path (which spacetimedb uses), `clang -c -O3` only sees the user module's `.ll` -- it cannot inline or DCE a function whose body lives in a separate archive. The link step is `wasm-ld` (a linker, not an optimizer) -- it does not run LTO passes.

The bitcode-link path (`PERRY_LLVM_BITCODE_LINK=1`) WOULD merge user IR and runtime bitcode, run `opt -O3` on the combined module, and potentially inline + DCE `js_number_coerce` (since the fast-path is a simple "check tag bits, return input"). But the spacetimedb target does not use the bitcode-link path.

## 5. Actionable findings

### Fix 1 (codegen, high impact, safe): Add `Expr::Conditional` to `is_numeric_expr`

In `perry-codegen/src/type_analysis.rs`, add an arm to `is_numeric_expr`:

```rust
Expr::Conditional { then_expr, else_expr, .. } =>
    is_numeric_expr(ctx, then_expr) && is_numeric_expr(ctx, else_expr),
```

This mirrors the existing pattern in `is_definitely_string_expr` at line 931 of the same file. When both branches of a ternary are provably numeric (like `damage > 0 ? damage : 0` where both `damage` and `0` are numeric), the conditional result is also numeric, and the `js_number_coerce` wrapper is elided.

This single change would eliminate the `call $js_number_coerce` from the hot loop, replacing the function body with:

```wasm
    select                ;; branchless pick damage or 0.0
    f64.add               ;; acc += result (no coerce call)
```

**Expected impact:** The 100k `js_number_coerce` calls disappear entirely. Each call costs roughly 5-10 wasm instruction cycles plus call overhead. Conservative estimate: 0.3-0.5ms saved on the 0.94ms total, bringing Perry to 0.4-0.6ms -- competitive with or beating V8 (0.51ms) and Rust wasm (0.44ms).

### Fix 2 (alternative/complementary): Use bitcode-link for spacetimedb

Wire the spacetimedb target to use the existing `PERRY_LLVM_BITCODE_LINK` pipeline (`linker.rs:600-734`). This would:
1. Emit user `.ll` instead of `.o` (`emit_ir_only: true`)
2. Build `libperry_runtime` as `.bc` instead of `.a`
3. Run `llvm-link` to merge user + runtime bitcode
4. Run `opt -O3` on the merged module (inlines `js_number_coerce` away, plus every other trivial runtime call)
5. Run `llc -filetype=obj -O3` to emit a single `.o`
6. Feed that single `.o` to `wasm-ld`

This is the heavier approach but would catch ALL similar patterns, not just the conditional case. With whole-program LTO, LLVM would inline `js_number_coerce`, see that the fast-path is just "return input", and DCE the entire call to a no-op. It would also inline other small runtime helpers.

**Trade-off:** Longer compile time (whole-program optimization), but the wasm binary would be smaller (dead-code elimination across the runtime) and faster.

### Fix 3 (complementary): Also add `Expr::Logical` to `is_numeric_expr`

The `||` and `&&` operators (`Expr::Logical`) are similarly missing from `is_numeric_expr`. Patterns like `x || 0` or `x && computeValue()` would also benefit. The same recursive approach works: numeric if both branches are numeric.

## 6. Module bloat

The compiled `bench_perry.wasm` contains 3,174 functions and over 1M lines of wasm text, despite the user source being 40 lines with two trivial functions. The entire `perry-runtime` (GC, string handling, regex, object system, BigInt, timers, streams, etc.) is statically linked in. `wasm-ld --gc-sections` cannot eliminate most of it because the runtime's internal call graph is densely connected.

With the bitcode-link path (Fix 2), `opt -O3`'s aggressive inter-procedural DCE would strip unreachable runtime code before the `.o` is produced, likely reducing the module to a few hundred functions and a much smaller binary.

## Side notes / observations / complaints

1. The `is_numeric_expr` gap for `Expr::Conditional` is not specific to wasm32 -- it affects every target. Native x86-64/aarch64 builds of Perry are also inserting `js_number_coerce` calls inside ternary expressions that are provably numeric. The fix benefits all platforms.

2. The `js_number_coerce` function is marked `#[inline]` in the Rust source (per the comment at `numbers.rs:243`), but this only matters for the bitcode-link path where LLVM can actually see the body. For the per-module path, the function is an opaque external call that LLVM cannot optimize across.

3. The LLVM IR emitted by Perry's codegen is textual `.ll` (not bitcode), written to a temp file, then compiled by shelling out to `clang`. This is functional but means Perry never uses the LLVM C API or runs custom optimization passes -- it relies entirely on `clang -O3` for optimization. For per-module compilation this is fine; for cross-module optimization (like inlining runtime helpers), the bitcode-link path is the existing solution.

4. The wasm `select` instruction for the ternary is optimal -- LLVM lowered the `phi`-based conditional to a branchless `select`, which is exactly what you want. The problem is exclusively the `js_number_coerce` call wrapping the result.

5. The `is_numeric_expr` function already has special handling for `Expr::Binary { op: Add }` (recursive check, line 614-618), `Expr::Call` (function return type, line 662-671), `Expr::PropertyGet` (class field type, line 628-643), and `Expr::IndexGet` (array element type, line 648-658). The `Conditional` case is a natural addition to this existing pattern of type-narrowing.

6. The shadow-stack cost (hypothesis b from the brief) is zero for the spacetimedb wasm target. The `--gc-sections` linker flag eliminates all `js_shadow_*` symbols because no user function in the benchmark reaches the GC or shadow-stack infrastructure. This is a clean architectural property of the freestanding wasm target, not an accident.

7. Perry's `refine_type_from_init` function (`type_analysis.rs:34`) already handles numeric refinement for `Expr::Number`, `Expr::Integer`, and `Expr::Binary` initializers, but does not handle `Expr::Conditional`. A local like `let x = cond ? 1 : 2` would not get its type refined to `Number`, causing downstream `is_numeric_expr` checks to fail on `x`. This is a second instance of the same gap, affecting locals rather than inline expressions.
