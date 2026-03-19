import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { effectScope } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { toast } from 'vue-sonner'
import { useAutoPlay } from '@/composables/useAutoPlay'
import { useGuidedWalkthrough } from '@/composables/useGuidedWalkthrough'
import { useSimulationStore } from '@/stores/simulation'
import { useQueueStore } from '@/stores/queue'
import { AUTOPLAY_DELAY_MS, STORAGE_KEY } from '@/constants/autoplay'

vi.mock('vue-sonner', () => ({ toast: vi.fn() }))
vi.mock('@vueuse/core', () => ({
  useMediaQuery: vi.fn(() => ({ value: true })),
}))

const mockedToast = vi.mocked(toast)

function mockLocalStorage(data: Record<string, string> = {}) {
  const store = { ...data }
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
  }
}

describe('useAutoPlay', () => {
  let storage: ReturnType<typeof mockLocalStorage>

  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    storage = mockLocalStorage()
    vi.stubGlobal('localStorage', storage)
    mockedToast.mockClear()

    const { skip } = useGuidedWalkthrough()
    skip()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  describe('first visit detection', () => {
    it('treats missing localStorage key as first visit', () => {
      const { isFirstVisit, initialize } = useAutoPlay()
      initialize()
      expect(isFirstVisit.value).toBe(true)
    })

    it('treats existing localStorage key as return visit', () => {
      storage = mockLocalStorage({ [STORAGE_KEY.HAS_VISITED]: '1' })
      vi.stubGlobal('localStorage', storage)

      const { isFirstVisit, initialize } = useAutoPlay()
      initialize()
      expect(isFirstVisit.value).toBe(false)
    })

    it('handles localStorage.getItem throwing (treats as first visit)', () => {
      storage.getItem.mockImplementation(() => {
        throw new Error('storage disabled')
      })

      const { isFirstVisit, initialize } = useAutoPlay()
      initialize()
      expect(isFirstVisit.value).toBe(true)
    })
  })

  describe('initialize — first visit', () => {
    it('sets panelsReady after nextTick', async () => {
      const { panelsReady, initialize } = useAutoPlay()
      initialize()
      expect(panelsReady.value).toBe(false)

      await flushPromises()
      expect(panelsReady.value).toBe(true)
    })

    it('runs Morning Rush scenario after AUTOPLAY_DELAY_MS', () => {
      const queue = useQueueStore()
      const { initialize } = useAutoPlay()
      initialize()

      expect(queue.requests.length).toBe(0)

      vi.advanceTimersByTime(AUTOPLAY_DELAY_MS)
      expect(queue.requests.length).toBeGreaterThanOrEqual(2)
    })

    it('selects first customer request after scenario starts', () => {
      const simulation = useSimulationStore()
      const queue = useQueueStore()
      const { initialize } = useAutoPlay()
      initialize()

      vi.advanceTimersByTime(AUTOPLAY_DELAY_MS)
      expect(simulation.selectedCustomerRequestId).toBe(queue.requests[0].id)
    })

    it('writes localStorage flag after auto-play starts', () => {
      const { initialize } = useAutoPlay()
      initialize()

      expect(storage.setItem).not.toHaveBeenCalled()

      vi.advanceTimersByTime(AUTOPLAY_DELAY_MS)
      expect(storage.setItem).toHaveBeenCalledWith(STORAGE_KEY.HAS_VISITED, '1')
    })

    it('shows toast with tour action', () => {
      const { initialize } = useAutoPlay()
      initialize()

      vi.advanceTimersByTime(AUTOPLAY_DELAY_MS)
      expect(mockedToast).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          action: expect.objectContaining({ label: 'Start Tour' }),
          dismissible: true,
        }),
      )
    })

    it('sets introComplete after auto-play starts', () => {
      const { introComplete, initialize } = useAutoPlay()
      initialize()

      expect(introComplete.value).toBe(false)
      vi.advanceTimersByTime(AUTOPLAY_DELAY_MS)
      expect(introComplete.value).toBe(true)
    })
  })

  describe('initialize — return visit', () => {
    beforeEach(() => {
      storage = mockLocalStorage({ [STORAGE_KEY.HAS_VISITED]: '1' })
      vi.stubGlobal('localStorage', storage)
    })

    it('does not run any scenario', () => {
      const queue = useQueueStore()
      const { initialize } = useAutoPlay()
      initialize()

      vi.advanceTimersByTime(AUTOPLAY_DELAY_MS * 2)
      expect(queue.requests.length).toBe(0)
    })

    it('does not show toast', () => {
      const { initialize } = useAutoPlay()
      initialize()

      vi.advanceTimersByTime(AUTOPLAY_DELAY_MS * 2)
      expect(mockedToast).not.toHaveBeenCalled()
    })

    it('panelsReady stays false', async () => {
      const { panelsReady, initialize } = useAutoPlay()
      initialize()

      await flushPromises()
      expect(panelsReady.value).toBe(false)
    })
  })

  describe('initialize — walkthrough active', () => {
    it('skips auto-play when walkthrough is already active', () => {
      const { start: startWalkthrough } = useGuidedWalkthrough()
      startWalkthrough()

      const queue = useQueueStore()
      const requestCountAfterWalkthrough = queue.requests.length

      const { initialize } = useAutoPlay()
      initialize()

      vi.advanceTimersByTime(AUTOPLAY_DELAY_MS)
      const { isActive } = useGuidedWalkthrough()
      expect(isActive.value).toBe(true)
      expect(queue.requests.length).toBe(requestCountAfterWalkthrough)
    })
  })

  describe('toast action', () => {
    it('invokes the guided walkthrough when toast action is clicked', () => {
      const { initialize } = useAutoPlay()
      initialize()

      vi.advanceTimersByTime(AUTOPLAY_DELAY_MS)

      const toastCall = mockedToast.mock.calls[0]
      const options = toastCall[1] as { action: { onClick: () => void } }
      options.action.onClick()

      const { isActive } = useGuidedWalkthrough()
      expect(isActive.value).toBe(true)
    })
  })

  describe('cleanup', () => {
    it('clears pending timeout before delay fires', () => {
      const queue = useQueueStore()
      const { initialize, cleanup } = useAutoPlay()
      initialize()

      cleanup()
      vi.advanceTimersByTime(AUTOPLAY_DELAY_MS * 2)
      expect(queue.requests.length).toBe(0)
    })

    it('cancels pending queue watcher on unmount', () => {
      const simulation = useSimulationStore()
      const queue = useQueueStore()
      const { initialize, cleanup } = useAutoPlay()
      initialize()

      vi.advanceTimersByTime(AUTOPLAY_DELAY_MS)

      // Queue is already populated so the watcher resolved immediately.
      // Re-initialize with an empty queue to test the watcher branch.
      setActivePinia(createPinia())
      const queue2 = useQueueStore()
      const simulation2 = useSimulationStore()
      const auto2 = useAutoPlay()
      auto2.initialize()
      vi.advanceTimersByTime(AUTOPLAY_DELAY_MS)

      // Cleanup before queue populates — watcher should be disposed
      auto2.cleanup()

      // Simulate late queue population
      queue2.requests.push({ id: 'late-request' } as any)
      expect(simulation2.selectedCustomerRequestId).toBeNull()
    })

    it('is idempotent', () => {
      const { initialize, cleanup } = useAutoPlay()
      initialize()

      expect(() => {
        cleanup()
        cleanup()
      }).not.toThrow()
    })
  })

  describe('scope disposal', () => {
    it('cleans up pending timeout when scope is disposed', () => {
      const queue = useQueueStore()
      const scope = effectScope()

      scope.run(() => {
        const { initialize } = useAutoPlay()
        initialize()
      })

      scope.stop()
      vi.advanceTimersByTime(AUTOPLAY_DELAY_MS * 2)
      expect(queue.requests.length).toBe(0)
    })
  })

  describe('error handling', () => {
    it('handles localStorage.setItem throwing gracefully', () => {
      storage.setItem.mockImplementation(() => {
        throw new Error('quota exceeded')
      })

      const { initialize } = useAutoPlay()
      expect(() => {
        initialize()
        vi.advanceTimersByTime(AUTOPLAY_DELAY_MS)
      }).not.toThrow()
    })
  })
})
