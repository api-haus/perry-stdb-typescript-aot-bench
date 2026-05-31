# perry-stdb-poc — orchestration working memory (index)

Working memory for the multi-milestone effort to give SpacetimeDB TypeScript modules an ahead-of-time Perry compile path (see `~/.claude` memory `mmodb-project`). These docs are **journals** — the story of what agents thought at a point in time, not canon. Ground every load-bearing claim against the code at current HEAD (`file:line`) or a research paper.

## Documents

| # | file | what it is |
|---|---|---|
| 00 | `00-context.md` | original context bundle |
| 01 | `01-perry-wasm.md` | Perry → wasm investigation |
| 02 | `02-stdb-abi.md` | SpacetimeDB native ABI contract |
| 03 | `03-stdb-ts-baseline.md` | STDB TS path baseline |
| 04 | `04-feasibility-and-design.md` | feasibility + design |
| 05 | `05-perry-runtime-wasm-port.md` | perry-runtime wasm32 port |
| 06 | `06-stdb-sdk-fork-surface.md` | SDK/CLI fork surface |
| 07 | `07-fork-plan.md` | the fork plan + milestones |
| 08 / 08b | `08-m1-llvm-wasm32.md` / `08b-m1-verify.md` | M1: `--target spacetimedb` → freestanding wasm32 (+ verify) |
| 09 / 09b | `09-m2-spike-abi-load.md` / `09b-m2-verify.md` | M2 spike: no-op module loads+callable on stock host (+ verify) |
| 10 | `10-benchmark-landscape.md` | reuse STDB's own `crates/bench`; the milestone-measurability split |
| 11 / 11b / 11c | `11-ts-v8-baseline.md` / `11b-…-verify.md` / `11c-…-complete-verify.md` | Step 1: raw-TS-on-V8 baseline (+ two verifications) |
| 12 | `12-bench-audit-stdb.md` / `12-bench-audit-perry.md` | bench-arm reuse audit, both forks (this phase) |
| 13 | `13-perry-bench-context.md` | **context bundle for the first-Perry-number phase** |
| 14 | `14-perry-bench-design.md` | architect: minimal path to the first Perry number (lazy) |
| 15 | `15-perry-bench-impl.md` | implementation log + captured numbers (lazy) |
| 16 | `16-perry-number-verify.md` | fresh-eyes adversarial verification of the number (lazy) |

`artifacts/` holds binary/diff artifacts (e.g. `perry-runtime-wasm32-port.diff`).

## Current phase — first real Perry-vs-V8 number (synthetic, de-risk)

Goal: turn Perry's no-op `__call_reducer__` into a real dispatcher and produce the first apples-to-apples Perry-vs-V8 numbers on `empty` (call overhead) + a pure-integer CPU kernel, on `crates/bench`'s Criterion clock — before any datastore (M3) / demo work. User decision (2026-06-01): *de-risk synthetic first*; the inventory+stats MMORPG demo + docker e2e harness come *after*.

Phase checklist:
- [x] Reuse audit, both forks (`12-bench-audit-stdb.md`, `12-bench-audit-perry.md`)
- [x] Context bundle (`13-perry-bench-context.md`)
- [x] Architect: minimal path + kernel/workload definition + verification spec (`14-perry-bench-design.md`) — bypass wiring, integer xorshift/mix kernel, empty+kernel = one milestone, adversarial verify spec'd
- [~] Implement M2-proper dispatch + bench wiring + run + capture (`15-perry-bench-impl.md`) — dispatcher written (uncommitted); BLOCKED: DB-1 fired (benchmark-shaped kernel pulls `js_*`), arity-mismatch trap. No numbers.
- [ ] Fresh-eyes diagnostic: confirm Findings A/B, probe amputation across kernel shapes, cost of greening wasm32 runtime archive (`16-amputation-diagnostic.md`)
- [ ] (was: fresh-eyes number-verify) — deferred until a real number exists
