import { GATE_CHART_COLORS } from '@/constants/chart'

export function resolveGateColors(): string[] {
  if (typeof document === 'undefined') return [...GATE_CHART_COLORS.light]
  const isDark = document.documentElement.classList.contains('dark')
  return isDark ? [...GATE_CHART_COLORS.dark] : [...GATE_CHART_COLORS.light]
}

export function formatTimeMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
