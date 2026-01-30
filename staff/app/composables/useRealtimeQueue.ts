import type { RealtimeChannel } from '@supabase/supabase-js'
import { useDocumentVisibility } from '@vueuse/core'
import { ref, readonly, watch, onUnmounted } from 'vue'
import type { PickupRequest } from '#shared/types/pickup-request'

export type SubscriptionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export function useRealtimeQueue() {
  const client = useSupabaseClient()
  const visibility = useDocumentVisibility()
  const queueStore = useQueueStore()

  const status = ref<SubscriptionStatus>('connecting')
  let channel: RealtimeChannel | null = null

  // Callback for full refresh (used on reconnect and gate changes)
  let refreshCallback: (() => void) | null = null

  const subscribe = (onRefresh?: () => void) => {
    // Store refresh callback for visibility change handling
    refreshCallback = onRefresh ?? null

    if (channel) return // Prevent duplicate subscriptions

    status.value = 'connecting'

    channel = client
      .channel('pickup-requests-staff')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pickup_requests' },
        (payload) => {
          // Update store based on event type
          if (payload.eventType === 'INSERT') {
            queueStore.addRequest(payload.new as PickupRequest)
          } else if (payload.eventType === 'UPDATE') {
            queueStore.updateRequest(payload.new.id as string, payload.new as Partial<PickupRequest>)
          } else if (payload.eventType === 'DELETE') {
            queueStore.removeRequest(payload.old.id as string)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gates' },
        () => {
          // For gate changes, trigger a full refresh (simpler than tracking counts)
          refreshCallback?.()
        }
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
    refreshCallback = null
  }

  // Auto-reconnect and refresh on tab visibility change
  watch(visibility, async (current, previous) => {
    if (current === 'visible' && previous === 'hidden') {
      // Refresh data (may have missed events while hidden)
      refreshCallback?.()
      // Reconnect if needed
      if (status.value !== 'connected') {
        unsubscribe()
        subscribe(refreshCallback ?? undefined)
      }
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    status: readonly(status),
    subscribe,
    unsubscribe
  }
}
