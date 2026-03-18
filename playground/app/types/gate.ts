export interface Gate {
  id: string
  gate_number: number
  is_active: boolean
}

export interface GateWithCount extends Gate {
  queue_count: number
}
