import { ref, watch, type Ref } from 'vue'
import { prefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { ROI_ANIMATION_DURATION_MS } from '@/constants/roi'
import { EASE_OUT_EXPONENT } from '@/constants/animation'

export function useAnimatedNumber(
  source: Ref<number>,
  duration: number = ROI_ANIMATION_DURATION_MS,
) {
  const displayed = ref(source.value)
  let rafId: number | null = null

  watch(source, (newVal) => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

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

  return { displayed }
}
