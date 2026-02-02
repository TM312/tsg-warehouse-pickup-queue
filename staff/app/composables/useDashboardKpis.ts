import { ref, computed } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { startOfDay, differenceInMinutes } from 'date-fns'
import { PICKUP_STATUS } from '#shared/types/pickup-request'
import type { PickupRequest } from '#shared/types/pickup-request'

const REFRESH_INTERVAL = 30_000 // 30 seconds

export function useDashboardKpis() {
  const client = useSupabaseClient()

  const completedToday = ref<PickupRequest[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const lastRefreshed = ref<Date | null>(null)

  async function fetchKpis() {
    loading.value = true
    error.value = null

    try {
      const todayStart = startOfDay(new Date()).toISOString()

      const { data, error: fetchError } = await client
        .from('pickup_requests')
        .select('id, created_at, processing_started_at, completed_at')
        .eq('status', PICKUP_STATUS.COMPLETED)
        .gte('completed_at', todayStart)

      if (fetchError) {
        throw fetchError
      }

      completedToday.value = (data ?? []) as PickupRequest[]
      lastRefreshed.value = new Date()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch KPIs'
      console.error('Dashboard KPI fetch error:', e)
    } finally {
      loading.value = false
    }
  }

  // Computed: count of completed today
  const completedCount = computed(() => completedToday.value.length)

  // Computed: average wait time (created_at to processing_started_at)
  const avgWaitTimeMinutes = computed((): number | null => {
    const validRequests = completedToday.value.filter(r =>
      r.processing_started_at && r.created_at
    )

    if (validRequests.length === 0) return null

    const totalMinutes = validRequests.reduce((sum, r) => {
      return sum + differenceInMinutes(
        new Date(r.processing_started_at!),
        new Date(r.created_at)
      )
    }, 0)

    return Math.round(totalMinutes / validRequests.length)
  })

  // Computed: average processing time (processing_started_at to completed_at)
  const avgProcessingTimeMinutes = computed((): number | null => {
    const validRequests = completedToday.value.filter(r =>
      r.completed_at && r.processing_started_at
    )

    if (validRequests.length === 0) return null

    const totalMinutes = validRequests.reduce((sum, r) => {
      return sum + differenceInMinutes(
        new Date(r.completed_at!),
        new Date(r.processing_started_at!)
      )
    }, 0)

    return Math.round(totalMinutes / validRequests.length)
  })

  // Periodic refresh
  const { pause, resume, isActive } = useIntervalFn(fetchKpis, REFRESH_INTERVAL, {
    immediate: true,
    immediateCallback: true
  })

  return {
    // State
    loading,
    error,
    lastRefreshed,
    // Computed KPIs
    completedCount,
    avgWaitTimeMinutes,
    avgProcessingTimeMinutes,
    // Actions
    refresh: fetchKpis,
    pause,
    resume,
    isActive
  }
}
