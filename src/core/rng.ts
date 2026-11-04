/** Seeded PRNG (mulberry32), so scenery details stay put between frames. */
export type Rng = (lo?: number, hi?: number) => number;

export function rng(seed: number): Rng {
  let a = seed >>> 0;
  return (lo = 0, hi = 1) => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return lo + (((t ^ (t >>> 14)) >>> 0) / 4294967296) * (hi - lo);
  };
}
