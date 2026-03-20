import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErpFlowDiagram from '@/components/landing/ErpFlowDiagram.vue'
import {
  ERP_FLOW_TITLE,
  ERP_FLOW_LABEL_LEFT,
  ERP_FLOW_LABEL_RIGHT,
  ERP_FLOW_ARROW_TOP,
  ERP_FLOW_ARROW_BOTTOM,
} from '@/constants/erp'

describe('ErpFlowDiagram', () => {
  function factory() {
    return mount(ErpFlowDiagram)
  }

  it('renders with the correct data-testid', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="erp-flow-diagram"]').exists()).toBe(true)
  })

  it('has role="img" for accessibility', () => {
    const wrapper = factory()
    const svg = wrapper.find('svg')
    expect(svg.attributes('role')).toBe('img')
  })

  it('has an accessible title with aria-labelledby', () => {
    const wrapper = factory()
    const svg = wrapper.find('svg')
    const titleId = svg.attributes('aria-labelledby')
    expect(titleId).toBeTruthy()

    const title = wrapper.find(`#${titleId}`)
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe(ERP_FLOW_TITLE)
  })

  it('renders all flow diagram labels from constants', () => {
    const wrapper = factory()
    const text = wrapper.text()
    expect(text).toContain(ERP_FLOW_LABEL_LEFT)
    expect(text).toContain(ERP_FLOW_LABEL_RIGHT)
    expect(text).toContain(ERP_FLOW_ARROW_TOP)
    expect(text).toContain(ERP_FLOW_ARROW_BOTTOM)
  })
})
