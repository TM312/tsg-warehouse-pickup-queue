import { describe, it, expect } from 'vitest'
import {
  TOAST_DURATION_MS,
  TOAST_STORAGE_KEY,
  TOAST_MESSAGES,
  TOAST_TYPES,
} from '@/constants/toasts'

describe('toast constants', () => {
  it('TOAST_DURATION_MS is a positive number', () => {
    expect(TOAST_DURATION_MS).toBeGreaterThan(0)
  })

  it('TOAST_STORAGE_KEY.MUTED is a non-empty string', () => {
    expect(TOAST_STORAGE_KEY.MUTED).toBeTruthy()
    expect(typeof TOAST_STORAGE_KEY.MUTED).toBe('string')
  })

  describe('TOAST_MESSAGES', () => {
    it('submit formats order number into message', () => {
      expect(TOAST_MESSAGES.submit('SO-100')).toBe('Order SO-100 submitted')
    })

    it('approve formats order number into message', () => {
      expect(TOAST_MESSAGES.approve('SO-200')).toBe('Order SO-200 approved')
    })

    it('start_processing formats gate and order into message', () => {
      expect(TOAST_MESSAGES.start_processing(3, 'SO-300')).toBe('Gate 3 started processing SO-300')
    })

    it('complete formats order number into message', () => {
      expect(TOAST_MESSAGES.complete('SO-400')).toBe('SO-400 pickup complete!')
    })

    it('gate_offline formats gate number into message', () => {
      expect(TOAST_MESSAGES.gate_offline(5)).toBe('Gate 5 taken offline')
    })
  })

  describe('TOAST_TYPES', () => {
    const validTypes = ['info', 'success', 'warning']

    it.each(Object.entries(TOAST_TYPES))('%s is a valid toast type', (_key, value) => {
      expect(validTypes).toContain(value)
    })
  })
})
