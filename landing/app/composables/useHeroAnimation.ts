import { ref } from 'vue'

export function useHeroAnimation() {
  const isVisible = ref(false)
  const prefersReducedMotion = ref(false)
  let observer: IntersectionObserver | null = null

  function init(el: HTMLElement) {
    if (observer) return

    prefersReducedMotion.value =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.value = entry.isIntersecting
      },
      { threshold: 0.2 },
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

  return { isVisible, prefersReducedMotion, init, destroy }
}
