/**
 * PRNG Utilities — deterministic pseudo-random number generation.
 *
 * Pure, domain-agnostic functions shared across related-content algorithms
 * (related tools in tools.ts, related posts in blog.ts).
 *
 * Algorithm credits:
 *   cyrb128  — 128-bit string hash → 32-bit integer (bryc/bcrypt-128)
 *   mulberry32 — 32-bit seeded PRNG (Tommy Ettinger)
 *
 * Usage pattern:
 *   const seed = cyrb128(slug);
 *   const rng  = mulberry32(seed);
 *   const shuffled = seededShuffle(myArray, rng);
 */

/**
 * cyrb128 — Hashes a string into a deterministic 32-bit unsigned integer.
 * Used to convert a URL slug (string) into a numeric seed for mulberry32.
 *
 * @param str - Any string (e.g. a URL slug).
 * @returns A 32-bit unsigned integer to use as a PRNG seed.
 */
export function cyrb128(str: string): number {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k: number; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
}

/**
 * mulberry32 — Returns a seeded PRNG function.
 * Each call to the returned function advances the PRNG state and returns the
 * next float in [0, 1).
 *
 * @param seed - 32-bit unsigned integer seed (e.g. from cyrb128).
 * @returns A stateful `() => number` function producing values in [0, 1).
 */
export function mulberry32(seed: number): () => number {
    return function () {
        let t = (seed += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * seededShuffle — Fisher-Yates in-place shuffle driven by a supplied RNG.
 * Returns a new array; does NOT mutate the input.
 *
 * The `rng` parameter must be a `() => number` function returning values in
 * [0, 1) — e.g. the function returned by `mulberry32()`.
 * Passing the same `rng` instance across multiple shuffle calls is intentional:
 * it advances the shared PRNG state, so each subsequent shuffle is seeded by
 * the result of the previous one (consistent behaviour within one page render).
 *
 * @param array - Any readonly array to shuffle.
 * @param rng   - A `() => number` PRNG function (from mulberry32 or compatible).
 * @returns A new shuffled copy of the array.
 */
export function seededShuffle<T>(array: readonly T[], rng: () => number): T[] {
    const result = [...array];
    let currentIndex = result.length;
    while (currentIndex !== 0) {
        const randomIndex = Math.floor(rng() * currentIndex);
        currentIndex--;
        [result[currentIndex], result[randomIndex]] = [result[randomIndex]!, result[currentIndex]!];
    }
    return result;
}
