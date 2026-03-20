import { ref } from 'vue'
import { NAV_SCROLL_THRESHOLD } from '@/constants/animation'

export function useScrolledNav() {
  const isScrolled = ref(false)
  let listener: (() => void) | null = null

  function init() {
    if (listener) return

    listener = () => {
      isScrolled.value = window.scrollY > NAV_SCROLL_THRESHOLD
    }

    listener()
    window.addEventListener('scroll', listener, { passive: true })
  }

  function destroy() {
    if (listener) {
      window.removeEventListener('scroll', listener)
      listener = null
    }
    isScrolled.value = false
  }

  return { isScrolled, init, destroy }
}
