import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGuidedWalkthrough } from '@/composables/useGuidedWalkthrough'
import { useSimulationStore } from '@/stores/simulation'
import { useQueueStore } from '@/stores/queue'
import { WALKTHROUGH_STEPS } from '@/constants/walkthrough'
import { PICKUP_STATUS } from '@/constants/status'

vi.mock('@vueuse/core', () => ({
  useMediaQuery: vi.fn(() => ({ value: true })),
}))

describe('useGuidedWalkthrough', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
    // Reset walkthrough state between tests
    const { skip } = useGuidedWalkthrough()
    skip()
  })

  describe('initial state', () => {
    it('isActive is false', () => {
      const { isActive } = useGuidedWalkthrough()
      expect(isActive.value).toBe(false)
    })

    it('currentStepIndex is 0', () => {
      const { currentStepIndex } = useGuidedWalkthrough()
      expect(currentStepIndex.value).toBe(0)
    })

    it('currentStep is null when not active', () => {
      const { currentStep } = useGuidedWalkthrough()
      expect(currentStep.value).toBeNull()
    })
  })

  describe('start()', () => {
    it('sets isActive to true', () => {
      const { start, isActive } = useGuidedWalkthrough()
      start()
      expect(isActive.value).toBe(true)
    })

    it('resets simulation state', () => {
      const queue = useQueueStore()
      const simulation = useSimulationStore()

      // Add some state
      queue.addRequest({
        id: 'pre-existing',
        sales_order_number: 'OLD-001',
        company_name: 'Old Co',
        status: PICKUP_STATUS.PENDING,
        is_priority: false,
        gate_id: null,
        queue_position: null,
        processing_started_at: null,
        processing_started_sim_ms: null,
        completed_at: null,
        created_at: new Date().toISOString(),
      })

      const { start } = useGuidedWalkthrough()
      start()

      expect(simulation.elapsedMs).toBe(0)
    })

    it('starts the simulation', () => {
      const simulation = useSimulationStore()
      const { start } = useGuidedWalkthrough()

      start()
      expect(simulation.isRunning).toBe(true)
    })

    it('sets currentStep to the first step', () => {
      const { start, currentStep } = useGuidedWalkthrough()
      start()
      expect(currentStep.value).toBe(WALKTHROUGH_STEPS[0])
    })

    it('executes step 0 action after delayMs', () => {
      const queue = useQueueStore()
      const { start } = useGuidedWalkthrough()

      start()

      // Before delay, action hasn't fired yet
      expect(queue.requests.length).toBe(0)

      // After delayMs, the action creates a request
      vi.advanceTimersByTime(1200)
      expect(queue.requests.length).toBe(1)
      expect(queue.requests[0].sales_order_number).toBe('WT-0001')
    })
  })

  describe('next()', () => {
    it('increments the step index', () => {
      const { start, next, currentStepIndex } = useGuidedWalkthrough()
      start()

      next()
      expect(currentStepIndex.value).toBe(1)
    })

    it('updates currentStep', () => {
      const { start, next, currentStep } = useGuidedWalkthrough()
      start()

      next()
      expect(currentStep.value).toBe(WALKTHROUGH_STEPS[1])
    })

    it('executes action when step has one', () => {
      const queue = useQueueStore()
      const { start, next } = useGuidedWalkthrough()

      start()
      // Fire step 0 action
      vi.advanceTimersByTime(1200)
      expect(queue.requests.length).toBe(1)

      // Step 1 (staff-sees) has no action — just observation
      next()

      // Step 2 (assign-gate) has an action with delay
      next()
      vi.advanceTimersByTime(800)

      const request = queue.requests[0]
      expect(request.status).toBe(PICKUP_STATUS.IN_QUEUE)
      expect(request.gate_id).toBe('gate-1')
    })

    it('skips action for observation steps', () => {
      const queue = useQueueStore()
      const { start, next } = useGuidedWalkthrough()

      start()
      vi.advanceTimersByTime(1200)

      // Step 1 (staff-sees) — no action
      const requestsBefore = queue.requests.length
      next()
      expect(queue.requests.length).toBe(requestsBefore)
    })

    it('calls skip() on last step', () => {
      const { start, next, isActive, currentStepIndex } = useGuidedWalkthrough()
      start()

      // Navigate to last step
      for (let i = 0; i < WALKTHROUGH_STEPS.length - 1; i++) {
        next()
      }
      expect(currentStepIndex.value).toBe(WALKTHROUGH_STEPS.length - 1)

      // Next on last step should end the walkthrough
      next()
      expect(isActive.value).toBe(false)
    })
  })

  describe('previous()', () => {
    it('decrements the step index', () => {
      const { start, next, previous, currentStepIndex } = useGuidedWalkthrough()
      start()

      next()
      expect(currentStepIndex.value).toBe(1)

      previous()
      expect(currentStepIndex.value).toBe(0)
    })

    it('does not go below 0', () => {
      const { start, previous, currentStepIndex } = useGuidedWalkthrough()
      start()

      previous()
      expect(currentStepIndex.value).toBe(0)
    })

    it('does NOT re-execute action', () => {
      const queue = useQueueStore()
      const { start, next, previous } = useGuidedWalkthrough()

      start()
      vi.advanceTimersByTime(1200)
      expect(queue.requests.length).toBe(1)

      next()
      previous()

      // Should still only have 1 request — action not re-executed
      vi.advanceTimersByTime(2000)
      expect(queue.requests.length).toBe(1)
    })
  })

  describe('skip()', () => {
    it('sets isActive to false from any step', () => {
      const { start, next, skip, isActive } = useGuidedWalkthrough()
      start()
      next()
      next()

      skip()
      expect(isActive.value).toBe(false)
    })

    it('resets index to 0', () => {
      const { start, next, skip, currentStepIndex } = useGuidedWalkthrough()
      start()
      next()
      next()

      skip()
      expect(currentStepIndex.value).toBe(0)
    })
  })

  describe('pending action cancellation', () => {
    it('skip() cancels a pending delayed action', () => {
      const queue = useQueueStore()
      const { start, skip } = useGuidedWalkthrough()

      start()
      // Step 0 has delayMs: 1200 — action is pending
      expect(queue.requests.length).toBe(0)

      skip()

      // Advance past the delay — action should NOT fire
      vi.advanceTimersByTime(2000)
      expect(queue.requests.length).toBe(0)
    })

    it('next() cancels the previous step pending action', () => {
      const queue = useQueueStore()
      const { start, next } = useGuidedWalkthrough()

      start()
      // Step 0 action is pending (delayMs: 1200)
      expect(queue.requests.length).toBe(0)

      // Immediately advance to step 1 before step 0 delay fires
      next()

      // Advance past step 0 delay — its action should NOT fire
      vi.advanceTimersByTime(2000)
      expect(queue.requests.length).toBe(0)
    })

    it('previous() cancels a pending delayed action', () => {
      const queue = useQueueStore()
      const { start, next, previous } = useGuidedWalkthrough()

      start()
      vi.advanceTimersByTime(1200)
      expect(queue.requests.length).toBe(1)
      expect(queue.requests[0].status).toBe(PICKUP_STATUS.APPROVED)

      // Step 1 (observation), then step 2 (assign-gate, delayMs: 800)
      next()
      next()

      // Go back before the delay fires
      previous()

      // Advance past step 2 delay — assign action should NOT fire
      vi.advanceTimersByTime(1000)
      expect(queue.requests[0].status).toBe(PICKUP_STATUS.APPROVED)
      expect(queue.requests[0].gate_id).toBeNull()
    })

    it('start() cancels any pending action from a previous run', () => {
      const queue = useQueueStore()
      const { start } = useGuidedWalkthrough()

      start()
      // Step 0 action pending (delayMs: 1200)

      // Restart immediately
      start()

      // Only the second start's timer should be active
      vi.advanceTimersByTime(1200)
      expect(queue.requests.length).toBe(1)
    })
  })

  describe('full flow', () => {
    it('completes all 6 steps with correct state transitions', () => {
      const queue = useQueueStore()
      const { start, next } = useGuidedWalkthrough()

      // Step 0: Submit
      start()
      vi.advanceTimersByTime(1200)
      expect(queue.requests.length).toBe(1)
      expect(queue.requests[0].status).toBe(PICKUP_STATUS.APPROVED)

      // Step 1: Staff sees (observation)
      next()

      // Step 2: Assign gate
      next()
      vi.advanceTimersByTime(800)
      expect(queue.requests[0].status).toBe(PICKUP_STATUS.IN_QUEUE)
      expect(queue.requests[0].gate_id).toBe('gate-1')

      // Step 3: Customer updates (observation)
      next()

      // Step 4: Start processing
      next()
      vi.advanceTimersByTime(800)
      expect(queue.requests[0].status).toBe(PICKUP_STATUS.PROCESSING)

      // Step 5: Complete request (analytics)
      next()
      vi.advanceTimersByTime(800)
      expect(queue.requests[0].status).toBe(PICKUP_STATUS.COMPLETED)

      // Queue has 1 completed request
      expect(queue.completedItems.length).toBe(1)
    })
  })
})
