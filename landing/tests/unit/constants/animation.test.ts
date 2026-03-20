import { describe, it, expect } from 'vitest'
import {
  REVEAL_THRESHOLD,
  DEFAULT_REVEAL_STAGGER_MS,
  EASE_OUT_EXPONENT,
  ROI_ROUNDING_PRECISION,
  NAV_SCROLL_THRESHOLD,
  HERO_ANIMATION_DELAY_S,
  HERO_GATE_DELAY_OFFSET_S,
} from '@/constants/animation'

describe('animation constants', () => {
  it('REVEAL_THRESHOLD is between 0 and 1', () => {
    expect(REVEAL_THRESHOLD).toBeGreaterThan(0)
    expect(REVEAL_THRESHOLD).toBeLessThanOrEqual(1)
  })

  it('DEFAULT_REVEAL_STAGGER_MS is a positive number', () => {
    expect(DEFAULT_REVEAL_STAGGER_MS).toBeGreaterThan(0)
  })

  it('EASE_OUT_EXPONENT is a positive integer', () => {
    expect(EASE_OUT_EXPONENT).toBeGreaterThan(0)
    expect(Number.isInteger(EASE_OUT_EXPONENT)).toBe(true)
  })

  it('ROI_ROUNDING_PRECISION is a positive power of 10', () => {
    expect(ROI_ROUNDING_PRECISION).toBeGreaterThan(0)
    expect(Math.log10(ROI_ROUNDING_PRECISION) % 1).toBe(0)
  })

  it('NAV_SCROLL_THRESHOLD is a non-negative number', () => {
    expect(NAV_SCROLL_THRESHOLD).toBeGreaterThanOrEqual(0)
  })

  it('HERO_ANIMATION_DELAY_S is a positive number', () => {
    expect(HERO_ANIMATION_DELAY_S).toBeGreaterThan(0)
  })

  it('HERO_GATE_DELAY_OFFSET_S is a positive number', () => {
    expect(HERO_GATE_DELAY_OFFSET_S).toBeGreaterThan(0)
  })
})
