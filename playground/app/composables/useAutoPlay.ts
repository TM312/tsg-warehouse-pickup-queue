import { ref, nextTick, watch } from 'vue'
import { toast } from 'vue-sonner'
import { AUTOPLAY_DELAY_MS, AUTOPLAY_TOAST_DURATION_MS, STORAGE_KEY } from '@/constants/autoplay'
import { SCENARIOS, SCENARIO_ID } from '@/constants/scenarios'
import { useScenarioRunner } from '@/composables/useScenarioRunner'
import { useGuidedWalkthrough } from '@/composables/useGuidedWalkthrough'
import { useSimulationStore } from '@/stores/simulation'
import { useQueueStore } from '@/stores/queue'

function hasVisitedBefore(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY.HAS_VISITED) !== null
  } catch {
    return false
  }
}

function markVisited(): void {
  try {
    localStorage.setItem(STORAGE_KEY.HAS_VISITED, '1')
  } catch {
    // Storage unavailable — acceptable degradation
  }
}

export function useAutoPlay() {
  const isFirstVisit = ref(false)
  const panelsReady = ref(false)
  const introComplete = ref(false)

  let pendingTimeout: ReturnType<typeof setTimeout> | null = null
  let unwatchQueue: (() => void) | null = null

  function cleanup() {
    if (pendingTimeout !== null) {
      clearTimeout(pendingTimeout)
      pendingTimeout = null
    }
    if (unwatchQueue !== null) {
      unwatchQueue()
      unwatchQueue = null
    }
  }

  function selectFirstRequest() {
    const queue = useQueueStore()
    const simulation = useSimulationStore()

    if (queue.requests.length > 0) {
      simulation.selectCustomerRequest(queue.requests[0].id)
      return
    }

    unwatchQueue = watch(
      () => queue.requests.length,
      (len) => {
        if (len > 0) {
          simulation.selectCustomerRequest(queue.requests[0].id)
          unwatchQueue?.()
          unwatchQueue = null
        }
      },
    )
  }

  function initialize() {
    if (hasVisitedBefore()) {
      isFirstVisit.value = false
      return
    }

    isFirstVisit.value = true

    nextTick(() => {
      panelsReady.value = true
    })

    pendingTimeout = setTimeout(() => {
      pendingTimeout = null

      const { isActive: walkthroughActive, start: startTour } = useGuidedWalkthrough()
      if (walkthroughActive.value) return

      const morningRush = SCENARIOS.find(s => s.id === SCENARIO_ID.MORNING_RUSH)
      if (!morningRush) return

      markVisited()

      const { runScenario } = useScenarioRunner()
      runScenario(morningRush)

      selectFirstRequest()

      toast('Watch the simulation or take the guided tour', {
        action: {
          label: 'Start Tour',
          onClick: () => startTour(),
        },
        duration: AUTOPLAY_TOAST_DURATION_MS,
        dismissible: true,
      })

      introComplete.value = true
    }, AUTOPLAY_DELAY_MS)
  }

  return { isFirstVisit, panelsReady, introComplete, initialize, cleanup }
}
