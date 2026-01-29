import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useDocumentVisibility } from '@vueuse/core'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

/**
 * Payload type for pickup_requests realtime events.
 * Simplified type definition - not using full generated database types.
 */
export interface PickupRequestPayload {
  id: string
  status: string
  queue_position: number | null
  assigned_gate_id: string | null
  order_number: string
  customer_name: string
  email: string
  netsuite_email: string | null
  notes: string | null
  created_at: string
  updated_at: string
  [key: string]: unknown
}

/**
 * Composable for subscribing to realtime updates for a specific pickup request.
 *
 * Features:
 * - Filters subscription by request ID (customer only sees their own data)
 * - Handles DELETE filter limitation (Supabase doesn't filter DELETE events)
 * - Tracks connection status for UI feedback
 * - Auto-reconnects on visibility change (tab switching)
 *
 * @param requestId - The UUID of the pickup request to subscribe to
 */
export function useRealtimeStatus(requestId: string) {
  const client = useSupabaseClient()
  const visibility = useDocumentVisibility()

  const status = ref<ConnectionStatus>('connecting')
  let channel: RealtimeChannel | null = null
  let updateCallback: ((payload: RealtimePostgresChangesPayload<PickupRequestPayload>) => void) | null = null

  /**
   * Subscribe to realtime updates for this request.
   * @param onUpdate - Callback invoked when the request changes
   */
  const subscribe = (
    onUpdate: (payload: RealtimePostgresChangesPayload<PickupRequestPayload>) => void
  ) => {
    // Store callback for reconnection
    updateCallback = onUpdate

    channel = client
      .channel(`pickup-request-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pickup_requests',
          filter: `id=eq.${requestId}`
        },
        (payload) => {
          // Handle DELETE filter limitation - filter doesn't work for DELETE events.
          // Supabase sends ALL delete events regardless of filter, so we must check
          // the old.id in the callback to ensure this is our request.
          if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as { id?: string })?.id
            if (oldId !== requestId) {
              return // Ignore DELETE for other requests
            }
          }
          onUpdate(payload as RealtimePostgresChangesPayload<PickupRequestPayload>)
        }
      )
      .subscribe((subscribeStatus) => {
        if (subscribeStatus === 'SUBSCRIBED') {
          status.value = 'connected'
        } else if (
          subscribeStatus === 'CLOSED' ||
          subscribeStatus === 'TIMED_OUT' ||
          subscribeStatus === 'CHANNEL_ERROR'
        ) {
          status.value = 'disconnected'
        }
      })
  }

  /**
   * Unsubscribe from realtime updates.
   * Should be called in onUnmounted to prevent memory leaks.
   */
  const unsubscribe = () => {
    if (channel) {
      client.removeChannel(channel)
      channel = null
    }
  }

  // Auto-reconnect on visibility change (tab becomes visible again).
  // When the browser tab is hidden (user switches apps on mobile, or switches tabs),
  // the WebSocket connection may become stale. This watch triggers reconnection
  // when the tab becomes visible again.
  watch(visibility, async (current, previous) => {
    if (current === 'visible' && previous === 'hidden') {
      // If we were disconnected while hidden, attempt to reconnect
      if (status.value !== 'connected' && updateCallback) {
        unsubscribe()
        subscribe(updateCallback)
      }
    }
  })

  return {
    status: readonly(status),
    subscribe,
    unsubscribe
  }
}
