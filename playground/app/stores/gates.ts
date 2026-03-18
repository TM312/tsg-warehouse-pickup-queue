import { defineStore } from 'pinia'
import { DEFAULT_GATES } from '@/constants/defaults'
import { GATE_STATUSES } from '@/constants/status'
import type { PickupStatus } from '@/constants/status'
import type { GateWithCount } from '@/types/gate'
import type { PickupRequest } from '@/types/pickup-request'

export const useGatesStore = defineStore('gates', {
  state: () => ({
    gates: DEFAULT_GATES.map((g) => ({ ...g, queue_count: 0 })) as GateWithCount[],
  }),

  getters: {
    activeGates: (state) => state.gates.filter((g) => g.is_active),
    sortedActiveGates(): GateWithCount[] {
      return [...this.activeGates].sort((a, b) => a.gate_number - b.gate_number)
    },
    gateById: (state) => (id: string) => state.gates.find((g) => g.id === id),
  },

  actions: {
    setGates(gates: GateWithCount[]) {
      this.gates = gates
    },
    updateGate(id: string, updates: Partial<GateWithCount>) {
      const gate = this.gates.find((g) => g.id === id)
      if (gate) Object.assign(gate, updates)
    },
    recountQueues(requests: PickupRequest[]) {
      for (const gate of this.gates) {
        gate.queue_count = requests.filter(
          (r) =>
            r.gate_id === gate.id &&
            (GATE_STATUSES as readonly PickupStatus[]).includes(r.status),
        ).length
      }
    },
  },
})
