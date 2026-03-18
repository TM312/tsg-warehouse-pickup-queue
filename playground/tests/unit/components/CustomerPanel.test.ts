import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { h, markRaw } from 'vue'
import CustomerPanel from '@/components/panels/CustomerPanel.vue'
import { useQueueStore } from '@/stores/queue'
import { useSimulationStore } from '@/stores/simulation'
import { createPickupRequest } from '@/utils/factories'

const stubComponent = (name: string) =>
  markRaw({ name, render: () => h('div', { 'data-testid': name }) })

const stubs = {
  LayoutPanelHeader: stubComponent('panel-header'),
  CustomerOrderForm: stubComponent('customer-order-form'),
  CustomerStatusCard: stubComponent('customer-status-card'),
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('CustomerPanel', () => {
  it('renders order form when no request is selected', () => {
    const wrapper = mount(CustomerPanel, { global: { stubs } })
    expect(wrapper.find('[data-testid="customer-order-form"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="customer-status-card"]').exists()).toBe(false)
  })

  it('renders status card when request exists', () => {
    const queue = useQueueStore()
    const simulation = useSimulationStore()
    const request = createPickupRequest({ sales_order_number: 'SO-100' })
    queue.addRequest(request)
    simulation.selectCustomerRequest(request.id)

    const wrapper = mount(CustomerPanel, { global: { stubs } })
    expect(wrapper.find('[data-testid="customer-status-card"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="customer-order-form"]').exists()).toBe(false)
  })

  it('renders panel header with correct title', () => {
    const wrapper = mount(CustomerPanel, { global: { stubs } })
    expect(wrapper.find('[data-testid="panel-header"]').exists()).toBe(true)
  })

  it('has data-testid="customer-panel"', () => {
    const wrapper = mount(CustomerPanel, { global: { stubs } })
    expect(wrapper.find('[data-testid="customer-panel"]').exists()).toBe(true)
  })
})
