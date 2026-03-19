import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { h, markRaw } from 'vue'
import CustomerStatusCard from '@/components/customer/CustomerStatusCard.vue'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS, STATUS_LABELS, type PickupStatus } from '@/constants/status'
import { STATUS_VARIANT } from '@/constants/status-ui'
import { useCrossPanelHighlight } from '@/composables/useCrossPanelHighlight'

vi.mock('@/composables/useCrossPanelHighlight', () => ({
  useCrossPanelHighlight: vi.fn(() => ({
    isHighlighted: () => false,
    highlight: vi.fn(),
    hasUnseen: () => false,
    clearUnseen: vi.fn(),
    resetAll: vi.fn(),
  })),
}))

const stubComponent = (name: string) =>
  markRaw({ name, render() { return h('div', { 'data-testid': name }) } })

const stubs = {
  UiBadge: markRaw({
    name: 'UiBadge',
    props: ['variant', 'class'],
    render() { return h('span', { 'data-testid': 'badge', 'data-variant': this.variant }, this.$slots.default?.()) },
  }),
  Loader2: stubComponent('loader'),
  CustomerQueuePosition: stubComponent('customer-queue-position'),
  CustomerCompletedState: stubComponent('customer-completed-state'),
  CustomerProcessingState: stubComponent('customer-processing-state'),
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

  it('renders processing state with CustomerProcessingState component', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.PROCESSING })
    const wrapper = mount(CustomerStatusCard, { props: { request }, global: { stubs } })
    expect(wrapper.find('[data-testid="customer-processing-state"]').exists()).toBe(true)
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

  it.each([
    PICKUP_STATUS.PENDING,
    PICKUP_STATUS.APPROVED,
    PICKUP_STATUS.IN_QUEUE,
    PICKUP_STATUS.PROCESSING,
    PICKUP_STATUS.COMPLETED,
    PICKUP_STATUS.CANCELLED,
  ] as PickupStatus[])('applies correct badge variant for %s status', (status) => {
    const extras: Record<string, unknown> = {}
    if (status === PICKUP_STATUS.IN_QUEUE) {
      extras.gate_id = 'gate-1'
      extras.queue_position = 1
    }
    const request = createPickupRequest({ status, ...extras })
    const wrapper = mount(CustomerStatusCard, { props: { request }, global: { stubs } })
    const badge = wrapper.find('[data-testid="badge"]')
    expect(badge.attributes('data-variant')).toBe(STATUS_VARIANT[status].variant)
  })

  it('has data-testid="customer-status-card"', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.PENDING })
    const wrapper = mount(CustomerStatusCard, { props: { request }, global: { stubs } })
    expect(wrapper.find('[data-testid="customer-status-card"]').exists()).toBe(true)
  })

  it('applies cross-panel highlight class when highlighted', () => {
    vi.mocked(useCrossPanelHighlight).mockReturnValue({
      isHighlighted: () => true,
      highlight: vi.fn(),
      hasUnseen: () => false,
      clearUnseen: vi.fn(),
      resetAll: vi.fn(),
    })
    const request = createPickupRequest({ status: PICKUP_STATUS.PENDING })
    const wrapper = mount(CustomerStatusCard, { props: { request }, global: { stubs } })
    expect(wrapper.find('[data-testid="customer-status-card"]').classes()).toContain('animate-cross-panel-highlight')
  })

  it('does not apply cross-panel highlight class when not highlighted', () => {
    vi.mocked(useCrossPanelHighlight).mockReturnValue({
      isHighlighted: () => false,
      highlight: vi.fn(),
      hasUnseen: () => false,
      clearUnseen: vi.fn(),
      resetAll: vi.fn(),
    })
    const request = createPickupRequest({ status: PICKUP_STATUS.PENDING })
    const wrapper = mount(CustomerStatusCard, { props: { request }, global: { stubs } })
    expect(wrapper.find('[data-testid="customer-status-card"]').classes()).not.toContain('animate-cross-panel-highlight')
  })
})
