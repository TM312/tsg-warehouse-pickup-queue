import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick, effectScope } from 'vue'

vi.mock('@vueuse/core', () => ({
  useMediaQuery: vi.fn(() => ref(false)),
}))

import { useMediaQuery } from '@vueuse/core'
import { useAnimatedNumber } from '@/composables/useAnimatedNumber'

describe('useAnimatedNumber', () => {
  let rafCallbacks: Array<(time: number) => void> = []
  let rafId = 0

  beforeEach(() => {
    rafCallbacks = []
    rafId = 0
    vi.stubGlobal('requestAnimationFrame', (cb: (time: number) => void) => {
      rafCallbacks.push(cb)
      return ++rafId
    })
    vi.stubGlobal('cancelAnimationFrame', (_id: number) => {
      // no-op for tests
    })
    vi.stubGlobal('performance', { now: vi.fn(() => 0) })
    vi.mocked(useMediaQuery).mockReturnValue(ref(false))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function flushRaf(time: number) {
    const cbs = [...rafCallbacks]
    rafCallbacks = []
    for (const cb of cbs) {
      cb(time)
    }
  }

  describe('initialization', () => {
    it('initializes displayValue to the current target', () => {
      const scope = effectScope()
      scope.run(() => {
        const target = ref(42)
        const { displayValue } = useAnimatedNumber(target)
        expect(displayValue.value).toBe(42)
      })
      scope.stop()
    })
  })

  describe('tweening', () => {
    it('tweens from current to new target value', async () => {
      const scope = effectScope()
      let target: ReturnType<typeof ref<number>>
      let displayValue: { value: number }

      scope.run(() => {
        target = ref(0)
        const result = useAnimatedNumber(target, { duration: 400 })
        displayValue = result.displayValue
      })

      target!.value = 100
      await nextTick()

      vi.mocked(performance.now).mockReturnValue(0)
      flushRaf(0)
      expect(displayValue!.value).toBe(0)

      vi.mocked(performance.now).mockReturnValue(200)
      flushRaf(200)
      expect(displayValue!.value).toBeGreaterThan(0)
      expect(displayValue!.value).toBeLessThan(100)

      vi.mocked(performance.now).mockReturnValue(400)
      flushRaf(400)
      expect(displayValue!.value).toBe(100)

      scope.stop()
    })

    it('applies ease-out cubic easing', async () => {
      const scope = effectScope()
      let target: ReturnType<typeof ref<number>>
      let displayValue: { value: number }

      scope.run(() => {
        target = ref(0)
        const result = useAnimatedNumber(target, { duration: 1000 })
        displayValue = result.displayValue
      })

      target!.value = 1000
      await nextTick()

      // At t=500 (halfway), ease-out cubic: 1 - (1 - 0.5)^3 = 0.875
      vi.mocked(performance.now).mockReturnValue(0)
      flushRaf(0)

      vi.mocked(performance.now).mockReturnValue(500)
      flushRaf(500)
      expect(displayValue!.value).toBe(Math.round(1000 * 0.875))

      scope.stop()
    })

    it('counts down from higher to lower value', async () => {
      const scope = effectScope()
      let target: ReturnType<typeof ref<number>>
      let displayValue: { value: number }

      scope.run(() => {
        target = ref(100)
        const result = useAnimatedNumber(target, { duration: 400 })
        displayValue = result.displayValue
      })

      target!.value = 0
      await nextTick()

      vi.mocked(performance.now).mockReturnValue(400)
      flushRaf(400)
      expect(displayValue!.value).toBe(0)

      scope.stop()
    })

    it('handles negative target values', async () => {
      const scope = effectScope()
      let target: ReturnType<typeof ref<number>>
      let displayValue: { value: number }

      scope.run(() => {
        target = ref(50)
        const result = useAnimatedNumber(target, { duration: 400 })
        displayValue = result.displayValue
      })

      target!.value = -50
      await nextTick()

      vi.mocked(performance.now).mockReturnValue(200)
      flushRaf(200)
      expect(displayValue!.value).toBeLessThan(50)
      expect(displayValue!.value).toBeGreaterThan(-50)

      vi.mocked(performance.now).mockReturnValue(400)
      flushRaf(400)
      expect(displayValue!.value).toBe(-50)

      scope.stop()
    })

    it('rounds to integers at every frame', async () => {
      const scope = effectScope()
      let target: ReturnType<typeof ref<number>>
      let displayValue: { value: number }

      scope.run(() => {
        target = ref(0)
        const result = useAnimatedNumber(target, { duration: 400 })
        displayValue = result.displayValue
      })

      target!.value = 7
      await nextTick()

      vi.mocked(performance.now).mockReturnValue(200)
      flushRaf(200)
      expect(Number.isInteger(displayValue!.value)).toBe(true)

      scope.stop()
    })

    it('skips animation when delta is zero', async () => {
      const scope = effectScope()
      let target: ReturnType<typeof ref<number>>

      scope.run(() => {
        target = ref(42)
        useAnimatedNumber(target, { duration: 400 })
      })

      // Set target to the same value
      target!.value = 42
      await nextTick()

      expect(rafCallbacks).toHaveLength(0)

      scope.stop()
    })
  })

  describe('reduced motion', () => {
    it('instantly jumps when prefers-reduced-motion is active', async () => {
      vi.mocked(useMediaQuery).mockReturnValue(ref(true))

      const scope = effectScope()
      let target: ReturnType<typeof ref<number>>
      let displayValue: { value: number }

      scope.run(() => {
        target = ref(0)
        const result = useAnimatedNumber(target)
        displayValue = result.displayValue
      })

      target!.value = 100
      await nextTick()

      expect(displayValue!.value).toBe(100)
      expect(rafCallbacks).toHaveLength(0)

      scope.stop()
    })
  })

  describe('cancellation', () => {
    it('cancels in-flight animation when target changes mid-tween', async () => {
      const cancelSpy = vi.fn()
      vi.stubGlobal('cancelAnimationFrame', cancelSpy)

      const scope = effectScope()
      let target: ReturnType<typeof ref<number>>

      scope.run(() => {
        target = ref(0)
        useAnimatedNumber(target, { duration: 400 })
      })

      target!.value = 100
      await nextTick()

      vi.mocked(performance.now).mockReturnValue(0)
      flushRaf(0)

      target!.value = 50
      await nextTick()
      expect(cancelSpy).toHaveBeenCalled()

      scope.stop()
    })

    it('continues from current display value after mid-tween retarget', async () => {
      const scope = effectScope()
      let target: ReturnType<typeof ref<number>>
      let displayValue: { value: number }

      scope.run(() => {
        target = ref(0)
        const result = useAnimatedNumber(target, { duration: 1000 })
        displayValue = result.displayValue
      })

      target!.value = 1000
      await nextTick()

      // Advance to halfway: ease-out cubic at t=0.5 → 0.875 → value ≈ 875
      vi.mocked(performance.now).mockReturnValue(0)
      flushRaf(0)
      vi.mocked(performance.now).mockReturnValue(500)
      flushRaf(500)
      const midValue = displayValue!.value
      expect(midValue).toBe(875)

      // Retarget to 500 — watcher reads performance.now() as startTime for new anim
      vi.mocked(performance.now).mockReturnValue(600)
      target!.value = 500
      await nextTick()

      // First frame of new animation (t=0 relative to startTime 600)
      flushRaf(600)
      expect(displayValue!.value).toBe(875)

      // Complete the new animation (startTime=600, duration=1000, done at 1600)
      vi.mocked(performance.now).mockReturnValue(1600)
      flushRaf(1600)
      expect(displayValue!.value).toBe(500)

      scope.stop()
    })

    it('cleans up on scope dispose', async () => {
      const cancelSpy = vi.fn()
      vi.stubGlobal('cancelAnimationFrame', cancelSpy)

      const scope = effectScope()
      let target: ReturnType<typeof ref<number>>
      scope.run(() => {
        target = ref(0)
        useAnimatedNumber(target, { duration: 400 })
      })

      target!.value = 100
      await nextTick()

      vi.mocked(performance.now).mockReturnValue(0)
      flushRaf(0)

      scope.stop()
      expect(cancelSpy).toHaveBeenCalled()
    })
  })
})
