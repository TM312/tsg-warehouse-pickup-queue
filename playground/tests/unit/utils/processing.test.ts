import { describe, it, expect } from 'vitest'
import { calcProcessingProgress, formatProcessingElapsed } from '@/utils/processing'
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

describe('formatProcessingElapsed', () => {
  it('returns "--" when processingStartedSimMs is null', () => {
    expect(formatProcessingElapsed(null, 10_000)).toBe('--')
  })

  it('returns "--" when processingStartedSimMs is undefined', () => {
    expect(formatProcessingElapsed(undefined, 10_000)).toBe('--')
  })

  it('formats elapsed time correctly', () => {
    expect(formatProcessingElapsed(0, 65_000)).toBe('1m')
  })

  it('clamps negative elapsed to 0s', () => {
    expect(formatProcessingElapsed(10_000, 5_000)).toBe('0s')
  })
})
