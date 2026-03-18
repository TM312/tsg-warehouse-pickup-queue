import type { Component } from 'vue'
import type { PickupRequest } from '@/types/pickup-request'

export interface SimulationActions {
  submitOrder: (orderNumber: string, companyName?: string) => PickupRequest
  approveRequest: (id: string) => void
  assignToGate: (id: string, gateId: string) => void
  reorderQueue: (gateId: string, orderedIds: string[]) => void
  setPriority: (id: string, isPriority: boolean) => void
  startProcessing: (id: string) => void
  completeRequest: (id: string) => void
  cancelRequest: (id: string) => void
  moveToGate: (id: string, newGateId: string) => void
  deactivateGate: (gateId: string) => void
}

export interface ScenarioStep {
  delayMs: number
  action: (actions: SimulationActions) => void
  feedLabel?: string
}

export interface Scenario {
  id: string
  label: string
  description: string
  icon: Component
  steps: ScenarioStep[]
}

export interface WalkthroughStep {
  id: string
  panel: string
  title: string
  description: string
  action?: (actions: SimulationActions) => void
  highlightSelector?: string
}
