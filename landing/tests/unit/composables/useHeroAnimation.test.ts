import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useHeroAnimation } from '@/composables/useHeroAnimation'

describe('useHeroAnimation', () => {
  let observeSpy: ReturnType<typeof vi.fn>
  let disconnectSpy: ReturnType<typeof vi.fn>
  let intersectionCallback: (entries: Array<{ isIntersecting: boolean }>) => void

  beforeEach(() => {
    observeSpy = vi.fn()
    disconnectSpy = vi.fn()

    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn((cb: typeof intersectionCallback) => {
        intersectionCallback = cb
        return { observe: observeSpy, disconnect: disconnectSpy }
      }),
    )

    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('isVisible starts false', () => {
    const { isVisible } = useHeroAnimation()
    expect(isVisible.value).toBe(false)
  })

  it('isVisible becomes true when IntersectionObserver fires', () => {
    const { isVisible, init } = useHeroAnimation()
    init(document.createElement('div'))

    intersectionCallback([{ isIntersecting: true }])
    expect(isVisible.value).toBe(true)
  })

  it('isVisible becomes false when element leaves viewport', () => {
    const { isVisible, init } = useHeroAnimation()
    init(document.createElement('div'))

    intersectionCallback([{ isIntersecting: true }])
    intersectionCallback([{ isIntersecting: false }])
    expect(isVisible.value).toBe(false)
  })

  it('reads prefersReducedMotion from matchMedia', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))

    const { prefersReducedMotion, init } = useHeroAnimation()
    init(document.createElement('div'))

    expect(prefersReducedMotion.value).toBe(true)
  })

  it('destroy disconnects observer and resets isVisible', () => {
    const { isVisible, init, destroy } = useHeroAnimation()
    init(document.createElement('div'))

    intersectionCallback([{ isIntersecting: true }])
    expect(isVisible.value).toBe(true)

    destroy()

    expect(disconnectSpy).toHaveBeenCalled()
    expect(isVisible.value).toBe(false)
  })

  it('guards against duplicate init calls', () => {
    const { init } = useHeroAnimation()
    const el = document.createElement('div')
    init(el)
    init(el)

    expect(observeSpy).toHaveBeenCalledTimes(1)
  })
})
