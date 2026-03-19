import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { h, markRaw } from 'vue'
import Sortable from 'sortablejs'
import StaffGateQueue from '@/components/staff/StaffGateQueue.vue'
import { useQueueStore } from '@/stores/queue'
import { useGatesStore } from '@/stores/gates'
import { useSimulationStore } from '@/stores/simulation'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'
import { DEFAULT_GATES, DEFAULT_PROCESSING_DURATION_MS } from '@/constants/defaults'
import { RESPONSIVE } from '@/constants/responsive'

const stubComponent = (name: string) =>
  markRaw({ name, render: () => h('div', { 'data-testid': name }) })

const stubs = {
  StaffStatusBadge: stubComponent('staff-status-badge'),
  StaffRequestActions: stubComponent('staff-request-actions'),
  EmptyState: markRaw({
    name: 'EmptyState',
    props: ['icon', 'heading', 'subtext'],
    setup(_: unknown, { slots }: { slots: Record<string, () => unknown> }) {
      return () => h('div', { 'data-testid': 'empty-state' }, slots.default?.())
    },
  }),
  ProcessingProgressBar: markRaw({
    name: 'ProcessingProgressBar',
    props: ['progress'],
    setup(props: { progress: number }) {
      return () => h('div', { 'data-testid': 'processing-progress-bar', 'data-progress': props.progress })
    },
  }),
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
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
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

    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(false)
  })

  it('has data-testid="staff-gate-queue"', () => {
    seedGates()
    const wrapper = mount(StaffGateQueue, {
      props: { gateId: GATE_ID },
      global: { stubs },
    })
    expect(wrapper.find('[data-testid="staff-gate-queue"]').exists()).toBe(true)
  })

  it('renders progress bar in "Now Processing" section', () => {
    seedGates()
    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({
      id: 'rp',
      sales_order_number: 'SO-PROC',
      status: PICKUP_STATUS.PROCESSING,
      gate_id: GATE_ID,
      processing_started_at: new Date().toISOString(),
      processing_started_sim_ms: 0,
    }))

    const wrapper = mount(StaffGateQueue, {
      props: { gateId: GATE_ID },
      global: { stubs },
    })

    expect(wrapper.find('[data-testid="processing-progress-bar"]').exists()).toBe(true)
  })

  it('passes correct progress value to progress bar', () => {
    seedGates()
    const simulation = useSimulationStore()
    simulation.elapsedMs = DEFAULT_PROCESSING_DURATION_MS / 2

    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({
      id: 'rp',
      sales_order_number: 'SO-PROC',
      status: PICKUP_STATUS.PROCESSING,
      gate_id: GATE_ID,
      processing_started_at: new Date().toISOString(),
      processing_started_sim_ms: 0,
    }))

    const wrapper = mount(StaffGateQueue, {
      props: { gateId: GATE_ID },
      global: { stubs },
    })

    const bar = wrapper.find('[data-testid="processing-progress-bar"]')
    expect(bar.attributes('data-progress')).toBe('0.5')
  })

  it('does not render progress bar when no processing item', () => {
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

    expect(wrapper.find('[data-testid="processing-progress-bar"]').exists()).toBe(false)
  })

  it('initializes SortableJS with forceFallback and touch delay options', () => {
    const createSpy = vi.spyOn(Sortable, 'create')
    seedGates()
    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({
      id: 'r1',
      status: PICKUP_STATUS.IN_QUEUE,
      gate_id: GATE_ID,
      queue_position: 1,
    }))

    mount(StaffGateQueue, {
      props: { gateId: GATE_ID },
      global: { stubs },
    })

    expect(createSpy).toHaveBeenCalled()
    const opts = createSpy.mock.calls[0][1]!
    expect(opts.forceFallback).toBe(true)
    expect(opts.delay).toBe(RESPONSIVE.SORTABLE_TOUCH_DELAY_MS)
    expect(opts.delayOnTouchOnly).toBe(true)
    expect(opts.touchStartThreshold).toBe(RESPONSIVE.SORTABLE_TOUCH_THRESHOLD_PX)

    createSpy.mockRestore()
  })
})
