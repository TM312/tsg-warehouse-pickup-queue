import { defineStore } from 'pinia'
import { DEFAULT_SIMULATION_SPEED } from '@/constants/defaults'
import type { SimulationSpeed, SimulationEvent } from '@/types/simulation'
import { generateId } from '@/utils/id'

const ACTIVITY_FEED_MAX = 20

export const useSimulationStore = defineStore('simulation', {
  state: () => ({
    speed: DEFAULT_SIMULATION_SPEED as SimulationSpeed,
    isRunning: false,
    elapsedMs: 0,
    selectedCustomerRequestId: null as string | null,
    autoProcessEnabled: true,
    activityFeed: [] as SimulationEvent[],
  }),

  actions: {
    setSpeed(speed: SimulationSpeed) {
      this.speed = speed
    },
    toggleRunning() {
      this.isRunning = !this.isRunning
    },
    tick(deltaMs: number) {
      this.elapsedMs += deltaMs * this.speed
    },
    selectCustomerRequest(id: string | null) {
      this.selectedCustomerRequestId = id
    },
    addEvent(event: Omit<SimulationEvent, 'id'>) {
      this.activityFeed = [{ ...event, id: generateId() }, ...this.activityFeed].slice(
        0,
        ACTIVITY_FEED_MAX,
      )
    },
    reset() {
      this.speed = DEFAULT_SIMULATION_SPEED
      this.isRunning = false
      this.elapsedMs = 0
      this.selectedCustomerRequestId = null
      this.autoProcessEnabled = true
      this.activityFeed = []
    },
  },
})
