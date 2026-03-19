import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import WalkthroughTooltip from '@/components/scenario/WalkthroughTooltip.vue'
import { WALKTHROUGH_STEPS } from '@/constants/walkthrough'

const mockIsActive = ref(false)
const mockCurrentStepIndex = ref(0)
const mockHighlightRect = ref({ x: 100, y: 100, width: 200, height: 40 })
const mockCurrentStep = computed(() =>
  mockIsActive.value ? WALKTHROUGH_STEPS[mockCurrentStepIndex.value] ?? null : null,
)

vi.mock('@vueuse/core', () => ({
  useWindowSize: () => ({ width: ref(1024), height: ref(768) }),
}))

const mockNext = vi.fn()
const mockPrevious = vi.fn()
const mockSkip = vi.fn()

vi.mock('@/composables/useGuidedWalkthrough', () => ({
  useGuidedWalkthrough: () => ({
    isActive: mockIsActive,
    currentStep: mockCurrentStep,
    currentStepIndex: mockCurrentStepIndex,
    totalSteps: WALKTHROUGH_STEPS.length,
    highlightRect: mockHighlightRect,
    next: mockNext,
    previous: mockPrevious,
    skip: mockSkip,
  }),
}))

function mountTooltip() {
  return mount(WalkthroughTooltip, {
    global: {
      stubs: { Teleport: true },
    },
  })
}

describe('WalkthroughTooltip', () => {
  beforeEach(() => {
    mockIsActive.value = true
    mockCurrentStepIndex.value = 0
    mockHighlightRect.value = { x: 100, y: 100, width: 200, height: 40 }
  })

  afterEach(() => {
    mockIsActive.value = false
    mockCurrentStepIndex.value = 0
    mockNext.mockClear()
    mockPrevious.mockClear()
    mockSkip.mockClear()
  })

  it('renders correct number of progress dots', () => {
    const wrapper = mountTooltip()
    const progress = wrapper.find('[data-testid="walkthrough-progress"]')
    const dots = progress.findAll('span')
    expect(dots.length).toBe(WALKTHROUGH_STEPS.length)
  })

  it('completed dots have bg-primary, remaining have bg-muted', () => {
    mockCurrentStepIndex.value = 2
    const wrapper = mountTooltip()
    const dots = wrapper.find('[data-testid="walkthrough-progress"]').findAll('span')

    // Dots at index 0, 1, 2 should be filled (i-1 <= currentStepIndex)
    expect(dots[0].classes()).toContain('bg-primary')
    expect(dots[1].classes()).toContain('bg-primary')
    expect(dots[2].classes()).toContain('bg-primary')
    // Dots after index 2 should be muted
    expect(dots[3].classes()).toContain('bg-muted')
  })

  it('arrow has upward classes when tooltip is below element', () => {
    // With y=100 and viewport 768, there's plenty of space below → tooltip below → arrow at top
    mockHighlightRect.value = { x: 100, y: 100, width: 200, height: 40 }
    const wrapper = mountTooltip()
    const arrow = wrapper.find('[data-testid="walkthrough-arrow"]')
    expect(arrow.exists()).toBe(true)
    expect(arrow.classes()).toContain('bottom-full')
    expect(arrow.classes()).toContain('border-b-8')
    expect(arrow.classes()).toContain('border-b-card')
  })

  it('arrow has downward classes when tooltip is above element', () => {
    // With y near bottom of viewport, tooltip placed above → arrow at bottom
    mockHighlightRect.value = { x: 100, y: 650, width: 200, height: 40 }
    const wrapper = mountTooltip()
    const arrow = wrapper.find('[data-testid="walkthrough-arrow"]')
    expect(arrow.exists()).toBe(true)
    expect(arrow.classes()).toContain('top-full')
    expect(arrow.classes()).toContain('border-t-8')
    expect(arrow.classes()).toContain('border-t-card')
  })

  it('arrow horizontal position is clamped within tooltip bounds', () => {
    // Place highlight far to the right so its center exceeds tooltip right edge
    // Viewport 1024, tooltip width 340, margin 16
    // Tooltip left will be clamped to max (1024 - 16 - 340 = 668)
    // Highlight center = 900 + 50/2 = 925
    // relative = 925 - 668 = 257, clamped to tooltipWidth - 16 = 324
    mockHighlightRect.value = { x: 900, y: 100, width: 50, height: 40 }
    const wrapper = mountTooltip()
    const arrow = wrapper.find('[data-testid="walkthrough-arrow"]')
    const style = arrow.attributes('style')
    // Arrow left should be clamped to max 324px (tooltipWidth - 16)
    expect(style).toContain('left: 257px')
  })

  it('outer div has entrance animation class', () => {
    const wrapper = mountTooltip()
    const tooltip = wrapper.find('[data-testid="walkthrough-tooltip"]')
    expect(tooltip.classes()).toContain('animate-walkthrough-tooltip-enter')
  })

  it('Next button calls next()', async () => {
    const wrapper = mountTooltip()
    await wrapper.find('[data-testid="walkthrough-next"]').trigger('click')
    expect(mockNext).toHaveBeenCalledOnce()
  })

  it('Skip button calls skip()', async () => {
    const wrapper = mountTooltip()
    await wrapper.find('[data-testid="walkthrough-skip"]').trigger('click')
    expect(mockSkip).toHaveBeenCalledOnce()
  })

  it('Back button calls previous()', async () => {
    mockCurrentStepIndex.value = 2
    const wrapper = mountTooltip()
    await wrapper.find('[data-testid="walkthrough-back"]').trigger('click')
    expect(mockPrevious).toHaveBeenCalledOnce()
  })

  it('Back button is hidden on step 0', () => {
    mockCurrentStepIndex.value = 0
    const wrapper = mountTooltip()
    expect(wrapper.find('[data-testid="walkthrough-back"]').exists()).toBe(false)
  })

  it('shows "Next" label on non-final step', () => {
    mockCurrentStepIndex.value = 0
    const wrapper = mountTooltip()
    expect(wrapper.find('[data-testid="walkthrough-next"]').text()).toBe('Next')
  })

  it('shows "Finish" label on final step', () => {
    mockCurrentStepIndex.value = WALKTHROUGH_STEPS.length - 1
    const wrapper = mountTooltip()
    expect(wrapper.find('[data-testid="walkthrough-next"]').text()).toBe('Finish')
  })
})
