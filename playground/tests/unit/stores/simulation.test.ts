import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSimulationStore } from '@/stores/simulation'
import { DEFAULT_SIMULATION_SPEED } from '@/constants/defaults'

describe('useSimulationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('has correct defaults', () => {
      const store = useSimulationStore()
      expect(store.speed).toBe(DEFAULT_SIMULATION_SPEED)
      expect(store.isRunning).toBe(false)
      expect(store.elapsedMs).toBe(0)
      expect(store.selectedCustomerRequestId).toBeNull()
      expect(store.autoProcessEnabled).toBe(true)
      expect(store.activityFeed).toEqual([])
    })
  })

  describe('actions', () => {
    it('setSpeed updates speed', () => {
      const store = useSimulationStore()
      store.setSpeed(5)
      expect(store.speed).toBe(5)
    })

    it('toggleRunning flips twice', () => {
      const store = useSimulationStore()
      store.toggleRunning()
      expect(store.isRunning).toBe(true)
      store.toggleRunning()
      expect(store.isRunning).toBe(false)
    })

    it('tick increments by deltaMs * speed', () => {
      const store = useSimulationStore()
      store.setSpeed(2)
      store.tick(100)
      expect(store.elapsedMs).toBe(200)
    })

    it('tick accumulates', () => {
      const store = useSimulationStore()
      store.tick(100)
      store.tick(50)
      expect(store.elapsedMs).toBe(150)
    })

    it('selectCustomerRequest sets and clears', () => {
      const store = useSimulationStore()
      store.selectCustomerRequest('req-1')
      expect(store.selectedCustomerRequestId).toBe('req-1')
      store.selectCustomerRequest(null)
      expect(store.selectedCustomerRequestId).toBeNull()
    })

    it('addEvent prepends newest-first', () => {
      const store = useSimulationStore()
      store.addEvent({ timestamp: 1, label: 'First', type: 'submit' })
      store.addEvent({ timestamp: 2, label: 'Second', type: 'approve' })
      expect(store.activityFeed[0].label).toBe('Second')
      expect(store.activityFeed[1].label).toBe('First')
    })

    it('addEvent generates an id', () => {
      const store = useSimulationStore()
      store.addEvent({ timestamp: 1, label: 'Test', type: 'submit' })
      expect(store.activityFeed[0].id).toBeDefined()
      expect(typeof store.activityFeed[0].id).toBe('string')
    })

    it('addEvent caps at 20 items', () => {
      const store = useSimulationStore()
      for (let i = 0; i < 25; i++) {
        store.addEvent({ timestamp: i, label: `Event ${i}`, type: 'submit' })
      }
      expect(store.activityFeed).toHaveLength(20)
      expect(store.activityFeed[0].label).toBe('Event 24')
    })

    it('reset restores all to initial values', () => {
      const store = useSimulationStore()
      store.setSpeed(5)
      store.toggleRunning()
      store.tick(1000)
      store.selectCustomerRequest('req-1')
      store.autoProcessEnabled = false
      store.addEvent({ timestamp: 1, label: 'Test', type: 'submit' })

      store.reset()

      expect(store.speed).toBe(DEFAULT_SIMULATION_SPEED)
      expect(store.isRunning).toBe(false)
      expect(store.elapsedMs).toBe(0)
      expect(store.selectedCustomerRequestId).toBeNull()
      expect(store.autoProcessEnabled).toBe(true)
      expect(store.activityFeed).toEqual([])
    })
  })
})
