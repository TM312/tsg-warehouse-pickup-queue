import { describe, expect, it } from 'vitest'
import { seededRandom, pickRandom, randomBetween } from '@/utils/random'

describe('seededRandom', () => {
  it('produces deterministic sequence', () => {
    const rng1 = seededRandom(42)
    const rng2 = seededRandom(42)
    const seq1 = Array.from({ length: 10 }, () => rng1())
    const seq2 = Array.from({ length: 10 }, () => rng2())
    expect(seq1).toEqual(seq2)
  })

  it('different seeds produce different sequences', () => {
    const rng1 = seededRandom(42)
    const rng2 = seededRandom(99)
    const seq1 = Array.from({ length: 10 }, () => rng1())
    const seq2 = Array.from({ length: 10 }, () => rng2())
    expect(seq1).not.toEqual(seq2)
  })

  it('values are in [0, 1)', () => {
    const rng = seededRandom(42)
    for (let i = 0; i < 100; i++) {
      const val = rng()
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    }
  })
})

describe('pickRandom', () => {
  it('returns element from array', () => {
    const items = ['a', 'b', 'c']
    const result = pickRandom(items)
    expect(items).toContain(result)
  })

  it('is deterministic with seeded rng', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    const rng1 = seededRandom(42)
    const rng2 = seededRandom(42)
    const picks1 = Array.from({ length: 5 }, () => pickRandom(items, rng1))
    const picks2 = Array.from({ length: 5 }, () => pickRandom(items, rng2))
    expect(picks1).toEqual(picks2)
  })

  it('throws on empty array', () => {
    expect(() => pickRandom([])).toThrow('Cannot pick from an empty array')
  })
})

describe('randomBetween', () => {
  it('returns values in [min, max]', () => {
    for (let i = 0; i < 100; i++) {
      const val = randomBetween(5, 10)
      expect(val).toBeGreaterThanOrEqual(5)
      expect(val).toBeLessThanOrEqual(10)
    }
  })

  it('returns integers', () => {
    for (let i = 0; i < 50; i++) {
      const val = randomBetween(1, 100)
      expect(Number.isInteger(val)).toBe(true)
    }
  })

  it('is deterministic with seeded rng', () => {
    const rng1 = seededRandom(42)
    const rng2 = seededRandom(42)
    const vals1 = Array.from({ length: 10 }, () => randomBetween(1, 100, rng1))
    const vals2 = Array.from({ length: 10 }, () => randomBetween(1, 100, rng2))
    expect(vals1).toEqual(vals2)
  })
})
