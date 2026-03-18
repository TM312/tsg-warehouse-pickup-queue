import { describe, it, expect } from 'vitest'
import { WALKTHROUGH_STEPS, WALKTHROUGH_STEP_ID } from '@/constants/walkthrough'
import { PANEL_ID } from '@/constants/panels'

describe('WALKTHROUGH_STEPS', () => {
  it('has exactly 6 steps', () => {
    expect(WALKTHROUGH_STEPS).toHaveLength(6)
  })

  it('each step has a unique id', () => {
    const ids = WALKTHROUGH_STEPS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all step IDs match WALKTHROUGH_STEP_ID constants', () => {
    const constantIds = Object.values(WALKTHROUGH_STEP_ID)
    const stepIds = WALKTHROUGH_STEPS.map((s) => s.id)
    expect(stepIds).toEqual(expect.arrayContaining(constantIds))
    expect(constantIds).toEqual(expect.arrayContaining(stepIds))
  })

  it('each step has non-empty title and description', () => {
    for (const step of WALKTHROUGH_STEPS) {
      expect(step.title).toBeTruthy()
      expect(step.description).toBeTruthy()
    }
  })

  it('each step panel is a valid PanelId', () => {
    const validPanels = Object.values(PANEL_ID)
    for (const step of WALKTHROUGH_STEPS) {
      expect(validPanels).toContain(step.panel)
    }
  })

  it('steps with actions have function-typed actions', () => {
    for (const step of WALKTHROUGH_STEPS) {
      if (step.action !== undefined) {
        expect(typeof step.action).toBe('function')
      }
    }
  })

  it('steps with highlightSelector have non-empty strings', () => {
    for (const step of WALKTHROUGH_STEPS) {
      if (step.highlightSelector !== undefined) {
        expect(typeof step.highlightSelector).toBe('string')
        expect(step.highlightSelector.length).toBeGreaterThan(0)
      }
    }
  })
})
