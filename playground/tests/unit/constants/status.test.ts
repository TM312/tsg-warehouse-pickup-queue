import { describe, expect, it } from 'vitest'
import {
  PICKUP_STATUS,
  ACTIVE_STATUSES,
  TERMINAL_STATUSES,
  GATE_STATUSES,
  STATUS_LABELS,
  STATUS_VARIANT,
  isActiveStatus,
  type PickupStatus,
} from '@/constants/status'

const ALL_STATUSES = Object.values(PICKUP_STATUS) as PickupStatus[]

describe('status constants', () => {
  it('ACTIVE_STATUSES + TERMINAL_STATUSES covers all statuses', () => {
    const combined = [...ACTIVE_STATUSES, ...TERMINAL_STATUSES]
    expect(combined.sort()).toEqual([...ALL_STATUSES].sort())
  })

  it('no overlap between active and terminal', () => {
    const overlap = ACTIVE_STATUSES.filter((s) =>
      (TERMINAL_STATUSES as readonly PickupStatus[]).includes(s),
    )
    expect(overlap).toHaveLength(0)
  })

  it('GATE_STATUSES is a subset of ACTIVE_STATUSES', () => {
    for (const status of GATE_STATUSES) {
      expect(ACTIVE_STATUSES).toContain(status)
    }
  })

  it('STATUS_LABELS has entry for every status', () => {
    for (const status of ALL_STATUSES) {
      expect(STATUS_LABELS[status]).toBeDefined()
      expect(typeof STATUS_LABELS[status]).toBe('string')
    }
  })

  it('STATUS_VARIANT has entry for every status with valid variant', () => {
    const validVariants = ['outline', 'secondary', 'default', 'destructive']
    for (const status of ALL_STATUSES) {
      expect(STATUS_VARIANT[status]).toBeDefined()
      expect(validVariants).toContain(STATUS_VARIANT[status].variant)
    }
  })

  it('isActiveStatus() returns correct boolean for each status', () => {
    for (const status of ACTIVE_STATUSES) {
      expect(isActiveStatus(status)).toBe(true)
    }
    for (const status of TERMINAL_STATUSES) {
      expect(isActiveStatus(status)).toBe(false)
    }
  })
})
