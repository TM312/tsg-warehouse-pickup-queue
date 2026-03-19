import { describe, expect, it, vi, beforeEach } from 'vitest'
import { setBreakpoint, useMediaQueryMock } from '../../helpers/breakpoint-mock'

vi.mock('@vueuse/core', () => ({
  useMediaQuery: useMediaQueryMock,
}))

// Re-import fresh module for each test to reset module-level refs
let useActivePanel: typeof import('@/composables/useActivePanel').useActivePanel

beforeEach(async () => {
  vi.resetModules()
  const mod = await import('@/composables/useActivePanel')
  useActivePanel = mod.useActivePanel
  setBreakpoint('desktop')
})

describe('useActivePanel', () => {
  describe('breakpoint', () => {
    it('returns "desktop" when min-width matches', () => {
      setBreakpoint('desktop')
      const { breakpoint } = useActivePanel()
      expect(breakpoint.value).toBe('desktop')
    })

    it('returns "mobile" when max-width matches', () => {
      setBreakpoint('mobile')
      const { breakpoint } = useActivePanel()
      expect(breakpoint.value).toBe('mobile')
    })

    it('returns "tablet" when neither matches', () => {
      setBreakpoint('tablet')
      const { breakpoint } = useActivePanel()
      expect(breakpoint.value).toBe('tablet')
    })
  })

  describe('activePanel', () => {
    it('defaults to "staff"', () => {
      const { activePanel } = useActivePanel()
      expect(activePanel.value).toBe('staff')
    })

    it('setActivePanel changes the active panel', () => {
      const { activePanel, setActivePanel } = useActivePanel()
      setActivePanel('customer')
      expect(activePanel.value).toBe('customer')
    })

    it('state is shared across multiple calls', () => {
      const first = useActivePanel()
      const second = useActivePanel()
      first.setActivePanel('analytics')
      expect(second.activePanel.value).toBe('analytics')
    })
  })

  describe('customerOverlayOpen', () => {
    it('defaults to false', () => {
      const { customerOverlayOpen } = useActivePanel()
      expect(customerOverlayOpen.value).toBe(false)
    })

    it('toggleCustomerOverlay flips the value', () => {
      const { customerOverlayOpen, toggleCustomerOverlay } = useActivePanel()
      toggleCustomerOverlay()
      expect(customerOverlayOpen.value).toBe(true)
      toggleCustomerOverlay()
      expect(customerOverlayOpen.value).toBe(false)
    })
  })
})
