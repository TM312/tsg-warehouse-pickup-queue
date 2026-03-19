import { computed, type Ref } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import { calcProcessingProgress, formatProcessingElapsed } from '@/utils/processing'
import type { PickupRequest } from '@/types/pickup-request'

export function useProcessingProgress(request: Ref<PickupRequest | null | undefined>) {
  const simulation = useSimulationStore()

  const progress = computed(() =>
    calcProcessingProgress(request.value?.processing_started_sim_ms, simulation.elapsedMs),
  )

  const elapsedMs = computed(() => {
    const startMs = request.value?.processing_started_sim_ms
    if (startMs == null) return 0
    return Math.max(0, simulation.elapsedMs - startMs)
  })

  const elapsedFormatted = computed(() =>
    formatProcessingElapsed(request.value?.processing_started_sim_ms, simulation.elapsedMs),
  )

  return { progress, elapsedMs, elapsedFormatted }
}
