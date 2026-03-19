import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PhoneFrame from '@/components/layout/PhoneFrame.vue'

describe('PhoneFrame', () => {
  it('renders default slot content inside phone-frame', () => {
    const wrapper = mount(PhoneFrame, {
      slots: {
        default: '<p>Hello customer</p>',
      },
    })
    expect(wrapper.text()).toContain('Hello customer')
  })

  it('has data-testid="phone-frame"', () => {
    const wrapper = mount(PhoneFrame)
    expect(wrapper.find('[data-testid="phone-frame"]').exists()).toBe(true)
  })

  it('merges custom class prop onto root element', () => {
    const wrapper = mount(PhoneFrame, {
      props: { class: 'h-full' },
    })
    const root = wrapper.find('[data-testid="phone-frame"]')
    expect(root.classes()).toContain('h-full')
  })

  it('renders status bar time "9:41"', () => {
    const wrapper = mount(PhoneFrame)
    expect(wrapper.text()).toContain('9:41')
  })

  it('renders home indicator element', () => {
    const wrapper = mount(PhoneFrame)
    expect(wrapper.find('[data-testid="home-indicator"]').exists()).toBe(true)
  })

  it('slot content still renders with status bar and home indicator', () => {
    const wrapper = mount(PhoneFrame, {
      slots: {
        default: '<p>Test content</p>',
      },
    })
    expect(wrapper.text()).toContain('Test content')
    expect(wrapper.text()).toContain('9:41')
    expect(wrapper.find('[data-testid="home-indicator"]').exists()).toBe(true)
  })
})
