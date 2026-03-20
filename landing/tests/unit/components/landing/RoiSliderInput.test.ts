import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RoiSliderInput from '@/components/landing/RoiSliderInput.vue'

describe('RoiSliderInput', () => {
  const defaultProps = {
    modelValue: 75,
    config: { min: 10, max: 300, step: 5, default: 75 },
    label: 'Pickups per day',
    testId: 'roi-pickups-slider',
  }

  const stubs = {
    Label: { template: '<label><slot /></label>' },
    Slider: {
      template: '<input type="range" />',
      props: ['modelValue', 'min', 'max', 'step'],
      emits: ['update:modelValue'],
    },
  }

  function factory(props = {}) {
    return mount(RoiSliderInput, {
      props: { ...defaultProps, ...props },
      global: { stubs },
    })
  }

  it('renders label text', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain('Pickups per day')
  })

  it('displays current modelValue', () => {
    const wrapper = factory({ modelValue: 150 })
    expect(wrapper.text()).toContain('150')
  })

  it('has correct data-testid', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="roi-pickups-slider"]').exists()).toBe(true)
  })

  it('emits update:modelValue when slider value changes', async () => {
    const wrapper = mount(RoiSliderInput, {
      props: defaultProps,
      global: {
        stubs: {
          Label: { template: '<label><slot /></label>' },
          Slider: {
            template: '<input type="range" @input="$emit(\'update:modelValue\', [100])" />',
            props: ['modelValue', 'min', 'max', 'step'],
            emits: ['update:modelValue'],
          },
        },
      },
    })

    const slider = wrapper.find('input[type="range"]')
    await slider.trigger('input')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })
})
