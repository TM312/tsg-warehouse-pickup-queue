import { describe, it, expect } from 'vitest'
import {
  GATE_OPERATIONAL_STATUS,
  GATE_STATUS_COLORS,
  GATE_STATUS_LABELS,
} from '@/constants/gate-status'

describe('gate-status constants', () => {
  it('defines all three operational statuses', () => {
    expect(GATE_OPERATIONAL_STATUS.IDLE).toBe('idle')
    expect(GATE_OPERATIONAL_STATUS.PROCESSING).toBe('processing')
    expect(GATE_OPERATIONAL_STATUS.OFFLINE).toBe('offline')
  })

  it('GATE_STATUS_COLORS covers all statuses', () => {
    for (const status of Object.values(GATE_OPERATIONAL_STATUS)) {
      expect(GATE_STATUS_COLORS[status]).toBeDefined()
    }
  })

  it('GATE_STATUS_LABELS covers all statuses', () => {
    for (const status of Object.values(GATE_OPERATIONAL_STATUS)) {
      expect(GATE_STATUS_LABELS[status]).toBeDefined()
    }
  })

  it('no color class contains "indigo"', () => {
    for (const color of Object.values(GATE_STATUS_COLORS)) {
      expect(color).not.toContain('indigo')
    }
  })
})
