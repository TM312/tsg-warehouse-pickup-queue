import { describe, it, expect } from 'vitest'
import { QUEUE_HISTORY, GATE_CHART_COLORS, CHART_HEIGHT_PX } from '@/constants/chart'

describe('chart constants', () => {
  it('QUEUE_HISTORY.SAMPLE_INTERVAL_MS is a positive integer', () => {
    expect(QUEUE_HISTORY.SAMPLE_INTERVAL_MS).toBeGreaterThan(0)
    expect(Number.isInteger(QUEUE_HISTORY.SAMPLE_INTERVAL_MS)).toBe(true)
  })

  it('QUEUE_HISTORY.MAX_POINTS is a positive integer', () => {
    expect(QUEUE_HISTORY.MAX_POINTS).toBeGreaterThan(0)
    expect(Number.isInteger(QUEUE_HISTORY.MAX_POINTS)).toBe(true)
  })

  it('GATE_CHART_COLORS.light has at least 3 entries', () => {
    expect(GATE_CHART_COLORS.light.length).toBeGreaterThanOrEqual(3)
  })

  it('GATE_CHART_COLORS.dark has at least 3 entries', () => {
    expect(GATE_CHART_COLORS.dark.length).toBeGreaterThanOrEqual(3)
  })

  it('CHART_HEIGHT_PX is a positive integer', () => {
    expect(CHART_HEIGHT_PX).toBeGreaterThan(0)
    expect(Number.isInteger(CHART_HEIGHT_PX)).toBe(true)
  })
})
