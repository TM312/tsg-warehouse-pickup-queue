import { ref, onScopeDispose } from 'vue'
import { prefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { REVEAL_THRESHOLD } from '@/constants/animation'

export function useHeroAnimation() {
  const isVisible = ref(false)
  const isReducedMotion = ref(false)
  let observer: IntersectionObserver | null = null

  function init(el: HTMLElement) {
    if (observer) return

    isReducedMotion.value = prefersReducedMotion()

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
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

  return { isVisible, prefersReducedMotion: isReducedMotion, init, destroy }
}
