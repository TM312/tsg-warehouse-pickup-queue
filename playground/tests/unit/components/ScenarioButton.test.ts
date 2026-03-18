import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { defineComponent, h } from 'vue'
import { TooltipProvider } from '@/components/ui/tooltip'
import ScenarioButton from '@/components/scenario/ScenarioButton.vue'
import { SCENARIOS } from '@/constants/scenarios'

function mountWithProvider(props: Record<string, unknown>) {
  return mount(
    defineComponent({
      setup() {
        return () => h(TooltipProvider, () => h(ScenarioButton, props))
      },
    }),
  )
}

beforeEach(() => {
  setActivePinia(createPinia())
})

const scenario = SCENARIOS[0]

describe('ScenarioButton', () => {
  it('renders the scenario label', () => {
    const wrapper = mountWithProvider({ scenario, disabled: false, active: false })
    expect(wrapper.text()).toContain(scenario.label)
  })

  it('calls onRun handler when clicked', async () => {
    const onRun = vi.fn()
    const wrapper = mountWithProvider({ scenario, disabled: false, active: false, onRun })
    await wrapper.find('button').trigger('click')
    expect(onRun).toHaveBeenCalledTimes(1)
  })

  it('sets data-testid with scenario id', () => {
    const wrapper = mountWithProvider({ scenario, disabled: false, active: false })
    expect(wrapper.find(`[data-testid="scenario-${scenario.id}"]`).exists()).toBe(true)
  })

  it('disables button when disabled and not active', () => {
    const wrapper = mountWithProvider({ scenario, disabled: true, active: false })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('remains enabled when disabled but active (allows stopping)', () => {
    const wrapper = mountWithProvider({ scenario, disabled: true, active: true })
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })
})
