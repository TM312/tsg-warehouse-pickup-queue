import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IndexPage from '@/pages/index.vue'

describe('index page', () => {
  const stubs = {
    LandingHeroSection: { template: '<div data-testid="hero-section" />' },
    LandingProblemSection: { template: '<div data-testid="problem-section" />' },
    LandingProductOverviewSection: { template: '<div id="features" data-testid="product-section" />' },
  }

  it('renders anchor sections for smooth-scroll targets', () => {
    const wrapper = mount(IndexPage, { global: { stubs } })
    expect(wrapper.find('#features').exists()).toBe(true)
    expect(wrapper.find('#pricing').exists()).toBe(true)
    expect(wrapper.find('#demo').exists()).toBe(true)
  })

  it('renders section headings', () => {
    const wrapper = mount(IndexPage, { global: { stubs } })
    const headings = wrapper.findAll('h2')
    expect(headings).toHaveLength(2)
    expect(headings[0].text()).toBe('Pricing')
    expect(headings[1].text()).toBe('Demo')
  })

  it('renders the hero section', () => {
    const wrapper = mount(IndexPage, { global: { stubs } })
    expect(wrapper.find('[data-testid="hero-section"]').exists()).toBe(true)
  })

  it('renders the problem section', () => {
    const wrapper = mount(IndexPage, { global: { stubs } })
    expect(wrapper.find('[data-testid="problem-section"]').exists()).toBe(true)
  })
})
