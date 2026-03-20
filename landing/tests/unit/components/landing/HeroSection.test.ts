import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '@/components/landing/HeroSection.vue'
import {
  HERO_HEADLINE,
  HERO_SUBHEADLINE,
  HERO_PRIMARY_CTA_LABEL,
  HERO_PRIMARY_CTA_HREF,
  HERO_SECONDARY_CTA_LABEL,
  HERO_SECONDARY_CTA_HREF,
  HERO_TRUST_BAR_ITEMS,
} from '@/constants/hero'

describe('HeroSection', () => {
  const stubs = {
    Button: { template: '<a v-bind="$attrs"><slot /></a>', props: ['variant', 'size', 'as'] },
    LandingHeroMockupPhone: { template: '<div data-testid="hero-mockup-phone" />' },
    LandingHeroMockupDashboard: { template: '<div data-testid="hero-mockup-dashboard" />' },
  }

  function factory() {
    return mount(HeroSection, {
      global: { stubs },
    })
  }

  it('renders headline from HERO_HEADLINE constant', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="hero-headline"]').text()).toBe(HERO_HEADLINE)
  })

  it('renders subheadline from HERO_SUBHEADLINE constant', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="hero-subheadline"]').text()).toBe(HERO_SUBHEADLINE)
  })

  it('primary CTA has correct label and href', () => {
    const wrapper = factory()
    const cta = wrapper.find('[data-testid="hero-primary-cta"]')
    expect(cta.text()).toBe(HERO_PRIMARY_CTA_LABEL)
    expect(cta.attributes('href')).toBe(HERO_PRIMARY_CTA_HREF)
  })

  it('secondary CTA has correct label and href', () => {
    const wrapper = factory()
    const cta = wrapper.find('[data-testid="hero-secondary-cta"]')
    expect(cta.text()).toBe(HERO_SECONDARY_CTA_LABEL)
    expect(cta.attributes('href')).toBe(HERO_SECONDARY_CTA_HREF)
  })

  it('renders all trust bar items', () => {
    const wrapper = factory()
    const items = wrapper.findAll('[data-testid="trust-bar-item"]')
    expect(items).toHaveLength(HERO_TRUST_BAR_ITEMS.length)
  })

  it('renders trust bar separators between items', () => {
    const wrapper = factory()
    const separators = wrapper.findAll('[aria-hidden="true"]')
    expect(separators).toHaveLength(HERO_TRUST_BAR_ITEMS.length - 1)
  })

  it('phone mockup sub-component is present', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="hero-mockup-phone"]').exists()).toBe(true)
  })

  it('dashboard mockup sub-component is present', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="hero-mockup-dashboard"]').exists()).toBe(true)
  })

  it('section element has id="hero"', () => {
    const wrapper = factory()
    expect(wrapper.find('#hero').exists()).toBe(true)
  })
})
