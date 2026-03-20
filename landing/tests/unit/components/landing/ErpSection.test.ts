import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErpSection from '@/components/landing/ErpSection.vue'
import {
  ERP_SECTION_HEADING,
  ERP_SECTION_ID,
  ERP_SECTION_NOTE,
  ERP_BULLETS,
} from '@/constants/erp'
import { REVEAL_STAGGER_MS } from '@/constants/animation'

describe('ErpSection', () => {
  const stubs = {
    LandingErpBulletItem: { template: '<div data-testid="erp-bullet-item" />', props: ['bullet'] },
    LandingErpFlowDiagram: { template: '<div data-testid="erp-flow-diagram" />' },
  }

  function factory() {
    return mount(ErpSection, {
      global: { stubs },
    })
  }

  it('renders section heading from ERP_SECTION_HEADING', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="erp-heading"]').text()).toBe(ERP_SECTION_HEADING)
  })

  it(`section has id="${ERP_SECTION_ID}"`, () => {
    const wrapper = factory()
    expect(wrapper.find(`#${ERP_SECTION_ID}`).exists()).toBe(true)
  })

  it('renders 4 ErpBulletItem stubs', () => {
    const wrapper = factory()
    const bullets = wrapper.findAll('[data-testid="erp-bullet-item"]')
    expect(bullets).toHaveLength(ERP_BULLETS.length)
  })

  it('renders ErpFlowDiagram stub', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="erp-flow-diagram"]').exists()).toBe(true)
  })

  it('renders note text', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="erp-note"]').text()).toBe(ERP_SECTION_NOTE)
  })

  it('bullet wrappers have section-reveal class', () => {
    const wrapper = factory()
    const bullets = wrapper.findAll('[data-testid="erp-bullet-item"]')
    for (const bullet of bullets) {
      expect(bullet.element.parentElement?.classList.contains('section-reveal')).toBe(true)
    }
  })

  it('bullet wrappers receive staggered transitionDelay based on REVEAL_STAGGER_MS', () => {
    const wrapper = factory()
    const bullets = wrapper.findAll('[data-testid="erp-bullet-item"]')
    bullets.forEach((bullet, i) => {
      expect(bullet.element.parentElement?.style.transitionDelay).toBe(`${i * REVEAL_STAGGER_MS}ms`)
    })
  })
})
