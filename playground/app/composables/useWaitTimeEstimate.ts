import { computed, unref } from 'vue'
import type { ComputedRef, MaybeRef } from 'vue'
import type { PickupRequest } from '@/types/pickup-request'
import { getProcessingDuration } from '@/utils/queue'

function percentile(sorted: number[], p: number): number {
  const index = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
}

export function useWaitTimeEstimate(
  queuePosition: MaybeRef<number | null>,
  completedRequests: MaybeRef<PickupRequest[]>,
): ComputedRef<{ min: number; max: number } | null> {
  return computed(() => {
    const position = unref(queuePosition)
    if (position === null) return null

    const completed = unref(completedRequests)
    const durations = completed
      .map(getProcessingDuration)
      .filter((d): d is number => d !== null)
      .sort((a, b) => a - b)

    if (durations.length < 3) return null

    const multiplier = position - 1
    if (multiplier <= 0) return { min: 0, max: 0 }

    const p25 = percentile(durations, 25)
    const p75 = percentile(durations, 75)

    return {
      min: Math.round(p25 * multiplier),
      max: Math.round(p75 * multiplier),
    }
  })
}
