import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroMockupPhone from '@/components/landing/HeroMockupPhone.vue'

describe('HeroMockupPhone', () => {
  function factory(animated = false) {
    return mount(HeroMockupPhone, { props: { animated } })
  }

  it('renders the phone frame with testid', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="hero-mockup-phone"]').exists()).toBe(true)
  })

  it('renders all queue position labels', () => {
    const wrapper = factory()
    const text = wrapper.text()
    expect(text).toContain('#3')
    expect(text).toContain('#2')
    expect(text).toContain('#1')
    expect(text).toContain('Your turn!')
  })

  it('renders wait time labels', () => {
    const wrapper = factory()
    const text = wrapper.text()
    expect(text).toContain('Estimated wait: ~8 min')
    expect(text).toContain('Estimated wait: ~4 min')
    expect(text).toContain('Proceed to gate')
  })

  it('renders the gate card', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain('Assigned Gate')
    expect(wrapper.text()).toContain('Gate 2')
  })

  it('applies animation classes when animated is true', () => {
    const wrapper = factory(true)
    const positions = wrapper.findAll('.hero-phone-animate')
    expect(positions.length).toBeGreaterThan(0)
  })

  it('does not apply animation classes when animated is false', () => {
    const wrapper = factory(false)
    const positions = wrapper.findAll('.hero-phone-animate')
    expect(positions).toHaveLength(0)
  })

  it('shows "Your turn!" as visible (opacity-100) when not animated', () => {
    const wrapper = factory(false)
    const done = wrapper.find('.hero-phone-pos-done')
    expect(done.classes()).toContain('opacity-100')
  })

  it('shows gate card as visible (opacity-100) when not animated', () => {
    const wrapper = factory(false)
    const gate = wrapper.find('.hero-phone-gate')
    expect(gate.classes()).toContain('opacity-100')
  })
})
