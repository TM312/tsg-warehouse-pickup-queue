import { ref, watch } from 'vue'
import type { Scenario } from '@/types/scenario'
import { useSimulationActions } from '@/composables/useSimulationActions'
import { useSimulationStore } from '@/stores/simulation'

export function useScenarioRunner() {
  const isRunning = ref(false)
  const activeScenarioId = ref<string | null>(null)

  let pendingTimeout: ReturnType<typeof setTimeout> | null = null
  let unwatchResume: (() => void) | null = null

  function cleanup() {
    if (pendingTimeout !== null) {
      clearTimeout(pendingTimeout)
      pendingTimeout = null
    }
    if (unwatchResume) {
      unwatchResume()
      unwatchResume = null
    }
  }

  function stopScenario() {
    cleanup()
    isRunning.value = false
    activeScenarioId.value = null
  }

  function runScenario(scenario: Scenario) {
    if (isRunning.value) {
      stopScenario()
    }

    const simulation = useSimulationStore()
    const actions = useSimulationActions()

    isRunning.value = true
    activeScenarioId.value = scenario.id

    // Start simulation if not running
    if (!simulation.isRunning) {
      simulation.isRunning = true
    }

    let stepIndex = 0

    function executeStep() {
      if (activeScenarioId.value !== scenario.id) return

      const step = scenario.steps[stepIndex]
      step.action(actions)

      if (step.feedLabel) {
        simulation.addEvent({
          timestamp: simulation.elapsedMs,
          label: step.feedLabel,
          type: 'submit',
        })
      }

      stepIndex++
      if (stepIndex < scenario.steps.length) {
        scheduleNext()
      } else {
        cleanup()
        isRunning.value = false
        activeScenarioId.value = null
      }
    }

    function runOrWaitForResume() {
      if (activeScenarioId.value !== scenario.id) return

      if (!simulation.isRunning) {
        unwatchResume = watch(
          () => simulation.isRunning,
          (running) => {
            if (running && activeScenarioId.value === scenario.id) {
              unwatchResume!()
              unwatchResume = null
              executeStep()
            }
          },
          { flush: 'sync' },
        )
        return
      }

      executeStep()
    }

    function scheduleNext() {
      if (activeScenarioId.value !== scenario.id) return

      const step = scenario.steps[stepIndex]
      const delay = step.delayMs / simulation.speed

      if (delay === 0) {
        runOrWaitForResume()
        return
      }

      pendingTimeout = setTimeout(() => {
        pendingTimeout = null
        runOrWaitForResume()
      }, delay)
    }

    scheduleNext()
  }

  return { runScenario, stopScenario, isRunning, activeScenarioId }
}
