import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PricingFeatureRow from '@/components/landing/PricingFeatureRow.vue'
import { FEATURE_UNAVAILABLE, FEATURE_BETA } from '@/constants/pricing'

describe('PricingFeatureRow', () => {
  function factory(props: { label: string; value: string }) {
    return mount(PricingFeatureRow, { props })
  }

  it('renders label and value text', () => {
    const wrapper = factory({ label: 'Dock assignments', value: '✓' })
    expect(wrapper.text()).toContain('Dock assignments')
    expect(wrapper.text()).toContain('✓')
  })

  it('applies text-muted-foreground when value is FEATURE_UNAVAILABLE', () => {
    const wrapper = factory({ label: 'Feature', value: FEATURE_UNAVAILABLE })
    const valueSpan = wrapper.findAll('span').at(1)!
    expect(valueSpan.classes()).toContain('text-muted-foreground')
  })

  it('applies text-primary font-medium when value is FEATURE_BETA', () => {
    const wrapper = factory({ label: 'Feature', value: FEATURE_BETA })
    const valueSpan = wrapper.findAll('span').at(1)!
    expect(valueSpan.classes()).toContain('text-primary')
    expect(valueSpan.classes()).toContain('font-medium')
  })

  it('applies font-medium text-foreground for normal values', () => {
    const wrapper = factory({ label: 'Feature', value: 'Unlimited' })
    const valueSpan = wrapper.findAll('span').at(1)!
    expect(valueSpan.classes()).toContain('font-medium')
    expect(valueSpan.classes()).toContain('text-foreground')
  })
})
