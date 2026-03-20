import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProblemSection from '@/components/landing/ProblemSection.vue'
import { PROBLEM_SECTION_HEADING, PROBLEM_CARDS, REVEAL_STAGGER_MS } from '@/constants/problem'

describe('ProblemSection', () => {
  const stubs = {
    LandingProblemCard: { template: '<div data-testid="problem-card" />', props: ['card'] },
  }

  function factory() {
    return mount(ProblemSection, {
      global: { stubs },
    })
  }

  it('renders section heading from PROBLEM_SECTION_HEADING', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="problem-heading"]').text()).toBe(PROBLEM_SECTION_HEADING)
  })

  it('renders 3 ProblemCard stubs', () => {
    const wrapper = factory()
    const cards = wrapper.findAll('[data-testid="problem-card"]')
    expect(cards).toHaveLength(PROBLEM_CARDS.length)
  })

  it('section has id="problem"', () => {
    const wrapper = factory()
    expect(wrapper.find('#problem').exists()).toBe(true)
  })

  it('cards have section-reveal class', () => {
    const wrapper = factory()
    const cards = wrapper.findAll('[data-testid="problem-card"]')
    for (const card of cards) {
      expect(card.classes()).toContain('section-reveal')
    }
  })

  it('cards receive staggered transitionDelay based on index', () => {
    const wrapper = factory()
    const cards = wrapper.findAll('[data-testid="problem-card"]')
    cards.forEach((card, i) => {
      expect(card.attributes('style')).toContain(`transition-delay: ${i * REVEAL_STAGGER_MS}ms`)
    })
  })
})
