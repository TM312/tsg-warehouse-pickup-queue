import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useSimulationStore } from '@/stores/simulation'
import { useQueueStore } from '@/stores/queue'
import { useSimulation } from '@/composables/useSimulation'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'
import { DEFAULT_PROCESSING_DURATION_MS } from '@/constants/defaults'

// Mock onUnmounted since we're not in a component context
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return { ...actual, onUnmounted: vi.fn() }
})

describe('useSimulation', () => {
  let simulation: ReturnType<typeof useSimulationStore>
  let queue: ReturnType<typeof useQueueStore>

  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    simulation = useSimulationStore()
    queue = useQueueStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('start sets isRunning to true and ticks', () => {
    const { start, stop } = useSimulation()
    start()
    expect(simulation.isRunning).toBe(true)
    vi.advanceTimersByTime(1000)
    expect(simulation.elapsedMs).toBe(1000)
    stop()
  })

  it('stop sets isRunning to false and stops ticking', () => {
    const { start, stop } = useSimulation()
    start()
    stop()
    expect(simulation.isRunning).toBe(false)
    const elapsed = simulation.elapsedMs
    vi.advanceTimersByTime(2000)
    expect(simulation.elapsedMs).toBe(elapsed)
  })

  it('toggle alternates running state', () => {
    const { toggle } = useSimulation()
    toggle()
    expect(simulation.isRunning).toBe(true)
    toggle()
    expect(simulation.isRunning).toBe(false)
  })

  it('ticks at 2x speed', () => {
    simulation.setSpeed(2)
    const { start, stop } = useSimulation()
    start()
    vi.advanceTimersByTime(500) // interval = 1000/2 = 500ms
    expect(simulation.elapsedMs).toBe(2000) // 1000 * 2 speed
    stop()
  })

  it('ticks at 5x speed', () => {
    simulation.setSpeed(5)
    const { start, stop } = useSimulation()
    start()
    vi.advanceTimersByTime(200) // interval = 1000/5 = 200ms
    expect(simulation.elapsedMs).toBe(5000) // 1000 * 5 speed
    stop()
  })

  it('start is idempotent', () => {
    const { start, stop } = useSimulation()
    start()
    start()
    vi.advanceTimersByTime(1000)
    // Should only tick once (not double interval)
    expect(simulation.elapsedMs).toBe(1000)
    stop()
  })

  it('auto-complete fires after threshold in simulation time', () => {
    // Simulate that processing started at sim time 0, and elapsedMs is already past threshold
    simulation.elapsedMs = DEFAULT_PROCESSING_DURATION_MS - 500
    queue.addRequest(
      createPickupRequest({
        id: 'r1',
        status: PICKUP_STATUS.PROCESSING,
        gate_id: 'gate-1',
        processing_started_at: new Date().toISOString(),
        processing_started_sim_ms: 0,
      }),
    )
    const { start, stop } = useSimulation()
    start()
    // One tick at 1x adds 1000ms to elapsedMs → total = threshold + 500 → completes
    vi.advanceTimersByTime(1000)
    expect(queue.requestById('r1')?.status).toBe(PICKUP_STATUS.COMPLETED)
    stop()
  })

  it('auto-complete respects speed for simulation time accumulation', () => {
    simulation.setSpeed(5)
    // At 5x speed, each tick adds 1000*5 = 5000 sim ms
    // Need DEFAULT_PROCESSING_DURATION_MS (120000) of sim time to elapse
    // 120000 / 5000 = 24 ticks, interval = 200ms → 4800ms real time
    queue.addRequest(
      createPickupRequest({
        id: 'r1',
        status: PICKUP_STATUS.PROCESSING,
        gate_id: 'gate-1',
        processing_started_at: new Date().toISOString(),
        processing_started_sim_ms: 0,
      }),
    )
    const { start, stop } = useSimulation()
    start()
    // 23 ticks: 23 * 5000 = 115000 sim ms — not enough
    vi.advanceTimersByTime(4600)
    expect(queue.requestById('r1')?.status).toBe(PICKUP_STATUS.PROCESSING)
    // 1 more tick: 24 * 5000 = 120000 sim ms — threshold met
    vi.advanceTimersByTime(200)
    expect(queue.requestById('r1')?.status).toBe(PICKUP_STATUS.COMPLETED)
    stop()
  })

  it('auto-complete is not affected by pause/resume', () => {
    queue.addRequest(
      createPickupRequest({
        id: 'r1',
        status: PICKUP_STATUS.PROCESSING,
        gate_id: 'gate-1',
        processing_started_at: new Date().toISOString(),
        processing_started_sim_ms: 0,
      }),
    )
    const { start, stop } = useSimulation()
    start()
    // Advance halfway through processing (60 ticks at 1x = 60000 sim ms)
    vi.advanceTimersByTime(60_000)
    expect(simulation.elapsedMs).toBe(60_000)
    expect(queue.requestById('r1')?.status).toBe(PICKUP_STATUS.PROCESSING)

    // Pause the simulation
    stop()
    // Wall-clock time passes, but sim time does not
    vi.advanceTimersByTime(300_000)
    expect(simulation.elapsedMs).toBe(60_000) // unchanged

    // Resume — item should NOT auto-complete yet
    start()
    vi.advanceTimersByTime(1000) // 1 tick → 61000 sim ms
    expect(queue.requestById('r1')?.status).toBe(PICKUP_STATUS.PROCESSING)

    // Advance remaining sim time (59 more ticks → 120000 total)
    vi.advanceTimersByTime(59_000)
    expect(queue.requestById('r1')?.status).toBe(PICKUP_STATUS.COMPLETED)
    stop()
  })

  it('adjusts tick rate when speed changes while running', async () => {
    const { start, stop } = useSimulation()
    start()
    // At 1x: interval = 1000ms, tick adds 1000 * 1 = 1000ms
    vi.advanceTimersByTime(1000)
    expect(simulation.elapsedMs).toBe(1000)

    // Change speed to 5x while running — watcher should restart interval
    simulation.setSpeed(5)
    // Flush the Vue watch effect
    await nextTick()

    // Isolate the new speed's effect
    const elapsedBefore = simulation.elapsedMs
    // At 5x: interval = 200ms, tick adds 1000 * 5 = 5000ms per tick
    vi.advanceTimersByTime(200)
    expect(simulation.elapsedMs - elapsedBefore).toBe(5000)
    stop()
  })

  it('auto-complete skips when disabled', () => {
    simulation.autoProcessEnabled = false
    simulation.elapsedMs = DEFAULT_PROCESSING_DURATION_MS
    queue.addRequest(
      createPickupRequest({
        id: 'r1',
        status: PICKUP_STATUS.PROCESSING,
        gate_id: 'gate-1',
        processing_started_at: new Date().toISOString(),
        processing_started_sim_ms: 0,
      }),
    )
    const { start, stop } = useSimulation()
    start()
    vi.advanceTimersByTime(1000)
    expect(queue.requestById('r1')?.status).toBe(PICKUP_STATUS.PROCESSING)
    stop()
  })
})
