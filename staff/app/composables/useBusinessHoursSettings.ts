import { ref, readonly } from 'vue'
import { toast } from 'vue-sonner'
import type { SupabaseClient } from '@supabase/supabase-js'
import { format, parse, addDays, setHours, setMinutes } from 'date-fns'
import { TZDate } from '@date-fns/tz'

export interface WeeklySchedule {
  dayOfWeek: number
  isClosed: boolean
  openTime: string  // HH:mm format
  closeTime: string
}

export interface Closure {
  id: string
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
  reason: string | null
}

export interface Override {
  active: boolean
  expiresAt: string | null  // ISO timestamp
}

const WAREHOUSE_TIMEZONE = 'America/Los_Angeles'

export function useBusinessHoursSettings() {
  // Cast to any to work around missing database types
  // TODO: Generate proper database types with `supabase gen types typescript`
  const client = useSupabaseClient() as SupabaseClient

  const pending = ref(false)
  const weeklySchedule = ref<WeeklySchedule[]>([])
  const closures = ref<Closure[]>([])
  const override = ref<Override>({ active: false, expiresAt: null })

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
      const existing = weeklySchedule.value[i]
      if (existing) {
        weeklySchedule.value[i] = {
          dayOfWeek: existing.dayOfWeek,
          isClosed: monday.isClosed,
          openTime: monday.openTime,
          closeTime: monday.closeTime
        }
      }
    }
  }

  // Copy hours from one day to all days
  function copyToAllDays(sourceDayIndex: number) {
    const source = weeklySchedule.value[sourceDayIndex]
    if (!source) return

    weeklySchedule.value = weeklySchedule.value.map(day => ({
      dayOfWeek: day.dayOfWeek,
      isClosed: source.isClosed,
      openTime: source.openTime,
      closeTime: source.closeTime
    }))
  }

  // Load upcoming closures (end_date >= today)
  async function loadClosures() {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await client
      .from('business_closures')
      .select('*')
      .gte('end_date', today)
      .order('start_date')

    if (error) {
      console.error('Failed to load closures:', error)
      return
    }

    closures.value = (data ?? []).map((c: { id: string; start_date: string; end_date: string; reason: string | null }) => ({
      id: c.id,
      startDate: c.start_date,
      endDate: c.end_date,
      reason: c.reason
    }))
  }

  async function addClosure(startDate: string, endDate: string, reason?: string) {
    pending.value = true
    try {
      const { data: user } = await client.auth.getUser()
      const { error } = await client
        .from('business_closures')
        .insert({
          start_date: startDate,
          end_date: endDate,
          reason: reason || null,
          created_by: user.user?.id
        })

      if (error) throw error
      await loadClosures()
      toast.success('Closure scheduled')
    } catch (e) {
      console.error('Failed to add closure:', e)
      toast.error('Failed to schedule closure')
    } finally {
      pending.value = false
    }
  }

  async function deleteClosure(id: string) {
    pending.value = true
    try {
      const { error } = await client
        .from('business_closures')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadClosures()
      toast.success('Closure removed')
    } catch (e) {
      console.error('Failed to delete closure:', e)
      toast.error('Failed to remove closure')
    } finally {
      pending.value = false
    }
  }

  // Load manual override setting
  async function loadOverride() {
    const { data, error } = await client
      .from('business_settings')
      .select('value')
      .eq('key', 'manual_override')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to load override:', error)
      return
    }

    if (data?.value) {
      override.value = data.value as Override
    }
  }

  // Calculate next open time from weekly schedule for override expiry
  function calculateNextOpenTime(): string | null {
    const now = new TZDate(new Date(), WAREHOUSE_TIMEZONE)
    const currentDay = now.getDay() // 0 = Sunday

    // Check up to 7 days ahead to find next open day
    for (let offset = 1; offset <= 7; offset++) {
      const targetDay = (currentDay + offset) % 7
      const daySchedule = weeklySchedule.value.find(d => d.dayOfWeek === targetDay)

      if (daySchedule && !daySchedule.isClosed) {
        // Calculate the date for this day
        const targetDate = addDays(now, offset)
        // Parse the open time and set it on the target date
        const timeParts = daySchedule.openTime.split(':').map(Number)
        const hours = timeParts[0] ?? 0
        const minutes = timeParts[1] ?? 0
        const openDateTime = setMinutes(setHours(targetDate, hours), minutes)
        return openDateTime.toISOString()
      }
    }

    // No open days found in schedule
    return null
  }

  async function toggleOverride(active: boolean) {
    pending.value = true
    try {
      // Calculate expiry: next scheduled open time
      let expiresAt: string | null = null
      if (active) {
        expiresAt = calculateNextOpenTime()
      }

      const { data: user } = await client.auth.getUser()
      const { error } = await client
        .from('business_settings')
        .upsert({
          key: 'manual_override',
          value: { active, expiresAt },
          updated_by: user.user?.id
        })

      if (error) throw error

      override.value = { active, expiresAt }
      toast.success(active ? 'Override activated - warehouse closed' : 'Override deactivated')
    } catch (e) {
      console.error('Failed to toggle override:', e)
      toast.error('Failed to update override')
    } finally {
      pending.value = false
    }
  }

  // Load all settings at once
  async function loadAllSettings() {
    pending.value = true
    try {
      await Promise.all([
        loadWeeklySchedule(),
        loadClosures(),
        loadOverride()
      ])
    } finally {
      pending.value = false
    }
  }

  return {
    weeklySchedule,
    closures,
    override,
    pending: readonly(pending),
    loadWeeklySchedule,
    saveWeeklySchedule,
    applyToWeekdays,
    copyToAllDays,
    loadClosures,
    addClosure,
    deleteClosure,
    loadOverride,
    toggleOverride,
    loadAllSettings
  }
}
