export function formatDurationMinutes(minutes: number | null | undefined): string {
  if (minutes == null) return '--'

  const h = Math.floor(minutes / 60)
  const m = minutes % 60

  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function formatDurationMs(ms: number | null | undefined): string {
  if (ms == null) return '--'

  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  if (totalSeconds < 60) return `${totalSeconds}s`

  return formatDurationMinutes(Math.floor(totalSeconds / 60))
}
