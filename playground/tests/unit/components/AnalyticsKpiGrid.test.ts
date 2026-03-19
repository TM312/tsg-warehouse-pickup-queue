import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useQueueStore } from '@/stores/queue'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'
import AnalyticsKpiGrid from '@/components/analytics/AnalyticsKpiGrid.vue'
import AnalyticsKpiCard from '@/components/analytics/AnalyticsKpiCard.vue'

const mockMediaQuery = ref(false)

vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vueuse/core')>()
  return {
    ...actual,
    useMediaQuery: () => mockMediaQuery,
  }
})

describe('AnalyticsKpiGrid', () => {
  let queue: ReturnType<typeof useQueueStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    queue = useQueueStore()
    mockMediaQuery.value = false
  })

  const mountGrid = () =>
    mount(AnalyticsKpiGrid, {
      global: {
        components: { AnalyticsKpiCard },
      },
    })

  it('renders 4 KPI cards', () => {
    const wrapper = mountGrid()
    expect(wrapper.findAll('[data-testid^="kpi-"]')).toHaveLength(4)
  })

  it('shows correct completed count', () => {
    queue.setRequests([
      createPickupRequest({ status: PICKUP_STATUS.COMPLETED }),
      createPickupRequest({ status: PICKUP_STATUS.COMPLETED }),
      createPickupRequest({ status: PICKUP_STATUS.COMPLETED }),
    ])
    const wrapper = mountGrid()
    expect(wrapper.find('[data-testid="kpi-completed-count"]').text()).toContain('3')
  })

  it('shows currently waiting count', () => {
    queue.setRequests([
      createPickupRequest({ status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-1', queue_position: 1 }),
      createPickupRequest({ status: PICKUP_STATUS.IN_QUEUE, gate_id: 'gate-2', queue_position: 1 }),
    ])
    const wrapper = mountGrid()
    expect(wrapper.find('[data-testid="kpi-currently-waiting"]').text()).toContain('2')
  })

  it('shows formatted avg processing time', () => {
    const base = new Date('2026-01-01T00:00:00Z')
    queue.setRequests([
      createPickupRequest({
        status: PICKUP_STATUS.COMPLETED,
        processing_started_at: base.toISOString(),
        completed_at: new Date(base.getTime() + 90000).toISOString(),
      }),
    ])
    const wrapper = mountGrid()
    expect(wrapper.find('[data-testid="kpi-avg-processing-time"]').text()).toContain('1m')
  })

  it('shows "--" when no data', () => {
    const wrapper = mountGrid()
    expect(wrapper.find('[data-testid="kpi-avg-wait-time"]').text()).toContain('--')
    expect(wrapper.find('[data-testid="kpi-avg-processing-time"]').text()).toContain('--')
  })

  it('compact breakpoint renders grid-cols-1', () => {
    mockMediaQuery.value = true
    const wrapper = mountGrid()
    const grid = wrapper.find('[data-testid="analytics-kpi-grid"]')
    expect(grid.classes()).toContain('grid-cols-1')
    expect(grid.classes()).not.toContain('grid-cols-2')
  })

  it('default renders grid-cols-2', () => {
    mockMediaQuery.value = false
    const wrapper = mountGrid()
    const grid = wrapper.find('[data-testid="analytics-kpi-grid"]')
    expect(grid.classes()).toContain('grid-cols-2')
    expect(grid.classes()).not.toContain('grid-cols-1')
  })
})
