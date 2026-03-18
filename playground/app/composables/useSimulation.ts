import { watch, onUnmounted } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import { useQueueStore } from '@/stores/queue'
import { useSimulationActions } from '@/composables/useSimulationActions'
import { DEFAULT_PROCESSING_DURATION_MS } from '@/constants/defaults'

export function useSimulation() {
  const simulation = useSimulationStore()
  const queue = useQueueStore()
  const actions = useSimulationActions()

  let intervalId: ReturnType<typeof setInterval> | null = null

  function tickPeriod(): number {
    return 1000 / simulation.speed
  }

  function tick() {
    simulation.tick(1000)

    if (simulation.autoProcessEnabled) {
      const processing = queue.processingItems

      for (const request of processing) {
        if (request.processing_started_sim_ms == null) continue
        const elapsed = simulation.elapsedMs - request.processing_started_sim_ms
        if (elapsed >= DEFAULT_PROCESSING_DURATION_MS) {
          actions.completeRequest(request.id)
        }
      }
    }
  }

  function startInterval() {
    if (intervalId !== null) clearInterval(intervalId)
    intervalId = setInterval(tick, tickPeriod())
  }

  function start() {
    if (intervalId !== null) return
    simulation.isRunning = true
    startInterval()
  }

  function stop() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
    simulation.isRunning = false
  }

  function toggle() {
    if (simulation.isRunning) {
      stop()
    } else {
      start()
    }
  }

  watch(
    () => simulation.speed,
    () => {
      if (simulation.isRunning) {
        startInterval()
      }
    },
  )

  onUnmounted(() => {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  })

  return { start, stop, toggle }
}
