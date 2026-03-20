import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick, effectScope } from 'vue'
import { useAnimatedNumber } from '@/composables/useAnimatedNumber'
import { ANIMATION_DURATION_MS } from '@/constants/animation'

describe('useAnimatedNumber', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('initial displayed equals source value', () => {
    const scope = effectScope()
    scope.run(() => {
      const source = ref(100)
      const { displayed } = useAnimatedNumber(source)
      expect(displayed.value).toBe(100)
    })
    scope.stop()
  })

  it('reaches target after animation frames', async () => {
    const scope = effectScope()
    await scope.run(async () => {
      const source = ref(0)
      const { displayed } = useAnimatedNumber(source, ANIMATION_DURATION_MS)

      source.value = 100
      await nextTick()

      // Simulate rAF with enough elapsed time to complete
      let rafCallback: ((time: number) => void) | null = null
      vi.stubGlobal('requestAnimationFrame', (cb: (time: number) => void) => {
        rafCallback = cb
        return 1
      })

      // Re-trigger the watch by changing source again to pick up the stubbed rAF
      source.value = 200
      await nextTick()

      // Advance past duration
      if (rafCallback) {
        rafCallback(performance.now() + ANIMATION_DURATION_MS + 100)
      }

      expect(displayed.value).toBe(200)
    })
    scope.stop()
  })

  it('snaps instantly when prefers-reduced-motion is set', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const scope = effectScope()
    await scope.run(async () => {
      const source = ref(0)
      const { displayed } = useAnimatedNumber(source, ANIMATION_DURATION_MS)

      source.value = 500
      await nextTick()

      expect(displayed.value).toBe(500)
    })
    scope.stop()
  })

  it('cancels previous animation when source changes mid-animation', async () => {
    const cancelSpy = vi.fn()
    vi.stubGlobal('cancelAnimationFrame', cancelSpy)

    let rafId = 0
    vi.stubGlobal('requestAnimationFrame', (_cb: (time: number) => void) => {
      return ++rafId
    })

    const scope = effectScope()
    await scope.run(async () => {
      const source = ref(0)
      useAnimatedNumber(source, ANIMATION_DURATION_MS)

      source.value = 100
      await nextTick()

      const firstRafId = rafId

      // Change source again mid-animation
      source.value = 200
      await nextTick()

      expect(cancelSpy).toHaveBeenCalledWith(firstRafId)
    })
    scope.stop()
  })

  it('cancels pending animation when scope is disposed', async () => {
    const cancelSpy = vi.fn()
    vi.stubGlobal('cancelAnimationFrame', cancelSpy)
    vi.stubGlobal('requestAnimationFrame', () => 42)

    const scope = effectScope()
    await scope.run(async () => {
      const source = ref(0)
      useAnimatedNumber(source, ANIMATION_DURATION_MS)

      source.value = 100
      await nextTick()
    })
    scope.stop()

    expect(cancelSpy).toHaveBeenCalledWith(42)
  })
})
