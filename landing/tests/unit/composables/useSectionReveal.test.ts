import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSectionReveal } from '@/composables/useSectionReveal'

describe('useSectionReveal', () => {
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

  it('isRevealed starts false', () => {
    const { isRevealed } = useSectionReveal()
    expect(isRevealed.value).toBe(false)
  })

  it('becomes true when IntersectionObserver fires isIntersecting', () => {
    const { isRevealed, init } = useSectionReveal()
    init(document.createElement('div'))

    intersectionCallback([{ isIntersecting: true }])
    expect(isRevealed.value).toBe(true)
  })

  it('stays true after element leaves viewport (once behavior)', () => {
    const { isRevealed, init } = useSectionReveal()
    init(document.createElement('div'))

    intersectionCallback([{ isIntersecting: true }])
    expect(isRevealed.value).toBe(true)

    // Observer disconnects after reveal, so it won't toggle back
    expect(disconnectSpy).toHaveBeenCalled()
  })

  it('respects prefers-reduced-motion (immediately revealed)', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))

    const { isRevealed, init } = useSectionReveal()
    init(document.createElement('div'))

    expect(isRevealed.value).toBe(true)
    // No observer created when reduced motion is preferred
    expect(observeSpy).not.toHaveBeenCalled()
  })

  it('destroy disconnects observer', () => {
    const { init, destroy } = useSectionReveal()
    init(document.createElement('div'))

    destroy()

    expect(disconnectSpy).toHaveBeenCalled()
  })

  it('guards against duplicate init calls', () => {
    const { init } = useSectionReveal()
    const el = document.createElement('div')
    init(el)
    init(el)

    expect(observeSpy).toHaveBeenCalledTimes(1)
  })
})
