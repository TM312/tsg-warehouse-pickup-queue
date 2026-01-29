import { serverSupabaseClient } from '#supabase/server'
import { format, getDay, parse, isWithinInterval } from 'date-fns'
import { TZDate } from '@date-fns/tz'

interface BusinessHours {
  id: string
  day_of_week: number
  open_time: string
  close_time: string
  is_closed: boolean
}

interface BusinessHoursResponse {
  isOpen: boolean
  message: string | null
  openTime?: string
  closeTime?: string
}

// Hardcoded warehouse timezone (per research recommendation)
const WAREHOUSE_TIMEZONE = 'America/Los_Angeles'

export default defineEventHandler(async (event): Promise<BusinessHoursResponse> => {
  const client = await serverSupabaseClient(event)
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

  // Get current time in warehouse timezone
  const warehouseNow = new TZDate(new Date(), WAREHOUSE_TIMEZONE)
  const dayOfWeek = getDay(warehouseNow)
  const todayHours = (hours as BusinessHours[]).find(h => h.day_of_week === dayOfWeek)

  // Day not configured or explicitly closed
  if (!todayHours || todayHours.is_closed) {
    return {
      isOpen: false,
      message: 'The warehouse is currently closed.'
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
      closeTime: format(closeTime, 'h:mm a')
    }
  }

  // Closed but have hours configured - show when they open
  return {
    isOpen: false,
    message: `We're open ${format(openTime, 'h:mm a')} - ${format(closeTime, 'h:mm a')}`,
    openTime: format(openTime, 'h:mm a'),
    closeTime: format(closeTime, 'h:mm a')
  }
})
