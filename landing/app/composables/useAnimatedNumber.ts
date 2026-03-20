import { ref, watch, onScopeDispose, type Ref } from 'vue'
import { prefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { ANIMATION_DURATION_MS, EASE_OUT_EXPONENT } from '@/constants/animation'

export function useAnimatedNumber(
  source: Ref<number>,
  duration: number = ANIMATION_DURATION_MS,
) {
  const displayed = ref(source.value)
  let rafId: number | null = null

  function cancelPending() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  watch(source, (newVal) => {
    cancelPending()

    if (typeof window === 'undefined' || prefersReducedMotion()) {
      displayed.value = newVal
      return
    }

    const startVal = displayed.value
    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, EASE_OUT_EXPONENT)

      displayed.value = Math.round(startVal + (newVal - startVal) * eased)

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      } else {
        rafId = null
      }
    }

    rafId = requestAnimationFrame(animate)
  })

  onScopeDispose(cancelPending)

  return { displayed }
}
