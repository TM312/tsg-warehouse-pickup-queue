import type { RealtimeChannel } from '@supabase/supabase-js'
import { useDocumentVisibility } from '@vueuse/core'
import { ref, readonly, watch, onUnmounted } from 'vue'

export type SubscriptionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export function useRealtimeQueue() {
  const client = useSupabaseClient()
  const visibility = useDocumentVisibility()

  const status = ref<SubscriptionStatus>('connecting')
  let channel: RealtimeChannel | null = null
  let eventCallback: (() => void) | null = null

  const subscribe = (onEvent: () => void) => {
    eventCallback = onEvent
    status.value = 'connecting'

    channel = client
      .channel('pickup-requests-staff')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pickup_requests' },
        () => onEvent()
      )
      .subscribe((subscribeStatus) => {
        if (subscribeStatus === 'SUBSCRIBED') {
          status.value = 'connected'
        } else if (subscribeStatus === 'CLOSED' || subscribeStatus === 'TIMED_OUT') {
          status.value = 'disconnected'
        } else if (subscribeStatus === 'CHANNEL_ERROR') {
          status.value = 'error'
        }
      })
  }

  const unsubscribe = () => {
    if (channel) {
      client.removeChannel(channel)
      channel = null
    }
    status.value = 'disconnected'
  }

  // Auto-reconnect and refresh on tab visibility change
  watch(visibility, async (current, previous) => {
    if (current === 'visible' && previous === 'hidden') {
      // Refresh data regardless of connection status (may have missed events)
      eventCallback?.()
      // Reconnect if needed
      if (status.value !== 'connected' && eventCallback) {
        unsubscribe()
        subscribe(eventCallback)
      }
    }
  })

  // Cleanup on unmount - caller should call unsubscribe in onUnmounted,
  // but we provide safety cleanup as well
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    status: readonly(status),
    subscribe,
    unsubscribe
  }
}
