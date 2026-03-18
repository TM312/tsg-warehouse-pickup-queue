import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomerCompletedState from '@/components/customer/CustomerCompletedState.vue'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'

describe('CustomerCompletedState', () => {
  it('displays "Pickup complete!" heading', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.COMPLETED })
    const wrapper = mount(CustomerCompletedState, { props: { request } })
    expect(wrapper.text()).toContain('Pickup complete!')
  })

  it('displays the sales order number', () => {
    const request = createPickupRequest({
      status: PICKUP_STATUS.COMPLETED,
      sales_order_number: 'SO-42',
    })
    const wrapper = mount(CustomerCompletedState, { props: { request } })
    expect(wrapper.text()).toContain('SO-42')
  })

  it('renders the success icon', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.COMPLETED })
    const wrapper = mount(CustomerCompletedState, { props: { request } })
    expect(wrapper.find('.lucide-circle-check-big').exists()).toBe(true)
  })

  it('has data-testid="customer-completed-state"', () => {
    const request = createPickupRequest({ status: PICKUP_STATUS.COMPLETED })
    const wrapper = mount(CustomerCompletedState, { props: { request } })
    expect(wrapper.find('[data-testid="customer-completed-state"]').exists()).toBe(true)
  })
})
