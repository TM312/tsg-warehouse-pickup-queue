import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PricingCard from '@/components/landing/PricingCard.vue'
import type { PricingTier } from '@/types/pricing'
import { PRICING_FEATURES, PRICING_PRICE_SUFFIX, PRICING_ANNUAL_NOTE } from '@/constants/pricing'

describe('PricingCard', () => {
  const baseTier: PricingTier = {
    key: 'starter',
    name: 'Starter',
    monthlyPrice: 149,
    badge: null,
    highlighted: false,
    cta: { label: 'Start Free Trial', href: '#trial', variant: 'outline' },
  }

  const stubs = {
    LandingPricingFeatureRow: { template: '<div data-testid="pricing-feature-row" />', props: ['label', 'value'] },
  }

  function factory(overrides: { tier?: Partial<PricingTier>; displayPrice?: number | null; billingCycle?: 'monthly' | 'annual' } = {}) {
    return mount(PricingCard, {
      props: {
        tier: { ...baseTier, ...overrides.tier } as PricingTier,
        displayPrice: 'displayPrice' in overrides ? overrides.displayPrice! : 149,
        billingCycle: overrides.billingCycle ?? 'monthly',
      },
      global: { stubs },
    })
  }

  it('renders tier name and CTA label', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain('Starter')
    expect(wrapper.text()).toContain('Start Free Trial')
  })

  it('renders correct number of feature rows', () => {
    const wrapper = factory()
    expect(wrapper.findAll('[data-testid="pricing-feature-row"]')).toHaveLength(PRICING_FEATURES.length)
  })

  it('shows dollar amount with price suffix for numeric price', () => {
    const wrapper = factory({ displayPrice: 149 })
    expect(wrapper.find('[data-testid="pricing-amount"]').text()).toContain('149')
    expect(wrapper.text()).toContain(PRICING_PRICE_SUFFIX)
  })

  it('shows Custom for null price without price suffix', () => {
    const wrapper = factory({
      tier: { key: 'enterprise', name: 'Enterprise', monthlyPrice: null },
      displayPrice: null,
    })
    expect(wrapper.find('[data-testid="pricing-amount"]').text()).toBe('Custom')
    expect(wrapper.text()).not.toContain(PRICING_PRICE_SUFFIX)
  })

  it('shows annual billing note only when billing cycle is annual', () => {
    const monthly = factory({ billingCycle: 'monthly' })
    expect(monthly.text()).not.toContain(PRICING_ANNUAL_NOTE)

    const annual = factory({ billingCycle: 'annual' })
    expect(annual.text()).toContain(PRICING_ANNUAL_NOTE)
  })

  it('does not show annual billing note for custom-priced tiers', () => {
    const wrapper = factory({
      tier: { key: 'enterprise', name: 'Enterprise', monthlyPrice: null },
      displayPrice: null,
      billingCycle: 'annual',
    })
    expect(wrapper.text()).not.toContain(PRICING_ANNUAL_NOTE)
  })

  it('renders badge only when tier.badge is non-null', () => {
    const noBadge = factory({ tier: { badge: null } })
    expect(noBadge.text()).not.toContain('Most Popular')

    const withBadge = factory({ tier: { badge: 'Most Popular', highlighted: true } })
    expect(withBadge.text()).toContain('Most Popular')
  })

  it('highlighted card has ring styling', () => {
    const wrapper = factory({ tier: { highlighted: true, badge: 'Most Popular' } })
    const card = wrapper.find('[data-testid="pricing-card"]')
    expect(card.classes()).toContain('ring-2')
    expect(card.classes()).toContain('ring-primary')
  })

  it('CTA links to the configured href', () => {
    const wrapper = factory({ tier: { cta: { label: 'Contact Sales', href: '#contact', variant: 'outline' } } })
    const button = wrapper.find('a, button')
    expect(button.attributes('href')).toBe('#contact')
  })
})
