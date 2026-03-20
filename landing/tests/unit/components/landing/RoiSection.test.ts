import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RoiSection from '@/components/landing/RoiSection.vue'
import { ROI_SECTION_ID, ROI_SECTION_HEADING } from '@/constants/roi'

describe('RoiSection', () => {
  const stubs = {
    LandingRoiSliderInput: { template: '<div data-testid="roi-slider-input" />', props: ['modelValue', 'config', 'label', 'testId'] },
    LandingRoiCurrencyInput: { template: '<div data-testid="roi-currency-input" />', props: ['modelValue', 'config', 'label', 'testId'] },
    LandingRoiOutputCard: { template: '<div data-testid="roi-output-card" />', props: ['label', 'value', 'format', 'testId', 'highlighted'] },
  }

  function factory() {
    return mount(RoiSection, {
      global: { stubs },
    })
  }

  it('renders heading from ROI_SECTION_HEADING', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="roi-heading"]').text()).toBe(ROI_SECTION_HEADING)
  })

  it('section id matches ROI_SECTION_ID constant', () => {
    const wrapper = factory()
    const section = wrapper.find('[data-testid="roi-section"]')
    expect(section.exists()).toBe(true)
    expect(section.attributes('id')).toBe(ROI_SECTION_ID)
  })

  it('renders 2 slider input stubs', () => {
    const wrapper = factory()
    const sliders = wrapper.findAll('[data-testid="roi-slider-input"]')
    expect(sliders).toHaveLength(2)
  })

  it('renders 1 currency input stub', () => {
    const wrapper = factory()
    const inputs = wrapper.findAll('[data-testid="roi-currency-input"]')
    expect(inputs).toHaveLength(1)
  })

  it('renders 5 output card stubs', () => {
    const wrapper = factory()
    const cards = wrapper.findAll('[data-testid="roi-output-card"]')
    expect(cards).toHaveLength(5)
  })

  it('cards container has section-reveal class', () => {
    const wrapper = factory()
    const outputContainer = wrapper.find('.space-y-3.rounded-xl')
    expect(outputContainer.classes()).toContain('section-reveal')
  })
})
