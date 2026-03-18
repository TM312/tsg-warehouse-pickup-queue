export function seededRandom(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickRandom<T>(array: readonly T[], rng: () => number = Math.random): T {
  if (array.length === 0) throw new Error('Cannot pick from an empty array')
  return array[Math.floor(rng() * array.length)]!
}

export function randomBetween(min: number, max: number, rng: () => number = Math.random): number {
  return Math.floor(rng() * (max - min + 1)) + min
}
