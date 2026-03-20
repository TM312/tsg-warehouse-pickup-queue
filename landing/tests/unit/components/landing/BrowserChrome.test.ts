import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BrowserChrome from '@/components/landing/BrowserChrome.vue'
import { MOCKUP_APP_URL } from '@/constants/mockup'

describe('BrowserChrome', () => {
  it('renders the app URL', () => {
    const wrapper = mount(BrowserChrome)
    expect(wrapper.text()).toContain(MOCKUP_APP_URL)
  })

  it('has aria-hidden on the chrome bar', () => {
    const wrapper = mount(BrowserChrome)
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })

  it('renders three traffic-light dots', () => {
    const wrapper = mount(BrowserChrome)
    const dots = wrapper.findAll('span.rounded-full')
    expect(dots).toHaveLength(3)
  })

  it('applies smaller sizes when size="sm"', () => {
    const wrapper = mount(BrowserChrome, { props: { size: 'sm' } })
    const dots = wrapper.findAll('span.rounded-full')
    for (const dot of dots) {
      expect(dot.classes()).toContain('size-2')
    }
  })

  it('applies default sizes when size="md"', () => {
    const wrapper = mount(BrowserChrome)
    const dots = wrapper.findAll('span.rounded-full')
    for (const dot of dots) {
      expect(dot.classes()).toContain('size-2.5')
    }
  })
})
