import { describe, it, expect } from 'vitest'
import { REVEAL_STAGGER_MS, REVEAL_THRESHOLD, ANIMATION_DURATION_MS } from '@/constants/animation'

describe('animation constants', () => {
  it('REVEAL_STAGGER_MS is a positive number', () => {
    expect(REVEAL_STAGGER_MS).toBeGreaterThan(0)
  })

  it('REVEAL_THRESHOLD is between 0 and 1', () => {
    expect(REVEAL_THRESHOLD).toBeGreaterThan(0)
    expect(REVEAL_THRESHOLD).toBeLessThanOrEqual(1)
  })

  it('ANIMATION_DURATION_MS is a positive number', () => {
    expect(ANIMATION_DURATION_MS).toBeGreaterThan(0)
  })
})
