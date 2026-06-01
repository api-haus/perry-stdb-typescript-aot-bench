// E2E bench module: Perry-compiled reducers for the artillery client.
// Compiled via: perry compile bench.ts --target spacetimedb -o bench_perry.wasm
//
// Two no-arg reducers:
//   - empty()     — noop, measures pure dispatch overhead
//   - cpu_heavy() — RPG stat computation kernel, measures AOT vs JIT compute

// empty — noop reducer, measures pure call/dispatch overhead
export function empty(): number {
  return 0;
}

// cpu_heavy — RPG stat computation kernel.
// 100k iterations of xorshift32 feeding attack/defense/damage formulas.
// Pure integer/float arithmetic: i32 shifts/xors + f64 mul/add/sub.
// No tables, no args, no SDK imports — stays in Perry's proven wasm32 envelope.
export function cpu_heavy(): number {
  let x = 0x9e3779b9 | 0; // golden ratio bits, 32-bit seed
  let acc = 0.0;
  for (let i = 0; i < 100000; i++) {
    // xorshift32 PRNG
    x = x ^ (x << 13);
    x = x ^ (x >> 17);
    x = x ^ (x << 5);

    // RPG stat computation using PRNG output as seed
    const base_attack = (x & 0xff) + 10; // 10-265
    const base_defense = ((x >> 8) & 0xff) + 5; // 5-260
    const level = ((x >> 16) & 0x3f) + 1; // 1-64

    // Damage formula: attack * level_multiplier - defense * resistance
    const level_mult = 1.0 + level * 0.05;
    const effective_attack = base_attack * level_mult;
    const resistance = 0.3 + base_defense / 1000.0;
    const damage = effective_attack - base_defense * resistance;

    acc = acc + (damage > 0 ? damage : 0);
  }
  return acc;
}
