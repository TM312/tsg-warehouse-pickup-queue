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

export interface ProcessingGateRow {
  id: string
  gate_number: number
  order: {
    id: string
    sales_order_number: string
    company_name: string | null
    processing_started_at: string
    gate_id: string
  } | null
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
 * @param showOnlyUnassigned - Ref controlling whether only unassigned orders are shown
 */
export function useDashboardData(showCompleted: Ref<boolean>, showOnlyUnassigned: Ref<boolean>) {
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

  // Create Map for O(1) processing order lookup by gate ID
  const processingByGate = computed(() => {
    const map = new Map<string, PickupRequest>()
    for (const r of requests.value) {
      if (r.status === PICKUP_STATUS.PROCESSING && r.assigned_gate_id) {
        map.set(r.assigned_gate_id, r)
      }
    }
    return map
  })

  // Active gates with processing status for NowProcessingSection table
  const activeGatesForProcessing: ComputedRef<ProcessingGateRow[]> = computed(() => {
    return sortedActiveGates.value.map((gate: GateWithCount) => {
      const processingOrder = processingByGate.value.get(gate.id)
      return {
        id: gate.id,
        gate_number: gate.gate_number,
        order: processingOrder ? {
          id: processingOrder.id,
          sales_order_number: processingOrder.sales_order_number,
          company_name: processingOrder.company_name,
          processing_started_at: processingOrder.processing_started_at!,
          gate_id: processingOrder.assigned_gate_id!
        } : null
      }
    })
  })

  // Filtered requests based on showCompleted and showOnlyUnassigned toggles
  const filteredRequests: ComputedRef<PickupRequest[]> = computed(() => {
    let result = requests.value

    // Filter out terminal statuses unless showCompleted is true
    if (!showCompleted.value) {
      result = result.filter((r: PickupRequest) => !(TERMINAL_STATUSES as readonly string[]).includes(r.status))
    }

    // Filter to unassigned only when showOnlyUnassigned is true
    if (showOnlyUnassigned.value) {
      result = result.filter((r: PickupRequest) => r.assigned_gate_id === null)
    }

    return result
  })

  return {
    currentlyWaiting,
    chartData,
    processingItems,
    gatesWithQueues,
    filteredRequests,
    activeGatesForProcessing
  }
}
