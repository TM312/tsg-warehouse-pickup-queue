import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DefaultLayout from '@/layouts/default.vue'

describe('default layout', () => {
  const stubs = {
    LandingNav: { template: '<header data-testid="nav" />', props: ['isScrolled'] },
    LandingFooter: { template: '<footer data-testid="footer" />' },
  }

  function factory() {
    return mount(DefaultLayout, {
      global: { stubs },
      slots: { default: '<div data-testid="slot-content">Page content</div>' },
    })
  }

  it('renders the nav component', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="nav"]').exists()).toBe(true)
  })

  it('renders the footer component', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="footer"]').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="slot-content"]').exists()).toBe(true)
  })

  it('main element has pt-16 class for nav offset', () => {
    const wrapper = factory()
    const main = wrapper.find('main')
    expect(main.classes()).toContain('pt-16')
  })
})
