import { describe, it, expect } from 'vitest'
import { cubicEaseOut } from '@/lib/easing'

describe('cubicEaseOut', () => {
  it('returns 0 for progress 0', () => {
    expect(cubicEaseOut(0)).toBe(0)
  })

  it('returns 1 for progress 1', () => {
    expect(cubicEaseOut(1)).toBe(1)
  })

  it('returns value between 0 and 1 for mid-progress', () => {
    const result = cubicEaseOut(0.5)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(1)
  })

  it('decelerates: early progress covers more distance than late progress', () => {
    const earlyDelta = cubicEaseOut(0.3) - cubicEaseOut(0.0)
    const lateDelta = cubicEaseOut(1.0) - cubicEaseOut(0.7)
    expect(earlyDelta).toBeGreaterThan(lateDelta)
  })
})
