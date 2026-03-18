import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useQueueStore } from '@/stores/queue'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'

describe('useQueueStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('starts with empty requests', () => {
      const store = useQueueStore()
      expect(store.requests).toEqual([])
    })
  })

  describe('getters', () => {
    function seedMixedRequests() {
      const store = useQueueStore()
      store.setRequests([
        createPickupRequest({ id: 'p1', status: PICKUP_STATUS.PENDING }),
        createPickupRequest({ id: 'a1', status: PICKUP_STATUS.APPROVED }),
        createPickupRequest({ id: 'q1', status: PICKUP_STATUS.IN_QUEUE }),
        createPickupRequest({ id: 'pr1', status: PICKUP_STATUS.PROCESSING }),
        createPickupRequest({ id: 'c1', status: PICKUP_STATUS.COMPLETED }),
        createPickupRequest({ id: 'x1', status: PICKUP_STATUS.CANCELLED }),
      ])
      return store
    }

    it('byStatus filters requests by any status', () => {
      const store = seedMixedRequests()
      const result = store.byStatus(PICKUP_STATUS.IN_QUEUE)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('q1')
    })

    it('byStatus returns empty array for status with no matches', () => {
      const store = useQueueStore()
      expect(store.byStatus(PICKUP_STATUS.PENDING)).toEqual([])
    })

    it.each([
      ['pendingItems', PICKUP_STATUS.PENDING, 'p1'],
      ['approvedItems', PICKUP_STATUS.APPROVED, 'a1'],
      ['inQueueItems', PICKUP_STATUS.IN_QUEUE, 'q1'],
      ['processingItems', PICKUP_STATUS.PROCESSING, 'pr1'],
      ['completedItems', PICKUP_STATUS.COMPLETED, 'c1'],
      ['cancelledItems', PICKUP_STATUS.CANCELLED, 'x1'],
    ] as const)('%s filters correctly', (getter, _status, expectedId) => {
      const store = seedMixedRequests()
      const items = store[getter] as ReturnType<typeof createPickupRequest>[]
      expect(items).toHaveLength(1)
      expect(items[0].id).toBe(expectedId)
    })

    it('activeItems returns 4 non-terminal statuses', () => {
      const store = seedMixedRequests()
      expect(store.activeItems).toHaveLength(4)
    })

    it('requestById finds a match', () => {
      const store = seedMixedRequests()
      expect(store.requestById('q1')?.id).toBe('q1')
    })

    it('requestById returns undefined for unknown id', () => {
      const store = seedMixedRequests()
      expect(store.requestById('unknown')).toBeUndefined()
    })
  })

  describe('actions', () => {
    it('addRequest appends to requests', () => {
      const store = useQueueStore()
      const request = createPickupRequest({ id: 'r1' })
      store.addRequest(request)
      expect(store.requests).toHaveLength(1)
      expect(store.requests[0].id).toBe('r1')
    })

    it('updateRequest modifies in-place', () => {
      const store = useQueueStore()
      store.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.PENDING }))
      store.updateRequest('r1', { status: PICKUP_STATUS.APPROVED })
      expect(store.requests[0].status).toBe(PICKUP_STATUS.APPROVED)
    })

    it('updateRequest no-ops for unknown id', () => {
      const store = useQueueStore()
      store.addRequest(createPickupRequest({ id: 'r1', status: PICKUP_STATUS.PENDING }))
      store.updateRequest('unknown', { status: PICKUP_STATUS.APPROVED })
      expect(store.requests[0].status).toBe(PICKUP_STATUS.PENDING)
    })

    it('removeRequest removes by id', () => {
      const store = useQueueStore()
      store.setRequests([
        createPickupRequest({ id: 'r1' }),
        createPickupRequest({ id: 'r2' }),
      ])
      store.removeRequest('r1')
      expect(store.requests).toHaveLength(1)
      expect(store.requests[0].id).toBe('r2')
    })

    it('setRequests replaces the array', () => {
      const store = useQueueStore()
      store.addRequest(createPickupRequest({ id: 'old' }))
      const newRequests = [createPickupRequest({ id: 'new1' }), createPickupRequest({ id: 'new2' })]
      store.setRequests(newRequests)
      expect(store.requests).toHaveLength(2)
      expect(store.requests[0].id).toBe('new1')
    })

    it('clear empties the array', () => {
      const store = useQueueStore()
      store.addRequest(createPickupRequest({ id: 'r1' }))
      store.clear()
      expect(store.requests).toEqual([])
    })
  })
})
