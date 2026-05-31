# 08b — M1 independent verification (adversarial)

This is the independent M1 verdict. The verifier did not write the M1 code. The question is narrow: does a trivial TypeScript file now compile, through the forked Perry's `feat/target-spacetimedb` branch on `api-haus/perry`, to a genuinely freestanding wasm32 module — the M1 success criterion. The verdict is **confirmed**, reproduced independently against a different source than the implementer used, and the killer check (zero imports under any host namespace) holds at the section level.

## Verdict

**CONFIRMED.** A different trivial TS source (`export function mul(a:number,b:number){return a*b}`, never compiled by the implementer) compiles via `perry compile mul.ts --target spacetimedb` to a 378-byte wasm32 module that `wasm-tools validate` accepts, exports `memory` and the user functions, has no `(start)`/no `_start`/no WASI, and imports **nothing** — confirmed both by `wasm-tools print | grep -c "(import"` returning 0 and by `wasm-tools objdump` showing no import section in the section table at all.

## Branch provenance (confirmed against the pushed remote)

- Local `/mnt/archive4/DEV/mmodb/_vendor/perry-fork` HEAD `036613761ef593f70abc2c4b47d77e0c58bc7a22` equals `origin/feat/target-spacetimedb` after a fresh `git fetch origin` — the branch is genuinely pushed to `git@github.com:api-haus/perry.git`, not just local.
- `git merge-base HEAD main` is `ed633ca5`, the fork's `main` — the branch is cut off the fork's main as claimed.
- `d57ba1cc` ("Measure: perry-runtime core compiles to freestanding wasm32") is the clean cherry-pick of `f4c536a` (same author `mail@api.haus`, same date, identical 9-file stat). Not load-bearing for M1 (M1's trivial path links with `--gc-sections` and never touches the runtime), but the provenance claim checks out.
- Branch diff vs `main` is the 13 files / +332 −20 the implementer described.

## The change is a real LLVM wasm32 path, not a JS-host hack or a faked artifact

Grounded at `file:line` on HEAD `03661376`:

- `crates/perry-codegen/src/codegen/helpers.rs:309` — `resolve_target_triple` gains `"spacetimedb" => Some("wasm32-unknown-unknown".to_string())`, ahead of the existing apple/host arms.
- `crates/perry-codegen/src/codegen/entry.rs` — `let is_wasm_reactor = llmod.target_triple.starts_with("wasm32"); let is_dylib = output_type == "dylib" || output_type == "staticlib" || is_wasm_reactor;` (was `dylib || staticlib`). Suppresses `main`, emits `perry_module_init` — reactor shape.
- `crates/perry/src/commands/compile.rs` — `mod spacetimedb;` registered (:42); `<stem>.wasm` default output for the target (:4404); a short-circuit `if target.as_deref() == Some("spacetimedb") { spacetimedb::link_spacetimedb_wasm(...) ; return ... }` placed **before** `find_runtime_library(target)?` and `build_and_run_link` (which would error on / pollute a wasm32 target). Placement confirmed by reading the surrounding code.
- `crates/perry/src/commands/compile/spacetimedb.rs` (new, 191 lines) — discovers exports by scanning objects with `llvm-nm --defined-only` for `perry_fn_*` (decoupled from codegen mangling), then runs `wasm-ld --no-entry --gc-sections --export=<fn>` with **no** `--allow-undefined`. An undefined symbol is a hard error with a doc-comment explaining it is the M2 "link the runtime archive" signal, never a silent host import.

The discriminator that this is the native LLVM path and not the JS-host `perry-codegen-wasm` emitter: at `compile.rs:311-312`, only `Some("web") | Some("wasm")` route to `compile_for_wasm` (the 211-`rt`-import browser emitter). `"spacetimedb"` is **not** in that match, so it falls through to native codegen + the new link step. Verified by grep.

## Independent reproduction

Built the `perry` CLI release from the branch (`cargo build --release -p perry`, exit 0, `perry 0.5.1046`). Wrote a source the implementer never used:

```ts
export function mul(a: number, b: number) { return a * b; }
```

`perry compile mul.ts -o mymul.wasm --target spacetimedb` → `/tmp/m1verify/mymul.wasm`, 378 bytes, sha256 `2fd17290…` — distinct from the implementer's `add.wasm` (`82f6127d…`), so this is not a hard-coded or copied artifact. The CLI printed `Linking freestanding wasm32 (spacetimedb) → mymul.wasm (exports: perry_fn_mul_ts__mul, perry_fn_mul_ts__mul_i64)`.

The emitted module (`wasm-tools print`):

```wat
(module $mymul.wasm
  (type (;0;) (func (param i64 i64) (result i64)))
  (type (;1;) (func (param f64 f64) (result f64)))
  (table (;0;) 1 1 funcref)
  (memory (;0;) 1)
  (global $__stack_pointer (;0;) (mut i32) i32.const 65536)
  (export "memory" (memory 0))
  (export "perry_fn_mul_ts__mul_i64" (func $perry_fn_mul_ts__mul_i64))
  (export "perry_fn_mul_ts__mul" (func $perry_fn_mul_ts__mul))
  (func $perry_fn_mul_ts__mul_i64 (type 0) (param i64 i64) (result i64)
    local.get 1
    local.get 0
    i64.mul)
  (func $perry_fn_mul_ts__mul (type 1) (param f64 f64) (result f64)
    local.get 1
    i64.trunc_sat_f64_s
    local.get 0
    i64.trunc_sat_f64_s
    i64.mul
    f64.convert_i64_s)
  (@custom "target_features" ...))
```

The intermediate object (`--keep-intermediates`) is `WebAssembly (wasm) binary version 0x1 (MVP module)` per `file(1)` — confirming `clang -c --target=wasm32-unknown-unknown` ran, not a native ELF compile. `llvm-nm --defined-only mul_ts.o` lists `perry_fn_mul_ts__mul`, `perry_fn_mul_ts__mul_i64`, and `__perry_wrap_perry_fn_mul_ts__mul` as wasm text symbols.

## Pass/fail per M1 criterion (all on my artifact)

| Criterion | Result | Evidence |
|---|---|---|
| `wasm-tools validate` passes | PASS | `VALID` |
| wasm32 (32-bit pointers) | PASS | `(memory 1)` with `memory64: false` (objdump); `$__stack_pointer (mut i32)` |
| `memory` exported | PASS | `(export "memory" (memory 0))`; export section `Export { name: "memory", kind: Memory }` |
| No `(start)` / no mandatory WASI `_start` | PASS | no `(start)`; no `_start`/`__wasi`/`wasi_snapshot` symbol; objdump section table has no start section |
| Zero imports from rt/ffi/any host namespace | PASS (killer check) | `grep -c "(import"` = 0; `wasm-tools objdump` section table lists types/functions/tables/memories/globals/exports/code/custom — **no imports section exists at all**; no `rt`/`ffi`/`env`/`wasi`/`web` string anywhere |
| NaN-canonicalization: no canonicalizing f64 op on value moves | PASS | only `f64.convert_i64_s` present; grep for `f64.(add\|sub\|mul\|div\|neg\|abs\|copysign\|min\|max\|sqrt\|ceil\|floor\|trunc\|nearest)` returns empty |

## Adversarial check from the artifact's own decision points

The killer case for M1 is a host import sneaking in under `--allow-undefined` (which would mean the JS-host backend, or a silently-fabricated import). I built the check from the link step's own decision point — the absence of `--allow-undefined` means a runtime-touching function must hard-fail, not silently import. I compiled a function that genuinely reaches the runtime:

```ts
export function greet(name: string): string { return "hello, " + name + "!"; }
```

`perry compile rt.ts --target spacetimedb` exits 1, produces **no** `rt.wasm`, and prints:

```
Error: wasm-ld failed (status=exit status: 1).
wasm-ld: error: rt_ts.o: undefined symbol: js_shadow_frame_push
wasm-ld: error: rt_ts.o: undefined symbol: js_shadow_slot_bind
wasm-ld: error: rt_ts.o: undefined symbol: js_string_concat_chain
wasm-ld: error: rt_ts.o: undefined symbol: js_shadow_frame_pop
```

This is decisive: the zero-imports result on the trivial kernel is genuine, not `--allow-undefined` masking missing symbols. A function that needs `js_*` fails loudly and points at the M2 runtime archive; it never becomes a host import that would break stock-loadability. This directly exercises the doc-07 invalidation criterion ("any import outside `spacetime_10.x` voids the premise") and the M1 link contract — and confirms the negative-space design the implementer claimed (`spacetimedb.rs:24-33,136-143`).

## Discrepancies with the implementer's claims

None material. Every load-bearing claim reproduced. Minor notes:

- The implementer cited `helpers.rs:300` for the new arm; the actual added match line is `helpers.rs:309` (the doc-comment block starts ~:300). Immaterial — same function, same edit.
- The implementer's `add.wasm` is 379 bytes; my `mul.wasm` is 378. Expected (one fewer instruction-encoding byte for `mul` vs `add` is within noise); both are the same structural shape. Not a discrepancy.
- The auto-optimize lib rebuild the implementer flagged as wasteful does fire on my compile (rebuilds `libperry_runtime.a` 57.8 MB + `libperry_stdlib.a` 81.3 MB for a spacetimedb build that links neither). Confirmed; out of M1 scope, correctly deferred to M2/M4 ergonomics.

## Scope honesty (what M1 does NOT prove — confirmed correctly deferred)

M1 is plumbing only. It does **not** demonstrate a loadable *SpacetimeDB* module: no `spacetime_10.x` imports (the module has zero imports, so the host's ABI-detection `>=1` import requirement is unmet by design), no `__describe_module__`/`__call_reducer__` dunders, no addressable-memory BSATN primitive. The "stock host loads it like a Rust/C#/C++ module" end-goal is M0+M2, not M1. M1's claim is exactly "the triple→clang→wasm-ld seam emits a valid freestanding wasm32 module," and that is what is confirmed. The B4 NaN-canonicalization result is confirmed for the integer-kernel shape only; the boxed-value kernel remains an open M2 test, as the implementer states.

## Side notes / observations / complaints

- **The `--gc-sections`-with-no-`--allow-undefined` design is the single most important thing M1 got right, and it is genuinely load-bearing rather than incidental.** It makes "zero imports" a *checkable invariant* of the link rather than a property of the trivial input: any function reaching the runtime fails the link loudly. That is the negative-space-correct shape — the error is the designed signal. M2's author must read `undefined symbol: js_*` as "link the wasm32 archive," never "add `--allow-undefined`"; the latter would re-introduce the exact host-import hazard the architecture exists to avoid (doc 07 §1.1). The implementer's own side-note flags this as the top M2 footgun; I concur, and the `rt.ts` probe above makes it concrete.
- **`wasm-tools objdump` (section table) is a stronger zero-imports proof than `grep -c "(import"` and worth keeping in the M0 gate.** Grep on the textual WAT could in principle miss an import expressed unusually; the objdump section table shows the imports section is simply absent from the binary. For M0 (where there *must* be ≥1 `spacetime_10.x` import), the same tool will show the import section present with only that namespace — the right adversarial check at both milestones.
- **The harness dropped/garbled several `ls` and `find` tool results mid-verification** (the cwd-reset between Bash calls compounded it — the artifact landed in the compile's cwd, surfaced via absolute `find`). Did not affect the verdict; the wasm bytes, the validate, the objdump, and the sha256 are all reproducible. Flagging per HARNESS.md so a re-run uses absolute paths and single Bash calls for the load-bearing checks.
- **One thing genuinely de-risked beyond the M1 letter:** the integer-specialization codegen (`fptosi`/`i64.mul`/`sitofp` rather than `f64.mul` on NaN-boxed doubles) is real and reproduced on `mul`, independent of `add`. It is why B4 looks safe on numeric kernels — but, exactly as the implementer cautions, it is also why B4 is *invisible* on numeric kernels: Perry never boxes a value it has proven is a number. The real B4 test is a kernel moving boxed objects/strings through paths LLVM cannot prove numeric, and only M2 can compile one. M1's clean result should be read as "B4 closed for the shape M1 can emit," not "B4 closed."
