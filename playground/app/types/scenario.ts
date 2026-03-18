import type { Component } from 'vue'
import type { PickupRequest } from '@/types/pickup-request'
import type { PanelId } from '@/constants/panels'

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

export interface WalkthroughContext {
  requestId: string | null
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
  panel: PanelId
  title: string
  description: string
  action?: (actions: SimulationActions, context: WalkthroughContext) => void
  highlightSelector?: string
  delayMs?: number
}
