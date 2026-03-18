import { describe, expect, it, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import { useQueueStore } from '@/stores/queue'
import { useGatesStore } from '@/stores/gates'
import { DEFAULT_GATES } from '@/constants/defaults'
import { createPickupRequest } from '@/utils/factories'

vi.mock('@vueuse/core', () => ({
  useMediaQuery: () => ref(true),
}))

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('PlaygroundHeader handleReset logic', () => {
  it('reset clears simulation store to initial state', () => {
    const simulation = useSimulationStore()
    simulation.isRunning = true
    simulation.elapsedMs = 50_000
    simulation.setSpeed(5)
    simulation.addEvent({ timestamp: Date.now(), label: 'test', type: 'submit' })

    simulation.reset()

    expect(simulation.isRunning).toBe(false)
    expect(simulation.elapsedMs).toBe(0)
    expect(simulation.speed).toBe(1)
    expect(simulation.activityFeed).toHaveLength(0)
    expect(simulation.autoProcessEnabled).toBe(true)
    expect(simulation.selectedCustomerRequestId).toBeNull()
  })

  it('reset clears all queue requests', () => {
    const queue = useQueueStore()
    queue.addRequest(createPickupRequest({ sales_order_number: 'SO-001' }))
    queue.addRequest(createPickupRequest({ sales_order_number: 'SO-002' }))
    expect(queue.requests).toHaveLength(2)

    queue.clear()

    expect(queue.requests).toHaveLength(0)
  })

  it('reset restores gates to defaults with zero queue counts', () => {
    const gates = useGatesStore()
    gates.updateGate('gate-1', { queue_count: 5 })
    gates.updateGate('gate-2', { queue_count: 3 })

    gates.setGates(DEFAULT_GATES.map((g) => ({ ...g, queue_count: 0 })))

    for (const gate of gates.gates) {
      expect(gate.queue_count).toBe(0)
      expect(gate.is_active).toBe(true)
    }
    expect(gates.gates).toHaveLength(DEFAULT_GATES.length)
  })

  it('full reset sequence leaves all stores in clean state', () => {
    const simulation = useSimulationStore()
    const queue = useQueueStore()
    const gates = useGatesStore()

    // Dirty all stores
    simulation.isRunning = true
    simulation.elapsedMs = 100_000
    simulation.addEvent({ timestamp: Date.now(), label: 'test', type: 'submit' })
    queue.addRequest(createPickupRequest({ sales_order_number: 'SO-001' }))
    gates.updateGate('gate-1', { queue_count: 3 })

    // Execute the same reset sequence as PlaygroundHeader.handleReset
    simulation.reset()
    queue.clear()
    gates.setGates(DEFAULT_GATES.map((g) => ({ ...g, queue_count: 0 })))

    expect(simulation.isRunning).toBe(false)
    expect(simulation.elapsedMs).toBe(0)
    expect(simulation.activityFeed).toHaveLength(0)
    expect(queue.requests).toHaveLength(0)
    expect(gates.gates.every((g) => g.queue_count === 0)).toBe(true)
  })
})
