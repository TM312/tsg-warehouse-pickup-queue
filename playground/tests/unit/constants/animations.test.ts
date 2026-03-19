import { describe, it, expect } from 'vitest'
import { ANIMATION } from '@/constants/animations'

describe('animation constants', () => {
  const expectedKeys = [
    'QUEUE_ITEM_ENTER_MS',
    'QUEUE_ITEM_LEAVE_MS',
    'STATUS_CROSSFADE_MS',
    'KPI_TWEEN_MS',
    'PROCESSING_PULSE_MS',
    'FEED_ITEM_ENTER_MS',
    'CROSS_PANEL_HIGHLIGHT_MS',
    'PROGRESS_BAR_TRANSITION_MS',
  ] as const

  it('exports all expected animation keys', () => {
    for (const key of expectedKeys) {
      expect(ANIMATION).toHaveProperty(key)
    }
  })

  it('contains no unexpected keys', () => {
    expect(Object.keys(ANIMATION)).toHaveLength(expectedKeys.length)
  })

  it.each(expectedKeys)('%s is a positive integer in milliseconds', (key) => {
    const value = ANIMATION[key]
    expect(value).toBeGreaterThan(0)
    expect(Number.isInteger(value)).toBe(true)
  })

  it('has leave durations not exceeding enter durations', () => {
    expect(ANIMATION.QUEUE_ITEM_LEAVE_MS).toBeLessThanOrEqual(ANIMATION.QUEUE_ITEM_ENTER_MS)
  })
})
