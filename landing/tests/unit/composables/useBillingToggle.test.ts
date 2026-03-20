import { describe, it, expect } from 'vitest'
import { useBillingToggle } from '@/composables/useBillingToggle'
import { PRICING_ANNUAL_DISCOUNT } from '@/constants/pricing'

describe('useBillingToggle', () => {
  it('defaults to monthly billing', () => {
    const { billingCycle } = useBillingToggle()
    expect(billingCycle.value).toBe('monthly')
  })

  it('returns monthly price when cycle is monthly', () => {
    const { getDisplayPrice } = useBillingToggle()
    expect(getDisplayPrice(349)).toBe(349)
  })

  it('returns discounted price when cycle is annual', () => {
    const { billingCycle, getDisplayPrice } = useBillingToggle()
    billingCycle.value = 'annual'
    expect(getDisplayPrice(349)).toBe(279)
  })

  it('returns null for null price regardless of cycle', () => {
    const { billingCycle, getDisplayPrice } = useBillingToggle()
    expect(getDisplayPrice(null)).toBeNull()
    billingCycle.value = 'annual'
    expect(getDisplayPrice(null)).toBeNull()
  })

  it('returns 119 for starter annual price', () => {
    const { billingCycle, getDisplayPrice } = useBillingToggle()
    billingCycle.value = 'annual'
    expect(getDisplayPrice(149)).toBe(119)
  })

  it('rounds fractional annual prices to nearest integer', () => {
    const { billingCycle, getDisplayPrice } = useBillingToggle()
    billingCycle.value = 'annual'
    // 333 * 0.8 = 266.4 → rounds to 266
    expect(getDisplayPrice(333)).toBe(Math.round(333 * (1 - PRICING_ANNUAL_DISCOUNT)))
  })

  it('applies discount formula consistently: price * (1 - discount)', () => {
    const { billingCycle, getDisplayPrice } = useBillingToggle()
    billingCycle.value = 'annual'
    const prices = [100, 199, 250, 499, 999]
    for (const price of prices) {
      expect(getDisplayPrice(price)).toBe(Math.round(price * (1 - PRICING_ANNUAL_DISCOUNT)))
    }
  })

  it('tracks billing cycle changes reactively', () => {
    const { billingCycle, getDisplayPrice } = useBillingToggle()
    expect(getDisplayPrice(100)).toBe(100)
    billingCycle.value = 'annual'
    expect(getDisplayPrice(100)).toBe(80)
    billingCycle.value = 'monthly'
    expect(getDisplayPrice(100)).toBe(100)
  })
})
