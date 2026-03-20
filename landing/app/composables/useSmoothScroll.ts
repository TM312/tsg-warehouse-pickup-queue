import { onScopeDispose } from 'vue'
import { scrollToHash } from '@/utils/scrollToHash'

export { scrollToHash }

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
      const href = anchor.getAttribute('href')
      if (!href) return
      e.preventDefault()
      scrollToHash(href)
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
