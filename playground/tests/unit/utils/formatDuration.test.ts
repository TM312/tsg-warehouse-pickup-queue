import { describe, expect, it } from 'vitest'
import { formatDurationMs, formatDurationMinutes } from '@/utils/formatDuration'

describe('formatDurationMs', () => {
  it('returns -- for null/undefined', () => {
    expect(formatDurationMs(null)).toBe('--')
    expect(formatDurationMs(undefined)).toBe('--')
  })

  it('returns 0s for 0', () => {
    expect(formatDurationMs(0)).toBe('0s')
  })

  it('returns seconds for < 60s', () => {
    expect(formatDurationMs(30000)).toBe('30s')
  })

  it('returns minutes for >= 60s', () => {
    expect(formatDurationMs(90000)).toBe('1m')
  })

  it('returns hours and minutes', () => {
    expect(formatDurationMs(3660000)).toBe('1h 1m')
  })

  it('returns 0s for negative values', () => {
    expect(formatDurationMs(-5000)).toBe('0s')
  })
})

describe('formatDurationMinutes', () => {
  it('returns -- for null', () => {
    expect(formatDurationMinutes(null)).toBe('--')
  })

  it('returns 0m for 0', () => {
    expect(formatDurationMinutes(0)).toBe('0m')
  })

  it('returns minutes only', () => {
    expect(formatDurationMinutes(45)).toBe('45m')
  })

  it('returns hours only for exact hours', () => {
    expect(formatDurationMinutes(60)).toBe('1h')
  })

  it('returns hours and minutes', () => {
    expect(formatDurationMinutes(90)).toBe('1h 30m')
  })
})
