import { PICKUP_STATUS } from '@/constants/status'
import { SEED_COMPANIES, SEED_ORDER_PREFIXES } from '@/constants/defaults'
import type { PickupRequest } from '@/types/pickup-request'
import type { Gate } from '@/types/gate'
import { generateId } from '@/utils/id'
import { pickRandom, randomBetween } from '@/utils/random'

export function createPickupRequest(
  overrides?: Partial<PickupRequest>,
  rng: () => number = Math.random,
): PickupRequest {
  return {
    id: generateId(),
    sales_order_number: `${pickRandom([...SEED_ORDER_PREFIXES], rng)}-${randomBetween(10000, 99999, rng)}`,
    company_name: pickRandom(SEED_COMPANIES, rng),
    status: PICKUP_STATUS.PENDING,
    is_priority: false,
    gate_id: null,
    queue_position: null,
    processing_started_at: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createGate(overrides?: Partial<Gate>): Gate {
  return {
    id: generateId(),
    gate_number: 1,
    is_active: true,
    ...overrides,
  }
}

export function createScenarioOrder(
  orderNumber: string,
  overrides?: Partial<PickupRequest>,
  rng?: () => number,
): PickupRequest {
  return createPickupRequest(
    {
      sales_order_number: orderNumber,
      ...overrides,
    },
    rng,
  )
}
