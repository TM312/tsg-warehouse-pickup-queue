import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import ScenarioBar from '@/components/scenario/ScenarioBar.vue'
import { SCENARIOS } from '@/constants/scenarios'
import { getScenarioDurationMs } from '@/utils/scenarioDuration'
import { formatDurationMs } from '@/utils/formatDuration'

vi.mock('@/composables/useSimulation', () => ({
  useSimulation: () => ({ toggle: vi.fn() }),
}))

const mockIsMuted = ref(false)
vi.mock('@/composables/useSimulationToasts', () => ({
  useSimulationToasts: () => ({
    isMuted: mockIsMuted,
    toggleMute: () => { mockIsMuted.value = !mockIsMuted.value },
  }),
}))

beforeEach(() => {
  setActivePinia(createPinia())
  mockIsMuted.value = false
})

describe('ScenarioBar', () => {
  it('renders a button for each scenario', () => {
    const wrapper = mount(ScenarioBar)
    for (const scenario of SCENARIOS) {
      expect(wrapper.find(`[data-testid="scenario-${scenario.id}"]`).exists()).toBe(true)
    }
  })

  it('renders play/pause button', () => {
    const wrapper = mount(ScenarioBar)
    expect(wrapper.find('[data-testid="sim-play-pause"]').exists()).toBe(true)
  })

  it('renders reset button', () => {
    const wrapper = mount(ScenarioBar)
    expect(wrapper.find('[data-testid="sim-reset"]').exists()).toBe(true)
  })

  it('renders speed control buttons', () => {
    const wrapper = mount(ScenarioBar)
    expect(wrapper.find('[data-testid="speed-control-1"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="speed-control-2"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="speed-control-5"]').exists()).toBe(true)
  })

  it('renders elapsed time display', () => {
    const wrapper = mount(ScenarioBar)
    const elapsed = wrapper.find('[data-testid="sim-elapsed-time"]')
    expect(elapsed.exists()).toBe(true)
    expect(elapsed.text()).toBe('00:00')
  })

  it('renders ScenarioProgressBar component', () => {
    const wrapper = mount(ScenarioBar)
    expect(wrapper.findComponent({ name: 'ScenarioProgressBar' }).exists()).toBe(true)
  })

  it('renders scenario descriptions in cards', () => {
    const wrapper = mount(ScenarioBar)
    for (const scenario of SCENARIOS) {
      expect(wrapper.text()).toContain(scenario.description)
    }
  })

  it('renders duration badges derived from scenario data', () => {
    const wrapper = mount(ScenarioBar)
    for (const scenario of SCENARIOS) {
      const ms = getScenarioDurationMs(scenario.steps)
      const expected = ms === 0 ? 'Instant' : formatDurationMs(ms)
      expect(wrapper.text()).toContain(expected)
    }
  })

  it('renders mute toggle button', () => {
    const wrapper = mount(ScenarioBar)
    expect(wrapper.find('[data-testid="toast-mute-toggle"]').exists()).toBe(true)
  })

  it('toggles icon on click', async () => {
    const wrapper = mount(ScenarioBar)
    const btn = wrapper.find('[data-testid="toast-mute-toggle"]')
    const htmlBefore = btn.html()

    await btn.trigger('click')
    await wrapper.vm.$nextTick()

    const htmlAfter = btn.html()
    expect(htmlAfter).not.toBe(htmlBefore)
  })
})
