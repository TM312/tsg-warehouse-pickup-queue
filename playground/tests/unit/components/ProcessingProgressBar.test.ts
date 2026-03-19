import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProcessingProgressBar from '@/components/staff/ProcessingProgressBar.vue'

describe('ProcessingProgressBar', () => {
  it('renders 0% width for progress 0', () => {
    const wrapper = mount(ProcessingProgressBar, { props: { progress: 0 } })
    const fill = wrapper.find('.progress-fill')
    expect(fill.attributes('style')).toContain('width: 0%')
  })

  it('renders 50% width for progress 0.5', () => {
    const wrapper = mount(ProcessingProgressBar, { props: { progress: 0.5 } })
    const fill = wrapper.find('.progress-fill')
    expect(fill.attributes('style')).toContain('width: 50%')
  })

  it('renders 100% width for progress 1', () => {
    const wrapper = mount(ProcessingProgressBar, { props: { progress: 1 } })
    const fill = wrapper.find('.progress-fill')
    expect(fill.attributes('style')).toContain('width: 100%')
  })

  it('clamps progress > 1 to 100%', () => {
    const wrapper = mount(ProcessingProgressBar, { props: { progress: 1.5 } })
    const fill = wrapper.find('.progress-fill')
    expect(fill.attributes('style')).toContain('width: 100%')
  })

  it('clamps negative progress to 0%', () => {
    const wrapper = mount(ProcessingProgressBar, { props: { progress: -0.5 } })
    const fill = wrapper.find('.progress-fill')
    expect(fill.attributes('style')).toContain('width: 0%')
  })

  it('has role="progressbar" with correct ARIA attributes', () => {
    const wrapper = mount(ProcessingProgressBar, { props: { progress: 0.5 } })
    const bar = wrapper.find('[role="progressbar"]')
    expect(bar.exists()).toBe(true)
    expect(bar.attributes('aria-valuenow')).toBe('50')
    expect(bar.attributes('aria-valuemin')).toBe('0')
    expect(bar.attributes('aria-valuemax')).toBe('100')
  })

  it('has data-testid', () => {
    const wrapper = mount(ProcessingProgressBar, { props: { progress: 0 } })
    expect(wrapper.find('[data-testid="processing-progress-bar"]').exists()).toBe(true)
  })
})
