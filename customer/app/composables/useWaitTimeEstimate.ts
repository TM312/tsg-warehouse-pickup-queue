/**
 * Composable for calculating wait time estimates based on recent completed pickups.
 *
 * Uses a rolling average of the last 10 completed requests to estimate wait time.
 * Returns a range (min/max) with +/- 20% buffer to account for variability.
 *
 * Returns null when insufficient data exists (fewer than 3 completed requests),
 * which should be handled by hiding the wait time display.
 */
export function useWaitTimeEstimate() {
  const client = useSupabaseClient()

  /**
   * Calculate estimated wait time based on queue position.
   *
   * @param position - Current position in queue (1 = next up, 2 = second, etc.)
   * @returns Object with min/max minutes, or null if insufficient data
   */
  async function calculateEstimate(
    position: number
  ): Promise<{ min: number; max: number } | null> {
    // Fetch last 10 completed pickups
    const { data, error } = await client
      .from('pickup_requests')
      .select('created_at, completed_at')
      .eq('status', PICKUP_STATUS.COMPLETED)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching completion history:', error)
      return null
    }

    // Not enough history to calculate estimate
    if (!data || data.length < 3) {
      return null
    }

    // Calculate average processing time in minutes
    const times = data.map((request) => {
      const created = new Date(request.created_at).getTime()
      const completed = new Date(request.completed_at!).getTime()
      return (completed - created) / 60000 // Convert milliseconds to minutes
    })

    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length

    // Position 1 = next up = 0 wait
    // Position 2 = 1 person ahead = avgTime wait
    // etc.
    const baseEstimate = avgTime * (position - 1)

    // Return as range with +/- 20% buffer
    const min = Math.max(0, Math.round(baseEstimate * 0.8))
    const max = Math.round(baseEstimate * 1.2)

    return { min, max }
  }

  return { calculateEstimate }
}
