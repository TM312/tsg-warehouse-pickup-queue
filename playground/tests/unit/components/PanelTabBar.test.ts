import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PanelTabBar from '@/components/layout/PanelTabBar.vue'
import { PANEL_DEFINITIONS, PANEL_ID } from '@/constants/panels'

function mountTabBar(modelValue = PANEL_ID.STAFF) {
  return mount(PanelTabBar, {
    props: { modelValue },
    global: {
      stubs: {
        // Stub lucide icons to simple inline elements
        Smartphone: { template: '<svg />' },
        ClipboardList: { template: '<svg />' },
        BarChart3: { template: '<svg />' },
      },
    },
  })
}

describe('PanelTabBar', () => {
  it('has data-testid="panel-tab-bar"', () => {
    const wrapper = mountTabBar()
    expect(wrapper.find('[data-testid="panel-tab-bar"]').exists()).toBe(true)
  })

  it('renders a tab trigger for each panel definition', () => {
    const wrapper = mountTabBar()
    for (const panel of PANEL_DEFINITIONS) {
      expect(wrapper.find(`[data-testid="panel-tab-${panel.id}"]`).exists()).toBe(true)
    }
  })

  it('renders panel labels', () => {
    const wrapper = mountTabBar()
    for (const panel of PANEL_DEFINITIONS) {
      expect(wrapper.text()).toContain(panel.label)
    }
  })
})
