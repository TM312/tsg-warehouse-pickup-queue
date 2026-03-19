import { describe, expect, it } from 'vitest'
import { RESPONSIVE } from '@/constants/responsive'

describe('RESPONSIVE constants', () => {
  it('has all required keys', () => {
    const keys = Object.keys(RESPONSIVE)
    expect(keys).toContain('COMPACT_BREAKPOINT_PX')
    expect(keys).toContain('TAP_TARGET_MIN_PX')
    expect(keys).toContain('ACTIVITY_FEED_MOBILE_MAX_H_PX')
    expect(keys).toContain('ACTIVITY_FEED_DEFAULT_MAX_H_PX')
    expect(keys).toContain('SORTABLE_TOUCH_DELAY_MS')
    expect(keys).toContain('SORTABLE_TOUCH_THRESHOLD_PX')
    expect(keys).toContain('PHONE_FRAME_BASELINE_PX')
    expect(keys).toContain('PHONE_FRAME_SCALE_RATIO')
  })

  it('PHONE_FRAME_SCALE_RATIO is between 0 and 1 exclusive', () => {
    expect(RESPONSIVE.PHONE_FRAME_SCALE_RATIO).toBeGreaterThan(0)
    expect(RESPONSIVE.PHONE_FRAME_SCALE_RATIO).toBeLessThan(1)
  })

  it('TAP_TARGET_MIN_PX meets WCAG 2.5.8 minimum of 44px', () => {
    expect(RESPONSIVE.TAP_TARGET_MIN_PX).toBeGreaterThanOrEqual(44)
  })

  it('mobile feed max-height is less than desktop', () => {
    expect(RESPONSIVE.ACTIVITY_FEED_MOBILE_MAX_H_PX).toBeLessThan(
      RESPONSIVE.ACTIVITY_FEED_DEFAULT_MAX_H_PX,
    )
  })

  it('all values are positive numbers', () => {
    for (const [, value] of Object.entries(RESPONSIVE)) {
      expect(value).toBeGreaterThan(0)
    }
  })
})
