/**
 * Format minutes as human-readable duration (e.g., "1h 12m", "45m")
 * Returns "--" for null/undefined input
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) {
    return '--'
  }

  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (mins === 0) {
    return `${hours}h`
  }

  return `${hours}h ${mins}m`
}
