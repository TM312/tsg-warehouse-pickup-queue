import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PricingFeatureRow from '@/components/landing/PricingFeatureRow.vue'
import { FEATURE_SUPPORTED, FEATURE_UNAVAILABLE, FEATURE_BETA } from '@/constants/pricing'

describe('PricingFeatureRow', () => {
  function factory(label: string, value: string) {
    return mount(PricingFeatureRow, {
      props: { label, value },
    })
  }

  it('renders the label text', () => {
    const wrapper = factory('SMS notifications', FEATURE_SUPPORTED)
    expect(wrapper.text()).toContain('SMS notifications')
  })

  it('renders the value text', () => {
    const wrapper = factory('Analytics', 'Advanced')
    expect(wrapper.text()).toContain('Advanced')
  })

  it('applies muted styling for unavailable features', () => {
    const wrapper = factory('Dedicated support', FEATURE_UNAVAILABLE)
    const valueSpan = wrapper.findAll('span').at(1)!
    expect(valueSpan.classes()).toContain('text-muted-foreground')
    expect(valueSpan.classes()).not.toContain('text-primary')
  })

  it('applies primary styling for beta features', () => {
    const wrapper = factory('ERP integration', FEATURE_BETA)
    const valueSpan = wrapper.findAll('span').at(1)!
    expect(valueSpan.classes()).toContain('text-primary')
    expect(valueSpan.classes()).toContain('font-medium')
  })

  it('applies foreground styling for supported features', () => {
    const wrapper = factory('Queue board', FEATURE_SUPPORTED)
    const valueSpan = wrapper.findAll('span').at(1)!
    expect(valueSpan.classes()).toContain('font-medium')
    expect(valueSpan.classes()).toContain('text-foreground')
  })

  it('applies foreground styling for custom text values', () => {
    const wrapper = factory('Pickup slots', 'Unlimited')
    const valueSpan = wrapper.findAll('span').at(1)!
    expect(valueSpan.classes()).toContain('text-foreground')
  })

  it('has the correct data-testid', () => {
    const wrapper = factory('Feature', FEATURE_SUPPORTED)
    expect(wrapper.find('[data-testid="pricing-feature-row"]').exists()).toBe(true)
  })
})
