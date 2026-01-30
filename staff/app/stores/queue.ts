import type { PickupRequest } from '#shared/types/pickup-request'
import { PICKUP_STATUS } from '#shared/types/pickup-request'

export const useQueueStore = defineStore('queue', () => {
  // === State ===
  const requests = ref<PickupRequest[]>([])
  const loading = ref(false)
  const lastUpdated = ref<Date | null>(null)

  // === Getters ===
  const processingItems = computed(() =>
    requests.value.filter(r => r.status === PICKUP_STATUS.PROCESSING)
  )

  const inQueueItems = computed(() =>
    requests.value.filter(r => r.status === PICKUP_STATUS.IN_QUEUE)
  )

  const pendingItems = computed(() =>
    requests.value.filter(r => r.status === PICKUP_STATUS.PENDING)
  )

  // === Actions ===
  function setRequests(data: PickupRequest[]) {
    requests.value = data
    lastUpdated.value = new Date()
  }

  function addRequest(request: PickupRequest) {
    // Add at beginning (newest first)
    requests.value.unshift(request)
    lastUpdated.value = new Date()
  }

  function updateRequest(id: string, updates: Partial<PickupRequest>) {
    const index = requests.value.findIndex(r => r.id === id)
    if (index !== -1) {
      requests.value[index] = Object.assign({}, requests.value[index], updates) as PickupRequest
      lastUpdated.value = new Date()
    }
  }

  function removeRequest(id: string) {
    requests.value = requests.value.filter(r => r.id !== id)
    lastUpdated.value = new Date()
  }

  // Helper to get request by ID
  function getRequestById(id: string): PickupRequest | undefined {
    return requests.value.find(r => r.id === id)
  }

  // Return everything for DevTools visibility
  return {
    // State
    requests,
    loading,
    lastUpdated,
    // Getters
    processingItems,
    inQueueItems,
    pendingItems,
    // Actions
    setRequests,
    addRequest,
    updateRequest,
    removeRequest,
    getRequestById,
  }
})
