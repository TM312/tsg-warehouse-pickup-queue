import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { TOAST_DURATION_MS } from '@/constants/toasts'

const { mockToast, mockWalkthroughActive } = vi.hoisted(() => ({
  mockToast: {
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
  mockWalkthroughActive: { value: false },
}))

vi.mock('vue-sonner', () => ({
  toast: mockToast,
}))

vi.mock('@/composables/useGuidedWalkthrough', () => ({
  useGuidedWalkthrough: () => ({
    isActive: mockWalkthroughActive,
  }),
}))

import { useSimulationToasts, _resetSimulationToasts } from '@/composables/useSimulationToasts'

describe('useSimulationToasts', () => {
  let toasts: ReturnType<typeof useSimulationToasts>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockWalkthroughActive.value = false
    _resetSimulationToasts()

    const store: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value }),
      removeItem: vi.fn((key: string) => { delete store[key] }),
    })

    toasts = useSimulationToasts()
    toasts.setMuted(false)
  })

  describe('notify methods', () => {
    it('notifySubmit calls toast.info with correct message', () => {
      toasts.notifySubmit('SO-100')
      expect(mockToast.info).toHaveBeenCalledWith('Order SO-100 submitted', { duration: TOAST_DURATION_MS })
    })

    it('notifyApprove calls toast.success with correct message', () => {
      toasts.notifyApprove('SO-200')
      expect(mockToast.success).toHaveBeenCalledWith('Order SO-200 approved', { duration: TOAST_DURATION_MS })
    })

    it('notifyStartProcessing calls toast.info with correct message', () => {
      toasts.notifyStartProcessing(3, 'SO-300')
      expect(mockToast.info).toHaveBeenCalledWith('Gate 3 started processing SO-300', { duration: TOAST_DURATION_MS })
    })

    it('notifyComplete calls toast.success with correct message', () => {
      toasts.notifyComplete('SO-400')
      expect(mockToast.success).toHaveBeenCalledWith('SO-400 pickup complete!', { duration: TOAST_DURATION_MS })
    })

    it('notifyGateOffline calls toast.warning with correct message', () => {
      toasts.notifyGateOffline(5)
      expect(mockToast.warning).toHaveBeenCalledWith('Gate 5 taken offline', { duration: TOAST_DURATION_MS })
    })
  })

  describe('mute suppression', () => {
    it('does not fire toast when muted', () => {
      toasts.setMuted(true)
      toasts.notifySubmit('SO-100')
      toasts.notifyApprove('SO-200')
      toasts.notifyComplete('SO-300')
      expect(mockToast.info).not.toHaveBeenCalled()
      expect(mockToast.success).not.toHaveBeenCalled()
      expect(mockToast.warning).not.toHaveBeenCalled()
    })
  })

  describe('walkthrough suppression', () => {
    it('does not fire toast when walkthrough is active', () => {
      mockWalkthroughActive.value = true
      toasts.notifySubmit('SO-100')
      toasts.notifyApprove('SO-200')
      expect(mockToast.info).not.toHaveBeenCalled()
      expect(mockToast.success).not.toHaveBeenCalled()
    })
  })

  describe('toggleMute', () => {
    it('flips isMuted and writes to localStorage', () => {
      expect(toasts.isMuted.value).toBe(false)
      toasts.toggleMute()
      expect(toasts.isMuted.value).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('playground:toasts-muted', '1')
      toasts.toggleMute()
      expect(toasts.isMuted.value).toBe(false)
      expect(localStorage.setItem).toHaveBeenCalledWith('playground:toasts-muted', '0')
    })
  })

  describe('setMuted', () => {
    it('sets isMuted explicitly and writes to localStorage', () => {
      toasts.setMuted(true)
      expect(toasts.isMuted.value).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('playground:toasts-muted', '1')
    })
  })

  describe('persisted mute preference', () => {
    it('restores muted state from localStorage on init', () => {
      _resetSimulationToasts()
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => '1'),
        setItem: vi.fn(),
      })
      const t = useSimulationToasts()
      expect(t.isMuted.value).toBe(true)
    })

    it('defaults to unmuted when localStorage has no entry', () => {
      _resetSimulationToasts()
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
      })
      const t = useSimulationToasts()
      expect(t.isMuted.value).toBe(false)
    })
  })

  describe('initialization guard', () => {
    it('reads localStorage only once across multiple calls', () => {
      _resetSimulationToasts()
      const getItem = vi.fn(() => null)
      vi.stubGlobal('localStorage', { getItem, setItem: vi.fn() })

      useSimulationToasts()
      useSimulationToasts()
      useSimulationToasts()

      expect(getItem).toHaveBeenCalledTimes(1)
    })

    it('preserves in-memory mute state when a second caller initializes', () => {
      const t1 = useSimulationToasts()
      t1.toggleMute()
      expect(t1.isMuted.value).toBe(true)

      const t2 = useSimulationToasts()
      expect(t2.isMuted.value).toBe(true)
    })

    it('retains mute state when localStorage write fails', () => {
      _resetSimulationToasts()
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => { throw new Error('quota exceeded') }),
      })

      const t1 = useSimulationToasts()
      t1.toggleMute()
      expect(t1.isMuted.value).toBe(true)

      // A second caller must not revert the in-memory state
      const t2 = useSimulationToasts()
      expect(t2.isMuted.value).toBe(true)
    })
  })

  describe('localStorage error handling', () => {
    it('setItem throw does not propagate', () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => { throw new Error('quota exceeded') }),
      })
      expect(() => toasts.setMuted(true)).not.toThrow()
    })

    it('getItem throw defaults to unmuted', () => {
      _resetSimulationToasts()
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => { throw new Error('storage disabled') }),
        setItem: vi.fn(),
      })
      const t = useSimulationToasts()
      expect(t.isMuted.value).toBe(false)
    })
  })
})
