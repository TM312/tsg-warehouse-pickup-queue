import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { defineComponent, h } from 'vue'
import { TooltipProvider } from '@/components/ui/tooltip'
import SimulationSpeedControl from '@/components/scenario/SimulationSpeedControl.vue'
import { useSimulationStore } from '@/stores/simulation'
import { SIMULATION_SPEEDS } from '@/constants/defaults'

function mountWithProvider() {
  return mount(
    defineComponent({
      setup() {
        return () => h(TooltipProvider, () => h(SimulationSpeedControl))
      },
    }),
  )
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('SimulationSpeedControl', () => {
  it('renders a button for each speed option', () => {
    const wrapper = mountWithProvider()
    for (const speed of SIMULATION_SPEEDS) {
      const btn = wrapper.find(`[data-testid="speed-control-${speed}"]`)
      expect(btn.exists()).toBe(true)
      expect(btn.text()).toContain(`${speed}x`)
    }
  })

  it('updates simulation speed when a button is clicked', async () => {
    const simulation = useSimulationStore()
    const wrapper = mountWithProvider()

    await wrapper.find('[data-testid="speed-control-5"]').trigger('click')
    expect(simulation.speed).toBe(5)
  })

  it('defaults to speed 1', () => {
    const simulation = useSimulationStore()
    expect(simulation.speed).toBe(1)
  })
})
