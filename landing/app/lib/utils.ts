import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function clampValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function scrollToHash(hash: string) {
  const el = document.querySelector(hash)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.history.replaceState(null, '', hash)
}
