import { useQueueStore } from '@/stores/queue'
import { useGatesStore } from '@/stores/gates'
import { useSimulationStore } from '@/stores/simulation'
import { PICKUP_STATUS, isActiveStatus } from '@/constants/status'
import { isValidTransition } from '@/constants/transitions'
import { createPickupRequest } from '@/utils/factories'
import { computeNextPosition, recalculatePositions } from '@/utils/queue'
import type { SimulationEventType } from '@/types/simulation'

function syncGates() {
  const queue = useQueueStore()
  const gates = useGatesStore()
  gates.recountQueues(queue.requests)
}

function logEvent(label: string, type: SimulationEventType) {
  const simulation = useSimulationStore()
  simulation.addEvent({ timestamp: simulation.elapsedMs, label, type })
}

function applyRecalculation(gateId: string) {
  const queue = useQueueStore()
  const updated = recalculatePositions(queue.requests, gateId)
  queue.setRequests(updated)
}

export function useSimulationActions() {
  const queue = useQueueStore()
  const gates = useGatesStore()

  function submitOrder(orderNumber: string, companyName?: string) {
    const overrides: Record<string, string> = { sales_order_number: orderNumber }
    if (companyName) overrides.company_name = companyName
    const request = createPickupRequest(overrides)
    queue.addRequest(request)
    syncGates()
    logEvent(`Submitted ${orderNumber}`, 'submit')
    return request
  }

  function approveRequest(id: string) {
    const request = queue.requestById(id)
    if (!request) return
    if (!isValidTransition(request.status, PICKUP_STATUS.APPROVED)) return
    queue.updateRequest(id, { status: PICKUP_STATUS.APPROVED })
    syncGates()
    logEvent(`Approved ${request.sales_order_number}`, 'approve')
  }

  function assignToGate(id: string, gateId: string) {
    const request = queue.requestById(id)
    if (!request) return
    if (!isValidTransition(request.status, PICKUP_STATUS.IN_QUEUE)) return
    const position = computeNextPosition(queue.requests, gateId)
    queue.updateRequest(id, {
      status: PICKUP_STATUS.IN_QUEUE,
      gate_id: gateId,
      queue_position: position,
    })
    syncGates()
    const gate = gates.gateById(gateId)
    logEvent(`Assigned ${request.sales_order_number} to Gate ${gate?.gate_number ?? gateId}`, 'assign')
  }

  function reorderQueue(gateId: string, orderedIds: string[]) {
    orderedIds.forEach((id, index) => {
      queue.updateRequest(id, { queue_position: index + 1 })
    })
    syncGates()
    const gate = gates.gateById(gateId)
    logEvent(`Reordered Gate ${gate?.gate_number ?? gateId} queue`, 'reorder')
  }

  function setPriority(id: string, isPriority: boolean) {
    const request = queue.requestById(id)
    if (!request) return
    queue.updateRequest(id, { is_priority: isPriority })
    if (request.gate_id && request.status === PICKUP_STATUS.IN_QUEUE) {
      applyRecalculation(request.gate_id)
    }
    syncGates()
  }

  function startProcessing(id: string) {
    const request = queue.requestById(id)
    if (!request) return
    if (!isValidTransition(request.status, PICKUP_STATUS.PROCESSING)) return
    const simulation = useSimulationStore()
    const gateId = request.gate_id
    queue.updateRequest(id, {
      status: PICKUP_STATUS.PROCESSING,
      processing_started_at: new Date().toISOString(),
      processing_started_sim_ms: simulation.elapsedMs,
      queue_position: null,
    })
    if (gateId) applyRecalculation(gateId)
    syncGates()
    logEvent(`Started processing ${request.sales_order_number}`, 'start_processing')
  }

  function completeRequest(id: string) {
    const request = queue.requestById(id)
    if (!request) return
    if (!isValidTransition(request.status, PICKUP_STATUS.COMPLETED)) return
    queue.updateRequest(id, {
      status: PICKUP_STATUS.COMPLETED,
      completed_at: new Date().toISOString(),
    })
    syncGates()
    logEvent(`Completed ${request.sales_order_number}`, 'complete')
  }

  function cancelRequest(id: string) {
    const request = queue.requestById(id)
    if (!request) return
    if (!isActiveStatus(request.status)) return
    const gateId = request.gate_id
    queue.updateRequest(id, {
      status: PICKUP_STATUS.CANCELLED,
      gate_id: null,
      queue_position: null,
    })
    if (gateId) applyRecalculation(gateId)
    syncGates()
    logEvent(`Cancelled ${request.sales_order_number}`, 'cancel')
  }

  function moveToGate(id: string, newGateId: string) {
    const request = queue.requestById(id)
    if (!request) return
    if (request.status !== PICKUP_STATUS.IN_QUEUE) return
    if (newGateId === request.gate_id) return
    const sourceGateId = request.gate_id
    const position = computeNextPosition(queue.requests, newGateId)
    queue.updateRequest(id, { gate_id: newGateId, queue_position: position })
    if (sourceGateId) applyRecalculation(sourceGateId)
    applyRecalculation(newGateId)
    syncGates()
    const gate = gates.gateById(newGateId)
    logEvent(`Moved ${request.sales_order_number} to Gate ${gate?.gate_number ?? newGateId}`, 'assign')
  }

  return {
    submitOrder,
    approveRequest,
    assignToGate,
    reorderQueue,
    setPriority,
    startProcessing,
    completeRequest,
    cancelRequest,
    moveToGate,
  }
}
