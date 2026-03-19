import type { ScenarioStep } from '@/types/scenario'

export function getScenarioDurationMs(steps: ScenarioStep[]): number {
  if (steps.length === 0) return 0
  return Math.max(...steps.map(s => s.delayMs))
}
