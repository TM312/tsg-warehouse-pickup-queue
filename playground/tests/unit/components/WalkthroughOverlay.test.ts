import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import WalkthroughOverlay from '@/components/scenario/WalkthroughOverlay.vue'

const mockIsActive = ref(false)
const mockHighlightRect = ref({ x: 0, y: 0, width: 0, height: 0 })

vi.mock('@/composables/useGuidedWalkthrough', () => ({
  useGuidedWalkthrough: () => ({
    isActive: mockIsActive,
    highlightRect: mockHighlightRect,
  }),
}))

function mountOverlay() {
  return mount(WalkthroughOverlay, {
    global: {
      stubs: { Teleport: true },
    },
  })
}

describe('WalkthroughOverlay', () => {
  beforeEach(() => {
    mockIsActive.value = true
    mockHighlightRect.value = { x: 100, y: 200, width: 300, height: 50 }
  })

  afterEach(() => {
    mockIsActive.value = false
    mockHighlightRect.value = { x: 0, y: 0, width: 0, height: 0 }
  })

  it('renders glow div when hasCutout is true', () => {
    const wrapper = mountOverlay()
    const glow = wrapper.find('[data-testid="walkthrough-highlight-glow"]')
    expect(glow.exists()).toBe(true)
  })

  it('glow div position style matches cutout rect', () => {
    const wrapper = mountOverlay()
    const glow = wrapper.find('[data-testid="walkthrough-highlight-glow"]')
    const style = glow.attributes('style')

    // Cutout adds 8px padding on each side
    expect(style).toContain('left: 92px')
    expect(style).toContain('top: 192px')
    expect(style).toContain('width: 316px')
    expect(style).toContain('height: 66px')
  })

  it('glow div has transition and animation durations from constants', () => {
    const wrapper = mountOverlay()
    const glow = wrapper.find('[data-testid="walkthrough-highlight-glow"]')
    const style = glow.attributes('style')

    expect(style).toContain('transition-duration: 300ms')
    expect(style).toContain('animation-duration: 1500ms')
  })

  it('no glow div when rect is empty (0,0,0,0)', () => {
    mockHighlightRect.value = { x: 0, y: 0, width: 0, height: 0 }
    const wrapper = mountOverlay()
    const glow = wrapper.find('[data-testid="walkthrough-highlight-glow"]')
    expect(glow.exists()).toBe(false)
  })
})
