import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useProcessingProgress } from '@/composables/useProcessingProgress'
import { useSimulationStore } from '@/stores/simulation'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'
import { DEFAULT_PROCESSING_DURATION_MS } from '@/constants/defaults'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('useProcessingProgress', () => {
  it('returns 0 progress for null request', () => {
    const request = ref(null)
    const { progress, elapsedMs, elapsedFormatted } = useProcessingProgress(request)
    expect(progress.value).toBe(0)
    expect(elapsedMs.value).toBe(0)
    expect(elapsedFormatted.value).toBe('--')
  })

  it('computes progress based on simulation elapsed time', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = DEFAULT_PROCESSING_DURATION_MS / 2

    const request = ref(createPickupRequest({
      status: PICKUP_STATUS.PROCESSING,
      processing_started_sim_ms: 0,
    }))

    const { progress } = useProcessingProgress(request)
    expect(progress.value).toBe(0.5)
  })

  it('computes raw elapsed milliseconds', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 70_000

    const request = ref(createPickupRequest({
      status: PICKUP_STATUS.PROCESSING,
      processing_started_sim_ms: 10_000,
    }))

    const { elapsedMs } = useProcessingProgress(request)
    expect(elapsedMs.value).toBe(60_000)
  })

  it('clamps elapsedMs to 0 when simulation is before start', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 5_000

    const request = ref(createPickupRequest({
      status: PICKUP_STATUS.PROCESSING,
      processing_started_sim_ms: 10_000,
    }))

    const { elapsedMs } = useProcessingProgress(request)
    expect(elapsedMs.value).toBe(0)
  })

  it('returns 0 elapsedMs when processing has not started', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 10_000

    const request = ref(createPickupRequest({
      status: PICKUP_STATUS.PROCESSING,
    }))
    ;(request.value as any).processing_started_sim_ms = undefined

    const { elapsedMs } = useProcessingProgress(request)
    expect(elapsedMs.value).toBe(0)
  })

  it('formats elapsed duration via formatProcessingElapsed', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 70_000

    const request = ref(createPickupRequest({
      status: PICKUP_STATUS.PROCESSING,
      processing_started_sim_ms: 10_000,
    }))

    const { elapsedFormatted } = useProcessingProgress(request)
    expect(elapsedFormatted.value).toBe('1m')
  })

  it('returns "--" when processing has not started', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 10_000

    const request = ref(createPickupRequest({
      status: PICKUP_STATUS.PROCESSING,
    }))
    ;(request.value as any).processing_started_sim_ms = undefined

    const { elapsedFormatted } = useProcessingProgress(request)
    expect(elapsedFormatted.value).toBe('--')
  })
})
