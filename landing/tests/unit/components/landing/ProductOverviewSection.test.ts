import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductOverviewSection from '@/components/landing/ProductOverviewSection.vue'
import { PRODUCT_SECTION_HEADING, PRODUCT_FEATURES, PRODUCT_SECTION_ID } from '@/constants/product'
import { REVEAL_STAGGER_MS } from '@/constants/animation'

describe('ProductOverviewSection', () => {
  const stubs = {
    LandingProductFeatureCard: { template: '<div data-testid="product-feature-card" />', props: ['feature'] },
  }

  function factory() {
    return mount(ProductOverviewSection, {
      global: { stubs },
    })
  }

  it('renders section heading from PRODUCT_SECTION_HEADING', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="product-heading"]').text()).toBe(PRODUCT_SECTION_HEADING)
  })

  it('renders 3 ProductFeatureCard stubs', () => {
    const wrapper = factory()
    const cards = wrapper.findAll('[data-testid="product-feature-card"]')
    expect(cards).toHaveLength(PRODUCT_FEATURES.length)
  })

  it('section has correct id from PRODUCT_SECTION_ID', () => {
    const wrapper = factory()
    expect(wrapper.find(`#${PRODUCT_SECTION_ID}`).exists()).toBe(true)
  })

  it('cards have section-reveal class', () => {
    const wrapper = factory()
    const cards = wrapper.findAll('[data-testid="product-feature-card"]')
    for (const card of cards) {
      expect(card.classes()).toContain('section-reveal')
    }
  })

  it('cards receive staggered transitionDelay based on REVEAL_STAGGER_MS', () => {
    const wrapper = factory()
    const cards = wrapper.findAll('[data-testid="product-feature-card"]')
    cards.forEach((card, i) => {
      expect(card.attributes('style')).toContain(`transition-delay: ${i * REVEAL_STAGGER_MS}ms`)
    })
  })
})
