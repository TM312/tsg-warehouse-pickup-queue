import { computed, type Ref, type ComputedRef } from 'vue'
import { PICKUP_STATUS, TERMINAL_STATUSES } from '#shared/types/pickup-request'
import type { PickupRequest } from '#shared/types/pickup-request'
import type { GateWithCount } from '#shared/types/gate'

// === Local Types ===

interface ProcessingItem {
  id: string
  sales_order_number: string
  company_name: string | null
  gate_number: number
  gate_id: string
  processing_started_at: string
}

interface GateQueueItem {
  id: string
  sales_order_number: string
  company_name: string | null
  queue_position: number
  is_priority: boolean
}

interface GateWithQueue extends GateWithCount {
  queue: GateQueueItem[]
  totalActive: number
}

// === Composable ===

/**
 * Dashboard-specific computed properties derived from queue and gates stores.
 * Extracts complex filtering/mapping logic from index.vue for better separation of concerns.
 *
 * @param showCompleted - Ref controlling whether terminal requests are shown
 */
export function useDashboardData(showCompleted: Ref<boolean>) {
  const queueStore = useQueueStore()
  const gatesStore = useGatesStore()

  const { requests } = storeToRefs(queueStore)
  const { activeGates, sortedActiveGates } = storeToRefs(gatesStore)

  // Count of requests currently waiting in queue
  const currentlyWaiting: ComputedRef<number> = computed(() =>
    requests.value.filter((r: PickupRequest) => r.status === PICKUP_STATUS.IN_QUEUE).length
  )

  // Chart data: gate queue counts for bar chart visualization
  const chartData: ComputedRef<{ gate: string; count: number; gateId: string }[]> = computed(() => {
    return sortedActiveGates.value.map((gate: GateWithCount) => ({
      gate: `Gate ${gate.gate_number}`,
      count: requests.value.filter(
        (r: PickupRequest) => r.assigned_gate_id === gate.id && r.status === PICKUP_STATUS.IN_QUEUE
      ).length,
      gateId: gate.id
    }))
  })

  // Items currently being processed (for NowProcessingSection)
  const processingItems: ComputedRef<ProcessingItem[]> = computed(() => {
    return requests.value
      .filter((r: PickupRequest) => r.status === PICKUP_STATUS.PROCESSING && r.gate)
      .map((r: PickupRequest) => ({
        id: r.id,
        sales_order_number: r.sales_order_number,
        company_name: r.company_name,
        gate_number: r.gate!.gate_number,
        gate_id: r.assigned_gate_id!,
        processing_started_at: r.processing_started_at!
      }))
      .sort((a: ProcessingItem, b: ProcessingItem) => a.gate_number - b.gate_number)
  })

  // Per-gate data with queue items and active counts (for gate tabs)
  const gatesWithQueues: ComputedRef<GateWithQueue[]> = computed(() => {
    return activeGates.value.map((gate: GateWithCount) => {
      // Items waiting in this gate's queue
      const queueItems = requests.value
        .filter((r: PickupRequest) => r.assigned_gate_id === gate.id && r.status === PICKUP_STATUS.IN_QUEUE)
        .sort((a: PickupRequest, b: PickupRequest) => (a.queue_position ?? 0) - (b.queue_position ?? 0))
        .map((r: PickupRequest) => ({
          id: r.id,
          sales_order_number: r.sales_order_number,
          company_name: r.company_name,
          queue_position: r.queue_position ?? 0,
          is_priority: r.is_priority ?? false
        }))

      // Count includes both in_queue and processing for the tab badge
      const processingCount = requests.value
        .filter((r: PickupRequest) => r.assigned_gate_id === gate.id && r.status === PICKUP_STATUS.PROCESSING)
        .length

      return {
        ...gate,
        queue: queueItems,
        totalActive: queueItems.length + processingCount
      }
    })
  })

  // Filtered requests based on showCompleted toggle
  const filteredRequests: ComputedRef<PickupRequest[]> = computed(() => {
    const all = requests.value
    if (showCompleted.value) {
      return all
    }
    return all.filter((r: PickupRequest) => !(TERMINAL_STATUSES as readonly string[]).includes(r.status))
  })

  return {
    currentlyWaiting,
    chartData,
    processingItems,
    gatesWithQueues,
    filteredRequests
  }
}
