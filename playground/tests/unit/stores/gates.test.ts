import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGatesStore } from '@/stores/gates'
import { createPickupRequest, createGate } from '@/utils/factories'
import { DEFAULT_GATES } from '@/constants/defaults'
import { PICKUP_STATUS } from '@/constants/status'
import type { GateWithCount } from '@/types/gate'

describe('useGatesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('starts with 3 gates from DEFAULT_GATES with queue_count 0', () => {
      const store = useGatesStore()
      expect(store.gates).toHaveLength(DEFAULT_GATES.length)
      for (const gate of store.gates) {
        expect(gate.queue_count).toBe(0)
        expect(gate.is_active).toBe(true)
      }
    })
  })

  describe('getters', () => {
    it('activeGates excludes inactive gates', () => {
      const store = useGatesStore()
      store.updateGate(store.gates[0].id, { is_active: false })
      expect(store.activeGates).toHaveLength(2)
    })

    it('sortedActiveGates sorts by gate_number', () => {
      const store = useGatesStore()
      store.setGates([
        { ...createGate({ id: 'g3', gate_number: 3 }), queue_count: 0 },
        { ...createGate({ id: 'g1', gate_number: 1 }), queue_count: 0 },
        { ...createGate({ id: 'g2', gate_number: 2 }), queue_count: 0 },
      ])
      const sorted = store.sortedActiveGates
      expect(sorted[0].gate_number).toBe(1)
      expect(sorted[1].gate_number).toBe(2)
      expect(sorted[2].gate_number).toBe(3)
    })

    it('gateById finds a match', () => {
      const store = useGatesStore()
      const gate = store.gateById(store.gates[0].id)
      expect(gate).toBeDefined()
      expect(gate!.id).toBe(store.gates[0].id)
    })

    it('gateById returns undefined for unknown id', () => {
      const store = useGatesStore()
      expect(store.gateById('unknown')).toBeUndefined()
    })
  })

  describe('actions', () => {
    it('setGates replaces the array', () => {
      const store = useGatesStore()
      const newGates: GateWithCount[] = [
        { ...createGate({ id: 'new-1', gate_number: 10 }), queue_count: 0 },
      ]
      store.setGates(newGates)
      expect(store.gates).toHaveLength(1)
      expect(store.gates[0].id).toBe('new-1')
    })

    it('updateGate modifies in-place', () => {
      const store = useGatesStore()
      const id = store.gates[0].id
      store.updateGate(id, { is_active: false })
      expect(store.gates[0].is_active).toBe(false)
    })

    it('updateGate no-ops for unknown id', () => {
      const store = useGatesStore()
      const before = { ...store.gates[0] }
      store.updateGate('unknown', { is_active: false })
      expect(store.gates[0].is_active).toBe(before.is_active)
    })

    it('recountQueues counts only GATE_STATUSES requests per gate', () => {
      const store = useGatesStore()
      const gateId = store.gates[0].id
      const requests = [
        createPickupRequest({ gate_id: gateId, status: PICKUP_STATUS.IN_QUEUE }),
        createPickupRequest({ gate_id: gateId, status: PICKUP_STATUS.PROCESSING }),
        createPickupRequest({ gate_id: gateId, status: PICKUP_STATUS.PENDING }),
        createPickupRequest({ gate_id: gateId, status: PICKUP_STATUS.COMPLETED }),
      ]
      store.recountQueues(requests)
      expect(store.gates[0].queue_count).toBe(2)
    })

    it('recountQueues sets 0 for gates with no matching requests', () => {
      const store = useGatesStore()
      store.recountQueues([])
      for (const gate of store.gates) {
        expect(gate.queue_count).toBe(0)
      }
    })
  })
})
