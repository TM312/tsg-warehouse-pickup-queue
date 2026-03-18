import { PICKUP_STATUS } from '@/constants/status'
import type { PickupStatus } from '@/constants/status'

export const VALID_TRANSITIONS: Record<PickupStatus, readonly PickupStatus[]> = {
  [PICKUP_STATUS.PENDING]: [PICKUP_STATUS.APPROVED, PICKUP_STATUS.CANCELLED],
  [PICKUP_STATUS.APPROVED]: [PICKUP_STATUS.IN_QUEUE, PICKUP_STATUS.CANCELLED],
  [PICKUP_STATUS.IN_QUEUE]: [PICKUP_STATUS.PROCESSING, PICKUP_STATUS.CANCELLED],
  [PICKUP_STATUS.PROCESSING]: [PICKUP_STATUS.COMPLETED, PICKUP_STATUS.CANCELLED],
  [PICKUP_STATUS.COMPLETED]: [],
  [PICKUP_STATUS.CANCELLED]: [],
}

export function isValidTransition(from: PickupStatus, to: PickupStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to)
}
