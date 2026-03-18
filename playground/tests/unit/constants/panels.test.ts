import { describe, expect, it } from 'vitest'
import {
  PANEL_ID,
  PANEL_DEFINITIONS,
  BREAKPOINTS,
  SIMULATION_SPEEDS,
} from '@/constants/panels'

describe('panel constants', () => {
  it('PANEL_ID has exactly 3 keys', () => {
    const keys = Object.keys(PANEL_ID)
    expect(keys).toHaveLength(3)
    expect(keys).toContain('CUSTOMER')
    expect(keys).toContain('STAFF')
    expect(keys).toContain('ANALYTICS')
  })

  it('PANEL_DEFINITIONS has entry for each PANEL_ID value with non-empty label/description', () => {
    const panelIds = Object.values(PANEL_ID)
    expect(PANEL_DEFINITIONS).toHaveLength(panelIds.length)

    for (const id of panelIds) {
      const def = PANEL_DEFINITIONS.find((d) => d.id === id)
      expect(def).toBeDefined()
      expect(def!.label.length).toBeGreaterThan(0)
      expect(def!.description.length).toBeGreaterThan(0)
    }
  })

  it('SIMULATION_SPEEDS matches [1, 2, 5]', () => {
    expect([...SIMULATION_SPEEDS]).toEqual([1, 2, 5])
  })

  it('BREAKPOINTS.MOBILE < BREAKPOINTS.DESKTOP', () => {
    expect(BREAKPOINTS.MOBILE).toBeLessThan(BREAKPOINTS.DESKTOP)
  })
})
