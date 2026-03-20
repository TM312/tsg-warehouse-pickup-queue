import { ref } from 'vue'
import { REVEAL_THRESHOLD } from '@/constants/problem'

export function useSectionReveal() {
  const isRevealed = ref(false)
  let observer: IntersectionObserver | null = null

  function init(el: HTMLElement) {
    if (observer) return

    const prefersReducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
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
