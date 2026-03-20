import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RoiSliderInput from '@/components/landing/RoiSliderInput.vue'
import type { RoiSliderConfig } from '@/types/roi'

describe('RoiSliderInput', () => {
  const config: RoiSliderConfig = { min: 0, max: 100, step: 5, default: 50 }

  const SliderStub = {
    template: '<div data-testid="slider-stub" />',
    props: ['modelValue', 'min', 'max', 'step'],
    emits: ['update:modelValue'],
  }

  function factory(overrides: { modelValue?: number; label?: string; testId?: string } = {}) {
    return mount(RoiSliderInput, {
      props: {
        modelValue: overrides.modelValue ?? 50,
        config,
        label: overrides.label ?? 'Orders per day',
        testId: overrides.testId ?? 'slider-orders',
      },
      global: { stubs: { Slider: SliderStub } },
    })
  }

  it('renders the label text', () => {
    const wrapper = factory({ label: 'Daily pickups' })
    expect(wrapper.text()).toContain('Daily pickups')
  })

  it('displays the current value', () => {
    const wrapper = factory({ modelValue: 75 })
    expect(wrapper.text()).toContain('75')
  })

  it('sets the data-testid from prop', () => {
    const wrapper = factory({ testId: 'slider-cost' })
    expect(wrapper.find('[data-testid="slider-cost"]').exists()).toBe(true)
  })

  it('emits update:modelValue when slider emits a value', async () => {
    const wrapper = factory()
    const slider = wrapper.findComponent(SliderStub)

    await slider.vm.$emit('update:modelValue', [80])
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([80])
  })

  it('does not emit when slider provides empty array', async () => {
    const wrapper = factory()
    const slider = wrapper.findComponent(SliderStub)

    await slider.vm.$emit('update:modelValue', [])
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('passes config min, max, step to Slider', () => {
    const wrapper = factory()
    const slider = wrapper.findComponent(SliderStub)

    expect(slider.props('min')).toBe(config.min)
    expect(slider.props('max')).toBe(config.max)
    expect(slider.props('step')).toBe(config.step)
  })

  it('passes modelValue as single-element array to Slider', () => {
    const wrapper = factory({ modelValue: 42 })
    const slider = wrapper.findComponent(SliderStub)

    expect(slider.props('modelValue')).toEqual([42])
  })
})
