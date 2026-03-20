import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useAnimatedNumber } from '@/composables/useAnimatedNumber'

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
    const source = ref(100)
    const { displayed } = useAnimatedNumber(source)
    expect(displayed.value).toBe(100)
  })

  it('reaches target after animation frames', async () => {
    const source = ref(0)
    const { displayed } = useAnimatedNumber(source, 400)

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
      rafCallback(performance.now() + 500)
    }

    expect(displayed.value).toBe(200)
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

    const source = ref(0)
    const { displayed } = useAnimatedNumber(source, 400)

    source.value = 500
    await nextTick()

    expect(displayed.value).toBe(500)
  })
})
