import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HowItWorksStep from '@/components/landing/HowItWorksStep.vue'
import type { HowItWorksStep as HowItWorksStepType } from '@/types/howItWorks'

describe('HowItWorksStep', () => {
  const step: HowItWorksStepType = {
    step: 1,
    icon: 'UserPlus',
    heading: 'Sign up',
    description: 'Create your account and invite your warehouse team in minutes.',
  }

  function factory(props: { step: HowItWorksStepType } = { step }) {
    return mount(HowItWorksStep, { props })
  }

  it('renders step number', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain('1')
  })

  it('renders heading from prop', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain(step.heading)
  })

  it('renders description from prop', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain(step.description)
  })

  it('has correct data-testid', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="how-it-works-step"]').exists()).toBe(true)
  })
})
