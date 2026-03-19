import { describe, it, expect } from 'vitest'
import { PHONE_STATUS_BAR_TIME } from '@/constants/phone'

describe('phone constants', () => {
  it('exports the classic iOS demo time', () => {
    expect(PHONE_STATUS_BAR_TIME).toBe('9:41')
  })
})
