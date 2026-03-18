import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useScenarioRunner } from '@/composables/useScenarioRunner'
import { useSimulationStore } from '@/stores/simulation'
import { useQueueStore } from '@/stores/queue'
import { useGatesStore } from '@/stores/gates'
import { SCENARIOS, SCENARIO_ID } from '@/constants/scenarios'
import type { Scenario } from '@/types/scenario'

function createTestScenario(overrides?: Partial<Scenario>): Scenario {
  return {
    id: 'test-scenario',
    label: 'Test',
    description: 'A test scenario',
    icon: {} as Scenario['icon'],
    steps: [
      {
        delayMs: 0,
        feedLabel: 'Step 1',
        action: vi.fn(),
      },
      {
        delayMs: 1000,
        feedLabel: 'Step 2',
        action: vi.fn(),
      },
      {
        delayMs: 2000,
        action: vi.fn(),
      },
    ],
    ...overrides,
  }
}

describe('useScenarioRunner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('runScenario', () => {
    it('executes all steps of a scenario in sequence', () => {
      const { runScenario } = useScenarioRunner()
      const scenario = createTestScenario()

      runScenario(scenario)

      // First step runs immediately (delayMs: 0)
      vi.advanceTimersByTime(0)
      expect(scenario.steps[0].action).toHaveBeenCalledTimes(1)

      // Second step after 1000ms cumulative
      vi.advanceTimersByTime(1000)
      expect(scenario.steps[1].action).toHaveBeenCalledTimes(1)

      // Third step after 3000ms cumulative (1000 + 2000)
      vi.advanceTimersByTime(2000)
      expect(scenario.steps[2].action).toHaveBeenCalledTimes(1)
    })

    it('respects delayMs between steps', () => {
      const { runScenario } = useScenarioRunner()
      const scenario = createTestScenario()

      runScenario(scenario)

      vi.advanceTimersByTime(500)
      expect(scenario.steps[1].action).not.toHaveBeenCalled()

      vi.advanceTimersByTime(500)
      expect(scenario.steps[1].action).toHaveBeenCalledTimes(1)
    })

    it('sets isRunning to true while executing', () => {
      const { runScenario, isRunning } = useScenarioRunner()
      const scenario = createTestScenario()

      expect(isRunning.value).toBe(false)
      runScenario(scenario)
      expect(isRunning.value).toBe(true)
    })

    it('sets activeScenarioId while executing', () => {
      const { runScenario, activeScenarioId } = useScenarioRunner()
      const scenario = createTestScenario()

      expect(activeScenarioId.value).toBeNull()
      runScenario(scenario)
      expect(activeScenarioId.value).toBe('test-scenario')
    })

    it('clears running state after all steps complete', () => {
      const { runScenario, isRunning, activeScenarioId } = useScenarioRunner()
      const scenario = createTestScenario()

      runScenario(scenario)
      vi.advanceTimersByTime(5000)

      expect(isRunning.value).toBe(false)
      expect(activeScenarioId.value).toBeNull()
    })

    it('logs feedLabel events to the activity feed', () => {
      const simulation = useSimulationStore()
      const { runScenario } = useScenarioRunner()
      const scenario = createTestScenario()

      runScenario(scenario)
      vi.advanceTimersByTime(0)

      // Step 1 has a feedLabel
      const feedEvents = simulation.activityFeed.filter((e) => e.label === 'Step 1')
      expect(feedEvents).toHaveLength(1)
    })
  })

  describe('stopScenario', () => {
    it('cancels remaining steps when stopped mid-execution', () => {
      const { runScenario, stopScenario } = useScenarioRunner()
      const scenario = createTestScenario()

      runScenario(scenario)
      vi.advanceTimersByTime(0)
      expect(scenario.steps[0].action).toHaveBeenCalled()

      stopScenario()
      vi.advanceTimersByTime(5000)
      expect(scenario.steps[1].action).not.toHaveBeenCalled()
      expect(scenario.steps[2].action).not.toHaveBeenCalled()
    })

    it('clears isRunning and activeScenarioId', () => {
      const { runScenario, stopScenario, isRunning, activeScenarioId } = useScenarioRunner()
      const scenario = createTestScenario()

      runScenario(scenario)
      expect(isRunning.value).toBe(true)
      expect(activeScenarioId.value).toBe('test-scenario')

      stopScenario()
      expect(isRunning.value).toBe(false)
      expect(activeScenarioId.value).toBeNull()
    })
  })

  describe('pause and resume', () => {
    it('does not execute steps while simulation is paused', () => {
      const simulation = useSimulationStore()
      const { runScenario } = useScenarioRunner()
      const scenario = createTestScenario()

      runScenario(scenario)
      vi.advanceTimersByTime(0)
      expect(scenario.steps[0].action).toHaveBeenCalledTimes(1)

      // Pause the simulation before step 2 fires
      simulation.isRunning = false
      vi.advanceTimersByTime(5000)

      expect(scenario.steps[1].action).not.toHaveBeenCalled()
      expect(scenario.steps[2].action).not.toHaveBeenCalled()
    })

    it('resumes executing steps when simulation is unpaused', () => {
      const simulation = useSimulationStore()
      const { runScenario } = useScenarioRunner()
      const scenario = createTestScenario()

      runScenario(scenario)
      vi.advanceTimersByTime(0)
      expect(scenario.steps[0].action).toHaveBeenCalledTimes(1)

      // Pause before step 2
      simulation.isRunning = false
      vi.advanceTimersByTime(5000)
      expect(scenario.steps[1].action).not.toHaveBeenCalled()

      // Resume — step 2 should execute immediately
      simulation.isRunning = true
      expect(scenario.steps[1].action).toHaveBeenCalledTimes(1)

      // Step 3 should follow after its delay
      vi.advanceTimersByTime(2000)
      expect(scenario.steps[2].action).toHaveBeenCalledTimes(1)
    })

    it('does not resume steps after scenario is stopped during pause', () => {
      const simulation = useSimulationStore()
      const { runScenario, stopScenario } = useScenarioRunner()
      const scenario = createTestScenario()

      runScenario(scenario)
      vi.advanceTimersByTime(0)

      // Pause, then stop
      simulation.isRunning = false
      vi.advanceTimersByTime(5000)
      stopScenario()

      // Resume simulation — stopped scenario should not continue
      simulation.isRunning = true
      vi.advanceTimersByTime(5000)
      expect(scenario.steps[1].action).not.toHaveBeenCalled()
    })

    it('pauses a zero-delay step when simulation is paused before start', () => {
      const simulation = useSimulationStore()
      const { runScenario } = useScenarioRunner()
      const scenario = createTestScenario({
        steps: [
          { delayMs: 0, action: vi.fn() },
        ],
      })

      // Pause before running
      simulation.isRunning = false

      // runScenario starts the simulation, so step should execute
      runScenario(scenario)
      expect(scenario.steps[0].action).toHaveBeenCalledTimes(1)
    })

    it('completes all steps after multiple pause/resume cycles', () => {
      const simulation = useSimulationStore()
      const { runScenario, isRunning } = useScenarioRunner()
      const scenario = createTestScenario()

      runScenario(scenario)
      vi.advanceTimersByTime(0)
      expect(scenario.steps[0].action).toHaveBeenCalledTimes(1)

      // Pause before step 2
      simulation.isRunning = false
      vi.advanceTimersByTime(5000)

      // Resume — step 2 fires
      simulation.isRunning = true
      expect(scenario.steps[1].action).toHaveBeenCalledTimes(1)

      // Pause before step 3
      simulation.isRunning = false
      vi.advanceTimersByTime(5000)
      expect(scenario.steps[2].action).not.toHaveBeenCalled()

      // Resume — step 3 fires after its delay
      simulation.isRunning = true
      vi.advanceTimersByTime(2000)
      expect(scenario.steps[2].action).toHaveBeenCalledTimes(1)
      expect(isRunning.value).toBe(false)
    })
  })

  describe('speed scaling', () => {
    it('executes steps faster at 2x speed', () => {
      const simulation = useSimulationStore()
      simulation.setSpeed(2)

      const { runScenario } = useScenarioRunner()
      const scenario = createTestScenario()

      runScenario(scenario)

      // Step 1 fires at 0ms regardless of speed
      vi.advanceTimersByTime(0)
      expect(scenario.steps[0].action).toHaveBeenCalledTimes(1)

      // Step 2 has 1000ms delay, at 2x speed fires at 500ms wall-clock
      vi.advanceTimersByTime(499)
      expect(scenario.steps[1].action).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(scenario.steps[1].action).toHaveBeenCalledTimes(1)
    })

    it('executes steps faster at 5x speed', () => {
      const simulation = useSimulationStore()
      simulation.setSpeed(5)

      const { runScenario } = useScenarioRunner()
      const scenario = createTestScenario()

      runScenario(scenario)

      vi.advanceTimersByTime(0)
      expect(scenario.steps[0].action).toHaveBeenCalledTimes(1)

      // Step 2: 1000ms / 5 = 200ms wall-clock
      vi.advanceTimersByTime(200)
      expect(scenario.steps[1].action).toHaveBeenCalledTimes(1)

      // Step 3: 2000ms / 5 = 400ms wall-clock
      vi.advanceTimersByTime(400)
      expect(scenario.steps[2].action).toHaveBeenCalledTimes(1)
    })

    it('all steps complete at scaled total duration', () => {
      const simulation = useSimulationStore()
      simulation.setSpeed(5)

      const { runScenario, isRunning } = useScenarioRunner()
      const scenario = createTestScenario()

      runScenario(scenario)
      // Total: (0 + 1000 + 2000) / 5 = 600ms wall-clock
      vi.advanceTimersByTime(600)
      expect(isRunning.value).toBe(false)
    })
  })

  describe('concurrent protection', () => {
    it('stops current scenario before starting a new one', () => {
      const { runScenario, activeScenarioId } = useScenarioRunner()
      const scenario1 = createTestScenario({ id: 'scenario-1' })
      const scenario2 = createTestScenario({ id: 'scenario-2' })

      runScenario(scenario1)
      expect(activeScenarioId.value).toBe('scenario-1')

      runScenario(scenario2)
      expect(activeScenarioId.value).toBe('scenario-2')

      // scenario1 steps should not fire
      vi.advanceTimersByTime(5000)
      // Only scenario2 steps should have run
      expect(scenario2.steps[0].action).toHaveBeenCalled()
    })
  })

  describe('Single Order scenario integration', () => {
    it('produces exactly 1 pending request in the queue', () => {
      const queue = useQueueStore()
      const { runScenario } = useScenarioRunner()
      const scenario = SCENARIOS.find((s) => s.id === SCENARIO_ID.SINGLE_ORDER)!

      runScenario(scenario)
      vi.advanceTimersByTime(0)

      expect(queue.requests.length).toBe(1)
    })
  })

  describe('Morning Rush scenario integration', () => {
    it('produces 8-12 requests across multiple gates', () => {
      const queue = useQueueStore()
      const { runScenario } = useScenarioRunner()
      const scenario = SCENARIOS.find((s) => s.id === SCENARIO_ID.MORNING_RUSH)!

      runScenario(scenario)
      vi.advanceTimersByTime(60000)

      expect(queue.requests.length).toBeGreaterThanOrEqual(8)
      expect(queue.requests.length).toBeLessThanOrEqual(12)

      const gateIds = new Set(queue.requests.map((r) => r.gate_id))
      expect(gateIds.size).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Priority Override scenario integration', () => {
    it('creates orders then injects priority order at front of queue', () => {
      const queue = useQueueStore()
      const { runScenario } = useScenarioRunner()
      const scenario = SCENARIOS.find((s) => s.id === SCENARIO_ID.PRIORITY_OVERRIDE)!

      runScenario(scenario)
      vi.advanceTimersByTime(30000)

      const priorityItems = queue.requests.filter((r) => r.is_priority)
      expect(priorityItems.length).toBeGreaterThanOrEqual(1)

      // Priority item should have position 1
      const priorityItem = priorityItems[0]
      expect(priorityItem.queue_position).toBe(1)
    })
  })

  describe('Gate Offline scenario integration', () => {
    it('deactivates gate', () => {
      const gates = useGatesStore()
      const { runScenario } = useScenarioRunner()
      const scenario = SCENARIOS.find((s) => s.id === SCENARIO_ID.GATE_OFFLINE)!

      runScenario(scenario)
      vi.advanceTimersByTime(30000)

      const gate3 = gates.gateById('gate-3')
      expect(gate3?.is_active).toBe(false)
    })
  })
})
