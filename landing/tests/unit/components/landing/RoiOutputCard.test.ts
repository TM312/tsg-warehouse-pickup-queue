import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RoiOutputCard from '@/components/landing/RoiOutputCard.vue'

describe('RoiOutputCard', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const baseProps = {
    label: 'Test label',
    testId: 'test-output',
    highlighted: false,
  }

  function factory(overrides: Record<string, unknown> = {}) {
    return mount(RoiOutputCard, {
      props: { ...baseProps, ...overrides },
    })
  }

  it('renders the label text', () => {
    const wrapper = factory({ value: 100, format: 'minutes' })
    expect(wrapper.text()).toContain('Test label')
  })

  it('renders with the provided testId', () => {
    const wrapper = factory({ value: 100, format: 'minutes' })
    expect(wrapper.find('[data-testid="test-output"]').exists()).toBe(true)
  })

  it('formats minutes correctly', () => {
    const wrapper = factory({ value: 150, format: 'minutes' })
    expect(wrapper.text()).toContain('150 minutes')
  })

  it('formats currency correctly', () => {
    const wrapper = factory({ value: 1650, format: 'currency' })
    expect(wrapper.text()).toContain('$1,650')
  })

  it('formats multiplier correctly', () => {
    const wrapper = factory({ value: 4.7, format: 'multiplier' })
    expect(wrapper.text()).toContain('4.7x')
  })

  it('formats text values as-is', () => {
    const wrapper = factory({ value: 'Under 1 week', format: 'text' })
    expect(wrapper.text()).toContain('Under 1 week')
  })

  it('applies highlighted styling when highlighted is true', () => {
    const wrapper = factory({ value: 4.7, format: 'multiplier', highlighted: true })
    const container = wrapper.find('[data-testid="test-output"]')
    expect(container.classes()).toContain('bg-primary/5')
  })

  it('does not apply highlighted styling when highlighted is false', () => {
    const wrapper = factory({ value: 100, format: 'minutes', highlighted: false })
    const container = wrapper.find('[data-testid="test-output"]')
    expect(container.classes()).not.toContain('bg-primary/5')
  })
})
