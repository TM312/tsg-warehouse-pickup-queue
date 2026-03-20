import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingFooter from '@/components/LandingFooter.vue'
import { FOOTER_SECTIONS, CONTACT_EMAIL, SUPPORT_HOURS, COPYRIGHT_HOLDER } from '@/constants/navigation'

describe('LandingFooter', () => {
  const stubs = {
    Linkedin: { template: '<svg />' },
  }

  function factory() {
    return mount(LandingFooter, { global: { stubs } })
  }

  it('renders all footer sections', () => {
    const wrapper = factory()
    const sections = wrapper.findAll('[data-testid="footer-section"]')
    expect(sections).toHaveLength(FOOTER_SECTIONS.length)
  })

  it('renders all footer links', () => {
    const wrapper = factory()
    const links = wrapper.findAll('[data-testid="footer-link"]')
    const totalLinks = FOOTER_SECTIONS.reduce((sum, s) => sum + s.links.length, 0)
    expect(links).toHaveLength(totalLinks)
  })

  it('renders the contact email', () => {
    const wrapper = factory()
    const email = wrapper.find('[data-testid="contact-email"]')
    expect(email.text()).toBe(CONTACT_EMAIL)
    expect(email.attributes('href')).toBe(`mailto:${CONTACT_EMAIL}`)
  })

  it('renders support hours', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="support-hours"]').text()).toBe(SUPPORT_HOURS)
  })

  it('renders copyright with current year', () => {
    const wrapper = factory()
    const copyright = wrapper.find('[data-testid="copyright"]')
    const year = new Date().getFullYear()
    expect(copyright.text()).toContain(String(year))
    expect(copyright.text()).toContain(COPYRIGHT_HOLDER)
  })

  it('renders social links with target="_blank"', () => {
    const wrapper = factory()
    const socialLinks = wrapper.findAll('[data-testid="social-link"]')
    expect(socialLinks.length).toBeGreaterThan(0)
    for (const link of socialLinks) {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    }
  })
})
