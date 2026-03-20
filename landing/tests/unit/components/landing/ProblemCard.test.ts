import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProblemCard from '@/components/landing/ProblemCard.vue'
import type { ProblemCard as ProblemCardType } from '@/types/problem'

describe('ProblemCard', () => {
  const card: ProblemCardType = {
    icon: 'Radio',
    heading: 'Test heading',
    description: 'Test description text',
  }

  function factory(overrides: Partial<ProblemCardType> = {}) {
    return mount(ProblemCard, {
      props: { card: { ...card, ...overrides } },
    })
  }

  it('renders heading from prop', () => {
    const wrapper = factory()
    expect(wrapper.find('h3').text()).toBe(card.heading)
  })

  it('renders description from prop', () => {
    const wrapper = factory()
    expect(wrapper.find('p').text()).toBe(card.description)
  })

  it('renders an icon element', () => {
    const wrapper = factory()
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })

  it('resolves different icon names to distinct components', () => {
    const radioWrapper = factory({ icon: 'Radio' })
    const eyeOffWrapper = factory({ icon: 'EyeOff' })

    const radioIcon = radioWrapper.find('[aria-hidden="true"]').element
    const eyeOffIcon = eyeOffWrapper.find('[aria-hidden="true"]').element

    // Different icon names must produce different SVG content
    expect(radioIcon.innerHTML).not.toBe(eyeOffIcon.innerHTML)
  })
})
