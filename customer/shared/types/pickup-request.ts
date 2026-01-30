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

// Minimal interface for customer app
// Only includes fields the customer app actually uses
export interface PickupRequest {
  id: string
  sales_order_number: string
  company_name: string | null
  status: PickupStatus
  queue_position: number | null
  created_at: string
  assigned_gate_id: string | null
}
