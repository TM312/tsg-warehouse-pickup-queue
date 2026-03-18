import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { h, markRaw } from 'vue'
import StaffAllRequestsTable from '@/components/staff/StaffAllRequestsTable.vue'
import { useQueueStore } from '@/stores/queue'
import { useGatesStore } from '@/stores/gates'
import { createPickupRequest, createGate } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'
import { DEFAULT_GATES } from '@/constants/defaults'

const stubComponent = (name: string) =>
  markRaw({ name, render: () => h('div', { 'data-testid': name }) })

const stubs = {
  StaffStatusBadge: stubComponent('staff-status-badge'),
  StaffGateSelect: stubComponent('staff-gate-select'),
  StaffRequestActions: stubComponent('staff-request-actions'),
}

function seedGates() {
  const gates = useGatesStore()
  gates.setGates(DEFAULT_GATES.map(g => ({ ...g, queue_count: 0 })))
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('StaffAllRequestsTable', () => {
  it('renders a row for each active request', () => {
    seedGates()
    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({ status: PICKUP_STATUS.PENDING }))
    queue.addRequest(createPickupRequest({ status: PICKUP_STATUS.APPROVED }))
    queue.addRequest(createPickupRequest({ status: PICKUP_STATUS.IN_QUEUE, gate_id: DEFAULT_GATES[0].id, queue_position: 1 }))

    const wrapper = mount(StaffAllRequestsTable, { global: { stubs } })
    const bodyRows = wrapper.findAll('tbody tr')
    expect(bodyRows).toHaveLength(3)
  })

  it('does not render completed/cancelled requests', () => {
    seedGates()
    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({ status: PICKUP_STATUS.PENDING }))
    queue.addRequest(createPickupRequest({ status: PICKUP_STATUS.COMPLETED }))
    queue.addRequest(createPickupRequest({ status: PICKUP_STATUS.CANCELLED }))

    const wrapper = mount(StaffAllRequestsTable, { global: { stubs } })
    const bodyRows = wrapper.findAll('tbody tr')
    expect(bodyRows).toHaveLength(1)
  })

  it('shows empty state when no requests', () => {
    seedGates()
    const wrapper = mount(StaffAllRequestsTable, { global: { stubs } })
    expect(wrapper.text()).toContain('No active requests')
  })

  it('has data-testid="staff-all-requests-table"', () => {
    seedGates()
    const wrapper = mount(StaffAllRequestsTable, { global: { stubs } })
    expect(wrapper.find('[data-testid="staff-all-requests-table"]').exists()).toBe(true)
  })
})
