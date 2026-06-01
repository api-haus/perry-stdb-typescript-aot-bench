# perry-e2e-bench — orchestration working memory (index)

E2E benchmarking harness: publish a real SpacetimeDB module (V8 + Perry AOT), hammer with Rust artillery client. Metrics: cold startup, TPS across empty + cpu_heavy.

## Execution mode

Consolidated: Research → Architect → Implement (single 1M-context agent, freeform).

## Documents

| # | file | what it is |
|---|---|---|
| 00 | `00-reuse-audit.md` | reuse audit — what exists, what to extend, what's greenfield |
| 01 | `01-context.md` | behavioural problemspace + constraints + required reading |
| 02 | `02-consolidated.md` | investigation + design + impl log + side notes |
| 03 | `03-optimization-investigation.md` | cpu_heavy bottleneck analysis (js_number_coerce / is_numeric_expr gap) |
| 04 | `04-assemblyscript-viability.md` | AssemblyScript as alternative wasm TS compiler |
| 05 | `05-bitcode-link-lto.md` | bitcode-link (LTO) experiment — 2.4x speedup, Perry matches V8 on cpu_heavy |
| 06 | `06-full-runtime-lto.md` | full-runtime LTO — runtime as bitcode, hybrid overlay approach, 2.82x speedup |

## Phase checklist

- [x] Reuse audit (`00-reuse-audit.md`)
- [x] Context bundle (`01-context.md`)
- [x] Consolidated: Research → Architect → Implement (`02-consolidated.md`) — NUMBERS LANDED
- [x] Optimization investigation (`03-optimization-investigation.md`) — bottleneck identified
- [x] Bitcode-link LTO experiment (`05-bitcode-link-lto.md`) — 2.4x speedup, Perry LTO matches V8 on cpu_heavy
- [x] Full-runtime LTO (`06-full-runtime-lto.md`) — hybrid approach, 2.82x speedup, runtime as bitcode works
