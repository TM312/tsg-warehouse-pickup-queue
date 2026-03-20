import { ref, onScopeDispose } from 'vue'

const SCROLL_THRESHOLD = 10

export function useScrolledNav() {
  const isScrolled = ref(false)
  let listener: (() => void) | null = null

  function init() {
    if (listener) return

    listener = () => {
      isScrolled.value = window.scrollY > SCROLL_THRESHOLD
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

  onScopeDispose(destroy)

  return { isScrolled, init, destroy }
}
