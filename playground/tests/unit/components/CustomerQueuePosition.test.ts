import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { markRaw } from 'vue'
import CustomerQueuePosition from '@/components/customer/CustomerQueuePosition.vue'
import { useGatesStore } from '@/stores/gates'
import { useQueueStore } from '@/stores/queue'
import { createPickupRequest, createGate } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'

const stubs = {
  UiBadge: markRaw({ name: 'UiBadge', template: '<span><slot /></span>' }),
}

function makeCompleted(startedAt: string, completedAt: string) {
  return createPickupRequest({
    status: PICKUP_STATUS.COMPLETED,
    processing_started_at: startedAt,
    completed_at: completedAt,
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('CustomerQueuePosition', () => {
  it('displays gate number when gate exists', () => {
    const gates = useGatesStore()
    const gate = createGate({ gate_number: 5 })
    gates.setGates([{ ...gate, queue_count: 1 }])

    const request = createPickupRequest({
      status: PICKUP_STATUS.IN_QUEUE,
      gate_id: gate.id,
      queue_position: 2,
    })

    const wrapper = mount(CustomerQueuePosition, { props: { request }, global: { stubs } })
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('Gate')
  })

  it('displays queue position', () => {
    const request = createPickupRequest({
      status: PICKUP_STATUS.IN_QUEUE,
      gate_id: 'gate-1',
      queue_position: 3,
    })

    const wrapper = mount(CustomerQueuePosition, { props: { request }, global: { stubs } })
    expect(wrapper.text()).toContain('Position 3')
  })

  it('does not render position badge when queue_position is null', () => {
    const request = createPickupRequest({
      status: PICKUP_STATUS.IN_QUEUE,
      gate_id: 'gate-1',
      queue_position: null,
    })

    const wrapper = mount(CustomerQueuePosition, { props: { request }, global: { stubs } })
    expect(wrapper.text()).not.toContain('Position')
  })

  it('shows "Calculating..." when insufficient historical data', () => {
    const request = createPickupRequest({
      status: PICKUP_STATUS.IN_QUEUE,
      gate_id: 'gate-1',
      queue_position: 2,
    })

    const wrapper = mount(CustomerQueuePosition, { props: { request }, global: { stubs } })
    expect(wrapper.text()).toContain('Calculating...')
  })

  it('shows wait estimate when sufficient historical data exists', () => {
    const queue = useQueueStore()
    // Add 3+ completed requests with known durations to enable estimate
    const base = new Date('2026-01-01T00:00:00Z')
    queue.addRequest(makeCompleted(base.toISOString(), new Date(base.getTime() + 60_000).toISOString()))
    queue.addRequest(makeCompleted(base.toISOString(), new Date(base.getTime() + 120_000).toISOString()))
    queue.addRequest(makeCompleted(base.toISOString(), new Date(base.getTime() + 180_000).toISOString()))

    const request = createPickupRequest({
      status: PICKUP_STATUS.IN_QUEUE,
      gate_id: 'gate-1',
      queue_position: 3,
    })

    const wrapper = mount(CustomerQueuePosition, { props: { request }, global: { stubs } })
    expect(wrapper.text()).toContain('~')
    expect(wrapper.text()).not.toContain('Calculating...')
  })

  it('shows "You\'re next!" for position 1 with sufficient data', () => {
    const queue = useQueueStore()
    const base = new Date('2026-01-01T00:00:00Z')
    queue.addRequest(makeCompleted(base.toISOString(), new Date(base.getTime() + 60_000).toISOString()))
    queue.addRequest(makeCompleted(base.toISOString(), new Date(base.getTime() + 120_000).toISOString()))
    queue.addRequest(makeCompleted(base.toISOString(), new Date(base.getTime() + 180_000).toISOString()))

    const request = createPickupRequest({
      status: PICKUP_STATUS.IN_QUEUE,
      gate_id: 'gate-1',
      queue_position: 1,
    })

    const wrapper = mount(CustomerQueuePosition, { props: { request }, global: { stubs } })
    expect(wrapper.text()).toContain("You're next!")
  })

  it('has data-testid="customer-queue-position"', () => {
    const request = createPickupRequest({
      status: PICKUP_STATUS.IN_QUEUE,
      gate_id: 'gate-1',
      queue_position: 1,
    })

    const wrapper = mount(CustomerQueuePosition, { props: { request }, global: { stubs } })
    expect(wrapper.find('[data-testid="customer-queue-position"]').exists()).toBe(true)
  })
})
