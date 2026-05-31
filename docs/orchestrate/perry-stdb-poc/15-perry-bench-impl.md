# 15 — Perry bench: implementation log + TWO blocking findings (DB-1 fired; dispatch-witness arg-mismatch)

**Status:** Honest partial with two hard findings; **no numbers, and the dispatch is NOT yet end-to-end proven.**

1. **Dispatch code implemented, builds clean.** Perry's no-op `__call_reducer__` is replaced by a real `id==0 → call <perry_fn> → volatile sink` dispatcher plus per-reducer describe-blob naming. `cargo build --bin perry` EXIT 0.
2. **FINDING A — DB-1 circuit-breaker FIRED on every loop-shaped kernel.** The design's `bigint` xorshift/mix kernel — AND the `number` fallback — fail the `wasm-ld` link with `undefined symbol: js_*`: a loop with a mutable accumulator pulls the M3-gated wasm32 runtime. Per the binding circuit-breaker I STOPPED, did not build the runtime archive. **There is no compute-kernel `.wasm` to bench.**
3. **FINDING B — the dispatch is NOT proven end-to-end.** The only kernel that links (M1's `add(a,b)`) takes ARGS, and the shim declares the reducer `extern long long fn(void)` (no-arg). wasm-ld resolved the arg/no-arg mismatch to a **`$signature_mismatch:...` stub whose body is `unreachable`** — so `__call_reducer__` calls a trap, not the real `add`. The dispatch *wiring* (discovery → symbol → injected `call` → survives gc) is demonstrated, but it has NOT been shown to call a real reducer body, because the no-arg kernels that would match the shim's signature all fire DB-1, and the one kernel that links has the wrong arity. The two findings interlock: I cannot exhibit a single kernel that both links AND matches the no-arg shim.

The net: the dispatch is built and partially demonstrated, but the first-number milestone is blocked on the wasm32 runtime archive (Finding A), and full dispatch proof is blocked on the same thing (need a no-arg amputating kernel, which doesn't exist without the runtime). **No numbers captured.**

**Date:** 2026-06-01.
**Verified against:** perry-fork `feat/target-spacetimedb` (working tree, base `42ae9659`); SpacetimeDB-fork `feat/perry-release-engine` @ `0f6824348`.
**Toolchain (all green):** clang 22.1.5, wasm-ld (LLD) 22.1.5, llvm-nm, wasm-tools 1.251.0, cargo/rustc 1.95.0.

> **Session output-fidelity hazard (binding disclosure).** The transcript channel dropped/corrupted a large fraction of reads this session (`~/.claude/HARNESS.md`/`RTK.md`, severe + sustained). I wrote and DISCARDED two earlier false drafts of this file: (1) "perry frontend is a stub, doesn't build" (phantom reads of a non-existent `frontend.rs`); (2) "bigint kernel compiled, V1 PASS" (stale read before the real `wasm-ld` failure). I also initially claimed the `add` witness "PROVED dispatch correct" — then a direct `Read` of the `.wat` showed the `signature_mismatch` trap stub, falsifying that too. Every fact here is from a clean read cross-checked against an artifact (exit code / byte size / direct `.wat` Read). The §3 WAT was read with the `Read` tool, not grep.

---

## What the gap was

`__call_reducer__` `(void)`-cast its params and `return 0;` — user body never ran. Describe blob hardcoded `noop`.

## What I implemented (perry-fork)

One file: `_vendor/perry-fork/crates/perry/src/commands/compile/spacetimedb.rs`. Diff on disk `/tmp/perry.diff` (169 ins / 22 del; **NOT committed**). Working tree: exactly ` M crates/perry/src/commands/compile/spacetimedb.rs` (a stray empty `frontend.rs` I created while phantom-probing was deleted).

1. **`STDB_ABI_SHIM_C` const → `format_stdb_abi_shim_c(reducer_name, dispatch_symbol)`.** Fixed `STDB_ABI_SHIM_HEAD` (typedefs + the one `spacetime_10.0::bytes_sink_write` import) + a formatter injecting the describe-blob `source_name` (length-byte + name bytes into the gold 34-byte V10 layout) and the dispatch body.
2. **Dispatch body** (symbol found): `extern long long <sym>(void); ... if (id==0){ volatile long long sink = <sym>(); (void)sink; return 0; } return -1;`. `None` → M2 no-op fallback.
3. **`compile_abi_shim()` → `compile_abi_shim(&str)`**; **`link_spacetimedb_wasm` reordered** so `collect_user_function_exports` runs before the shim is built. Link flags unchanged (`--no-entry --gc-sections`, no `--allow-undefined`).
4. **Helpers:** `select_dispatch_symbol` (prefers `_i64`), `reducer_name_from_symbol` (`perry_fn_add_ts__add_i64`→`"add"`).

## §3 — What the dispatch demonstrably DOES and does NOT do (from a direct Read of `add.wasm`)

`add.ts` (`add(a:number,b:number){return a+b}`) is the only kernel that links (M1's proven amputation shape). Its `.wat`, read directly:

```wat
(import "spacetime_10.0" "bytes_sink_write" ...)               ;; sole import, no js_*
(func $signature_mismatch:perry_fn_add_ts__add_i64 (result i64)  ;; <-- LINKER-SYNTHESIZED STUB
    unreachable)                                                  ;;     body traps
(func $__call_reducer__ (param i32 i64×7 i32 i32) (result i32)
    ...
    block
      local.get 0  br_if 0          ;; if id != 0 -> return -1
      call $signature_mismatch:perry_fn_add_ts__add_i64   ;; <-- calls the TRAP STUB, not the real add_i64
      i64.store offset=8 ... drop    ;; the volatile sink (kept the call live)
      i32.const 0  local.set 11      ;; would return 0
    end ...)
(func $perry_fn_add_ts__add_i64 (param i64 i64) (result i64)    ;; the REAL reducer: takes 2 args
    local.get 1 local.get 0 i64.add)
(data $.rodata "...\03\00\00\00add\00\00\00\00...")            ;; describe blob renamed noop->add
```

**What IS demonstrated:** discovery of `perry_fn_add_ts__add_i64`, selection of the `_i64` variant, injection of a guarded `call` to it in `__call_reducer__`, the `volatile` sink keeping the call live through `-O3 --gc-sections` (visible as `i64.store … drop`), and the describe blob renamed `noop`→`add` (`reducer_name_from_symbol` works). The no-op `i32.const 0` shape is gone.

**What is NOT demonstrated (Finding B):** the call does not reach the real reducer. The shim declares `extern long long perry_fn_add_ts__add_i64(void)` (zero args), but the real symbol is `(i64,i64)->i64`. wasm-ld resolved the type mismatch by binding the call to a **synthesized `$signature_mismatch:...` stub whose body is `unreachable`** (a trap). So at runtime `id==0` would trap, not add. The dispatch calls *a* `perry_fn` symbol-name, but the linker redirected it to a trap because the arity is wrong.

This is harmless for the *actual* bench kernel — `mix()` takes **no args**, so `extern long long mix(void)` would match a real no-arg `perry_fn_..._mix_i64()` and bind correctly. But I cannot exhibit that, because every no-arg `mix` kernel fires DB-1 (Finding A). So: the dispatch is wired and the no-arg shim signature is correct *for the intended kernel*, but I have **no kernel that both links and matches the shim**, hence no end-to-end proof. `add` proves the plumbing up to the `call`; it cannot prove the callee runs.

## §4 — FINDING A: DB-1 fired; the amputation boundary is the loop, not the type

The design kernel `cpu_kernel.ts` (bigint xorshift/mix) compiled to `kernel_ts.o` but **failed `wasm-ld`** (EXIT 1, no `.wasm`):

```
wasm-ld: error: kernel_ts.o: undefined symbol: js_bigint_from_string
                                               js_bigint_cmp
                                               js_dynamic_shl / js_dynamic_shr / js_dynamic_bitxor
                                               js_shadow_frame_push / js_shadow_slot_bind / js_shadow_slot_set
wasm-ld: error: too many errors emitted, stopping now
```

8 distinct `js_*`. This is exactly the falsifying observation DB-1 keys on. **I STOPPED. I did NOT build/fix the wasm32 runtime archive.** I bisected the boundary (three independent compiles):

| Kernel | result | pulled |
|---|---|---|
| `add(a:number,b:number){return a+b}` — params, single expr, **no loop, no let** | **LINKS CLEAN** | nothing |
| `mix():number{ let acc=0; for(...) acc=acc+i*K }` — number, **loop+let** | **DB-1 FIRES** | `js_dynamic_*` + `js_shadow_frame_push/pop/slot_bind/slot_set` |
| `mix():bigint{ let acc=…; for(...) acc=acc^(acc<<13n)… }` — the design kernel | **DB-1 FIRES** | `js_bigint_*` + `js_dynamic_shl/shr/bitxor` + `js_shadow_*` |

Two unanticipated runtime deps, pulled by the **loop+mutable-accumulator structure**, not by `bigint`:
- **`js_dynamic_*`** — in-loop arithmetic on a `let` accumulator is NOT specialized to wasm value ops; it lowers to dynamic (NaN-boxed) operator helpers. M1's clean `i64.add` happened only because `add`'s operands were typed params in a single expression.
- **`js_shadow_*`** — shadow-stack GC root setup (CLAUDE.md "precise shadow-stack roots") for any function whose locals could hold GC values. `add` (no locals) emits none; a `let acc` loop does.

**The design's `number` fallback does not help** — it fired DB-1 too (middle row). There is no loop-shaped kernel in the supported subset that stays amputated; the hot loop that makes a CPU benchmark a benchmark is the exact thing that pulls the runtime. Per the circuit-breaker's "if the fallback also pulls `js_*`, stop and surface — do not grind," I stopped.

---

## What this means for the milestone (orchestrator / user decision — not chosen here)

The first-number milestone is **blocked on the wasm32 `libperry_runtime.a`**, which is M3-gated. Options, surfaced not chosen:

1. **Link the wasm32 runtime archive (do the M3 shell-amputation now).** The undefined set is small and named (`js_bigint_*`, `js_dynamic_*`, `js_shadow_*`); the runtime core is documented green with ~15 *shell-module* errors (child_process/fs/etc.) a CPU kernel never calls. Amputating the shell so the core links is the genuine unblock — and it ALSO fixes Finding B (a real no-arg `mix_i64` would then exist and bind to the no-arg shim correctly). This is the M3 long pole (docs 05/08 §6), a substantial task, explicitly outside this brief and the circuit-breaker's scope.
2. **Reframe the kernel to the param-only-single-expression envelope that amputates** (an unrolled sequence of `add`-like expressions, no loop, no `let`). This links today, but (a) measures call/marshaling + trivial arithmetic, a weak AOT-vs-JIT discriminator near the `empty` row, and (b) **still hits Finding B** — args mean the no-arg shim binds to a trap; the shim would need an arg-passing dispatch (declare the real arity, decode args via `bytes_source_read`), which is itself M3-ward marshaling work. So option 2 is not actually cheap once Finding B is included.
3. **Resequence: accept the synthetic-CPU de-risk REQUIRES the runtime archive first.** The genuine compute number cannot exist until the wasm32 runtime links, so the runtime amputation moves onto the de-risk critical path. This is the milestone-reorder the audit's open-Q#3 and the design's V1-flip both named as the contingency.

My read: the de-risk *discovered its own answer* — the foundation does not yet carry a compute kernel, and the wasm32 runtime archive is the single blocker gating BOTH a real number AND end-to-end dispatch proof. That finding is more load-bearing than a number would have been. The dispatch code is ready and waiting behind it.

---

## What the fresh-eyes verifier still needs to confirm

- **Finding A (load-bearing):** `perry compile <bigint-or-number-loop>.ts --target spacetimedb` → `undefined symbol: js_*`; `perry compile add.ts …` → links clean. Cheap, reproducible.
- **Finding B (load-bearing):** `wasm-tools print add.wasm` shows `__call_reducer__` calls `$signature_mismatch:perry_fn_add_ts__add_i64` (a trap), NOT the real `add_i64` — i.e. the args-vs-no-arg shim mismatch. Confirm the dispatch wiring is real (the `call`, the volatile sink, the rename) but the callee is a trap for an arg-taking reducer.
- **No compute number exists** — none was produced; the Criterion run and V3 duration check are moot until a no-arg kernel both links (option 1) and binds (Finding B resolved).

---

## Side notes / observations / complaints

- **The de-risk worked exactly as intended: it hit the brick wall before the demo/harness phase.** The user's "de-risk synthetic first" sequencing is vindicated — the synthetic kernel surfaced that the wasm32 runtime is a hard prerequisite for ANY compute benchmark, AND that the no-arg-shim dispatch needs the runtime to even have a callee, BEFORE anyone built docker around an uncompilable kernel. Negative-space-pt-5: the measurement's value was in what it refused to let us assume.
- **The journals over-generalized M1's "integer codegens clean."** Docs 08/09 ("integer arithmetic → `i64.add`, zero imports") are TRUE only for the `add(a,b){return a+b}` shape (typed params, single expression). The bench design + audit inherited "any pure-integer kernel amputates," which is FALSE: a `let`-accumulator loop pulls `js_dynamic_*` (unspecialized arithmetic) + `js_shadow_*` (GC roots). Doc 08's own side-note warned "read M1's result as closed only for the shape M1 can emit" — the warning didn't propagate into the kernel choice. The boundary is structural (param-expr vs loop-accumulator), not type-based.
- **Finding B is the subtler trap and I nearly published it as a PASS.** A `call $perry_fn_..._i64` in the disassembly LOOKS like proof the dispatch reaches the reducer. It does not, when the linker silently rebinds an arity-mismatched call to a `signature_mismatch` trap stub. The lesson: "the disassembly contains a `call` to the right name" is necessary but NOT sufficient — verify the callee is the real defined function with matching type, not a synthesized stub. The shim's `(void)` decl is correct *for the no-arg kernel it targets*; it's wrong for `add`, which is why `add` is a bad witness. The right witness is a no-arg amputating kernel, which doesn't exist pre-runtime-archive.
- **The dispatch code itself is clean and correct for the intended (no-arg) kernel** — ~80 lines of formatted-C over the proven M2 mechanism; observes codegen symbols rather than recomputing mangling. When the runtime archive lands and a no-arg `mix_i64` exists, this dispatch binds correctly with no change. I'd keep it.
- **Auto-optimize STILL rebuilds the 57MB+81MB HOST archives on every `--target spacetimedb` compile** (flagged in docs 08/09 twice), then fails at the wasm32 link for lack of the wasm32 archive — the logs say "built libperry_runtime.a" while the missing one is the wasm32 build. Gate it off before the M3 runtime work so the logs stop misleading.
- **Foundation reckoning (brief asked me to flag if I suspected it).** The dispatch structure is NOT rotten — it's right. But the foundation does not carry the next milestone: no compute kernel links, no no-arg kernel exists to prove dispatch end-to-end, and both gaps are the same wasm32-runtime-archive blocker. Iterating on bench wiring or kernel variants is premature — I tried two kernel shapes and the boundary is the loop itself. The next dispatch should be the runtime-archive shell-amputation (option 1), or an explicit user decision to reframe (option 2, which is not as cheap as it looks due to Finding B).
