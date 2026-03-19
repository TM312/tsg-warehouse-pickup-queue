import { describe, it, expect } from 'vitest'
import { ANIMATION, cssMs } from '@/constants/animations'

describe('animation constants', () => {
  it('every value is a positive integer in milliseconds', () => {
    for (const [key, value] of Object.entries(ANIMATION)) {
      expect(value, `${key} should be a positive integer`).toBeGreaterThan(0)
      expect(Number.isInteger(value), `${key} should be an integer`).toBe(true)
    }
  })

  it('has leave durations not exceeding enter durations', () => {
    expect(ANIMATION.QUEUE_ITEM_LEAVE_MS).toBeLessThanOrEqual(ANIMATION.QUEUE_ITEM_ENTER_MS)
  })
})

describe('cssMs', () => {
  it('formats a number as a CSS millisecond string', () => {
    expect(cssMs(300)).toBe('300ms')
    expect(cssMs(0)).toBe('0ms')
  })
})
