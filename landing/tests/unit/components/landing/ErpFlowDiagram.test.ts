import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErpFlowDiagram from '@/components/landing/ErpFlowDiagram.vue'

describe('ErpFlowDiagram', () => {
  function factory() {
    return mount(ErpFlowDiagram)
  }

  it('renders SVG with role="img"', () => {
    const wrapper = factory()
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.attributes('role')).toBe('img')
  })

  it('has aria-labelledby pointing to title element', () => {
    const wrapper = factory()
    const svg = wrapper.find('svg')
    const labelledBy = svg.attributes('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    const title = wrapper.find(`#${labelledBy}`)
    expect(title.exists()).toBe(true)
  })

  it('title element contains descriptive text', () => {
    const wrapper = factory()
    const title = wrapper.find('title')
    expect(title.text()).toContain('ERP')
    expect(title.text()).toContain('PickupQueue')
  })

  it('has data-testid="erp-flow-diagram"', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="erp-flow-diagram"]').exists()).toBe(true)
  })
})
