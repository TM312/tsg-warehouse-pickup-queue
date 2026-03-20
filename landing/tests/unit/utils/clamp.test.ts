import { describe, it, expect } from 'vitest'
import { clampValue } from '@/utils/clamp'

describe('clampValue', () => {
  it('returns min when value is below min', () => {
    expect(clampValue(5, 10, 100)).toBe(10)
  })

  it('returns max when value is above max', () => {
    expect(clampValue(150, 10, 100)).toBe(100)
  })

  it('returns value when within range', () => {
    expect(clampValue(50, 10, 100)).toBe(50)
  })

  it('returns min when value equals min', () => {
    expect(clampValue(10, 10, 100)).toBe(10)
  })

  it('returns max when value equals max', () => {
    expect(clampValue(100, 10, 100)).toBe(100)
  })
})
