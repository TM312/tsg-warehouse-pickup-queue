import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { h, markRaw } from 'vue'
import CustomerStatusCard from '@/components/customer/CustomerStatusCard.vue'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS, STATUS_LABELS } from '@/constants/status'

const stubComponent = (name: string) =>
  markRaw({ name, render() { return h('div', { 'data-testid': name }) } })

const stubs = {
  UiBadge: markRaw({
    name: 'UiBadge',
    props: ['variant', 'class'],
    render() { return h('span', { 'data-testid': 'badge' }, this.$slots.default?.()) },
  }),
  Loader2: stubComponent('loader'),
  CustomerQueuePosition: stubComponent('customer-queue-position'),
  CustomerCompletedState: stubComponent('customer-completed-state'),
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('CustomerStatusCard', () => {
  it('renders pending state', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.PENDING })
    const wrapper = mount(CustomerStatusCard, { props: { request }, global: { stubs } })
    expect(wrapper.text()).toContain('Waiting for approval')
  })

  it('renders approved state', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.APPROVED })
    const wrapper = mount(CustomerStatusCard, { props: { request }, global: { stubs } })
    expect(wrapper.text()).toContain('Approved')
    expect(wrapper.text()).toContain('Waiting for gate assignment')
  })

  it('renders queue position for IN_QUEUE', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 2 })
    const wrapper = mount(CustomerStatusCard, { props: { request }, global: { stubs } })
    expect(wrapper.find('[data-testid="customer-queue-position"]').exists()).toBe(true)
  })

  it('renders processing state', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.PROCESSING })
    const wrapper = mount(CustomerStatusCard, { props: { request }, global: { stubs } })
    expect(wrapper.text()).toContain('being loaded')
  })

  it('renders completed state', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.COMPLETED })
    const wrapper = mount(CustomerStatusCard, { props: { request }, global: { stubs } })
    expect(wrapper.find('[data-testid="customer-completed-state"]').exists()).toBe(true)
  })

  it('renders cancelled state', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.CANCELLED })
    const wrapper = mount(CustomerStatusCard, { props: { request }, global: { stubs } })
    expect(wrapper.text()).toContain('cancelled')
  })

  it('shows correct status badge', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1 })
    const wrapper = mount(CustomerStatusCard, { props: { request }, global: { stubs } })
    const badge = wrapper.find('[data-testid="badge"]')
    expect(badge.text()).toBe(STATUS_LABELS[PICKUP_STATUS.IN_QUEUE])
  })

  it('has data-testid="customer-status-card"', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.PENDING })
    const wrapper = mount(CustomerStatusCard, { props: { request }, global: { stubs } })
    expect(wrapper.find('[data-testid="customer-status-card"]').exists()).toBe(true)
  })
})
