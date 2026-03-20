export { scrollToHash } from '@/lib/utils'
import { onScopeDispose } from 'vue'
import { scrollToHash } from '@/lib/utils'

const ANCHOR_SELECTOR = 'a[href^="#"]'

export function useSmoothScroll() {
  let attached = false
  let handler: ((e: Event) => void) | null = null

  function init() {
    if (attached) return

    handler = (e: Event) => {
      const target = e.target as HTMLElement
      const anchor = target.closest(ANCHOR_SELECTOR) as HTMLAnchorElement | null
      if (!anchor) return
      e.preventDefault()
      scrollToHash(anchor.getAttribute('href')!)
    }

    document.addEventListener('click', handler)
    attached = true
  }

  function destroy() {
    if (handler) {
      document.removeEventListener('click', handler)
      handler = null
    }
    attached = false
  }

  onScopeDispose(destroy)

  return { init, destroy }
}
