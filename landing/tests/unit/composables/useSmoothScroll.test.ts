import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope } from 'vue'
import { useSmoothScroll, scrollToHash } from '@/composables/useSmoothScroll'

describe('useSmoothScroll', () => {
  let addSpy: ReturnType<typeof vi.spyOn>
  let removeSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addSpy = vi.spyOn(document, 'addEventListener')
    removeSpy = vi.spyOn(document, 'removeEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('attaches a click listener on init', () => {
    const scope = effectScope()
    scope.run(() => {
      const { init } = useSmoothScroll()
      init()
      expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function))
    })
    scope.stop()
  })

  it('removes the listener on destroy', () => {
    const scope = effectScope()
    scope.run(() => {
      const { init, destroy } = useSmoothScroll()
      init()
      destroy()
      expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function))
    })
    scope.stop()
  })

  it('does not attach duplicate listeners on the same instance', () => {
    const scope = effectScope()
    scope.run(() => {
      const { init } = useSmoothScroll()
      init()
      init()
      const clickCalls = addSpy.mock.calls.filter(([event]) => event === 'click')
      expect(clickCalls).toHaveLength(1)
    })
    scope.stop()
  })

  it('separate instances attach independent listeners', () => {
    const scope = effectScope()
    scope.run(() => {
      const a = useSmoothScroll()
      const b = useSmoothScroll()
      a.init()
      b.init()
      const clickCalls = addSpy.mock.calls.filter(([event]) => event === 'click')
      expect(clickCalls).toHaveLength(2)
    })
    scope.stop()
  })

  it('removes listener when scope is disposed', () => {
    const scope = effectScope()
    scope.run(() => {
      const { init } = useSmoothScroll()
      init()
    })
    scope.stop()

    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function))
  })
})

describe('scrollToHash', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls scrollIntoView on matching element', () => {
    const mockEl = { scrollIntoView: vi.fn() }
    vi.spyOn(document, 'querySelector').mockReturnValue(mockEl as unknown as Element)
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})

    scrollToHash('#features')

    expect(mockEl.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('updates history with the hash', () => {
    const mockEl = { scrollIntoView: vi.fn() }
    vi.spyOn(document, 'querySelector').mockReturnValue(mockEl as unknown as Element)
    const replaceSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})

    scrollToHash('#pricing')

    expect(replaceSpy).toHaveBeenCalledWith(null, '', '#pricing')
  })

  it('is a no-op for missing elements', () => {
    vi.spyOn(document, 'querySelector').mockReturnValue(null)
    expect(() => scrollToHash('#nonexistent')).not.toThrow()
  })
})
