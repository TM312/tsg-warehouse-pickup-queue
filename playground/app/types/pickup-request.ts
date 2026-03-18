import type { PickupStatus } from '@/constants/status'

export interface PickupRequest {
  id: string
  sales_order_number: string
  company_name: string
  status: PickupStatus
  is_priority: boolean
  gate_id: string | null
  queue_position: number | null
  processing_started_at: string | null
  processing_started_sim_ms: number | null
  completed_at: string | null
  created_at: string
}
