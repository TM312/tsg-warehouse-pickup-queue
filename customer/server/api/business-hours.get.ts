import { serverSupabaseClient } from '#supabase/server'
import { format, getDay, parse, isWithinInterval } from 'date-fns'
import { TZDate } from '@date-fns/tz'
import type { SupabaseClient } from '@supabase/supabase-js'

interface BusinessHours {
  id: string
  day_of_week: number
  open_time: string
  close_time: string
  is_closed: boolean
}

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

interface Override {
  active: boolean
  expiresAt: string | null
}

// Hardcoded warehouse timezone (per research recommendation)
const WAREHOUSE_TIMEZONE = 'America/Los_Angeles'
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Helper function to get formatted weekly hours
async function getWeeklyHours(client: SupabaseClient): Promise<DayHours[]> {
  const { data: hours } = await client
    .from('business_hours')
    .select('*')
    .order('day_of_week')

  return DAY_NAMES.map((name, i) => {
    const day = (hours as BusinessHours[] | null)?.find(h => h.day_of_week === i)
    return {
      dayOfWeek: i,
      dayName: name,
      isClosed: !day || day.is_closed,
      openTime: day && !day.is_closed ? format(parse(day.open_time, 'HH:mm:ss', new Date()), 'h:mm a') : null,
      closeTime: day && !day.is_closed ? format(parse(day.close_time, 'HH:mm:ss', new Date()), 'h:mm a') : null
    }
  })
}

export default defineEventHandler(async (event): Promise<BusinessHoursResponse> => {
  const client = await serverSupabaseClient(event)

  // 1. Check manual override first
  const { data: overrideSetting } = await client
    .from('business_settings')
    .select('value')
    .eq('key', 'manual_override')
    .single()

  if (overrideSetting?.value) {
    const override = overrideSetting.value as Override
    if (override.active) {
      const expiresAt = override.expiresAt
      // Override is active and not expired
      if (!expiresAt || new Date(expiresAt) > new Date()) {
        return {
          isOpen: false,
          message: 'The warehouse is temporarily closed.',
          weeklyHours: await getWeeklyHours(client)
        }
      }
    }
  }

  // 2. Check scheduled closures
  const warehouseNow = new TZDate(new Date(), WAREHOUSE_TIMEZONE)
  const today = format(warehouseNow, 'yyyy-MM-dd')

  const { data: closures } = await client
    .from('business_closures')
    .select('reason')
    .lte('start_date', today)
    .gte('end_date', today)
    .limit(1)

  if (closures && closures.length > 0) {
    const reason = (closures[0] as { reason: string | null }).reason
    return {
      isOpen: false,
      message: reason ? `Closed: ${reason}` : 'The warehouse is closed today.',
      weeklyHours: await getWeeklyHours(client)
    }
  }

  // 3. Check weekly schedule
  const { data: hours, error } = await client
    .from('business_hours')
    .select('*')

  if (error || !hours) {
    console.error('Failed to fetch business hours:', error)
    return {
      isOpen: false,
      message: 'Unable to check business hours. Please try again later.'
    }
  }

  const dayOfWeek = getDay(warehouseNow)
  const todayHours = (hours as BusinessHours[]).find(h => h.day_of_week === dayOfWeek)

  // Day not configured or explicitly closed
  if (!todayHours || todayHours.is_closed) {
    return {
      isOpen: false,
      message: 'The warehouse is currently closed.',
      weeklyHours: await getWeeklyHours(client)
    }
  }

  // Parse open and close times using the warehouse date as reference
  const openTime = parse(todayHours.open_time, 'HH:mm:ss', warehouseNow)
  const closeTime = parse(todayHours.close_time, 'HH:mm:ss', warehouseNow)

  // Check if current time is within business hours
  const isOpen = isWithinInterval(warehouseNow, { start: openTime, end: closeTime })

  if (isOpen) {
    return {
      isOpen: true,
      message: null,
      openTime: format(openTime, 'h:mm a'),
      closeTime: format(closeTime, 'h:mm a'),
      weeklyHours: await getWeeklyHours(client)
    }
  }

  // Closed but have hours configured - show when they open
  return {
    isOpen: false,
    message: `We're open ${format(openTime, 'h:mm a')} - ${format(closeTime, 'h:mm a')}`,
    openTime: format(openTime, 'h:mm a'),
    closeTime: format(closeTime, 'h:mm a'),
    weeklyHours: await getWeeklyHours(client)
  }
})
