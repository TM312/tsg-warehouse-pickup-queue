import { ref, onScopeDispose } from 'vue'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { REVEAL_THRESHOLD } from '@/constants/animation'

export function useHeroAnimation() {
  const isVisible = ref(false)
  const prefersReducedMotion = ref(false)
  let observer: IntersectionObserver | null = null

  function init(el: HTMLElement) {
    if (observer) return

    prefersReducedMotion.value = usePrefersReducedMotion()

    observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.value = entry.isIntersecting
      },
      { threshold: REVEAL_THRESHOLD },
    )
    observer.observe(el)
  }

  function destroy() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    isVisible.value = false
  }

  onScopeDispose(destroy)

  return { isVisible, prefersReducedMotion, init, destroy }
}
