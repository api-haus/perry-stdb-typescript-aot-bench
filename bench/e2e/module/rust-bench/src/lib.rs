//! Minimal SpacetimeDB Rust module for E2E benchmarking.
//!
//! Two no-arg reducers matching the Perry/V8 bench modules:
//!   - empty()     -- noop, measures pure dispatch overhead
//!   - cpu_heavy() -- RPG stat computation kernel (100k xorshift32 iterations)

use spacetimedb::ReducerContext;

#[spacetimedb::reducer]
pub fn empty(_ctx: &ReducerContext) {}

#[spacetimedb::reducer]
pub fn cpu_heavy(_ctx: &ReducerContext) {
    // xorshift32 PRNG seeded with golden ratio bits.
    // Identical kernel to the Perry and V8 bench modules.
    let mut x: u32 = 0x9e3779b9;
    let mut acc: f64 = 0.0;

    for _ in 0..100_000u32 {
        // xorshift32
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;

        // RPG stat computation using PRNG output
        let base_attack = (x & 0xFF) as i32 + 10; // 10-265
        let base_defense = ((x >> 8) & 0xFF) as i32 + 5; // 5-260
        let level = ((x >> 16) & 0x3F) as i32 + 1; // 1-64

        // Damage formula: attack * level_multiplier - defense * resistance
        let level_mult: f64 = 1.0 + level as f64 * 0.05;
        let effective_attack: f64 = base_attack as f64 * level_mult;
        let resistance: f64 = 0.3 + base_defense as f64 / 1000.0;
        let damage: f64 = effective_attack - base_defense as f64 * resistance;

        if damage > 0.0 {
            acc += damage;
        }
    }

    // Prevent the optimizer from eliminating the entire loop.
    // Use a volatile write through a pointer to ensure the accumulator is "used".
    let acc_ptr = &acc as *const f64;
    unsafe {
        core::ptr::read_volatile(acc_ptr);
    }
}
