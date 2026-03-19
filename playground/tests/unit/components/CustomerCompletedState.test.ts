import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { h, markRaw } from 'vue'
import { CircleCheckBig } from 'lucide-vue-next'
import CustomerCompletedState from '@/components/customer/CustomerCompletedState.vue'
import { useSimulationStore } from '@/stores/simulation'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'

const stubs = {
  ConfettiBurst: markRaw({
    name: 'ConfettiBurst',
    render() { return h('div', { 'data-testid': 'confetti-burst' }) },
  }),
  UiButton: markRaw({
    name: 'UiButton',
    props: ['variant', 'size'],
    render() {
      return h('button', {
        'data-testid': this.$attrs['data-testid'],
        onClick: () => this.$emit('click'),
      }, this.$slots.default?.())
    },
  }),
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('CustomerCompletedState', () => {
  it('displays "Pickup complete!" heading', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.COMPLETED })
    const wrapper = mount(CustomerCompletedState, { props: { request }, global: { stubs } })
    expect(wrapper.text()).toContain('Pickup complete!')
  })

  it('displays the sales order number', () => {
    const request = createPickupRequest({
      status: PICKUP_STATUS.COMPLETED,
      sales_order_number: 'SO-42',
    })
    const wrapper = mount(CustomerCompletedState, { props: { request }, global: { stubs } })
    expect(wrapper.text()).toContain('SO-42')
  })

  it('renders the success icon', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.COMPLETED })
    const wrapper = mount(CustomerCompletedState, { props: { request }, global: { stubs } })
    expect(wrapper.findComponent(CircleCheckBig).exists()).toBe(true)
  })

  it('has data-testid="customer-completed-state"', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.COMPLETED })
    const wrapper = mount(CustomerCompletedState, { props: { request }, global: { stubs } })
    expect(wrapper.find('[data-testid="customer-completed-state"]').exists()).toBe(true)
  })

  it('renders confetti burst', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.COMPLETED })
    const wrapper = mount(CustomerCompletedState, { props: { request }, global: { stubs } })
    expect(wrapper.find('[data-testid="confetti-burst"]').exists()).toBe(true)
  })

  it('renders "Submit Another Order" button', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.COMPLETED })
    const wrapper = mount(CustomerCompletedState, { props: { request }, global: { stubs } })
    expect(wrapper.find('[data-testid="submit-another-button"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Submit Another Order')
  })

  it('clicking "Submit Another" calls selectCustomerRequest(null)', async () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.COMPLETED })
    const wrapper = mount(CustomerCompletedState, { props: { request }, global: { stubs } })
    const simulation = useSimulationStore()

    simulation.selectCustomerRequest('some-id')
    expect(simulation.selectedCustomerRequestId).toBe('some-id')

    await wrapper.find('[data-testid="submit-another-button"]').trigger('click')
    expect(simulation.selectedCustomerRequestId).toBeNull()
  })
})
