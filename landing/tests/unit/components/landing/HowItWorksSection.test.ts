import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HowItWorksSection from '@/components/landing/HowItWorksSection.vue'
import {
  HOW_IT_WORKS_SECTION_HEADING,
  HOW_IT_WORKS_SECTION_ID,
  HOW_IT_WORKS_STEPS,
  HOW_IT_WORKS_REVEAL_STAGGER_MS,
} from '@/constants/howItWorks'

describe('HowItWorksSection', () => {
  const stubs = {
    LandingHowItWorksStep: { template: '<div data-testid="how-it-works-step" />', props: ['step'] },
  }

  function factory() {
    return mount(HowItWorksSection, {
      global: { stubs },
    })
  }

  it('renders section heading from HOW_IT_WORKS_SECTION_HEADING', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="how-it-works-heading"]').text()).toBe(HOW_IT_WORKS_SECTION_HEADING)
  })

  it(`section has id="${HOW_IT_WORKS_SECTION_ID}"`, () => {
    const wrapper = factory()
    expect(wrapper.find(`#${HOW_IT_WORKS_SECTION_ID}`).exists()).toBe(true)
  })

  it('renders 4 HowItWorksStep stubs', () => {
    const wrapper = factory()
    const steps = wrapper.findAll('[data-testid="how-it-works-step"]')
    expect(steps).toHaveLength(HOW_IT_WORKS_STEPS.length)
  })

  it('step wrappers have section-reveal class', () => {
    const wrapper = factory()
    const steps = wrapper.findAll('[data-testid="how-it-works-step"]')
    for (const step of steps) {
      expect(step.element.parentElement?.classList.contains('section-reveal')).toBe(true)
    }
  })

  it('step wrappers receive staggered transitionDelay based on index', () => {
    const wrapper = factory()
    const steps = wrapper.findAll('[data-testid="how-it-works-step"]')
    steps.forEach((step, i) => {
      expect(step.element.parentElement?.style.transitionDelay).toBe(`${i * HOW_IT_WORKS_REVEAL_STAGGER_MS}ms`)
    })
  })

  it('connector line element exists', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="connector-line"]').exists()).toBe(true)
  })
})
