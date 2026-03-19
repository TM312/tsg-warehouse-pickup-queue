import { ref, watch, toValue, onScopeDispose, type Readonly, type Ref, type MaybeRefOrGetter } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { ANIMATION } from '@/constants/animations'

export function useAnimatedNumber(
  target: MaybeRefOrGetter<number>,
  options?: { duration?: number },
): { displayValue: Readonly<Ref<number>> } {
  const duration = options?.duration ?? ANIMATION.KPI_TWEEN_MS
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const displayValue = ref(toValue(target))

  let rafId: number | null = null

  function cancelAnimation() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  watch(
    () => toValue(target),
    (newTarget) => {
      cancelAnimation()

      if (prefersReducedMotion.value) {
        displayValue.value = newTarget
        return
      }

      const startValue = displayValue.value
      const delta = newTarget - startValue
      if (delta === 0) return

      const startTime = performance.now()

      function step(now: number) {
        const elapsed = now - startTime
        const t = Math.min(elapsed / duration, 1)
        const eased = 1 - (1 - t) ** 3 // ease-out cubic

        displayValue.value = Math.round(startValue + delta * eased)

        if (t < 1) {
          rafId = requestAnimationFrame(step)
        } else {
          rafId = null
        }
      }

      rafId = requestAnimationFrame(step)
    },
    { immediate: false },
  )

  onScopeDispose(cancelAnimation)

  return { displayValue }
}
