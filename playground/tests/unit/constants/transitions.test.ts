import { describe, it, expect } from 'vitest'
import { PICKUP_STATUS } from '@/constants/status'
import type { PickupStatus } from '@/constants/status'
import { VALID_TRANSITIONS, isValidTransition } from '@/constants/transitions'

describe('transitions', () => {
  const allStatuses = Object.values(PICKUP_STATUS) as PickupStatus[]

  it('every PICKUP_STATUS has an entry in VALID_TRANSITIONS', () => {
    for (const status of allStatuses) {
      expect(VALID_TRANSITIONS).toHaveProperty(status)
    }
  })

  it('terminal statuses have empty transition arrays', () => {
    expect(VALID_TRANSITIONS[PICKUP_STATUS.COMPLETED]).toEqual([])
    expect(VALID_TRANSITIONS[PICKUP_STATUS.CANCELLED]).toEqual([])
  })

  it('no self-transitions are allowed', () => {
    for (const status of allStatuses) {
      expect(VALID_TRANSITIONS[status]).not.toContain(status)
    }
  })

  it('isValidTransition returns true for valid pairs', () => {
    expect(isValidTransition(PICKUP_STATUS.PENDING, PICKUP_STATUS.APPROVED)).toBe(true)
    expect(isValidTransition(PICKUP_STATUS.APPROVED, PICKUP_STATUS.IN_QUEUE)).toBe(true)
    expect(isValidTransition(PICKUP_STATUS.IN_QUEUE, PICKUP_STATUS.PROCESSING)).toBe(true)
    expect(isValidTransition(PICKUP_STATUS.PROCESSING, PICKUP_STATUS.COMPLETED)).toBe(true)
    expect(isValidTransition(PICKUP_STATUS.PENDING, PICKUP_STATUS.CANCELLED)).toBe(true)
  })

  it('isValidTransition returns false for invalid pairs', () => {
    expect(isValidTransition(PICKUP_STATUS.PENDING, PICKUP_STATUS.PROCESSING)).toBe(false)
    expect(isValidTransition(PICKUP_STATUS.COMPLETED, PICKUP_STATUS.PENDING)).toBe(false)
    expect(isValidTransition(PICKUP_STATUS.CANCELLED, PICKUP_STATUS.PENDING)).toBe(false)
    expect(isValidTransition(PICKUP_STATUS.IN_QUEUE, PICKUP_STATUS.APPROVED)).toBe(false)
  })
})
