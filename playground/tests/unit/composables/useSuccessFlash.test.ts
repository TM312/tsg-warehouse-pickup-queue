import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useSuccessFlash } from '@/composables/useSuccessFlash'
import { ANIMATION } from '@/constants/animations'

vi.mock('@vueuse/core', () => ({
  useMediaQuery: vi.fn(() => ref(false)),
}))

beforeEach(() => {
  vi.useFakeTimers()
  vi.mocked(useMediaQuery).mockReturnValue(ref(false))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useSuccessFlash', () => {
  it('showFlash is initially false', () => {
    const scope = effectScope()
    scope.run(() => {
      const { showFlash } = useSuccessFlash(vi.fn())
      expect(showFlash.value).toBe(false)
    })
    scope.stop()
  })

  it('shows flash then hides and calls callback after delay', () => {
    const callback = vi.fn()
    const scope = effectScope()

    scope.run(() => {
      const { showFlash, triggerFlash } = useSuccessFlash(callback)

      triggerFlash()
      expect(showFlash.value).toBe(true)
      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(ANIMATION.SUCCESS_FLASH_MS)
      expect(showFlash.value).toBe(false)
      expect(callback).toHaveBeenCalledOnce()
    })
    scope.stop()
  })

  it('calls callback immediately without flash when reduced motion is active', () => {
    vi.mocked(useMediaQuery).mockReturnValue(ref(true))
    const callback = vi.fn()
    const scope = effectScope()

    scope.run(() => {
      const { showFlash, triggerFlash } = useSuccessFlash(callback)

      triggerFlash()
      expect(showFlash.value).toBe(false)
      expect(callback).toHaveBeenCalledOnce()
    })
    scope.stop()
  })

  it('double trigger cancels previous timeout — callback fires only once', () => {
    const callback = vi.fn()
    const scope = effectScope()

    scope.run(() => {
      const { showFlash, triggerFlash } = useSuccessFlash(callback)

      triggerFlash()
      expect(showFlash.value).toBe(true)

      vi.advanceTimersByTime(ANIMATION.SUCCESS_FLASH_MS / 2)
      triggerFlash()
      expect(showFlash.value).toBe(true)

      vi.advanceTimersByTime(ANIMATION.SUCCESS_FLASH_MS)
      expect(showFlash.value).toBe(false)
      expect(callback).toHaveBeenCalledOnce()
    })
    scope.stop()
  })

  it('cleans up timeout on scope dispose — callback never fires', () => {
    const callback = vi.fn()
    const scope = effectScope()

    scope.run(() => {
      const { triggerFlash } = useSuccessFlash(callback)
      triggerFlash()
    })

    scope.stop()
    vi.advanceTimersByTime(ANIMATION.SUCCESS_FLASH_MS * 2)
    expect(callback).not.toHaveBeenCalled()
  })
})
