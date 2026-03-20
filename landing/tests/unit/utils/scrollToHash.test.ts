import { describe, it, expect, vi, afterEach } from 'vitest'
import { scrollToHash } from '@/utils/scrollToHash'

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
