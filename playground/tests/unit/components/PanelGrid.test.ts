import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import PanelGrid from '@/components/layout/PanelGrid.vue'

// Mock useMediaQuery to control breakpoints
const mockDesktop = ref(true)
const mockMobile = ref(false)

vi.mock('@vueuse/core', () => ({
  useMediaQuery: (query: string) => {
    if (query.includes('min-width')) return mockDesktop
    if (query.includes('max-width')) return mockMobile
    return ref(false)
  },
}))

// Stub child components
const stubs = {
  LayoutPhoneFrame: {
    template: '<div data-testid="phone-frame"><slot /></div>',
  },
  LayoutPanelTabBar: {
    template: '<div data-testid="panel-tab-bar"></div>',
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
}

function setBreakpoint(bp: 'desktop' | 'tablet' | 'mobile') {
  mockDesktop.value = bp === 'desktop'
  mockMobile.value = bp === 'mobile'
}

function mountGrid() {
  return mount(PanelGrid, {
    global: { stubs },
    slots: {
      customer: '<div>Customer content</div>',
      staff: '<div>Staff content</div>',
      analytics: '<div>Analytics content</div>',
    },
  })
}

describe('PanelGrid', () => {
  beforeEach(() => {
    setBreakpoint('desktop')
  })

  it('desktop: all 3 panel columns present', () => {
    const wrapper = mountGrid()
    expect(wrapper.find('[data-testid="panel-col-customer"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="panel-col-staff"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="panel-col-analytics"]').exists()).toBe(true)
  })

  it('desktop: phone-frame wraps customer slot', () => {
    const wrapper = mountGrid()
    expect(wrapper.find('[data-testid="phone-frame"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="phone-frame"]').text()).toContain('Customer content')
  })

  it('desktop: no tab bar', () => {
    const wrapper = mountGrid()
    expect(wrapper.find('[data-testid="panel-tab-bar"]').exists()).toBe(false)
  })

  it('mobile: only active panel column present', async () => {
    setBreakpoint('mobile')
    const wrapper = mountGrid()

    // Default active panel is 'staff'
    expect(wrapper.find('[data-testid="panel-col-staff"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="panel-col-customer"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="panel-col-analytics"]').exists()).toBe(false)
  })

  it('mobile: tab bar rendered', () => {
    setBreakpoint('mobile')
    const wrapper = mountGrid()
    expect(wrapper.find('[data-testid="panel-tab-bar"]').exists()).toBe(true)
  })

  it('mobile: no phone-frame', () => {
    setBreakpoint('mobile')
    const wrapper = mountGrid()
    expect(wrapper.find('[data-testid="phone-frame"]').exists()).toBe(false)
  })

  it('tablet: staff + analytics visible, no tab bar', () => {
    setBreakpoint('tablet')
    const wrapper = mountGrid()
    expect(wrapper.find('[data-testid="panel-col-staff"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="panel-col-analytics"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="panel-tab-bar"]').exists()).toBe(false)
  })

  it('has data-testid="panel-grid"', () => {
    const wrapper = mountGrid()
    expect(wrapper.find('[data-testid="panel-grid"]').exists()).toBe(true)
  })
})
