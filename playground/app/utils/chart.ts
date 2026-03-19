import { GATE_CHART_COLORS } from '@/constants/chart'
import { formatElapsedTime } from '@/utils/formatDuration'

export function resolveGateColors(isDark?: boolean): string[] {
  const dark = isDark ?? (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))
  return dark ? [...GATE_CHART_COLORS.dark] : [...GATE_CHART_COLORS.light]
}

export function formatTimeMs(ms: number): string {
  return formatElapsedTime(ms, { padMinutes: false })
}
