import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductMockupTablet from '@/components/landing/ProductMockupTablet.vue'
import {
  PRODUCT_TABLET_GATE_LABEL,
  PRODUCT_TABLET_NOW_LOADING,
  PRODUCT_TABLET_ORDER_DETAIL,
  PRODUCT_TABLET_NEXT_UP,
} from '@/constants/mockup'

describe('ProductMockupTablet', () => {
  function factory() {
    return mount(ProductMockupTablet)
  }

  it('has data-testid', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="product-mockup-tablet"]').exists()).toBe(true)
  })

  it('renders gate label from constant', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain(PRODUCT_TABLET_GATE_LABEL)
  })

  it('renders now-loading company from constant', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain(PRODUCT_TABLET_NOW_LOADING)
  })

  it('renders order detail from constant', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain(PRODUCT_TABLET_ORDER_DETAIL)
  })

  it('renders next-up company from constant', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain(PRODUCT_TABLET_NEXT_UP)
  })

  it('shows Active status', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain('Active')
  })
})
