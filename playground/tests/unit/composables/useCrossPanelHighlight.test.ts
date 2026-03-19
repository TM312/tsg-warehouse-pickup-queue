import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, effectScope, nextTick } from 'vue'

const mockActivePanel = ref('staff')
const mockBreakpoint = ref<'mobile' | 'tablet' | 'desktop'>('desktop')

vi.mock('@vueuse/core', () => ({
  useMediaQuery: vi.fn(() => ref(false)),
}))

vi.mock('@/composables/useActivePanel', () => ({
  useActivePanel: () => ({
    activePanel: mockActivePanel,
    breakpoint: mockBreakpoint,
    setActivePanel: vi.fn(),
    customerOverlayOpen: ref(false),
    toggleCustomerOverlay: vi.fn(),
  }),
}))

import { useMediaQuery } from '@vueuse/core'
import { useCrossPanelHighlight } from '@/composables/useCrossPanelHighlight'
import { HIGHLIGHT_TARGET } from '@/constants/highlights'
import { ANIMATION } from '@/constants/animations'

describe('useCrossPanelHighlight', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(useMediaQuery).mockReturnValue(ref(false))
    mockActivePanel.value = 'staff'
    mockBreakpoint.value = 'desktop'

    // Reset module-level state
    const scope = effectScope()
    scope.run(() => {
      const { resetAll } = useCrossPanelHighlight()
      resetAll()
    })
    scope.stop()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('highlight triggering', () => {
    it('highlight("approve") makes CUSTOMER_STATUS and KPI_CURRENTLY_WAITING highlighted', () => {
      const scope = effectScope()
      scope.run(() => {
        const { highlight, isHighlighted } = useCrossPanelHighlight()
        highlight('approve')
        expect(isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS)).toBe(true)
        expect(isHighlighted(HIGHLIGHT_TARGET.KPI_CURRENTLY_WAITING)).toBe(true)
        expect(isHighlighted(HIGHLIGHT_TARGET.ACTIVITY_FEED)).toBe(true)
      })
      scope.stop()
    })

    it('targets not in the mapping return false', () => {
      const scope = effectScope()
      scope.run(() => {
        const { highlight, isHighlighted } = useCrossPanelHighlight()
        highlight('approve')
        expect(isHighlighted(HIGHLIGHT_TARGET.KPI_COMPLETED_COUNT)).toBe(false)
        expect(isHighlighted(HIGHLIGHT_TARGET.KPI_AVG_PROCESSING_TIME)).toBe(false)
      })
      scope.stop()
    })

    it('highlight("submit") does not highlight anything (not in mapping)', () => {
      const scope = effectScope()
      scope.run(() => {
        const { highlight, isHighlighted } = useCrossPanelHighlight()
        highlight('submit')
        expect(isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS)).toBe(false)
      })
      scope.stop()
    })
  })

  describe('highlight expiry', () => {
    it('highlights clear after CROSS_PANEL_HIGHLIGHT_MS', () => {
      const scope = effectScope()
      scope.run(() => {
        const { highlight, isHighlighted } = useCrossPanelHighlight()
        highlight('approve')
        expect(isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS)).toBe(true)

        vi.advanceTimersByTime(ANIMATION.CROSS_PANEL_HIGHLIGHT_MS)
        expect(isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS)).toBe(false)
      })
      scope.stop()
    })

    it('re-highlighting resets the timeout', async () => {
      const scope = effectScope()
      await scope.run(async () => {
        const { highlight, isHighlighted } = useCrossPanelHighlight()
        highlight('approve')

        vi.advanceTimersByTime(ANIMATION.CROSS_PANEL_HIGHLIGHT_MS - 100)
        expect(isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS)).toBe(true)

        // Re-highlight removes target, then re-adds after nextTick
        highlight('approve')
        expect(isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS)).toBe(false)

        await nextTick()
        expect(isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS)).toBe(true)

        // Timer resets from re-add, so 100ms is not enough
        vi.advanceTimersByTime(100)
        expect(isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS)).toBe(true)

        vi.advanceTimersByTime(ANIMATION.CROSS_PANEL_HIGHLIGHT_MS - 100)
        expect(isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS)).toBe(false)
      })
      scope.stop()
    })

    it('re-triggering toggles highlight off then on to restart CSS animation', async () => {
      const scope = effectScope()
      await scope.run(async () => {
        const { highlight, isHighlighted } = useCrossPanelHighlight()
        highlight('approve')
        expect(isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS)).toBe(true)

        // Re-trigger while still highlighted
        highlight('approve')
        // Target is removed synchronously so CSS class detaches
        expect(isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS)).toBe(false)

        // After nextTick, target is re-added so CSS class reattaches (animation restarts)
        await nextTick()
        expect(isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS)).toBe(true)
      })
      scope.stop()
    })
  })

  describe('unseen panels (mobile)', () => {
    it('adds unseen panels when breakpoint is mobile and target panel differs from active', () => {
      mockBreakpoint.value = 'mobile'
      mockActivePanel.value = 'staff'

      const scope = effectScope()
      scope.run(() => {
        const { highlight, hasUnseen } = useCrossPanelHighlight()
        highlight('approve')
        expect(hasUnseen('customer')).toBe(true)
        expect(hasUnseen('analytics')).toBe(true)
      })
      scope.stop()
    })

    it('clearUnseen removes the panel', () => {
      mockBreakpoint.value = 'mobile'
      mockActivePanel.value = 'staff'

      const scope = effectScope()
      scope.run(() => {
        const { highlight, hasUnseen, clearUnseen } = useCrossPanelHighlight()
        highlight('approve')
        expect(hasUnseen('customer')).toBe(true)
        clearUnseen('customer')
        expect(hasUnseen('customer')).toBe(false)
      })
      scope.stop()
    })

    it('unseen not added when target panel equals active panel', () => {
      mockBreakpoint.value = 'mobile'
      mockActivePanel.value = 'customer'

      const scope = effectScope()
      scope.run(() => {
        const { highlight, hasUnseen } = useCrossPanelHighlight()
        highlight('approve')
        // customer panel is active, so it shouldn't be unseen
        expect(hasUnseen('customer')).toBe(false)
        // analytics is not active, so it should be unseen
        expect(hasUnseen('analytics')).toBe(true)
      })
      scope.stop()
    })

    it('unseen not added on desktop', () => {
      mockBreakpoint.value = 'desktop'
      mockActivePanel.value = 'staff'

      const scope = effectScope()
      scope.run(() => {
        const { highlight, hasUnseen } = useCrossPanelHighlight()
        highlight('approve')
        expect(hasUnseen('customer')).toBe(false)
        expect(hasUnseen('analytics')).toBe(false)
      })
      scope.stop()
    })

    it('unseen not added on tablet', () => {
      mockBreakpoint.value = 'tablet'
      mockActivePanel.value = 'staff'

      const scope = effectScope()
      scope.run(() => {
        const { highlight, hasUnseen } = useCrossPanelHighlight()
        highlight('approve')
        expect(hasUnseen('customer')).toBe(false)
        expect(hasUnseen('analytics')).toBe(false)
      })
      scope.stop()
    })
  })

  describe('reduced motion', () => {
    it('highlight() is a no-op when reduced motion is active', () => {
      vi.mocked(useMediaQuery).mockReturnValue(ref(true))

      const scope = effectScope()
      scope.run(() => {
        const { highlight, isHighlighted } = useCrossPanelHighlight()
        highlight('approve')
        expect(isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS)).toBe(false)
      })
      scope.stop()
    })
  })

  describe('reset', () => {
    it('resetAll() clears highlights, unseen set, and timeouts', () => {
      mockBreakpoint.value = 'mobile'
      mockActivePanel.value = 'staff'

      const scope = effectScope()
      scope.run(() => {
        const { highlight, isHighlighted, hasUnseen, resetAll } = useCrossPanelHighlight()
        highlight('approve')
        expect(isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS)).toBe(true)
        expect(hasUnseen('customer')).toBe(true)

        resetAll()
        expect(isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS)).toBe(false)
        expect(hasUnseen('customer')).toBe(false)

        // Advancing timers should not cause errors
        vi.advanceTimersByTime(ANIMATION.CROSS_PANEL_HIGHLIGHT_MS)
      })
      scope.stop()
    })
  })
})
