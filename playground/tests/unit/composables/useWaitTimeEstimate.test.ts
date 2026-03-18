import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useWaitTimeEstimate } from '@/composables/useWaitTimeEstimate'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'

function makeCompleted(processingMs: number) {
  const started = new Date('2026-01-01T00:00:00Z')
  const completed = new Date(started.getTime() + processingMs)
  return createPickupRequest({
    status: PICKUP_STATUS.COMPLETED,
    processing_started_at: started.toISOString(),
    completed_at: completed.toISOString(),
  })
}

describe('useWaitTimeEstimate', () => {
  it('returns null when position is null', () => {
    const position = ref(null)
    const completed = ref([makeCompleted(60000), makeCompleted(90000), makeCompleted(120000)])
    const result = useWaitTimeEstimate(position, completed)
    expect(result.value).toBeNull()
  })

  it('returns null when fewer than 3 completed requests', () => {
    const position = ref(3)
    const completed = ref([makeCompleted(60000), makeCompleted(90000)])
    const result = useWaitTimeEstimate(position, completed)
    expect(result.value).toBeNull()
  })

  it('returns min=0, max=0 for position 1', () => {
    const position = ref(1)
    const completed = ref([makeCompleted(60000), makeCompleted(90000), makeCompleted(120000)])
    const result = useWaitTimeEstimate(position, completed)
    expect(result.value).toEqual({ min: 0, max: 0 })
  })

  it('returns correct min/max with sufficient data', () => {
    const position = ref(3) // multiplier = 2
    // Durations: 60000, 90000, 120000 (already sorted)
    // p25 = 60000 + (90000-60000)*0.5 = 75000
    // p75 = 90000 + (120000-90000)*0.5 = 105000
    const completed = ref([makeCompleted(60000), makeCompleted(90000), makeCompleted(120000)])
    const result = useWaitTimeEstimate(position, completed)
    expect(result.value).toEqual({ min: 150000, max: 210000 })
  })

  it('ignores completed requests without valid timestamps', () => {
    const position = ref(2)
    const completed = ref([
      makeCompleted(60000),
      makeCompleted(90000),
      createPickupRequest({ status: PICKUP_STATUS.COMPLETED, processing_started_at: null, completed_at: null }),
    ])
    const result = useWaitTimeEstimate(position, completed)
    // Only 2 valid durations, so returns null
    expect(result.value).toBeNull()
  })

  it('is reactive to position changes', () => {
    const position = ref(1)
    const completed = ref([makeCompleted(60000), makeCompleted(90000), makeCompleted(120000)])
    const result = useWaitTimeEstimate(position, completed)
    expect(result.value).toEqual({ min: 0, max: 0 })
    position.value = 3
    expect(result.value).toEqual({ min: 150000, max: 210000 })
  })
})
