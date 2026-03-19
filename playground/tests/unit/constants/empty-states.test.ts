import { describe, expect, it } from 'vitest'
import { EMPTY_STATE, RUN_SCENARIO_LABEL } from '@/constants/empty-states'

describe('EMPTY_STATE constants', () => {
  const entries = Object.entries(EMPTY_STATE)

  it.each(entries)('%s has icon, heading, and subtext', (_key, entry) => {
    expect(entry).toHaveProperty('icon')
    expect(typeof entry.heading).toBe('string')
    expect(entry.heading.length).toBeGreaterThan(0)
    expect(typeof entry.subtext).toBe('string')
    expect(entry.subtext.length).toBeGreaterThan(0)
  })

  it.each(entries)('%s icon is a valid Vue component', (_key, entry) => {
    const icon = entry.icon as Record<string, unknown>
    expect(icon.render || icon.setup || typeof icon === 'function').toBeTruthy()
  })

  it('RUN_SCENARIO_LABEL is a non-empty string', () => {
    expect(typeof RUN_SCENARIO_LABEL).toBe('string')
    expect(RUN_SCENARIO_LABEL.length).toBeGreaterThan(0)
  })
})
