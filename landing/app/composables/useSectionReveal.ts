import { ref } from 'vue'
import { prefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { REVEAL_THRESHOLD } from '@/constants/animation'

export function useSectionReveal() {
  const isRevealed = ref(false)
  let observer: IntersectionObserver | null = null

  function init(el: HTMLElement) {
    if (observer) return

    if (prefersReducedMotion()) {
      isRevealed.value = true
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return
        isRevealed.value = true
        observer?.disconnect()
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
  }

  return { isRevealed, init, destroy }
}
