import { describe, it, expect } from 'vitest'
import { HIGHLIGHT_TARGET, TARGET_PANEL, ACTION_HIGHLIGHT_TARGETS, KPI_HIGHLIGHT_MAP } from '@/constants/highlights'

describe('highlights constants', () => {
  it('every HIGHLIGHT_TARGET value has an entry in TARGET_PANEL', () => {
    for (const target of Object.values(HIGHLIGHT_TARGET)) {
      expect(TARGET_PANEL).toHaveProperty(target)
    }
  })

  it('every target in ACTION_HIGHLIGHT_TARGETS exists in HIGHLIGHT_TARGET', () => {
    const validTargets = new Set(Object.values(HIGHLIGHT_TARGET))
    for (const targets of Object.values(ACTION_HIGHLIGHT_TARGETS)) {
      for (const target of targets!) {
        expect(validTargets.has(target)).toBe(true)
      }
    }
  })

  it('ACTION_HIGHLIGHT_TARGETS covers approve, assign, start_processing, complete', () => {
    expect(ACTION_HIGHLIGHT_TARGETS).toHaveProperty('approve')
    expect(ACTION_HIGHLIGHT_TARGETS).toHaveProperty('assign')
    expect(ACTION_HIGHLIGHT_TARGETS).toHaveProperty('start_processing')
    expect(ACTION_HIGHLIGHT_TARGETS).toHaveProperty('complete')
  })

  it('every KPI_HIGHLIGHT_MAP value exists in HIGHLIGHT_TARGET', () => {
    const validTargets = new Set(Object.values(HIGHLIGHT_TARGET))
    for (const target of Object.values(KPI_HIGHLIGHT_MAP)) {
      expect(validTargets.has(target)).toBe(true)
    }
  })
})
