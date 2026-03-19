import { describe, expect, it } from 'vitest'
import { SHORTCUT_KEY, SPEED_KEYS, SHORTCUT_DISPLAY } from '@/constants/keyboard-shortcuts'

describe('keyboard-shortcuts constants', () => {
  it('SPEED_KEYS contains exactly the speed-related SHORTCUT_KEY values', () => {
    const expectedSpeedKeys = [SHORTCUT_KEY.SPEED_1, SHORTCUT_KEY.SPEED_2, SHORTCUT_KEY.SPEED_5]
    expect([...SPEED_KEYS]).toEqual(expect.arrayContaining(expectedSpeedKeys))
    expect(SPEED_KEYS.size).toBe(expectedSpeedKeys.length)
  })

  it('SHORTCUT_DISPLAY covers every SHORTCUT_KEY action', () => {
    // One display entry per SHORTCUT_KEY (speed keys are grouped in one row)
    const nonSpeedKeys = Object.keys(SHORTCUT_KEY).filter((k) => !k.startsWith('SPEED_'))
    // +1 for the single grouped speed entry
    const expectedCount = nonSpeedKeys.length + 1
    expect(SHORTCUT_DISPLAY.length).toBe(expectedCount)
  })

  it('no duplicate keys in SHORTCUT_KEY', () => {
    const values = Object.values(SHORTCUT_KEY)
    expect(new Set(values).size).toBe(values.length)
  })
})
