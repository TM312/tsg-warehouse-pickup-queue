// Status constants - single source of truth
// Values must match database CHECK constraint: 'pending', 'approved', 'in_queue', 'processing', 'completed', 'cancelled'
export const PICKUP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_QUEUE: 'in_queue',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

// Derived type from constants
export type PickupStatus = typeof PICKUP_STATUS[keyof typeof PICKUP_STATUS]

// Status groupings for filtering
export const ACTIVE_STATUSES = [
  PICKUP_STATUS.PENDING,
  PICKUP_STATUS.APPROVED,
  PICKUP_STATUS.IN_QUEUE,
  PICKUP_STATUS.PROCESSING,
] as const satisfies readonly PickupStatus[]

export const TERMINAL_STATUSES = [
  PICKUP_STATUS.COMPLETED,
  PICKUP_STATUS.CANCELLED,
] as const satisfies readonly PickupStatus[]

// Helper type guard
export function isActiveStatus(status: PickupStatus): status is typeof ACTIVE_STATUSES[number] {
  return (ACTIVE_STATUSES as readonly string[]).includes(status)
}

// Main interface
export interface PickupRequest {
  id: string
  sales_order_number: string
  company_name: string | null
  customer_email: string
  status: PickupStatus
  email_flagged: boolean
  assigned_gate_id: string | null
  queue_position: number | null
  is_priority?: boolean
  processing_started_at?: string | null
  created_at: string
  gate?: { id: string; gate_number: number } | null
}
