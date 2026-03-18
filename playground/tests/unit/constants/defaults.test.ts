import { describe, expect, it } from 'vitest'
import {
  DEFAULT_GATE_COUNT,
  DEFAULT_GATES,
  DEFAULT_PROCESSING_DURATION_MS,
  DEFAULT_SIMULATION_SPEED,
  SIMULATION_SPEEDS,
} from '@/constants/defaults'

describe('defaults constants', () => {
  it('DEFAULT_GATES has DEFAULT_GATE_COUNT entries', () => {
    expect(DEFAULT_GATES).toHaveLength(DEFAULT_GATE_COUNT)
  })

  it('DEFAULT_GATES have sequential gate numbers starting at 1', () => {
    DEFAULT_GATES.forEach((gate, i) => {
      expect(gate.gate_number).toBe(i + 1)
      expect(gate.is_active).toBe(true)
    })
  })

  it('DEFAULT_PROCESSING_DURATION_MS is a positive number', () => {
    expect(DEFAULT_PROCESSING_DURATION_MS).toBeGreaterThan(0)
  })

  it('DEFAULT_SIMULATION_SPEED is included in SIMULATION_SPEEDS', () => {
    expect(SIMULATION_SPEEDS).toContain(DEFAULT_SIMULATION_SPEED)
  })

  it('SIMULATION_SPEEDS matches [1, 2, 5]', () => {
    expect([...SIMULATION_SPEEDS]).toEqual([1, 2, 5])
  })
})
