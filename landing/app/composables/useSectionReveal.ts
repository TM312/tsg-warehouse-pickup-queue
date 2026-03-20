import { ref, onScopeDispose } from 'vue'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { REVEAL_THRESHOLD } from '@/constants/animation'

export function useSectionReveal(threshold: number = REVEAL_THRESHOLD) {
  const isRevealed = ref(false)
  let observer: IntersectionObserver | null = null

  function init(el: HTMLElement) {
    if (observer) return

    if (usePrefersReducedMotion()) {
      isRevealed.value = true
      return
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isRevealed.value = true
          observer?.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(el)
  }

  function destroy() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onScopeDispose(destroy)

  return { isRevealed, init, destroy }
}
