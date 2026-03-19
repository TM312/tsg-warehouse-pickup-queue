import { useScenarioRunner } from '@/composables/useScenarioRunner'
import { SCENARIOS, SCENARIO_ID } from '@/constants/scenarios'

export function useMorningRush() {
  const { runScenario, isRunning } = useScenarioRunner()

  function handleRunMorningRush() {
    const scenario = SCENARIOS.find(s => s.id === SCENARIO_ID.MORNING_RUSH)
    if (scenario) runScenario(scenario)
  }

  return { handleRunMorningRush, isRunning }
}
