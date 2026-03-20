import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PricingToggle from '@/components/landing/PricingToggle.vue'
import { PRICING_TOGGLE_LABELS, PRICING_ANNUAL_SAVE_LABEL } from '@/constants/pricing'

describe('PricingToggle', () => {
  const stubs = {
    Switch: {
      template: '<button data-testid="switch-stub" @click="$emit(\'update:checked\', !checked)"></button>',
      props: ['checked'],
      emits: ['update:checked'],
    },
    Badge: {
      template: '<span data-testid="badge-stub"><slot /></span>',
      props: ['variant'],
    },
  }

  function factory(modelValue: 'monthly' | 'annual' = 'monthly') {
    return mount(PricingToggle, {
      props: { modelValue },
      global: { stubs },
    })
  }

  it('renders Monthly and Annual labels', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain(PRICING_TOGGLE_LABELS.monthly)
    expect(wrapper.text()).toContain(PRICING_TOGGLE_LABELS.annual)
  })

  it('renders Save badge', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain(PRICING_ANNUAL_SAVE_LABEL)
  })

  it('highlights the active billing cycle label', () => {
    const monthlyWrapper = factory('monthly')
    const monthlySpans = monthlyWrapper.findAll('span.text-sm')
    expect(monthlySpans[0].classes()).toContain('text-foreground')
    expect(monthlySpans[1].classes()).toContain('text-muted-foreground')

    const annualWrapper = factory('annual')
    const annualSpans = annualWrapper.findAll('span.text-sm')
    expect(annualSpans[0].classes()).toContain('text-muted-foreground')
    expect(annualSpans[1].classes()).toContain('text-foreground')
  })

  it('emits annual when switch is toggled on', async () => {
    const wrapper = factory('monthly')
    await wrapper.find('[data-testid="switch-stub"]').trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted![0]).toEqual(['annual'])
  })

  it('emits monthly when switch is toggled off', async () => {
    const wrapper = factory('annual')
    await wrapper.find('[data-testid="switch-stub"]').trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted![0]).toEqual(['monthly'])
  })
})
