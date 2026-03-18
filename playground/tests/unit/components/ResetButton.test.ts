import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { defineComponent, h } from 'vue'
import { TooltipProvider } from '@/components/ui/tooltip'
import ResetButton from '@/components/scenario/ResetButton.vue'
import { useSimulationStore } from '@/stores/simulation'
import { useQueueStore } from '@/stores/queue'
import { useGatesStore } from '@/stores/gates'
import { createPickupRequest } from '@/utils/factories'

function mountWithProvider(props: Record<string, unknown> = {}) {
  const wrapper = mount(
    defineComponent({
      setup() {
        return () => h(TooltipProvider, () => h(ResetButton, props))
      },
    }),
  )
  return wrapper
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('ResetButton', () => {
  it('renders the reset button', () => {
    const wrapper = mountWithProvider()
    expect(wrapper.find('[data-testid="sim-reset"]').exists()).toBe(true)
  })

  it('resets all stores when confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    const simulation = useSimulationStore()
    const queue = useQueueStore()
    const gates = useGatesStore()

    simulation.isRunning = true
    simulation.elapsedMs = 50_000
    queue.addRequest(createPickupRequest({ id: 'r1' }))
    gates.updateGate('gate-1', { is_active: false, queue_count: 3 })

    const wrapper = mountWithProvider()
    await wrapper.find('[data-testid="sim-reset"]').trigger('click')

    expect(simulation.isRunning).toBe(false)
    expect(simulation.elapsedMs).toBe(0)
    expect(queue.requests).toHaveLength(0)
    expect(gates.gates.every((g) => g.is_active && g.queue_count === 0)).toBe(true)
  })

  it('does not reset when confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({ id: 'r1' }))

    const wrapper = mountWithProvider()
    await wrapper.find('[data-testid="sim-reset"]').trigger('click')

    expect(queue.requests).toHaveLength(1)
  })

  it('calls onBeforeReset callback before resetting', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const onBeforeReset = vi.fn()

    const wrapper = mountWithProvider({ onBeforeReset })
    await wrapper.find('[data-testid="sim-reset"]').trigger('click')

    expect(onBeforeReset).toHaveBeenCalledTimes(1)
  })
})
