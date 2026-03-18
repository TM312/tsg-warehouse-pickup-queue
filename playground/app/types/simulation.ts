export type SimulationSpeed = 1 | 2 | 5

export interface SimulationState {
  speed: SimulationSpeed
  isRunning: boolean
  elapsedMs: number
  selectedCustomerRequestId: string | null
  autoProcessEnabled: boolean
}

export type SimulationEventType =
  | 'submit'
  | 'approve'
  | 'assign'
  | 'start_processing'
  | 'complete'
  | 'cancel'
  | 'reorder'

export interface SimulationEvent {
  id: string
  timestamp: number
  label: string
  type: SimulationEventType
}
