import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { h, markRaw } from 'vue'
import StaffGateQueue from '@/components/staff/StaffGateQueue.vue'
import { useQueueStore } from '@/stores/queue'
import { useGatesStore } from '@/stores/gates'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'
import { DEFAULT_GATES } from '@/constants/defaults'

const stubComponent = (name: string) =>
  markRaw({ name, render: () => h('div', { 'data-testid': name }) })

const stubs = {
  StaffStatusBadge: stubComponent('staff-status-badge'),
  StaffRequestActions: stubComponent('staff-request-actions'),
}

const GATE_ID = DEFAULT_GATES[0].id

function seedGates() {
  const gates = useGatesStore()
  gates.setGates(DEFAULT_GATES.map(g => ({ ...g, queue_count: 0 })))
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('StaffGateQueue', () => {
  it('renders items in position order', () => {
    seedGates()
    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({
      id: 'r1', sales_order_number: 'SO-001', status: PICKUP_STATUS.IN_QUEUE,
      gate_id: GATE_ID, queue_position: 1,
    }))
    queue.addRequest(createPickupRequest({
      id: 'r2', sales_order_number: 'SO-002', status: PICKUP_STATUS.IN_QUEUE,
      gate_id: GATE_ID, queue_position: 2,
    }))
    queue.addRequest(createPickupRequest({
      id: 'r3', sales_order_number: 'SO-003', status: PICKUP_STATUS.IN_QUEUE,
      gate_id: GATE_ID, queue_position: 3,
    }))

    const wrapper = mount(StaffGateQueue, {
      props: { gateId: GATE_ID },
      global: { stubs },
    })

    const items = wrapper.findAll('[data-request-id]')
    expect(items).toHaveLength(3)
    expect(items[0].attributes('data-request-id')).toBe('r1')
    expect(items[1].attributes('data-request-id')).toBe('r2')
    expect(items[2].attributes('data-request-id')).toBe('r3')
  })

  it('renders items by queue_position (priority already encoded by recalculatePositions)', () => {
    seedGates()
    const queue = useQueueStore()
    // recalculatePositions assigns lower positions to priority items,
    // so position order already reflects priority
    queue.addRequest(createPickupRequest({
      id: 'r1', sales_order_number: 'SO-001', status: PICKUP_STATUS.IN_QUEUE,
      gate_id: GATE_ID, queue_position: 2, is_priority: false,
    }))
    queue.addRequest(createPickupRequest({
      id: 'r2', sales_order_number: 'SO-002', status: PICKUP_STATUS.IN_QUEUE,
      gate_id: GATE_ID, queue_position: 1, is_priority: true,
    }))

    const wrapper = mount(StaffGateQueue, {
      props: { gateId: GATE_ID },
      global: { stubs },
    })

    const items = wrapper.findAll('[data-request-id]')
    expect(items[0].attributes('data-request-id')).toBe('r2')
    expect(items[1].attributes('data-request-id')).toBe('r1')
  })

  it('shows empty state when no items', () => {
    seedGates()
    const wrapper = mount(StaffGateQueue, {
      props: { gateId: GATE_ID },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('No items in this gate')
  })

  it('renders "Now Processing" section when a processing item exists at the gate', () => {
    seedGates()
    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({
      id: 'rp',
      sales_order_number: 'SO-PROC',
      company_name: 'Processing Co',
      status: PICKUP_STATUS.PROCESSING,
      gate_id: GATE_ID,
      processing_started_at: new Date().toISOString(),
      processing_started_sim_ms: 0,
    }))

    const wrapper = mount(StaffGateQueue, {
      props: { gateId: GATE_ID },
      global: { stubs },
    })

    expect(wrapper.text()).toContain('Now Processing')
    expect(wrapper.text()).toContain('SO-PROC')
    expect(wrapper.text()).toContain('Processing Co')
  })

  it('does not render "Now Processing" section when no processing item at the gate', () => {
    seedGates()
    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({
      id: 'r1',
      status: PICKUP_STATUS.IN_QUEUE,
      gate_id: GATE_ID,
      queue_position: 1,
    }))

    const wrapper = mount(StaffGateQueue, {
      props: { gateId: GATE_ID },
      global: { stubs },
    })

    expect(wrapper.text()).not.toContain('Now Processing')
  })

  it('does not show empty state when processing item exists but queue is empty', () => {
    seedGates()
    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({
      id: 'rp',
      status: PICKUP_STATUS.PROCESSING,
      gate_id: GATE_ID,
      processing_started_at: new Date().toISOString(),
      processing_started_sim_ms: 0,
    }))

    const wrapper = mount(StaffGateQueue, {
      props: { gateId: GATE_ID },
      global: { stubs },
    })

    expect(wrapper.text()).not.toContain('No items in this gate')
  })

  it('has data-testid="staff-gate-queue"', () => {
    seedGates()
    const wrapper = mount(StaffGateQueue, {
      props: { gateId: GATE_ID },
      global: { stubs },
    })
    expect(wrapper.find('[data-testid="staff-gate-queue"]').exists()).toBe(true)
  })
})
