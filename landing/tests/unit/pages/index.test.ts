import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IndexPage from '@/pages/index.vue'

describe('index page', () => {
  const stubs = {
    LandingHeroSection: { template: '<div data-testid="hero-section" />' },
    LandingProblemSection: { template: '<div data-testid="problem-section" />' },
    LandingProductOverviewSection: { template: '<div id="features" data-testid="product-section" />' },
    LandingRoiSection: { template: '<div id="roi" data-testid="roi-section" />' },
    LandingErpSection: { template: '<div id="erp-integration" data-testid="erp-section" />' },
    LandingHowItWorksSection: { template: '<div id="how-it-works" data-testid="how-it-works-section" />' },
    LandingPricingSection: { template: '<div id="pricing" data-testid="pricing-section" />' },
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
    expect(headings).toHaveLength(1)
    expect(headings[0].text()).toBe('Demo')
  })

  it('renders the hero section', () => {
    const wrapper = mount(IndexPage, { global: { stubs } })
    expect(wrapper.find('[data-testid="hero-section"]').exists()).toBe(true)
  })

  it('renders the problem section', () => {
    const wrapper = mount(IndexPage, { global: { stubs } })
    expect(wrapper.find('[data-testid="problem-section"]').exists()).toBe(true)
  })

  it('renders the product overview section', () => {
    const wrapper = mount(IndexPage, { global: { stubs } })
    expect(wrapper.find('[data-testid="product-section"]').exists()).toBe(true)
  })

  it('renders the ROI section', () => {
    const wrapper = mount(IndexPage, { global: { stubs } })
    expect(wrapper.find('[data-testid="roi-section"]').exists()).toBe(true)
  })

  it('renders the ERP section', () => {
    const wrapper = mount(IndexPage, { global: { stubs } })
    expect(wrapper.find('[data-testid="erp-section"]').exists()).toBe(true)
  })

  it('renders the how-it-works section', () => {
    const wrapper = mount(IndexPage, { global: { stubs } })
    expect(wrapper.find('[data-testid="how-it-works-section"]').exists()).toBe(true)
  })
})
