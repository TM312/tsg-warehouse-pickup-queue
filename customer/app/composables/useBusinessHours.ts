interface DayHours {
  dayOfWeek: number
  dayName: string
  isClosed: boolean
  openTime: string | null
  closeTime: string | null
}

interface BusinessHoursResponse {
  isOpen: boolean
  message: string | null
  openTime?: string
  closeTime?: string
  weeklyHours?: DayHours[]
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
  const weeklyHours = computed(() => data.value?.weeklyHours ?? [])

  return {
    isOpen,
    closedMessage,
    openTime,
    closeTime,
    weeklyHours,
    isLoading: pending,
    refresh
  }
}
