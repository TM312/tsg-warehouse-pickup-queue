import { ref, computed, watch } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import { useGatesStore } from '@/stores/gates'
import { QUEUE_HISTORY } from '@/constants/chart'

export interface QueueHistoryPoint {
  timeMs: number
  counts: Record<string, number>
}

const history = ref<QueueHistoryPoint[]>([])
let lastSampledMs = -1

function samplePoint(timeMs: number): QueueHistoryPoint {
  const gates = useGatesStore()
  const counts: Record<string, number> = {}
  for (const gate of gates.activeGates) {
    counts[gate.id] = gate.queue_count
  }
  return { timeMs, counts }
}

export function useQueueHistory() {
  const simulation = useSimulationStore()
  const gates = useGatesStore()

  // Record t=0 point when simulation starts
  watch(
    () => simulation.isRunning,
    (running) => {
      if (running && history.value.length === 0) {
        history.value.push(samplePoint(simulation.elapsedMs))
        lastSampledMs = simulation.elapsedMs
      }
    },
  )

  // Sample at regular intervals
  watch(
    () => simulation.elapsedMs,
    (ms) => {
      if (!simulation.isRunning) return
      if (lastSampledMs < 0) return
      if (ms - lastSampledMs < QUEUE_HISTORY.SAMPLE_INTERVAL_MS) return

      history.value.push(samplePoint(ms))
      lastSampledMs = ms

      if (history.value.length > QUEUE_HISTORY.MAX_POINTS) {
        history.value = history.value.slice(-QUEUE_HISTORY.MAX_POINTS)
      }
    },
  )

  const gateIds = computed(() => {
    const ids = new Set<string>()
    for (const point of history.value) {
      for (const id of Object.keys(point.counts)) {
        ids.add(id)
      }
    }
    return [...ids]
  })

  const gateLabels = computed(() => {
    const labels: Record<string, string> = {}
    for (const id of gateIds.value) {
      const gate = gates.gateById(id)
      labels[id] = gate ? `Gate ${gate.gate_number}` : id
    }
    return labels
  })

  function reset() {
    history.value = []
    lastSampledMs = -1
  }

  return {
    history: computed(() => history.value),
    gateIds,
    gateLabels,
    reset,
  }
}
