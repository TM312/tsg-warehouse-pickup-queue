import { defineStore } from 'pinia'
import { PICKUP_STATUS, isActiveStatus } from '@/constants/status'
import type { PickupStatus } from '@/constants/status'
import type { PickupRequest } from '@/types/pickup-request'

export const useQueueStore = defineStore('queue', {
  state: () => ({
    requests: [] as PickupRequest[],
  }),

  getters: {
    byStatus: (state) => (status: PickupStatus) =>
      state.requests.filter((r) => r.status === status),
    pendingItems(): PickupRequest[] { return this.byStatus(PICKUP_STATUS.PENDING) },
    approvedItems(): PickupRequest[] { return this.byStatus(PICKUP_STATUS.APPROVED) },
    inQueueItems(): PickupRequest[] { return this.byStatus(PICKUP_STATUS.IN_QUEUE) },
    processingItems(): PickupRequest[] { return this.byStatus(PICKUP_STATUS.PROCESSING) },
    completedItems(): PickupRequest[] { return this.byStatus(PICKUP_STATUS.COMPLETED) },
    cancelledItems(): PickupRequest[] { return this.byStatus(PICKUP_STATUS.CANCELLED) },
    activeItems: (state) => state.requests.filter((r) => isActiveStatus(r.status)),
    requestById: (state) => (id: string) => state.requests.find((r) => r.id === id),
  },

  actions: {
    addRequest(request: PickupRequest) {
      this.requests.push(request)
    },
    updateRequest(id: string, updates: Partial<PickupRequest>) {
      const request = this.requests.find((r) => r.id === id)
      if (request) Object.assign(request, updates)
    },
    removeRequest(id: string) {
      this.requests = this.requests.filter((r) => r.id !== id)
    },
    setRequests(requests: PickupRequest[]) {
      this.requests = requests
    },
    clear() {
      this.requests = []
    },
  },
})
