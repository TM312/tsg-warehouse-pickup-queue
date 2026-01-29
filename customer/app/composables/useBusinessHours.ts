interface BusinessHoursResponse {
  isOpen: boolean
  message: string | null
  openTime?: string
  closeTime?: string
}

export function useBusinessHours() {
  const { data, pending, error, refresh } = useFetch<BusinessHoursResponse>('/api/business-hours', {
    lazy: true
  })

  // If error fetching, assume closed for safety
  const isOpen = computed(() => {
    if (error.value) return false
    return data.value?.isOpen ?? false
  })

  const closedMessage = computed(() => {
    if (error.value) return 'Unable to check business hours. Please try again later.'
    return data.value?.message ?? 'Checking hours...'
  })

  const openTime = computed(() => data.value?.openTime)
  const closeTime = computed(() => data.value?.closeTime)

  return {
    isOpen,
    closedMessage,
    openTime,
    closeTime,
    isLoading: pending,
    refresh
  }
}
