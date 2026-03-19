import { ref } from 'vue'

export type Breakpoint = 'desktop' | 'tablet' | 'mobile'

/**
 * Shared reactive refs backing the useMediaQuery mock.
 * Exported for use in vi.mock factories — prefer setBreakpoint() in tests.
 */
export const mockDesktop = ref(true)
export const mockMobile = ref(false)

/**
 * Mock implementation of useMediaQuery that routes min-width queries
 * to mockDesktop and max-width queries to mockMobile.
 */
export function useMediaQueryMock(query: string) {
  if (query.includes('min-width')) return mockDesktop
  if (query.includes('max-width')) return mockMobile
  return ref(false)
}

/**
 * Set the simulated breakpoint for tests.
 * Call in beforeEach or within individual tests.
 */
export function setBreakpoint(bp: Breakpoint) {
  mockDesktop.value = bp === 'desktop'
  mockMobile.value = bp === 'mobile'
}
