import { ref, watch, onScopeDispose, type Ref } from 'vue'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { cubicEaseOut } from '@/lib/easing'
import { ANIMATION_DURATION_MS } from '@/constants/animation'

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

    if (typeof window === 'undefined') {
      displayed.value = newVal
      return
    }

    if (usePrefersReducedMotion()) {
      displayed.value = newVal
      return
    }

    const startVal = displayed.value
    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = cubicEaseOut(progress)

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
