import { describe, it, expect } from 'vitest'
import {
  MOCKUP_APP_URL,
  PRODUCT_MOCKUP_QUEUE_ENTRIES,
  PRODUCT_PHONE_POSITION,
  PRODUCT_PHONE_WAIT,
  PRODUCT_PHONE_GATE,
  PRODUCT_TABLET_GATE_LABEL,
  PRODUCT_TABLET_NOW_LOADING,
  PRODUCT_TABLET_ORDER_DETAIL,
  PRODUCT_TABLET_NEXT_UP,
} from '@/constants/mockup'

describe('mockup constants', () => {
  it('MOCKUP_APP_URL is a non-empty string', () => {
    expect(MOCKUP_APP_URL).toBeTruthy()
  })

  it('has queue entries with company, order, and status', () => {
    expect(PRODUCT_MOCKUP_QUEUE_ENTRIES.length).toBeGreaterThan(0)
    for (const entry of PRODUCT_MOCKUP_QUEUE_ENTRIES) {
      expect(entry.company).toBeTruthy()
      expect(entry.order).toBeTruthy()
      expect(entry.status).toBeTruthy()
    }
  })

  it('phone mockup constants are non-empty', () => {
    expect(PRODUCT_PHONE_POSITION).toBeTruthy()
    expect(PRODUCT_PHONE_WAIT).toBeTruthy()
    expect(PRODUCT_PHONE_GATE).toBeTruthy()
  })

  it('tablet mockup constants are non-empty', () => {
    expect(PRODUCT_TABLET_GATE_LABEL).toBeTruthy()
    expect(PRODUCT_TABLET_NOW_LOADING).toBeTruthy()
    expect(PRODUCT_TABLET_ORDER_DETAIL).toBeTruthy()
    expect(PRODUCT_TABLET_NEXT_UP).toBeTruthy()
  })
})
