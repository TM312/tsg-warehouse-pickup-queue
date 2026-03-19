import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ScenarioCard from '@/components/scenario/ScenarioCard.vue'
import { SCENARIOS, SCENARIO_ID } from '@/constants/scenarios'

beforeEach(() => {
  setActivePinia(createPinia())
})

const singleOrder = SCENARIOS.find(s => s.id === SCENARIO_ID.SINGLE_ORDER)!
const morningRush = SCENARIOS.find(s => s.id === SCENARIO_ID.MORNING_RUSH)!

function mountCard(props: Record<string, unknown> = {}) {
  return mount(ScenarioCard, {
    props: { scenario: singleOrder, disabled: false, active: false, ...props },
  })
}

describe('ScenarioCard', () => {
  it('renders the scenario label', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain(singleOrder.label)
  })

  it('renders the scenario description text', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain(singleOrder.description)
  })

  it('renders duration badge with "15s" for MORNING_RUSH', () => {
    const wrapper = mountCard({ scenario: morningRush })
    expect(wrapper.text()).toContain('15s')
  })

  it('renders duration badge with "Instant" for SINGLE_ORDER', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('Instant')
  })

  it('renders the scenario icon component', () => {
    const wrapper = mountCard()
    expect(wrapper.findComponent(singleOrder.icon).exists()).toBe(true)
  })

  it('emits run on click', async () => {
    const wrapper = mountCard()
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('run')).toHaveLength(1)
  })

  it('sets correct data-testid', () => {
    const wrapper = mountCard()
    expect(wrapper.find(`[data-testid="scenario-${singleOrder.id}"]`).exists()).toBe(true)
  })

  it('disables button when disabled and not active', () => {
    const wrapper = mountCard({ disabled: true, active: false })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('remains enabled when disabled but active (allows stopping)', () => {
    const wrapper = mountCard({ disabled: true, active: true })
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })

  it('applies pulse animation class when active', () => {
    const wrapper = mountCard({ active: true })
    expect(wrapper.find('button').classes()).toContain('scenario-card-pulse')
  })

  it('does not apply pulse animation class when inactive', () => {
    const wrapper = mountCard({ active: false })
    expect(wrapper.find('button').classes()).not.toContain('scenario-card-pulse')
  })
})
