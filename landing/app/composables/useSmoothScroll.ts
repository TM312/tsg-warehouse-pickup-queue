export function scrollToHash(hash: string) {
  const el = document.querySelector(hash)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.history.replaceState(null, '', hash)
}

export function useSmoothScroll() {
  let attached = false
  let handler: ((e: Event) => void) | null = null

  function init() {
    if (attached) return

    handler = (e: Event) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null
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

  return { init, destroy }
}
