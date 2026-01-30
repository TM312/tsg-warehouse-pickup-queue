import { ref, readonly } from 'vue'
import { toast } from 'vue-sonner'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface WeeklySchedule {
  dayOfWeek: number
  isClosed: boolean
  openTime: string  // HH:mm format
  closeTime: string
}

export function useBusinessHoursSettings() {
  // Cast to any to work around missing database types
  // TODO: Generate proper database types with `supabase gen types typescript`
  const client = useSupabaseClient() as SupabaseClient

  const pending = ref(false)
  const weeklySchedule = ref<WeeklySchedule[]>([])

  // Initialize with default schedule (all days closed)
  function initializeSchedule() {
    weeklySchedule.value = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      isClosed: true,
      openTime: '08:00',
      closeTime: '17:00'
    }))
  }

  async function loadWeeklySchedule() {
    pending.value = true
    try {
      const { data, error } = await client
        .from('business_hours')
        .select('*')
        .order('day_of_week')

      if (error) throw error

      if (!data || data.length === 0) {
        initializeSchedule()
        return
      }

      // Map database format to UI format
      // Normalize time format to HH:mm (remove seconds if present)
      weeklySchedule.value = data.map((h: { day_of_week: number; is_closed: boolean; open_time: string; close_time: string }) => ({
        dayOfWeek: h.day_of_week,
        isClosed: h.is_closed,
        openTime: h.open_time.substring(0, 5),
        closeTime: h.close_time.substring(0, 5)
      }))
    } catch (e) {
      console.error('Failed to load business hours:', e)
      toast.error('Failed to load business hours')
      initializeSchedule()
    } finally {
      pending.value = false
    }
  }

  async function saveWeeklySchedule() {
    pending.value = true
    try {
      // Upsert each day
      for (const day of weeklySchedule.value) {
        const { error } = await client
          .from('business_hours')
          .upsert({
            day_of_week: day.dayOfWeek,
            is_closed: day.isClosed,
            open_time: day.openTime + ':00',  // Add seconds for time type
            close_time: day.closeTime + ':00'
          }, { onConflict: 'day_of_week' })

        if (error) throw error
      }
      toast.success('Business hours saved')
    } catch (e) {
      console.error('Failed to save business hours:', e)
      toast.error('Failed to save business hours')
    } finally {
      pending.value = false
    }
  }

  // Copy hours from Monday (index 1) to all weekdays (Mon-Fri)
  function applyToWeekdays() {
    const monday = weeklySchedule.value[1]
    if (!monday) return

    // Days 1-5 are Mon-Fri
    for (let i = 1; i <= 5; i++) {
      weeklySchedule.value[i] = {
        ...weeklySchedule.value[i],
        isClosed: monday.isClosed,
        openTime: monday.openTime,
        closeTime: monday.closeTime
      }
    }
  }

  // Copy hours from one day to all days
  function copyToAllDays(sourceDayIndex: number) {
    const source = weeklySchedule.value[sourceDayIndex]
    if (!source) return

    weeklySchedule.value = weeklySchedule.value.map(day => ({
      ...day,
      isClosed: source.isClosed,
      openTime: source.openTime,
      closeTime: source.closeTime
    }))
  }

  return {
    weeklySchedule,
    pending: readonly(pending),
    loadWeeklySchedule,
    saveWeeklySchedule,
    applyToWeekdays,
    copyToAllDays
  }
}
