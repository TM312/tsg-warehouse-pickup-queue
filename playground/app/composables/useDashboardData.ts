import { computed } from 'vue'
import { useQueueStore } from '@/stores/queue'
import { useGatesStore } from '@/stores/gates'
import { PICKUP_STATUS } from '@/constants/status'
import { getProcessingDuration } from '@/utils/queue'

export function useDashboardData() {
  const queue = useQueueStore()
  const gates = useGatesStore()

  const completedCount = computed(() => queue.completedItems.length)

  const currentlyWaiting = computed(() => queue.inQueueItems.length)

  const avgProcessingTime = computed(() => {
    const durations = queue.completedItems
      .map(getProcessingDuration)
      .filter((d): d is number => d !== null)
    if (durations.length === 0) return null
    return durations.reduce((sum, d) => sum + d, 0) / durations.length
  })

  const avgWaitTime = computed(() => {
    const completed = queue.completedItems
    const waits = completed
      .filter((r) => r.processing_started_at)
      .map((r) => new Date(r.processing_started_at!).getTime() - new Date(r.created_at).getTime())
    if (waits.length === 0) return null
    return waits.reduce((sum, d) => sum + d, 0) / waits.length
  })

  const chartData = computed(() =>
    gates.sortedActiveGates.map((gate) => ({
      gate: `Gate ${gate.gate_number}`,
      count: gate.queue_count,
    })),
  )

  const processingGateRows = computed(() =>
    gates.sortedActiveGates.map((gate) => {
      const processing = queue.processingItems.find((r) => r.gate_id === gate.id)
      return {
        gate: `Gate ${gate.gate_number}`,
        gateId: gate.id,
        request: processing ?? null,
      }
    }),
  )

  return {
    completedCount,
    currentlyWaiting,
    avgProcessingTime,
    avgWaitTime,
    chartData,
    processingGateRows,
  }
}
