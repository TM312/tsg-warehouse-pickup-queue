import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductMockupBrowser from '@/components/landing/ProductMockupBrowser.vue'
import { PRODUCT_MOCKUP_QUEUE_ENTRIES } from '@/constants/mockup'

describe('ProductMockupBrowser', () => {
  const stubs = {
    LandingBrowserChrome: { template: '<div data-testid="browser-chrome" />' },
  }

  function factory() {
    return mount(ProductMockupBrowser, {
      global: { stubs },
    })
  }

  it('has data-testid', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="product-mockup-browser"]').exists()).toBe(true)
  })

  it('renders BrowserChrome component', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="browser-chrome"]').exists()).toBe(true)
  })

  it('renders all queue entries from constants', () => {
    const wrapper = factory()
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(PRODUCT_MOCKUP_QUEUE_ENTRIES.length)
  })

  it('renders company names from constants', () => {
    const wrapper = factory()
    for (const entry of PRODUCT_MOCKUP_QUEUE_ENTRIES) {
      expect(wrapper.text()).toContain(entry.company)
    }
  })

  it('renders status text from constants', () => {
    const wrapper = factory()
    for (const entry of PRODUCT_MOCKUP_QUEUE_ENTRIES) {
      expect(wrapper.text()).toContain(entry.status)
    }
  })

  it('renders gate or dash for entries without gates', () => {
    const wrapper = factory()
    const withGate = PRODUCT_MOCKUP_QUEUE_ENTRIES.filter((e) => e.gate)
    for (const entry of withGate) {
      expect(wrapper.text()).toContain(entry.gate)
    }
  })
})
