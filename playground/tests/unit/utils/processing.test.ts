import { describe, it, expect } from 'vitest'
import { calcProcessingProgress } from '@/utils/processing'
import { DEFAULT_PROCESSING_DURATION_MS } from '@/constants/defaults'

describe('calcProcessingProgress', () => {
  it('returns 0 when processingStartedSimMs is null', () => {
    expect(calcProcessingProgress(null, 10_000)).toBe(0)
  })

  it('returns 0 when processingStartedSimMs is undefined', () => {
    expect(calcProcessingProgress(undefined, 10_000)).toBe(0)
  })

  it('returns 0.5 at halfway point', () => {
    const halfway = DEFAULT_PROCESSING_DURATION_MS / 2
    expect(calcProcessingProgress(0, halfway)).toBe(0.5)
  })

  it('returns 1 when fully elapsed', () => {
    expect(calcProcessingProgress(0, DEFAULT_PROCESSING_DURATION_MS)).toBe(1)
  })

  it('clamps to 1 when elapsed exceeds duration', () => {
    expect(calcProcessingProgress(0, DEFAULT_PROCESSING_DURATION_MS * 2)).toBe(1)
  })

  it('clamps to 0 when elapsed is negative', () => {
    expect(calcProcessingProgress(5_000, 0)).toBe(0)
  })

  it('accounts for start offset', () => {
    const start = 10_000
    const elapsed = start + DEFAULT_PROCESSING_DURATION_MS / 2
    expect(calcProcessingProgress(start, elapsed)).toBe(0.5)
  })
})
