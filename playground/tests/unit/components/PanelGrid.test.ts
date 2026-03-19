import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setBreakpoint, useMediaQueryMock } from '../../helpers/breakpoint-mock'
import PanelGrid from '@/components/layout/PanelGrid.vue'
import { RESPONSIVE } from '@/constants/responsive'

type ResizeCallback = (entries: Array<{ contentRect: { height: number } }>) => void
let resizeCallback: ResizeCallback | undefined

vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vueuse/core')>()
  return {
    ...actual,
    useMediaQuery: useMediaQueryMock,
    useResizeObserver: vi.fn((_target: unknown, cb: ResizeCallback) => {
      resizeCallback = cb
    }),
  }
})

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
    resizeCallback = undefined
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

  it('tablet: overlay container has overscroll-contain class', () => {
    setBreakpoint('tablet')
    const wrapper = mountGrid()
    const overlay = wrapper.find('[data-testid="panel-col-customer"]')
    expect(overlay.classes()).toContain('overscroll-contain')
  })

  it('mobile: content area has overscroll-contain class', () => {
    setBreakpoint('mobile')
    const wrapper = mountGrid()
    const contentArea = wrapper.find('.overflow-y-auto')
    expect(contentArea.classes()).toContain('overscroll-contain')
  })

  it('desktop: staff and analytics columns have overscroll-contain', () => {
    setBreakpoint('desktop')
    const wrapper = mountGrid()
    const staff = wrapper.find('[data-testid="panel-col-staff"]')
    const analytics = wrapper.find('[data-testid="panel-col-analytics"]')
    expect(staff.classes()).toContain('overscroll-contain')
    expect(analytics.classes()).toContain('overscroll-contain')
  })

  describe('tablet phoneScale (ResizeObserver)', () => {
    function getPhoneFrameScale(wrapper: ReturnType<typeof mount>) {
      const el = wrapper.find('[data-testid="phone-frame"]').element
      // Walk up from the stub to find the element with the inline transform style
      let current = el as HTMLElement | null
      while (current) {
        const style = current.getAttribute('style') ?? ''
        const match = style.match(/scale\(([^)]+)\)/)
        if (match) return Number(match[1])
        current = current.parentElement
      }
      return undefined
    }

    it('defaults to baseline scale before any resize event', () => {
      setBreakpoint('tablet')
      const wrapper = mountGrid()
      const expected = Math.min(
        1,
        (RESPONSIVE.PHONE_FRAME_BASELINE_PX * RESPONSIVE.PHONE_FRAME_SCALE_RATIO) / RESPONSIVE.PHONE_FRAME_BASELINE_PX,
      )
      expect(getPhoneFrameScale(wrapper)).toBeCloseTo(expected)
    })

    it('scales down when container is smaller than baseline', async () => {
      setBreakpoint('tablet')
      const wrapper = mountGrid()
      resizeCallback!([{ contentRect: { height: 400 } }])
      await wrapper.vm.$nextTick()
      const expected = (400 * RESPONSIVE.PHONE_FRAME_SCALE_RATIO) / RESPONSIVE.PHONE_FRAME_BASELINE_PX
      expect(getPhoneFrameScale(wrapper)).toBeCloseTo(expected)
    })

    it('caps scale at 1 for large containers', async () => {
      setBreakpoint('tablet')
      const wrapper = mountGrid()
      resizeCallback!([{ contentRect: { height: 2000 } }])
      await wrapper.vm.$nextTick()
      expect(getPhoneFrameScale(wrapper)).toBe(1)
    })

    it('ignores zero-height resize events (v-show hidden)', async () => {
      setBreakpoint('tablet')
      const wrapper = mountGrid()
      resizeCallback!([{ contentRect: { height: 500 } }])
      await wrapper.vm.$nextTick()
      const scaleAfterResize = getPhoneFrameScale(wrapper)!

      resizeCallback!([{ contentRect: { height: 0 } }])
      await wrapper.vm.$nextTick()
      expect(getPhoneFrameScale(wrapper)).toBe(scaleAfterResize)
    })

    it('recovers correct scale after zero-height then valid resize', async () => {
      setBreakpoint('tablet')
      const wrapper = mountGrid()
      resizeCallback!([{ contentRect: { height: 500 } }])
      await wrapper.vm.$nextTick()

      resizeCallback!([{ contentRect: { height: 0 } }])
      await wrapper.vm.$nextTick()

      resizeCallback!([{ contentRect: { height: 800 } }])
      await wrapper.vm.$nextTick()
      const expected = Math.min(1, (800 * RESPONSIVE.PHONE_FRAME_SCALE_RATIO) / RESPONSIVE.PHONE_FRAME_BASELINE_PX)
      expect(getPhoneFrameScale(wrapper)).toBeCloseTo(expected)
    })
  })
})
