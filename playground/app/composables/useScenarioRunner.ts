import { ref, shallowRef, watch } from 'vue'
import type { Scenario } from '@/types/scenario'
import { useSimulationActions } from '@/composables/useSimulationActions'
import { useSimulationStore } from '@/stores/simulation'

const isRunning = ref(false)
const activeScenarioId = ref<string | null>(null)
const currentStepIndex = ref(0)
const totalSteps = ref(0)
const activeScenario = shallowRef<Scenario | null>(null)

let pendingTimeout: ReturnType<typeof setTimeout> | null = null
let unwatchResume: (() => void) | null = null
let unwatchSpeed: (() => void) | null = null
let pendingStepDelayMs = 0
let timeoutStartedAt = 0
let timeoutSpeedAtSchedule = 1
let rescheduleNext: (() => void) | null = null

function cleanup() {
  if (pendingTimeout !== null) {
    clearTimeout(pendingTimeout)
    pendingTimeout = null
  }
  if (unwatchResume) {
    unwatchResume()
    unwatchResume = null
  }
  if (unwatchSpeed) {
    unwatchSpeed()
    unwatchSpeed = null
  }
  rescheduleNext = null
}

function stopScenario() {
  cleanup()
  isRunning.value = false
  activeScenarioId.value = null
  currentStepIndex.value = 0
  totalSteps.value = 0
  activeScenario.value = null
}

function runScenario(scenario: Scenario) {
  if (isRunning.value) {
    stopScenario()
  }

  const simulation = useSimulationStore()
  const actions = useSimulationActions()

  isRunning.value = true
  activeScenarioId.value = scenario.id
  currentStepIndex.value = 0
  totalSteps.value = scenario.steps.length
  activeScenario.value = scenario

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
    currentStepIndex.value = stepIndex
    if (stepIndex < scenario.steps.length) {
      scheduleNext()
    } else {
      stopScenario()
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

  function scheduleTimeout(wallClockDelayMs: number, stepDelayMs: number) {
    timeoutStartedAt = Date.now()
    timeoutSpeedAtSchedule = simulation.speed
    pendingStepDelayMs = stepDelayMs

    pendingTimeout = setTimeout(() => {
      pendingTimeout = null
      runOrWaitForResume()
    }, wallClockDelayMs)
  }

  function scheduleNext() {
    if (activeScenarioId.value !== scenario.id) return

    const step = scenario.steps[stepIndex]
    const delay = step.delayMs / simulation.speed

    if (delay === 0) {
      runOrWaitForResume()
      return
    }

    rescheduleNext = () => {
      if (pendingTimeout === null) return
      const wallClockElapsed = Date.now() - timeoutStartedAt
      const simTimeElapsed = wallClockElapsed * timeoutSpeedAtSchedule
      const remainingSimTime = Math.max(0, pendingStepDelayMs - simTimeElapsed)
      const newWallClockDelay = remainingSimTime / simulation.speed

      clearTimeout(pendingTimeout)
      pendingTimeout = null
      scheduleTimeout(newWallClockDelay, remainingSimTime)
    }

    scheduleTimeout(delay, step.delayMs)
  }

  unwatchSpeed = watch(
    () => simulation.speed,
    () => { rescheduleNext?.() },
    { flush: 'sync' },
  )

  scheduleNext()
}

export function useScenarioRunner() {
  return { runScenario, stopScenario, isRunning, activeScenarioId, currentStepIndex, totalSteps, activeScenario }
}
