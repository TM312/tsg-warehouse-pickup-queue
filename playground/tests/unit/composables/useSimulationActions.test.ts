import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useQueueStore } from '@/stores/queue'
import { useGatesStore } from '@/stores/gates'
import { useSimulationStore } from '@/stores/simulation'
import { useSimulationActions } from '@/composables/useSimulationActions'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'

describe('useSimulationActions', () => {
  let queue: ReturnType<typeof useQueueStore>
  let gates: ReturnType<typeof useGatesStore>
  let simulation: ReturnType<typeof useSimulationStore>
  let actions: ReturnType<typeof useSimulationActions>

  beforeEach(() => {
    setActivePinia(createPinia())
    queue = useQueueStore()
    gates = useGatesStore()
    simulation = useSimulationStore()
    actions = useSimulationActions()
  })

  describe('submitOrder', () => {
    it('creates a pending request and adds to store', () => {
      const result = actions.submitOrder('SO-10001')
      expect(result.sales_order_number).toBe('SO-10001')
      expect(result.status).toBe(PICKUP_STATUS.PENDING)
      expect(queue.requests).toHaveLength(1)
    })

    it('sets company name when provided', () => {
      const result = actions.submitOrder('SO-10002', 'Acme Corp')
      expect(result.company_name).toBe('Acme Corp')
    })

    it('logs a submit event', () => {
      actions.submitOrder('SO-10003')
      expect(simulation.activityFeed).toHaveLength(1)
      expect(simulation.activityFeed[0].type).toBe('submit')
    })

    it('records simulation elapsed time as event timestamp', () => {
      simulation.tick(5000)
      actions.submitOrder('SO-10004')
      expect(simulation.activityFeed[0].timestamp).toBe(5000)
    })
  })

  describe('approveRequest', () => {
    it('transitions pending to approved', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.PENDING }))
      actions.approveRequest('r1')
      expect(queue.requestById('r1')?.status).toBe(PICKUP_STATUS.APPROVED)
    })

    it('no-ops for invalid transition', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.IN_QUEUE }))
      actions.approveRequest('r1')
      expect(queue.requestById('r1')?.status).toBe(PICKUP_STATUS.IN_QUEUE)
    })

    it('no-ops for unknown id', () => {
      actions.approveRequest('nonexistent')
      expect(simulation.activityFeed).toHaveLength(0)
    })

    it('logs an approve event', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.PENDING }))
      actions.approveRequest('r1')
      expect(simulation.activityFeed[0].type).toBe('approve')
    })
  })

  describe('assignToGate', () => {
    it('transitions approved to in_queue with correct position', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.APPROVED }))
      actions.assignToGate('r1', 'gate-1')
      const request = queue.requestById('r1')
      expect(request?.status).toBe(PICKUP_STATUS.IN_QUEUE)
      expect(request?.gate_id).toBe('gate-1')
      expect(request?.queue_position).toBe(1)
    })

    it('assigns correct position with existing items', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1 }))
      queue.addRequest(createPickupRequest({ id: 'r2', status: PICKUP_STATUS.APPROVED }))
      actions.assignToGate('r2', 'gate-1')
      expect(queue.requestById('r2')?.queue_position).toBe(2)
    })

    it('no-ops for invalid transition', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.PENDING }))
      actions.assignToGate('r1', 'gate-1')
      expect(queue.requestById('r1')?.status).toBe(PICKUP_STATUS.PENDING)
    })

    it('updates gate queue counts', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.APPROVED }))
      actions.assignToGate('r1', 'gate-1')
      expect(gates.gateById('gate-1')?.queue_count).toBe(1)
    })

    it('logs an assign event', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.APPROVED }))
      actions.assignToGate('r1', 'gate-1')
      expect(simulation.activityFeed[0].type).toBe('assign')
    })
  })

  describe('reorderQueue', () => {
    it('reassigns queue_position by orderedIds index', () => {
      queue.setRequests([
        createPickupRequest({ id: 'r1', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1 }),
        createPickupRequest({ id: 'r2', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 2 }),
        createPickupRequest({ id: 'r3', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 3 }),
      ])
      actions.reorderQueue('gate-1', ['r3', 'r1', 'r2'])
      expect(queue.requestById('r3')?.queue_position).toBe(1)
      expect(queue.requestById('r1')?.queue_position).toBe(2)
      expect(queue.requestById('r2')?.queue_position).toBe(3)
    })

    it('logs a reorder event', () => {
      actions.reorderQueue('gate-1', [])
      expect(simulation.activityFeed[0].type).toBe('reorder')
    })
  })

  describe('setPriority', () => {
    it('toggles priority flag', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', is_priority: false }))
      actions.setPriority('r1', true)
      expect(queue.requestById('r1')?.is_priority).toBe(true)
    })

    it('recalculates positions when in_queue at a gate', () => {
      queue.setRequests([
        createPickupRequest({ id: 'r1', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1, is_priority: false }),
        createPickupRequest({ id: 'r2', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 2, is_priority: false }),
      ])
      actions.setPriority('r2', true)
      expect(queue.requestById('r2')?.queue_position).toBe(1)
      expect(queue.requestById('r1')?.queue_position).toBe(2)
    })

    it('no-ops for unknown id', () => {
      actions.setPriority('nonexistent', true)
      expect(queue.requests).toHaveLength(0)
    })
  })

  describe('startProcessing', () => {
    it('transitions in_queue to processing', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1 }))
      actions.startProcessing('r1')
      const request = queue.requestById('r1')
      expect(request?.status).toBe(PICKUP_STATUS.PROCESSING)
      expect(request?.processing_started_at).toBeTruthy()
      expect(request?.processing_started_sim_ms).toBe(simulation.elapsedMs)
      expect(request?.queue_position).toBeNull()
    })

    it('recalculates positions for remaining gate items', () => {
      queue.setRequests([
        createPickupRequest({ id: 'r1', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1 }),
        createPickupRequest({ id: 'r2', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 2 }),
      ])
      actions.startProcessing('r1')
      expect(queue.requestById('r2')?.queue_position).toBe(1)
    })

    it('no-ops for invalid transition', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.PENDING }))
      actions.startProcessing('r1')
      expect(queue.requestById('r1')?.status).toBe(PICKUP_STATUS.PENDING)
    })

    it('logs a start_processing event', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1 }))
      actions.startProcessing('r1')
      expect(simulation.activityFeed[0].type).toBe('start_processing')
    })
  })

  describe('completeRequest', () => {
    it('transitions processing to completed', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.PROCESSING, gate_id: 'gate-1', processing_started_at: new Date().toISOString() }))
      actions.completeRequest('r1')
      const request = queue.requestById('r1')
      expect(request?.status).toBe(PICKUP_STATUS.COMPLETED)
      expect(request?.completed_at).toBeTruthy()
    })

    it('no-ops for invalid transition', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.IN_QUEUE }))
      actions.completeRequest('r1')
      expect(queue.requestById('r1')?.status).toBe(PICKUP_STATUS.IN_QUEUE)
    })

    it('logs a complete event', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.PROCESSING, processing_started_at: new Date().toISOString() }))
      actions.completeRequest('r1')
      expect(simulation.activityFeed[0].type).toBe('complete')
    })
  })

  describe('cancelRequest', () => {
    it('cancels an active request', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.PENDING }))
      actions.cancelRequest('r1')
      expect(queue.requestById('r1')?.status).toBe(PICKUP_STATUS.CANCELLED)
    })

    it('clears gate_id and queue_position when cancelling from gate', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1 }))
      actions.cancelRequest('r1')
      const request = queue.requestById('r1')
      expect(request?.gate_id).toBeNull()
      expect(request?.queue_position).toBeNull()
    })

    it('recalculates gate positions after cancel', () => {
      queue.setRequests([
        createPickupRequest({ id: 'r1', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1 }),
        createPickupRequest({ id: 'r2', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 2 }),
      ])
      actions.cancelRequest('r1')
      expect(queue.requestById('r2')?.queue_position).toBe(1)
    })

    it('no-ops for terminal status', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.COMPLETED }))
      actions.cancelRequest('r1')
      expect(queue.requestById('r1')?.status).toBe(PICKUP_STATUS.COMPLETED)
    })

    it('logs a cancel event', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.PENDING }))
      actions.cancelRequest('r1')
      expect(simulation.activityFeed[0].type).toBe('cancel')
    })
  })

  describe('moveToGate', () => {
    it('moves in_queue request to a different gate', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1 }))
      actions.moveToGate('r1', 'gate-2')
      const request = queue.requestById('r1')
      expect(request?.gate_id).toBe('gate-2')
      expect(request?.queue_position).toBe(1)
    })

    it('no-ops when moving to the same gate', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1 }))
      const feedBefore = simulation.activityFeed.length
      actions.moveToGate('r1', 'gate-1')
      expect(simulation.activityFeed.length).toBe(feedBefore)
    })

    it('no-ops for non in_queue status', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.PROCESSING, gate_id: 'gate-1' }))
      actions.moveToGate('r1', 'gate-2')
      expect(queue.requestById('r1')?.gate_id).toBe('gate-1')
    })

    it('recalculates positions in both source and target gates', () => {
      queue.setRequests([
        createPickupRequest({ id: 'r1', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1 }),
        createPickupRequest({ id: 'r2', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 2 }),
        createPickupRequest({ id: 'r3', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-2', queue_position: 1 }),
      ])
      actions.moveToGate('r1', 'gate-2')
      // source gate-1: r2 should be position 1
      expect(queue.requestById('r2')?.queue_position).toBe(1)
      // target gate-2: r3 at 1, r1 at 2
      expect(queue.requestById('r3')?.queue_position).toBe(1)
      expect(queue.requestById('r1')?.queue_position).toBe(2)
    })

    it('logs an assign event', () => {
      queue.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1 }))
      actions.moveToGate('r1', 'gate-2')
      expect(simulation.activityFeed[0].type).toBe('assign')
    })
  })
})
