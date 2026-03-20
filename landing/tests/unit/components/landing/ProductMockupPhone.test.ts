import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductMockupPhone from '@/components/landing/ProductMockupPhone.vue'
import {
  PRODUCT_PHONE_POSITION,
  PRODUCT_PHONE_WAIT,
  PRODUCT_PHONE_GATE,
} from '@/constants/mockup'

describe('ProductMockupPhone', () => {
  function factory() {
    return mount(ProductMockupPhone)
  }

  it('has data-testid', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="product-mockup-phone"]').exists()).toBe(true)
  })

  it('renders queue position from constant', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain(PRODUCT_PHONE_POSITION)
  })

  it('renders estimated wait from constant', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain(PRODUCT_PHONE_WAIT)
  })

  it('renders gate assignment from constant', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain(PRODUCT_PHONE_GATE)
  })

  it('renders Queue Status header', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain('Queue Status')
  })
})
