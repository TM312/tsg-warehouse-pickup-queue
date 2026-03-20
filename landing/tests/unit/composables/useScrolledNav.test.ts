import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
    const { isScrolled } = useScrolledNav()
    expect(isScrolled.value).toBe(false)
  })

  it('attaches a passive scroll listener on init', () => {
    const { init, destroy } = useScrolledNav()
    init()
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
    destroy()
  })

  it('toggles isScrolled when scrollY exceeds threshold', () => {
    const { isScrolled, init, destroy } = useScrolledNav()
    init()

    Object.defineProperty(window, 'scrollY', { value: 50, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    expect(isScrolled.value).toBe(true)

    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    expect(isScrolled.value).toBe(false)

    destroy()
  })

  it('destroy removes listener and resets isScrolled', () => {
    const { isScrolled, init, destroy } = useScrolledNav()
    init()

    Object.defineProperty(window, 'scrollY', { value: 50, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    expect(isScrolled.value).toBe(true)

    destroy()
    expect(isScrolled.value).toBe(false)
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
