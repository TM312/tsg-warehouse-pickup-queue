import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductFeatureCard from '@/components/landing/ProductFeatureCard.vue'
import type { ProductFeature } from '@/types/product'

describe('ProductFeatureCard', () => {
  const feature: ProductFeature = {
    mockup: 'phone',
    heading: 'Test heading',
    description: 'Test description text',
  }

  function factory(overrides: Partial<ProductFeature> = {}) {
    return mount(ProductFeatureCard, {
      props: { feature: { ...feature, ...overrides } },
    })
  }

  it('renders heading from prop', () => {
    const wrapper = factory()
    expect(wrapper.find('h3').text()).toBe(feature.heading)
  })

  it('renders description from prop', () => {
    const wrapper = factory()
    expect(wrapper.find('p').text()).toBe(feature.description)
  })

  it('renders a mockup element', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="product-mockup-phone"]').exists()).toBe(true)
  })

  it('different mockup types produce different content', () => {
    const phoneWrapper = factory({ mockup: 'phone' })
    const browserWrapper = factory({ mockup: 'browser' })

    expect(phoneWrapper.find('[data-testid="product-mockup-phone"]').exists()).toBe(true)
    expect(phoneWrapper.find('[data-testid="product-mockup-browser"]').exists()).toBe(false)

    expect(browserWrapper.find('[data-testid="product-mockup-browser"]').exists()).toBe(true)
    expect(browserWrapper.find('[data-testid="product-mockup-phone"]').exists()).toBe(false)
  })
})
