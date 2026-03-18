import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useQueueStore } from '@/stores/queue'
import { useGatesStore } from '@/stores/gates'
import { useDashboardData } from '@/composables/useDashboardData'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'

describe('useDashboardData', () => {
  let queue: ReturnType<typeof useQueueStore>
  let gates: ReturnType<typeof useGatesStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    queue = useQueueStore()
    gates = useGatesStore()
  })

  it('completedCount returns number of completed requests', () => {
    queue.setRequests([
      createPickupRequest({ status: PICKUP_STATUS.COMPLETED }),
      createPickupRequest({ status: PICKUP_STATUS.COMPLETED }),
      createPickupRequest({ status: PICKUP_STATUS.PENDING }),
    ])
    const { completedCount } = useDashboardData()
    expect(completedCount.value).toBe(2)
  })

  it('currentlyWaiting returns number of in_queue requests', () => {
    queue.setRequests([
      createPickupRequest({ status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1 }),
      createPickupRequest({ status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-2', queue_position: 1 }),
      createPickupRequest({ status: PICKUP_STATUS.PROCESSING }),
    ])
    const { currentlyWaiting } = useDashboardData()
    expect(currentlyWaiting.value).toBe(2)
  })

  it('avgProcessingTime computes average from completed requests', () => {
    const base = new Date('2026-01-01T00:00:00Z')
    queue.setRequests([
      createPickupRequest({
        status: PICKUP_STATUS.COMPLETED,
        processing_started_at: base.toISOString(),
        completed_at: new Date(base.getTime() + 60000).toISOString(),
      }),
      createPickupRequest({
        status: PICKUP_STATUS.COMPLETED,
        processing_started_at: base.toISOString(),
        completed_at: new Date(base.getTime() + 120000).toISOString(),
      }),
    ])
    const { avgProcessingTime } = useDashboardData()
    expect(avgProcessingTime.value).toBe(90000) // (60000 + 120000) / 2
  })

  it('avgProcessingTime returns null for empty stores', () => {
    const { avgProcessingTime } = useDashboardData()
    expect(avgProcessingTime.value).toBeNull()
  })

  it('avgWaitTime computes time from created_at to processing_started_at', () => {
    const created = new Date('2026-01-01T00:00:00Z')
    const started = new Date(created.getTime() + 30000)
    queue.setRequests([
      createPickupRequest({
        status: PICKUP_STATUS.COMPLETED,
        created_at: created.toISOString(),
        processing_started_at: started.toISOString(),
        completed_at: new Date(started.getTime() + 60000).toISOString(),
      }),
    ])
    const { avgWaitTime } = useDashboardData()
    expect(avgWaitTime.value).toBe(30000)
  })

  it('chartData returns per-gate queue counts', () => {
    queue.setRequests([
      createPickupRequest({ status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1 }),
      createPickupRequest({ status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 2 }),
    ])
    gates.recountQueues(queue.requests)
    const { chartData } = useDashboardData()
    expect(chartData.value).toEqual([
      { gate: 'Gate 1', count: 2 },
      { gate: 'Gate 2', count: 0 },
      { gate: 'Gate 3', count: 0 },
    ])
  })

  it('processingGateRows returns current processing request per gate', () => {
    queue.setRequests([
      createPickupRequest({ id: 'r1', status: PICKUP_STATUS.PROCESSING, gate_id: 'gate-2' }),
    ])
    gates.recountQueues(queue.requests)
    const { processingGateRows } = useDashboardData()
    const rows = processingGateRows.value
    expect(rows).toHaveLength(3)
    expect(rows[0].request).toBeNull()
    expect(rows[1].request?.id).toBe('r1')
    expect(rows[2].request).toBeNull()
  })

  it('returns zeros for empty stores', () => {
    const { completedCount, currentlyWaiting, avgWaitTime } = useDashboardData()
    expect(completedCount.value).toBe(0)
    expect(currentlyWaiting.value).toBe(0)
    expect(avgWaitTime.value).toBeNull()
  })
})
