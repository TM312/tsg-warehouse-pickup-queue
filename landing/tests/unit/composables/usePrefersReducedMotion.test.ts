import { describe, it, expect, vi, afterEach } from 'vitest'
import { prefersReducedMotion } from '@/composables/usePrefersReducedMotion'

describe('prefersReducedMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns false when matchMedia reports no preference', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
    expect(prefersReducedMotion()).toBe(false)
  })

  it('returns true when matchMedia reports reduced motion', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    expect(prefersReducedMotion()).toBe(true)
  })

  it('queries the correct media query string', () => {
    const spy = vi.fn(() => ({ matches: false }))
    vi.stubGlobal('matchMedia', spy)

    prefersReducedMotion()

    expect(spy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })
})
