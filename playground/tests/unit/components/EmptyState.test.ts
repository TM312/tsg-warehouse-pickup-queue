import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, markRaw } from 'vue'
import EmptyState from '@/components/ui/empty-state/EmptyState.vue'

const FakeIcon = markRaw({ name: 'FakeIcon', render: () => h('svg', { 'data-testid': 'fake-icon' }) })

describe('EmptyState', () => {
  const defaultProps = {
    icon: FakeIcon,
    heading: 'Test heading',
    subtext: 'Test subtext',
  }

  it('renders icon component, heading, and subtext from props', () => {
    const wrapper = mount(EmptyState, { props: defaultProps })
    expect(wrapper.find('[data-testid="fake-icon"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test heading')
    expect(wrapper.text()).toContain('Test subtext')
  })

  it('renders default slot content when provided', () => {
    const wrapper = mount(EmptyState, {
      props: defaultProps,
      slots: { default: '<button>Click me</button>' },
    })
    expect(wrapper.text()).toContain('Click me')
  })

  it('does not render slot wrapper when no slot content', () => {
    const wrapper = mount(EmptyState, { props: defaultProps })
    const slotWrapper = wrapper.find('[data-testid="empty-state"] > div:last-child')
    // The last direct child should be the <p> subtext, not a slot wrapper div
    expect(wrapper.findAll('[data-testid="empty-state"] > div').length).toBe(0)
  })

  it('has data-testid="empty-state"', () => {
    const wrapper = mount(EmptyState, { props: defaultProps })
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
  })
})
