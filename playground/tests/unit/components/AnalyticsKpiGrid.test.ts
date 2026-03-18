import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useQueueStore } from '@/stores/queue'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'
import AnalyticsKpiGrid from '@/components/analytics/AnalyticsKpiGrid.vue'
import AnalyticsKpiCard from '@/components/analytics/AnalyticsKpiCard.vue'

describe('AnalyticsKpiGrid', () => {
  let queue: ReturnType<typeof useQueueStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    queue = useQueueStore()
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
})
