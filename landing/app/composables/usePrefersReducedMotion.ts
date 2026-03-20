const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** Returns true when the user has enabled reduced-motion in OS/browser settings. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}
