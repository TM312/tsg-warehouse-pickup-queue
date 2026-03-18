import { describe, expect, it } from 'vitest'
import { computeNextPosition, recalculatePositions } from '@/utils/queue'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'

describe('computeNextPosition', () => {
  it('returns 1 for empty gate', () => {
    expect(computeNextPosition([], 'gate-1')).toBe(1)
  })

  it('returns count + 1 for existing items', () => {
    const requests = [
      createPickupRequest({ gate_id: 'gate-1', status: PICKUP_STATUS.IN_QUEUE, queue_position: 1 }),
      createPickupRequest({ gate_id: 'gate-1', status: PICKUP_STATUS.IN_QUEUE, queue_position: 2 }),
    ]
    expect(computeNextPosition(requests, 'gate-1')).toBe(3)
  })

  it('ignores non-in_queue statuses', () => {
    const requests = [
      createPickupRequest({ gate_id: 'gate-1', status: PICKUP_STATUS.IN_QUEUE, queue_position: 1 }),
      createPickupRequest({ gate_id: 'gate-1', status: PICKUP_STATUS.PROCESSING }),
      createPickupRequest({ gate_id: 'gate-1', status: PICKUP_STATUS.COMPLETED }),
    ]
    expect(computeNextPosition(requests, 'gate-1')).toBe(2)
  })

  it('ignores items in other gates', () => {
    const requests = [
      createPickupRequest({ gate_id: 'gate-1', status: PICKUP_STATUS.IN_QUEUE, queue_position: 1 }),
      createPickupRequest({ gate_id: 'gate-2', status: PICKUP_STATUS.IN_QUEUE, queue_position: 1 }),
      createPickupRequest({ gate_id: 'gate-2', status: PICKUP_STATUS.IN_QUEUE, queue_position: 2 }),
    ]
    expect(computeNextPosition(requests, 'gate-1')).toBe(2)
  })
})

describe('recalculatePositions', () => {
  it('assigns sequential positions from 1', () => {
    const requests = [
      createPickupRequest({ id: 'a', gate_id: 'gate-1', status: PICKUP_STATUS.IN_QUEUE, queue_position: 5 }),
      createPickupRequest({ id: 'b', gate_id: 'gate-1', status: PICKUP_STATUS.IN_QUEUE, queue_position: 10 }),
    ]
    const result = recalculatePositions(requests, 'gate-1')
    expect(result.find((r) => r.id === 'a')!.queue_position).toBe(1)
    expect(result.find((r) => r.id === 'b')!.queue_position).toBe(2)
  })

  it('puts priority items first', () => {
    const requests = [
      createPickupRequest({ id: 'normal', gate_id: 'gate-1', status: PICKUP_STATUS.IN_QUEUE, is_priority: false, queue_position: 1 }),
      createPickupRequest({ id: 'priority', gate_id: 'gate-1', status: PICKUP_STATUS.IN_QUEUE, is_priority: true, queue_position: 2 }),
    ]
    const result = recalculatePositions(requests, 'gate-1')
    expect(result.find((r) => r.id === 'priority')!.queue_position).toBe(1)
    expect(result.find((r) => r.id === 'normal')!.queue_position).toBe(2)
  })

  it('preserves position order among multiple priority items', () => {
    const requests = [
      createPickupRequest({ id: 'p1', gate_id: 'gate-1', status: PICKUP_STATUS.IN_QUEUE, is_priority: true, queue_position: 2 }),
      createPickupRequest({ id: 'p2', gate_id: 'gate-1', status: PICKUP_STATUS.IN_QUEUE, is_priority: true, queue_position: 1 }),
      createPickupRequest({ id: 'n1', gate_id: 'gate-1', status: PICKUP_STATUS.IN_QUEUE, is_priority: false, queue_position: 3 }),
    ]
    const result = recalculatePositions(requests, 'gate-1')
    expect(result.find((r) => r.id === 'p2')!.queue_position).toBe(1)
    expect(result.find((r) => r.id === 'p1')!.queue_position).toBe(2)
    expect(result.find((r) => r.id === 'n1')!.queue_position).toBe(3)
  })

  it('does not mutate input', () => {
    const requests = [
      createPickupRequest({ id: 'a', gate_id: 'gate-1', status: PICKUP_STATUS.IN_QUEUE, queue_position: 3 }),
    ]
    const original = { ...requests[0] }
    recalculatePositions(requests, 'gate-1')
    expect(requests[0]).toEqual(original)
  })

  it('leaves other gates untouched', () => {
    const requests = [
      createPickupRequest({ id: 'a', gate_id: 'gate-1', status: PICKUP_STATUS.IN_QUEUE, queue_position: 1 }),
      createPickupRequest({ id: 'b', gate_id: 'gate-2', status: PICKUP_STATUS.IN_QUEUE, queue_position: 5 }),
    ]
    const result = recalculatePositions(requests, 'gate-1')
    expect(result.find((r) => r.id === 'b')!.queue_position).toBe(5)
  })
})
