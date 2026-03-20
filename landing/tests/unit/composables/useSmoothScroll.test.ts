import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSmoothScroll } from '@/composables/useSmoothScroll'

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
    const { init, destroy } = useSmoothScroll()
    init()
    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function))
    destroy()
  })

  it('removes the listener on destroy', () => {
    const { init, destroy } = useSmoothScroll()
    init()
    destroy()
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function))
  })

  it('does not attach duplicate listeners on the same instance', () => {
    const { init, destroy } = useSmoothScroll()
    init()
    init()
    const clickCalls = addSpy.mock.calls.filter(([event]) => event === 'click')
    expect(clickCalls).toHaveLength(1)
    destroy()
  })

  it('separate instances attach independent listeners', () => {
    const a = useSmoothScroll()
    const b = useSmoothScroll()
    a.init()
    b.init()
    const clickCalls = addSpy.mock.calls.filter(([event]) => event === 'click')
    expect(clickCalls).toHaveLength(2)
    a.destroy()
    b.destroy()
  })
})

