import { ref } from 'vue'
import type { BillingCycle } from '@/types/pricing'
import { PRICING_ANNUAL_DISCOUNT } from '@/constants/pricing'

export function useBillingToggle() {
  const billingCycle = ref<BillingCycle>('monthly')

  function getDisplayPrice(monthlyPrice: number | null): number | null {
    if (monthlyPrice === null) return null
    if (billingCycle.value === 'annual') {
      return Math.round(monthlyPrice * (1 - PRICING_ANNUAL_DISCOUNT))
    }
    return monthlyPrice
  }

  return { billingCycle, getDisplayPrice }
}
