import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope } from 'vue'
import { useSectionReveal } from '@/composables/useSectionReveal'
import { setupIntersectionObserverMock } from '../helpers/mockIntersectionObserver'

describe('useSectionReveal', () => {
  let mock: ReturnType<typeof setupIntersectionObserverMock>

  beforeEach(() => {
    mock = setupIntersectionObserverMock()
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('isRevealed starts false', () => {
    const scope = effectScope()
    scope.run(() => {
      const { isRevealed } = useSectionReveal()
      expect(isRevealed.value).toBe(false)
    })
    scope.stop()
  })

  it('becomes true when IntersectionObserver fires isIntersecting', () => {
    const scope = effectScope()
    scope.run(() => {
      const { isRevealed, init } = useSectionReveal()
      init(document.createElement('div'))

      mock.trigger([{ isIntersecting: true }])
      expect(isRevealed.value).toBe(true)
    })
    scope.stop()
  })

  it('stays true after element leaves viewport (once behavior)', () => {
    const scope = effectScope()
    scope.run(() => {
      const { isRevealed, init } = useSectionReveal()
      init(document.createElement('div'))

      mock.trigger([{ isIntersecting: true }])
      expect(isRevealed.value).toBe(true)

      // Observer disconnects after reveal, so it won't toggle back
      expect(mock.disconnectSpy).toHaveBeenCalled()
    })
    scope.stop()
  })

  it('respects prefers-reduced-motion (immediately revealed)', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))

    const scope = effectScope()
    scope.run(() => {
      const { isRevealed, init } = useSectionReveal()
      init(document.createElement('div'))

      expect(isRevealed.value).toBe(true)
      // No observer created when reduced motion is preferred
      expect(mock.observeSpy).not.toHaveBeenCalled()
    })
    scope.stop()
  })

  it('destroy disconnects observer', () => {
    const scope = effectScope()
    scope.run(() => {
      const { init, destroy } = useSectionReveal()
      init(document.createElement('div'))

      destroy()

      expect(mock.disconnectSpy).toHaveBeenCalled()
    })
    scope.stop()
  })

  it('guards against duplicate init calls', () => {
    const scope = effectScope()
    scope.run(() => {
      const { init } = useSectionReveal()
      const el = document.createElement('div')
      init(el)
      init(el)

      expect(mock.observeSpy).toHaveBeenCalledTimes(1)
    })
    scope.stop()
  })

  it('disconnects observer when scope is disposed', () => {
    const scope = effectScope()
    scope.run(() => {
      const { init } = useSectionReveal()
      init(document.createElement('div'))
    })
    scope.stop()

    expect(mock.disconnectSpy).toHaveBeenCalled()
  })
})
