import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope } from 'vue'
import { useScrolledNav } from '@/composables/useScrolledNav'

describe('useScrolledNav', () => {
  let addSpy: ReturnType<typeof vi.spyOn>
  let removeSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addSpy = vi.spyOn(window, 'addEventListener')
    removeSpy = vi.spyOn(window, 'removeEventListener')
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('isScrolled starts false', () => {
    const scope = effectScope()
    scope.run(() => {
      const { isScrolled } = useScrolledNav()
      expect(isScrolled.value).toBe(false)
    })
    scope.stop()
  })

  it('attaches a passive scroll listener on init', () => {
    const scope = effectScope()
    scope.run(() => {
      const { init } = useScrolledNav()
      init()
      expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
    })
    scope.stop()
  })

  it('toggles isScrolled when scrollY exceeds threshold', () => {
    const scope = effectScope()
    scope.run(() => {
      const { isScrolled, init } = useScrolledNav()
      init()

      Object.defineProperty(window, 'scrollY', { value: 50, configurable: true })
      window.dispatchEvent(new Event('scroll'))
      expect(isScrolled.value).toBe(true)

      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
      window.dispatchEvent(new Event('scroll'))
      expect(isScrolled.value).toBe(false)
    })
    scope.stop()
  })

  it('destroy removes listener and resets isScrolled', () => {
    const scope = effectScope()
    scope.run(() => {
      const { isScrolled, init, destroy } = useScrolledNav()
      init()

      Object.defineProperty(window, 'scrollY', { value: 50, configurable: true })
      window.dispatchEvent(new Event('scroll'))
      expect(isScrolled.value).toBe(true)

      destroy()
      expect(isScrolled.value).toBe(false)
      expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })
    scope.stop()
  })

  it('removes listener when scope is disposed', () => {
    const scope = effectScope()
    scope.run(() => {
      const { init } = useScrolledNav()
      init()
    })
    scope.stop()

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
