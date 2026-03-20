import { describe, it, expect, vi, afterEach } from 'vitest'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'

describe('usePrefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns false by default', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    expect(usePrefersReducedMotion()).toBe(false)
  })

  it('returns true when matchMedia matches', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    expect(usePrefersReducedMotion()).toBe(true)
  })

  it('returns false when window is undefined (SSR)', () => {
    const originalWindow = globalThis.window
    // @ts-expect-error -- simulating SSR
    delete globalThis.window

    expect(usePrefersReducedMotion()).toBe(false)

    globalThis.window = originalWindow
  })
})
