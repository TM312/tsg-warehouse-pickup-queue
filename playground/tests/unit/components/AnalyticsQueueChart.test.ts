import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { h, markRaw, ref } from 'vue'
import AnalyticsQueueChart from '@/components/analytics/AnalyticsQueueChart.vue'
import type { QueueHistoryPoint } from '@/composables/useQueueHistory'

const mockHistory = ref<QueueHistoryPoint[]>([])

vi.mock('@/composables/useQueueHistory', () => ({
  useQueueHistory: () => ({
    history: mockHistory,
    gateIds: ref([]),
    gateLabels: ref({}),
  }),
}))

vi.mock('@/composables/useGateStatus', () => ({
  useGateStatuses: () => ({
    statusOf: () => 'online',
  }),
}))

const stubComponent = (name: string) =>
  markRaw({ name, render: () => h('div', { 'data-testid': name }) })

const stubs = {
  VisXYContainer: stubComponent('vis-xy-container'),
  VisArea: stubComponent('vis-area'),
  VisAxis: stubComponent('vis-axis'),
  GateStatusDot: stubComponent('gate-status-dot'),
  EmptyState: markRaw({
    name: 'EmptyState',
    props: ['icon', 'heading', 'subtext'],
    setup(_: unknown, { slots }: { slots: Record<string, () => unknown> }) {
      return () => h('div', { 'data-testid': 'empty-state' }, slots.default?.())
    },
  }),
}

beforeEach(() => {
  setActivePinia(createPinia())
  mockHistory.value = []
})

describe('AnalyticsQueueChart', () => {
  it('shows empty state when history has fewer than 2 data points', () => {
    mockHistory.value = []
    const wrapper = mount(AnalyticsQueueChart, { global: { stubs } })
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="vis-xy-container"]').exists()).toBe(false)
  })

  it('shows empty state with exactly 1 data point', () => {
    mockHistory.value = [{ timeMs: 0, counts: { g1: 0 } }]
    const wrapper = mount(AnalyticsQueueChart, { global: { stubs } })
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
  })

  it('shows chart when history has 2 or more data points', () => {
    mockHistory.value = [
      { timeMs: 0, counts: { g1: 0 } },
      { timeMs: 1000, counts: { g1: 2 } },
    ]
    const wrapper = mount(AnalyticsQueueChart, { global: { stubs } })
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Queue Depth Over Time')
  })

  it('has data-testid="analytics-queue-chart"', () => {
    const wrapper = mount(AnalyticsQueueChart, { global: { stubs } })
    expect(wrapper.find('[data-testid="analytics-queue-chart"]').exists()).toBe(true)
  })
})
