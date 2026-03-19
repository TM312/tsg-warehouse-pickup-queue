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
  EmptyState: markRaw({
    name: 'EmptyState',
    props: ['icon', 'heading', 'subtext'],
    setup(_: unknown, { slots }: { slots: Record<string, () => unknown> }) {
      return () => h('div', { 'data-testid': 'empty-state' }, slots.default?.())
    },
  }),
  Button: stubComponent('button-stub'),
}

function seedGates() {
  const gates = useGatesStore()
  gates.setGates(DEFAULT_GATES.map(g => ({ ...g, queue_count: 0 })))
}

function seedProcessingRequest(overrides: Record<string, unknown> = {}) {
  const queue = useQueueStore()
  queue.addRequest(createPickupRequest({
    id: 'r1',
    sales_order_number: 'SO-12345',
    status: PICKUP_STATUS.PROCESSING,
    gate_id: DEFAULT_GATES[0].id,
    processing_started_at: new Date().toISOString(),
    processing_started_sim_ms: 0,
    ...overrides,
  }))
}

beforeEach(() => {
  setActivePinia(createPinia())
  seedGates()
})

describe('StaffProcessingTable', () => {
  it('shows empty state when all gates are idle', () => {
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('empty state disappears when a processing request exists', () => {
    seedProcessingRequest()
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(false)
    expect(wrapper.find('table').exists()).toBe(true)
  })

  it('renders a row for each active gate when processing', () => {
    seedProcessingRequest()
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    // Filter out progress bar rows (they have a single td with colspan)
    const gateRows = wrapper.findAll('tbody tr').filter(row => row.findAll('td').length === 3)
    expect(gateRows).toHaveLength(DEFAULT_GATES.length)
  })

  it('shows "Idle" for gates with no processing request', () => {
    seedProcessingRequest()
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    // Get only gate rows (3 cells each), skip progress bar rows
    const gateRows = wrapper.findAll('tbody tr').filter(row => row.findAll('td').length === 3)
    // Skip first gate (has request), others show Idle
    gateRows.slice(1).forEach(row => {
      const cells = row.findAll('td')
      expect(cells[1].text()).toBe('Idle')
    })
  })

  it('shows "--" elapsed for gates with no processing request', () => {
    seedProcessingRequest()
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    const gateRows = wrapper.findAll('tbody tr').filter(row => row.findAll('td').length === 3)
    // Skip first gate (has request), rest show --
    gateRows.slice(1).forEach(row => {
      const cells = row.findAll('td')
      expect(cells[2].text()).toBe('--')
    })
  })

  it('shows order number for a gate with a processing request', () => {
    seedProcessingRequest()
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    expect(wrapper.text()).toContain('SO-12345')
  })

  it('calculates elapsed time from simulation clock', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 65_000
    seedProcessingRequest({ processing_started_sim_ms: 5_000 })

    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    expect(wrapper.text()).toContain('1m')
  })

  it('clamps negative elapsed to 0s', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 0
    seedProcessingRequest({ processing_started_sim_ms: 5_000 })

    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    expect(wrapper.text()).toContain('0s')
  })

  it('has data-testid="staff-processing-table"', () => {
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    expect(wrapper.find('[data-testid="staff-processing-table"]').exists()).toBe(true)
  })

  it('renders gate status dots in each row', () => {
    seedProcessingRequest()
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    const dots = wrapper.findAll('[data-testid="gate-status-dot"]')
    expect(dots).toHaveLength(DEFAULT_GATES.length)
  })

  it('renders progress bar when gate has a processing request', () => {
    seedProcessingRequest()
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    expect(wrapper.find('[data-testid="processing-progress-bar"]').exists()).toBe(true)
  })

  it('does not render progress bar when gate is idle (empty state shown)', () => {
    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    expect(wrapper.find('[data-testid="processing-progress-bar"]').exists()).toBe(false)
  })

  it('calculates correct progress value (50% at halfway through processing)', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = DEFAULT_PROCESSING_DURATION_MS / 2

    seedProcessingRequest()

    const wrapper = mount(StaffProcessingTable, { global: { stubs } })
    const bar = wrapper.find('[data-testid="processing-progress-bar"]')
    expect(bar.attributes('data-progress')).toBe('0.5')
  })
})
