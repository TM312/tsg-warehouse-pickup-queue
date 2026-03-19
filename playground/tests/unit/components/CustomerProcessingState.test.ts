import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CustomerProcessingState from '@/components/customer/CustomerProcessingState.vue'
import { useSimulationStore } from '@/stores/simulation'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('CustomerProcessingState', () => {
  it('shows progress at 50% with correct aria-valuenow', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 70_000
    const request = createPickupRequest({
      status: PICKUP_STATUS.PROCESSING,
      processing_started_sim_ms: 10_000,
    })
    const wrapper = mount(CustomerProcessingState, { props: { request } })
    expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('50')
  })

  it('renders elapsed time text correctly', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 70_000
    const request = createPickupRequest({
      status: PICKUP_STATUS.PROCESSING,
      processing_started_sim_ms: 10_000,
    })
    const wrapper = mount(CustomerProcessingState, { props: { request } })
    expect(wrapper.text()).toContain('01:00')
  })

  it('clamps progress to 100% when exceeded', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 200_000
    const request = createPickupRequest({
      status: PICKUP_STATUS.PROCESSING,
      processing_started_sim_ms: 10_000,
    })
    const wrapper = mount(CustomerProcessingState, { props: { request } })
    expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')
  })

  it('shows 0% progress when processing just started', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 10_000
    const request = createPickupRequest({
      status: PICKUP_STATUS.PROCESSING,
      processing_started_sim_ms: 10_000,
    })
    const wrapper = mount(CustomerProcessingState, { props: { request } })
    expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('0')
  })

  it('falls back to 0 when processing_started_sim_ms is nullish', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 60_000
    const request = createPickupRequest({
      status: PICKUP_STATUS.PROCESSING,
    })
    // processing_started_sim_ms defaults to undefined from factory
    ;(request as any).processing_started_sim_ms = undefined
    const wrapper = mount(CustomerProcessingState, { props: { request } })
    // With undefined start, calcProcessingProgress returns 0
    expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('0')
  })

  it('displays the loading message', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 10_000
    const request = createPickupRequest({
      status: PICKUP_STATUS.PROCESSING,
      processing_started_sim_ms: 10_000,
    })
    const wrapper = mount(CustomerProcessingState, { props: { request } })
    expect(wrapper.text()).toContain('Your order is being loaded!')
  })

  it('has data-testid="customer-processing-state"', () => {
    const simulation = useSimulationStore()
    simulation.elapsedMs = 0
    const request = createPickupRequest({
      status: PICKUP_STATUS.PROCESSING,
      processing_started_sim_ms: 0,
    })
    const wrapper = mount(CustomerProcessingState, { props: { request } })
    expect(wrapper.find('[data-testid="customer-processing-state"]').exists()).toBe(true)
  })
})
