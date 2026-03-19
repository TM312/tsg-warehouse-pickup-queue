import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { nextTick, effectScope, type EffectScope } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useQueueHistory } from '@/composables/useQueueHistory'
import { useSimulationStore } from '@/stores/simulation'
import { useGatesStore } from '@/stores/gates'
import { QUEUE_HISTORY } from '@/constants/chart'

describe('useQueueHistory', () => {
  let scope: EffectScope

  beforeEach(() => {
    setActivePinia(createPinia())
    scope = effectScope()
    // Reset singleton state from previous tests
    scope.run(() => {
      const { reset } = useQueueHistory()
      reset()
    })
    scope.stop()
    scope = effectScope()
  })

  afterEach(() => {
    scope.stop()
  })

  function setup() {
    let result!: ReturnType<typeof useQueueHistory>
    scope.run(() => {
      result = useQueueHistory()
    })
    return result
  }

  function setupWithGates() {
    const gates = useGatesStore()
    gates.setGates([
      { id: 'g1', gate_number: 1, is_active: true, queue_count: 2 },
      { id: 'g2', gate_number: 2, is_active: true, queue_count: 3 },
      { id: 'g3', gate_number: 3, is_active: true, queue_count: 0 },
    ])
    return setup()
  }

  it('records initial point when simulation starts running', async () => {
    const { history } = setupWithGates()
    const simulation = useSimulationStore()

    expect(history.value).toHaveLength(0)

    simulation.isRunning = true
    await nextTick()

    expect(history.value).toHaveLength(1)
    expect(history.value[0].timeMs).toBe(0)
    expect(history.value[0].counts).toEqual({ g1: 2, g2: 3, g3: 0 })
  })

  it('does not record between sample intervals', async () => {
    const { history } = setupWithGates()
    const simulation = useSimulationStore()

    simulation.isRunning = true
    await nextTick()
    expect(history.value).toHaveLength(1)

    // Advance less than SAMPLE_INTERVAL_MS
    simulation.elapsedMs = QUEUE_HISTORY.SAMPLE_INTERVAL_MS - 1
    await nextTick()

    expect(history.value).toHaveLength(1)
  })

  it('does not record when simulation is not running', async () => {
    const { history } = setupWithGates()
    const simulation = useSimulationStore()

    // Start and record t=0
    simulation.isRunning = true
    await nextTick()
    expect(history.value).toHaveLength(1)

    // Stop simulation, then advance time past interval
    simulation.isRunning = false
    await nextTick()
    simulation.elapsedMs = QUEUE_HISTORY.SAMPLE_INTERVAL_MS * 2
    await nextTick()

    expect(history.value).toHaveLength(1)
  })

  it('records point when sample interval is reached', async () => {
    const { history } = setupWithGates()
    const simulation = useSimulationStore()

    simulation.isRunning = true
    await nextTick()

    simulation.elapsedMs = QUEUE_HISTORY.SAMPLE_INTERVAL_MS
    await nextTick()

    expect(history.value).toHaveLength(2)
    expect(history.value[1].timeMs).toBe(QUEUE_HISTORY.SAMPLE_INTERVAL_MS)
  })

  it('captures correct per-gate counts', async () => {
    const { history } = setupWithGates()
    const simulation = useSimulationStore()
    const gates = useGatesStore()

    simulation.isRunning = true
    await nextTick()

    // Change queue counts before next sample
    gates.updateGate('g1', { queue_count: 5 })
    gates.updateGate('g2', { queue_count: 1 })
    await nextTick()

    simulation.elapsedMs = QUEUE_HISTORY.SAMPLE_INTERVAL_MS
    await nextTick()

    expect(history.value[1].counts).toEqual({ g1: 5, g2: 1, g3: 0 })
  })

  it('respects MAX_POINTS cap', async () => {
    const { history } = setupWithGates()
    const simulation = useSimulationStore()

    simulation.isRunning = true
    await nextTick()

    // Fill beyond MAX_POINTS
    for (let i = 1; i <= QUEUE_HISTORY.MAX_POINTS + 10; i++) {
      simulation.elapsedMs = i * QUEUE_HISTORY.SAMPLE_INTERVAL_MS
      await nextTick()
    }

    expect(history.value.length).toBeLessThanOrEqual(QUEUE_HISTORY.MAX_POINTS)
  })

  it('reset() clears all history', async () => {
    const { history, reset } = setupWithGates()
    const simulation = useSimulationStore()

    simulation.isRunning = true
    await nextTick()

    simulation.elapsedMs = QUEUE_HISTORY.SAMPLE_INTERVAL_MS
    await nextTick()
    expect(history.value.length).toBeGreaterThan(0)

    reset()
    expect(history.value).toHaveLength(0)

    // Can record again after reset
    simulation.isRunning = false
    await nextTick()
    simulation.elapsedMs = 0
    simulation.isRunning = true
    await nextTick()

    expect(history.value).toHaveLength(1)
  })

  it('handles gate becoming inactive between samples', async () => {
    const { history } = setupWithGates()
    const simulation = useSimulationStore()
    const gates = useGatesStore()

    simulation.isRunning = true
    await nextTick()

    // Deactivate g3
    gates.updateGate('g3', { is_active: false })

    simulation.elapsedMs = QUEUE_HISTORY.SAMPLE_INTERVAL_MS
    await nextTick()

    // Second point should only have active gates
    expect(history.value[1].counts).not.toHaveProperty('g3')
    expect(history.value[1].counts).toHaveProperty('g1')
    expect(history.value[1].counts).toHaveProperty('g2')
  })

  it('derives gateLabels from gate store', async () => {
    const { gateLabels } = setupWithGates()
    const simulation = useSimulationStore()

    simulation.isRunning = true
    await nextTick()

    expect(gateLabels.value).toEqual({
      g1: 'Gate 1',
      g2: 'Gate 2',
      g3: 'Gate 3',
    })
  })

  it('falls back to raw id for unknown gate in gateLabels', async () => {
    const { history, gateLabels } = setup()
    const simulation = useSimulationStore()
    const gates = useGatesStore()

    gates.setGates([
      { id: 'g1', gate_number: 1, is_active: true, queue_count: 1 },
    ])

    simulation.isRunning = true
    await nextTick()

    // Manually inject a point with an unknown gate id
    history.value.push({ timeMs: 1000, counts: { g1: 1, unknown_gate: 2 } })
    await nextTick()

    expect(gateLabels.value.g1).toBe('Gate 1')
    expect(gateLabels.value.unknown_gate).toBe('unknown_gate')
  })
})
