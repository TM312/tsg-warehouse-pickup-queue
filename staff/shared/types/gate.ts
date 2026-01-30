export interface Gate {
  id: string
  gate_number: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// Extended type for UI that needs queue count
export interface GateWithCount extends Gate {
  queue_count: number
}
