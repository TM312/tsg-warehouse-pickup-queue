import { describe, it, expect } from 'vitest'
import { getScenarioDurationMs } from '@/utils/scenarioDuration'
import { SCENARIOS, SCENARIO_ID } from '@/constants/scenarios'

describe('getScenarioDurationMs', () => {
  it('returns 0 for empty steps array', () => {
    expect(getScenarioDurationMs([])).toBe(0)
  })

  it('returns 0 for a single step with delayMs 0', () => {
    expect(getScenarioDurationMs([{ delayMs: 0, action: () => {} }])).toBe(0)
  })

  it('returns max delayMs from multiple steps', () => {
    const steps = [
      { delayMs: 0, action: () => {} },
      { delayMs: 3000, action: () => {} },
      { delayMs: 5000, action: () => {} },
    ]
    expect(getScenarioDurationMs(steps)).toBe(5000)
  })

  it.each([
    [SCENARIO_ID.SINGLE_ORDER, 0],
    [SCENARIO_ID.MORNING_RUSH, 15000],
    [SCENARIO_ID.PRIORITY_OVERRIDE, 8000],
    [SCENARIO_ID.GATE_OFFLINE, 8000],
  ])('returns expected duration for %s', (id, expected) => {
    const scenario = SCENARIOS.find(s => s.id === id)!
    expect(getScenarioDurationMs(scenario.steps)).toBe(expected)
  })
})
