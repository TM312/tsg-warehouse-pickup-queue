import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ScenarioProgressBar from '@/components/scenario/ScenarioProgressBar.vue'
import type { ScenarioStep } from '@/types/scenario'

function createSteps(delays: number[]): ScenarioStep[] {
  return delays.map((delayMs) => ({
    delayMs,
    action: () => {},
  }))
}

describe('ScenarioProgressBar', () => {
  it('renders when visible is true', () => {
    const wrapper = mount(ScenarioProgressBar, {
      props: { currentStep: 0, totalSteps: 3, steps: createSteps([0, 1000, 2000]), visible: true },
    })
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
  })

  it('does not render when visible is false', () => {
    const wrapper = mount(ScenarioProgressBar, {
      props: { currentStep: 0, totalSteps: 3, steps: createSteps([0, 1000, 2000]), visible: false },
    })
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(false)
  })

  it('fill bar width matches currentStep/totalSteps percentage', () => {
    const wrapper = mount(ScenarioProgressBar, {
      props: { currentStep: 2, totalSteps: 4, steps: createSteps([0, 1000, 2000, 3000]), visible: true },
    })
    const fill = wrapper.find('[role="progressbar"]')
    expect(fill.attributes('style')).toContain('width: 50%')
  })

  it('excludes markers at 0% and renders only boundary markers', () => {
    const steps = createSteps([0, 3000, 5000, 8000])
    // cumulative: [0, 0, 3000, 8000], total = 16000
    // After filtering c > 0: [3000, 8000] → 2 markers
    const wrapper = mount(ScenarioProgressBar, {
      props: { currentStep: 0, totalSteps: 4, steps, visible: true },
    })
    const markers = wrapper.findAll('.bg-foreground\\/30')
    expect(markers).toHaveLength(2)
  })

  it('computes marker positions from cumulative delays', () => {
    const steps = createSteps([0, 3000, 5000, 8000])
    // cumulative: [0, 0, 3000, 8000], total = 16000
    // After filtering c > 0: 3000/16000=18.75%, 8000/16000=50%
    const wrapper = mount(ScenarioProgressBar, {
      props: { currentStep: 0, totalSteps: 4, steps, visible: true },
    })
    const markers = wrapper.findAll('.bg-foreground\\/30')
    expect(markers[0].attributes('style')).toContain('left: 18.75%')
    expect(markers[1].attributes('style')).toContain('left: 50%')
  })

  it('has correct aria attributes', () => {
    const wrapper = mount(ScenarioProgressBar, {
      props: { currentStep: 2, totalSteps: 5, steps: createSteps([0, 1000, 2000, 3000, 4000]), visible: true },
    })
    const fill = wrapper.find('[role="progressbar"]')
    expect(fill.attributes('aria-valuenow')).toBe('2')
    expect(fill.attributes('aria-valuemin')).toBe('0')
    expect(fill.attributes('aria-valuemax')).toBe('5')
  })

  it('handles zero totalSteps without division error', () => {
    const wrapper = mount(ScenarioProgressBar, {
      props: { currentStep: 0, totalSteps: 0, steps: [], visible: true },
    })
    const fill = wrapper.find('[role="progressbar"]')
    expect(fill.attributes('style')).toContain('width: 0%')
  })

  it('returns empty markers for single-step scenario', () => {
    const wrapper = mount(ScenarioProgressBar, {
      props: { currentStep: 0, totalSteps: 1, steps: createSteps([0]), visible: true },
    })
    const markers = wrapper.findAll('.bg-foreground\\/30')
    expect(markers).toHaveLength(0)
  })
})
