import type { Component } from 'vue'

export interface SimulationActions {
  [key: string]: (...args: unknown[]) => unknown
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
