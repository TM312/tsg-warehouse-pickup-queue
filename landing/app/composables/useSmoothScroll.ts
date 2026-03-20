import { scrollToHash } from '@/utils/scrollToHash'

export { scrollToHash }

export function useSmoothScroll() {
  let attached = false
  let handler: ((e: Event) => void) | null = null

  function init() {
    if (attached) return

    handler = (e: Event) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null
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

  return { init, destroy }
}
