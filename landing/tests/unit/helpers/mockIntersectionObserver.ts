import { vi } from 'vitest'

export interface IntersectionObserverMock {
  observeSpy: ReturnType<typeof vi.fn>
  disconnectSpy: ReturnType<typeof vi.fn>
  trigger: (entries: Array<{ isIntersecting: boolean }>) => void
}

export function setupIntersectionObserverMock(): IntersectionObserverMock {
  const observeSpy = vi.fn()
  const disconnectSpy = vi.fn()
  let callback: (entries: Array<{ isIntersecting: boolean }>) => void

  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn((cb: typeof callback) => {
      callback = cb
      return { observe: observeSpy, disconnect: disconnectSpy }
    }),
  )

  return {
    observeSpy,
    disconnectSpy,
    trigger: (entries) => callback(entries),
  }
}
