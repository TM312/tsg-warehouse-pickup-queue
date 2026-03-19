import { describe, it, expect, afterEach } from 'vitest'
import { resolveGateColors, formatTimeMs } from '@/utils/chart'
import { GATE_CHART_COLORS } from '@/constants/chart'

describe('resolveGateColors', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('returns light colors when no .dark class on documentElement', () => {
    document.documentElement.classList.remove('dark')
    const colors = resolveGateColors()
    expect(colors).toEqual([...GATE_CHART_COLORS.light])
  })

  it('returns dark colors when .dark class is present', () => {
    document.documentElement.classList.add('dark')
    const colors = resolveGateColors()
    expect(colors).toEqual([...GATE_CHART_COLORS.dark])
  })

  it('returns light colors when isDark is explicitly false', () => {
    const colors = resolveGateColors(false)
    expect(colors).toEqual([...GATE_CHART_COLORS.light])
  })

  it('returns dark colors when isDark is explicitly true', () => {
    const colors = resolveGateColors(true)
    expect(colors).toEqual([...GATE_CHART_COLORS.dark])
  })

  it('returns a new array each call (not a reference to the constant)', () => {
    const a = resolveGateColors()
    const b = resolveGateColors()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })
})

describe('formatTimeMs', () => {
  it('formats zero', () => {
    expect(formatTimeMs(0)).toBe('0:00')
  })

  it('formats seconds with zero-padding', () => {
    expect(formatTimeMs(5_000)).toBe('0:05')
  })

  it('formats exact minutes', () => {
    expect(formatTimeMs(60_000)).toBe('1:00')
  })

  it('formats minutes and seconds', () => {
    expect(formatTimeMs(125_000)).toBe('2:05')
  })

  it('truncates sub-second precision', () => {
    expect(formatTimeMs(61_999)).toBe('1:01')
  })

  it('clamps negative input to 0:00', () => {
    expect(formatTimeMs(-5000)).toBe('0:00')
  })
})
