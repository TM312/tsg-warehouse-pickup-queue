import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErpBulletItem from '@/components/landing/ErpBulletItem.vue'
import type { ErpBullet } from '@/types/erp'

describe('ErpBulletItem', () => {
  const bullet: ErpBullet = {
    icon: 'ShieldCheck',
    text: 'Validate orders against your ERP before check-in.',
  }

  function factory(props: { bullet: ErpBullet } = { bullet }) {
    return mount(ErpBulletItem, { props })
  }

  it('renders text from prop', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain(bullet.text)
  })

  it('renders an icon', () => {
    const wrapper = factory()
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('has correct data-testid', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="erp-bullet-item"]').exists()).toBe(true)
  })
})
