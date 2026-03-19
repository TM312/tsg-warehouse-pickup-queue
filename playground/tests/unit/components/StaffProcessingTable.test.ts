import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { h, markRaw } from 'vue'
import StaffProcessingTable from '@/components/staff/StaffProcessingTable.vue'
import { useQueueStore } from '@/stores/queue'
import { useGatesStore } from '@/stores/gates'
import { useSimulationStore } from '@/stores/simulation'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'
import { DEFAULT_GATES, DEFAULT_PROCESSING_DURATION_MS } from '@/constants/defaults'

const stubComponent = (name: string) =>
  markRaw({ name, render: () => h('div', { 'data-testid': name }) })

const stubs = {
  Table: markRaw({ name: 'Table', setup(_: unknown, { slots }: { slots: Record<string, () => unknown> }) { return () => h('table', slots.default?.()) } }),
  TableHeader: markRaw({ name: 'TableHeader', setup(_: unknown, { slots }: { slots: Record<string, () => unknown> }) { return () => h('thead', slots.default?.()) } }),
  TableBody: markRaw({ name: 'TableBody', setup(_: unknown, { slots }: { slots: Record<string, () => unknown> }) { return () => h('tbody', slots.default?.()) } }),
  TableRow: markRaw({ name: 'TableRow', setup(_: unknown, { slots }: { slots: Record<string, () => unknown> }) { return () => h('tr', slots.default?.()) } }),
  TableHead: markRaw({ name: 'TableHead', setup(_: unknown, { slots }: { slots: Record<string, () => unknown> }) { return () => h('th', slots.default?.()) } }),
  TableCell: markRaw({ name: 'TableCell', setup(_: unknown, { slots }: { slots: Record<string, () => unknown> }) { return () => h('td', slots.default?.()) } }),
  GateStatusDot: stubComponent('gate-status-dot'),
  ProcessingProgressBar: markRaw({
    name: 'ProcessingProgressBar',
    props: ['progress'],
    setup(props: { progress: number }) {
      return () => h('div', { 'data-testid': 'processing-progress-bar', 'data-progress': props.progress })
    },
  }),
}

function seedGates() {
  const gates = useGatesStore()
  gates.setGates(DEFAULT_GATES.map(g => ({ ...g, queue_count: 0 })))
}

beforeEach(() => {
  setActivePinia(createPinia())
  seedGates()
})

describe('StaffProcessingTable', () => {
  it('renders a row for each active gate', () => {
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(DEFAULT_GATES.length)
  })

  it('shows "Idle" for gates with no processing request', () => {
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    const cells = wrapper.findAll('tbody td')
    // Each row has 3 cells: gate, order, elapsed. Check order cell for "Idle"
    const orderCells = cells.filter((_, i) => i % 3 === 1)
    orderCells.forEach(cell => {
      expect(cell.text()).toBe('Idle')
    })
  })

  it('shows "--" elapsed for gates with no processing request', () => {
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    const cells = wrapper.findAll('tbody td')
    const elapsedCells = cells.filter((_, i) => i % 3 === 2)
    elapsedCells.forEach(cell => {
      expect(cell.text()).toBe('--')
    })
  })

  it('shows order number for a gate with a processing request', () => {
    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({
      id: 'r1',
      sales_order_number: 'SO-12345',
      status: PICKUP_STATUS.PROCESSING,
      gate_id: DEFAULT_GATES[0].id,
      processing_started_at: new Date().toISOString(),
      processing_started_sim_ms: 0,
    }))

    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    expect(wrapper.text()).toContain('SO-12345')
  })

  it('calculates elapsed time from simulation clock', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 65_000 // 65 seconds elapsed

    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({
      id: 'r1',
      sales_order_number: 'SO-12345',
      status: PICKUP_STATUS.PROCESSING,
      gate_id: DEFAULT_GATES[0].id,
      processing_started_at: new Date().toISOString(),
      processing_started_sim_ms: 5_000, // started at 5s
    }))

    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    // 65000 - 5000 = 60000ms = 1m
    expect(wrapper.text()).toContain('1m')
  })

  it('clamps negative elapsed to 0s', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 0

    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({
      id: 'r1',
      sales_order_number: 'SO-12345',
      status: PICKUP_STATUS.PROCESSING,
      gate_id: DEFAULT_GATES[0].id,
      processing_started_at: new Date().toISOString(),
      processing_started_sim_ms: 5_000,
    }))

    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    expect(wrapper.text()).toContain('0s')
  })

  it('has data-testid="staff-processing-table"', () => {
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    expect(wrapper.find('[data-testid="staff-processing-table"]').exists()).toBe(true)
  })

  it('renders gate status dots in each row', () => {
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    const dots = wrapper.findAll('[data-testid="gate-status-dot"]')
    expect(dots).toHaveLength(DEFAULT_GATES.length)
  })

  it('renders progress bar when gate has a processing request', () => {
    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({
      id: 'r1',
      sales_order_number: 'SO-12345',
      status: PICKUP_STATUS.PROCESSING,
      gate_id: DEFAULT_GATES[0].id,
      processing_started_at: new Date().toISOString(),
      processing_started_sim_ms: 0,
    }))

    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    expect(wrapper.find('[data-testid="processing-progress-bar"]').exists()).toBe(true)
  })

  it('does not render progress bar when gate is idle', () => {
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    expect(wrapper.find('[data-testid="processing-progress-bar"]').exists()).toBe(false)
  })

  it('calculates correct progress value (50% at halfway through processing)', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = DEFAULT_PROCESSING_DURATION_MS / 2 // halfway

    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({
      id: 'r1',
      sales_order_number: 'SO-12345',
      status: PICKUP_STATUS.PROCESSING,
      gate_id: DEFAULT_GATES[0].id,
      processing_started_at: new Date().toISOString(),
      processing_started_sim_ms: 0,
    }))

    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    const bar = wrapper.find('[data-testid="processing-progress-bar"]')
    expect(bar.attributes('data-progress')).toBe('0.5')
  })
})
