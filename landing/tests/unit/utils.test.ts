import { describe, it, expect, vi, afterEach } from 'vitest'
import { cn, clampValue, scrollToHash } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('deduplicates conflicting tailwind classes', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })

  it('returns empty string for no input', () => {
    expect(cn()).toBe('')
  })
})

describe('clampValue', () => {
  it('returns min when value is below min', () => {
    expect(clampValue(5, 10, 100)).toBe(10)
  })

  it('returns max when value is above max', () => {
    expect(clampValue(150, 10, 100)).toBe(100)
  })

  it('returns value when within range', () => {
    expect(clampValue(50, 10, 100)).toBe(50)
  })
})

describe('scrollToHash', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls scrollIntoView and updates history', () => {
    const mockEl = {
      scrollIntoView: vi.fn(),
    }
    vi.spyOn(document, 'querySelector').mockReturnValue(mockEl as unknown as Element)
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})

    scrollToHash('#test')

    expect(mockEl.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '#test')
  })

  it('is a no-op for missing element', () => {
    vi.spyOn(document, 'querySelector').mockReturnValue(null)
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})

    scrollToHash('#missing')

    expect(window.history.replaceState).not.toHaveBeenCalled()
  })
})
