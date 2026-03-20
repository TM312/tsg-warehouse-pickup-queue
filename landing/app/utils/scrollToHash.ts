/** Smoothly scrolls to the element matching `hash` and updates the URL. */
export function scrollToHash(hash: string) {
  const el = document.querySelector(hash)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.history.replaceState(null, '', hash)
}
