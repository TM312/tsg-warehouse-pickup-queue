import { describe, it, expect } from 'vitest'
import { SCENARIOS, SCENARIO_ID } from '@/constants/scenarios'

describe('SCENARIOS', () => {
  it('has exactly 4 scenarios', () => {
    expect(SCENARIOS).toHaveLength(4)
  })

  it('each scenario has a unique id', () => {
    const ids = SCENARIOS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each scenario has non-empty steps array', () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.steps.length).toBeGreaterThan(0)
    }
  })

  it('each scenario has label, description, and icon', () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.label).toBeTruthy()
      expect(scenario.description).toBeTruthy()
      expect(scenario.icon).toBeTruthy()
    }
  })

  it('all scenario IDs match SCENARIO_ID constants', () => {
    const constantIds = Object.values(SCENARIO_ID)
    const scenarioIds = SCENARIOS.map((s) => s.id)
    expect(scenarioIds).toEqual(expect.arrayContaining(constantIds))
    expect(constantIds).toEqual(expect.arrayContaining(scenarioIds))
  })

  it('step delayMs values are non-negative numbers', () => {
    for (const scenario of SCENARIOS) {
      for (const step of scenario.steps) {
        expect(step.delayMs).toBeGreaterThanOrEqual(0)
        expect(typeof step.delayMs).toBe('number')
      }
    }
  })

  it('step actions are functions', () => {
    for (const scenario of SCENARIOS) {
      for (const step of scenario.steps) {
        expect(typeof step.action).toBe('function')
      }
    }
  })
})
