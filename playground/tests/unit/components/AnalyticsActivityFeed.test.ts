import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useSimulationStore } from '@/stores/simulation'
import { RESPONSIVE } from '@/constants/responsive'
import { setBreakpoint, useMediaQueryMock } from '../../helpers/breakpoint-mock'
import AnalyticsActivityFeed from '@/components/analytics/AnalyticsActivityFeed.vue'

vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vueuse/core')>()
  return { ...actual, useMediaQuery: useMediaQueryMock }
})

describe('AnalyticsActivityFeed', () => {
  let simulation: ReturnType<typeof useSimulationStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    simulation = useSimulationStore()
    setBreakpoint('desktop')
  })

  const mountFeed = () => mount(AnalyticsActivityFeed)

  it('renders events in order (newest first)', () => {
    simulation.addEvent({ timestamp: 1000, label: 'First event', type: 'submit' })
    simulation.addEvent({ timestamp: 2000, label: 'Second event', type: 'approve' })
    simulation.addEvent({ timestamp: 3000, label: 'Third event', type: 'complete' })
    const wrapper = mountFeed()
    const events = wrapper.findAll('[data-testid="feed-event"]')
    expect(events[0].text()).toContain('Third event')
  })

  it('renders all events up to 20', () => {
    for (let i = 0; i < 25; i++) {
      simulation.addEvent({ timestamp: i * 1000, label: `Event ${i}`, type: 'submit' })
    }
    const wrapper = mountFeed()
    expect(wrapper.findAll('[data-testid="feed-event"]')).toHaveLength(20)
  })

  it('shows empty state', () => {
    const wrapper = mountFeed()
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
  })

  it('displays event label', () => {
    simulation.addEvent({ timestamp: 1000, label: 'Order submitted: ORD-001', type: 'submit' })
    const wrapper = mountFeed()
    expect(wrapper.text()).toContain('Order submitted: ORD-001')
  })

  it('shows relative time based on simulation elapsed time', () => {
    simulation.addEvent({ timestamp: 5000, label: 'Early event', type: 'submit' })
    simulation.$patch({ elapsedMs: 65000 })
    const wrapper = mountFeed()
    expect(wrapper.text()).toContain('1m ago')
  })

  it('shows "just now" for events logged after elapsed time', () => {
    simulation.$patch({ elapsedMs: 1000 })
    simulation.addEvent({ timestamp: 2000, label: 'Future event', type: 'submit' })
    const wrapper = mountFeed()
    expect(wrapper.text()).toContain('just now')
  })

  it('mobile: feed uses reduced max-height', () => {
    setBreakpoint('mobile')
    simulation.addEvent({ timestamp: 1000, label: 'Test event', type: 'submit' })
    const wrapper = mountFeed()
    const container = wrapper.find('.overflow-y-auto')
    expect(container.attributes('style')).toContain(`${RESPONSIVE.ACTIVITY_FEED_MOBILE_MAX_H_PX}px`)
  })

  it('desktop: feed uses default max-height', () => {
    setBreakpoint('desktop')
    simulation.addEvent({ timestamp: 1000, label: 'Test event', type: 'submit' })
    const wrapper = mountFeed()
    const container = wrapper.find('.overflow-y-auto')
    expect(container.attributes('style')).toContain(`${RESPONSIVE.ACTIVITY_FEED_DEFAULT_MAX_H_PX}px`)
  })
})
