import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, markRaw } from 'vue'
import PanelHeader from '@/components/layout/PanelHeader.vue'

const MockIcon = markRaw({ render: () => h('svg', { class: 'mock-icon' }) })

describe('PanelHeader', () => {
  it('renders title and description', () => {
    const wrapper = mount(PanelHeader, {
      props: {
        icon: MockIcon,
        title: 'Staff Dashboard',
        description: 'Queue management',
      },
    })
    expect(wrapper.text()).toContain('Staff Dashboard')
    expect(wrapper.text()).toContain('Queue management')
  })

  it('renders icon component', () => {
    const wrapper = mount(PanelHeader, {
      props: {
        icon: MockIcon,
        title: 'Test',
        description: 'Desc',
      },
    })
    expect(wrapper.find('.mock-icon').exists()).toBe(true)
  })

  it('has data-testid="panel-header"', () => {
    const wrapper = mount(PanelHeader, {
      props: {
        icon: MockIcon,
        title: 'Test',
        description: 'Desc',
      },
    })
    expect(wrapper.find('[data-testid="panel-header"]').exists()).toBe(true)
  })
})
