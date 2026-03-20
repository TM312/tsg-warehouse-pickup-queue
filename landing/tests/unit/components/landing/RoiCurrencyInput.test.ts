import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RoiCurrencyInput from '@/components/landing/RoiCurrencyInput.vue'
import { ROI_HOURLY_COST_CONFIG } from '@/constants/roi'

describe('RoiCurrencyInput', () => {
  const defaultProps = {
    modelValue: 30,
    config: ROI_HOURLY_COST_CONFIG,
    label: 'Hourly cost',
    testId: 'roi-hourly-cost',
  }

  function factory(overrides: Record<string, unknown> = {}) {
    return mount(RoiCurrencyInput, {
      props: { ...defaultProps, ...overrides },
    })
  }

  it('renders the label and prefix from config', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain('Hourly cost')
    expect(wrapper.text()).toContain(ROI_HOURLY_COST_CONFIG.prefix)
  })

  it('renders with the provided testId', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="roi-hourly-cost"]').exists()).toBe(true)
  })

  it('emits update:modelValue with parsed number on valid input', async () => {
    const wrapper = factory()
    const input = wrapper.find('input')
    await input.setValue('45')
    await input.trigger('input')
    const events = wrapper.emitted('update:modelValue') as number[][]
    expect(events[events.length - 1][0]).toBe(45)
  })

  it('emits 0 for empty input (number input coerces non-numeric to empty)', async () => {
    const wrapper = factory()
    const input = wrapper.find('input')
    await input.setValue('')
    await input.trigger('input')
    const events = wrapper.emitted('update:modelValue') as number[][]
    expect(events[events.length - 1][0]).toBe(0)
  })

  it('clamps value to min on blur when below range', async () => {
    const wrapper = factory()
    const input = wrapper.find('input')
    const el = input.element as HTMLInputElement
    el.value = '5'
    await input.trigger('input')
    await input.trigger('blur')

    const events = wrapper.emitted('update:modelValue') as number[][]
    expect(events[events.length - 1][0]).toBe(ROI_HOURLY_COST_CONFIG.min)
  })

  it('clamps value to max on blur when above range', async () => {
    const wrapper = factory()
    const input = wrapper.find('input')
    const el = input.element as HTMLInputElement
    el.value = '999'
    await input.trigger('input')
    await input.trigger('blur')

    const events = wrapper.emitted('update:modelValue') as number[][]
    expect(events[events.length - 1][0]).toBe(ROI_HOURLY_COST_CONFIG.max)
  })

  it('clamps empty input to min on blur', async () => {
    const wrapper = factory()
    const input = wrapper.find('input')
    await input.setValue('')
    await input.trigger('input')
    await input.trigger('blur')

    const events = wrapper.emitted('update:modelValue') as number[][]
    expect(events[events.length - 1][0]).toBe(ROI_HOURLY_COST_CONFIG.min)
  })
})
