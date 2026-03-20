import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope } from 'vue'
import { useHeroAnimation } from '@/composables/useHeroAnimation'
import { setupIntersectionObserverMock } from '../helpers/mockIntersectionObserver'
import { REVEAL_THRESHOLD } from '@/constants/animation'

describe('useHeroAnimation', () => {
  let mock: ReturnType<typeof setupIntersectionObserverMock>

  beforeEach(() => {
    mock = setupIntersectionObserverMock()
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('isVisible starts false', () => {
    const scope = effectScope()
    scope.run(() => {
      const { isVisible } = useHeroAnimation()
      expect(isVisible.value).toBe(false)
    })
    scope.stop()
  })

  it('isVisible becomes true when IntersectionObserver fires', () => {
    const scope = effectScope()
    scope.run(() => {
      const { isVisible, init } = useHeroAnimation()
      init(document.createElement('div'))

      mock.trigger([{ isIntersecting: true }])
      expect(isVisible.value).toBe(true)
    })
    scope.stop()
  })

  it('isVisible becomes false when element leaves viewport', () => {
    const scope = effectScope()
    scope.run(() => {
      const { isVisible, init } = useHeroAnimation()
      init(document.createElement('div'))

      mock.trigger([{ isIntersecting: true }])
      mock.trigger([{ isIntersecting: false }])
      expect(isVisible.value).toBe(false)
    })
    scope.stop()
  })

  it('reads prefersReducedMotion from matchMedia', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))

    const scope = effectScope()
    scope.run(() => {
      const { prefersReducedMotion, init } = useHeroAnimation()
      init(document.createElement('div'))

      expect(prefersReducedMotion.value).toBe(true)
    })
    scope.stop()
  })

  it('uses REVEAL_THRESHOLD from animation constants', () => {
    const { init } = useHeroAnimation()
    init(document.createElement('div'))

    expect(IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), { threshold: REVEAL_THRESHOLD })
  })

  it('destroy disconnects observer and resets isVisible', () => {
    const scope = effectScope()
    scope.run(() => {
      const { isVisible, init, destroy } = useHeroAnimation()
      init(document.createElement('div'))

      mock.trigger([{ isIntersecting: true }])
      expect(isVisible.value).toBe(true)

      destroy()

      expect(mock.disconnectSpy).toHaveBeenCalled()
      expect(isVisible.value).toBe(false)
    })
    scope.stop()
  })

  it('guards against duplicate init calls', () => {
    const scope = effectScope()
    scope.run(() => {
      const { init } = useHeroAnimation()
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
      const { init } = useHeroAnimation()
      init(document.createElement('div'))
    })
    scope.stop()

    expect(mock.disconnectSpy).toHaveBeenCalled()
  })

  it('handles empty entries array without throwing', () => {
    const scope = effectScope()
    scope.run(() => {
      const { isVisible, init } = useHeroAnimation()
      init(document.createElement('div'))

      mock.trigger([])
      expect(isVisible.value).toBe(false)
    })
    scope.stop()
  })
})
