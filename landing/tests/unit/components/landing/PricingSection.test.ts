import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PricingSection from '@/components/landing/PricingSection.vue'
import {
  PRICING_SECTION_HEADING,
  PRICING_FINE_PRINT,
  PRICING_TIERS,
  PRICING_REVEAL_STAGGER_MS,
} from '@/constants/pricing'

describe('PricingSection', () => {
  const stubs = {
    LandingPricingCard: { template: '<div data-testid="pricing-card" />', props: ['tier', 'displayPrice', 'billingCycle'] },
    LandingPricingToggle: { template: '<div data-testid="pricing-toggle" />', props: ['modelValue'] },
  }

  function factory() {
    return mount(PricingSection, {
      global: { stubs },
    })
  }

  it('renders section heading from constant', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="pricing-heading"]').text()).toBe(PRICING_SECTION_HEADING)
  })

  it('section has id="pricing"', () => {
    const wrapper = factory()
    expect(wrapper.find('#pricing').exists()).toBe(true)
  })

  it('renders 1 PricingToggle stub', () => {
    const wrapper = factory()
    expect(wrapper.findAll('[data-testid="pricing-toggle"]')).toHaveLength(1)
  })

  it('renders 3 PricingCard stubs', () => {
    const wrapper = factory()
    expect(wrapper.findAll('[data-testid="pricing-card"]')).toHaveLength(PRICING_TIERS.length)
  })

  it('cards have section-reveal class with staggered transitionDelay', () => {
    const wrapper = factory()
    const cards = wrapper.findAll('[data-testid="pricing-card"]')
    cards.forEach((card, i) => {
      expect(card.classes()).toContain('section-reveal')
      expect(card.attributes('style')).toContain(`transition-delay: ${i * PRICING_REVEAL_STAGGER_MS}ms`)
    })
  })

  it('renders fine print text', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="pricing-fine-print"]').text()).toBe(PRICING_FINE_PRINT)
  })
})
