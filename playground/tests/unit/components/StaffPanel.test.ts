import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { h, markRaw } from 'vue'
import StaffPanel from '@/components/panels/StaffPanel.vue'

const stubComponent = (name: string) =>
  markRaw({ name, render: () => h('div', { 'data-testid': name }) })

const stubs = {
  LayoutPanelHeader: stubComponent('panel-header'),
  StaffProcessingTable: stubComponent('staff-processing-table'),
  StaffQueueTabs: stubComponent('staff-queue-tabs'),
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('StaffPanel', () => {
  it('renders panel header', () => {
    const wrapper = mount(StaffPanel, { global: { stubs } })
    expect(wrapper.find('[data-testid="panel-header"]').exists()).toBe(true)
  })

  it('renders processing table', () => {
    const wrapper = mount(StaffPanel, { global: { stubs } })
    expect(wrapper.find('[data-testid="staff-processing-table"]').exists()).toBe(true)
  })

  it('renders queue tabs', () => {
    const wrapper = mount(StaffPanel, { global: { stubs } })
    expect(wrapper.find('[data-testid="staff-queue-tabs"]').exists()).toBe(true)
  })

  it('has data-testid="staff-panel"', () => {
    const wrapper = mount(StaffPanel, { global: { stubs } })
    expect(wrapper.find('[data-testid="staff-panel"]').exists()).toBe(true)
  })
})
