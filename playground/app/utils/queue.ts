import { PICKUP_STATUS } from '@/constants/status'
import type { PickupRequest } from '@/types/pickup-request'

function isQueuedAtGate(request: PickupRequest, gateId: string): boolean {
  return request.gate_id === gateId && request.status === PICKUP_STATUS.IN_QUEUE
}

export function computeNextPosition(requests: readonly PickupRequest[], gateId: string): number {
  const count = requests.filter((r) => isQueuedAtGate(r, gateId)).length
  return count + 1
}

export function recalculatePositions(
  requests: readonly PickupRequest[],
  gateId: string,
): PickupRequest[] {
  const gateQueue = requests
    .filter((r) => isQueuedAtGate(r, gateId))
    .sort((a, b) => {
      if (a.is_priority !== b.is_priority) return a.is_priority ? -1 : 1
      return (a.queue_position ?? Infinity) - (b.queue_position ?? Infinity)
    })

  const positionMap = new Map<string, number>()
  gateQueue.forEach((r, i) => positionMap.set(r.id, i + 1))

  return requests.map((r) => {
    const newPosition = positionMap.get(r.id)
    if (newPosition !== undefined) {
      return { ...r, queue_position: newPosition }
    }
    return r
  })
}
