import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfettiBurst from '@/components/customer/ConfettiBurst.vue'

describe('ConfettiBurst', () => {
  it('renders data-testid="confetti-burst"', () => {
    const wrapper = mount(ConfettiBurst)
    expect(wrapper.find('[data-testid="confetti-burst"]').exists()).toBe(true)
  })

  it('contains 12 particle elements', () => {
    const wrapper = mount(ConfettiBurst)
    const particles = wrapper.findAll('[data-testid="confetti-particle"]')
    expect(particles).toHaveLength(12)
  })

  it('each particle has animation-related styles', () => {
    const wrapper = mount(ConfettiBurst)
    const particles = wrapper.findAll('[data-testid="confetti-particle"]')
    for (const particle of particles) {
      const style = particle.attributes('style') ?? ''
      expect(style).toContain('--angle')
    }
  })
})
