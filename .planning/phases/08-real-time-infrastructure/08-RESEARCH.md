# Phase 8: Real-time Infrastructure - Research

**Researched:** 2026-01-29
**Domain:** Supabase Realtime / WebSocket subscriptions
**Confidence:** HIGH

## Summary

This phase implements real-time updates using Supabase Realtime's Postgres Changes feature. The research confirms that the project already has Realtime enabled in `supabase/config.toml` (`[realtime] enabled = true`), but the `pickup_requests` table must be added to the `supabase_realtime` publication to enable change streaming.

Supabase Realtime uses PostgreSQL's Write-Ahead Logging (WAL) to capture INSERT, UPDATE, and DELETE events and broadcast them to subscribed clients over WebSocket. The `@nuxtjs/supabase` module (already installed in both apps at v2.0.3) provides the `useSupabaseClient()` composable which includes full realtime channel support.

The key implementation pattern is: (1) fetch initial data, (2) subscribe to realtime channel in `onMounted`, (3) refresh data on events, (4) cleanup channel in `onUnmounted`. For the customer app, filtering by request ID uses the `filter: 'id=eq.{uuid}'` parameter to receive only relevant changes.

**Primary recommendation:** Create a migration to add `pickup_requests` to the `supabase_realtime` publication, then build a reusable `useRealtimeSubscription` composable for each app with proper connection state handling and reconnection logic.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @nuxtjs/supabase | ^2.0.3 | Nuxt Supabase integration | Already installed, provides auto-configured client |
| @supabase/supabase-js | ^2.93.2 | Underlying Supabase client | Included via @nuxtjs/supabase, handles realtime |
| @vueuse/core | ^14.1.0 | Vue composables | Already installed, provides useDocumentVisibility |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| RealtimeChannel (type) | From @supabase/supabase-js | TypeScript type | Type the channel variable |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Realtime | Polling | Much simpler but higher latency, more load on DB |
| Full row broadcast | Delta/partial updates | Full row is simpler, small data size (30-40 rows) makes delta unnecessary |

**Installation:**
No additional packages needed - `@nuxtjs/supabase` and `@vueuse/core` already installed.

## Architecture Patterns

### Recommended Project Structure
```
staff/app/
├── composables/
│   └── useRealtimeQueue.ts    # Staff realtime subscription
customer/app/
├── composables/
│   └── useRealtimeStatus.ts   # Customer realtime subscription
supabase/
└── migrations/
    └── 20260130100000_enable_realtime_pickup_requests.sql
```

### Pattern 1: Fetch-Then-Subscribe
**What:** Load initial data with a regular query, then subscribe for changes
**When to use:** Always - ensures initial render doesn't wait for WebSocket
**Example:**
```typescript
// Source: https://dev.to/jacobandrewsky/supabase-realtime-changes-in-nuxt-i6b
const client = useSupabaseClient()

// Step 1: Fetch initial data
const { data: requests, refresh: refreshRequests } = await useAsyncData(
  'pickup-requests',
  async () => {
    const { data } = await client
      .from('pickup_requests')
      .select('*')
      .in('status', ['pending', 'approved', 'in_queue'])
      .order('queue_position', { ascending: true })
    return data
  }
)

// Step 2: Subscribe for changes
import type { RealtimeChannel } from '@supabase/supabase-js'
let realtimeChannel: RealtimeChannel

onMounted(() => {
  realtimeChannel = client
    .channel('pickup-requests-staff')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pickup_requests' },
      () => refreshRequests()
    )
    .subscribe()
})

// Step 3: Cleanup
onUnmounted(() => {
  client.removeChannel(realtimeChannel)
})
```

### Pattern 2: Filtered Subscription (Customer)
**What:** Subscribe only to changes for a specific row by ID
**When to use:** Customer status page - only their request
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/realtime/postgres-changes
const requestId = route.params.id as string

onMounted(() => {
  realtimeChannel = client
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
        // payload.new contains full updated row
        request.value = payload.new
      }
    )
    .subscribe()
})
```

### Pattern 3: Connection State Monitoring
**What:** Monitor subscription status and show UI feedback
**When to use:** Always - user needs to know if connection is lost
**Example:**
```typescript
// Source: https://supabase.com/docs/reference/javascript/subscribe
const connectionStatus = ref<'connecting' | 'connected' | 'disconnected'>('connecting')

onMounted(() => {
  realtimeChannel = client
    .channel('pickup-requests-staff')
    .on('postgres_changes', { /* ... */ }, callback)
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        connectionStatus.value = 'connected'
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        connectionStatus.value = 'disconnected'
      } else if (status === 'TIMED_OUT') {
        connectionStatus.value = 'disconnected'
        // Trigger reconnection
      }
    })
})
```

### Pattern 4: Visibility-Based Reconnection
**What:** Reconnect when tab becomes visible again
**When to use:** Handles mobile/tab switching gracefully
**Example:**
```typescript
// Source: https://vueuse.org/core/useDocumentVisibility/
import { useDocumentVisibility } from '@vueuse/core'

const visibility = useDocumentVisibility()

watch(visibility, async (current, previous) => {
  if (current === 'visible' && previous === 'hidden') {
    // Tab became visible - refresh data and check subscription
    await refreshRequests()
    if (connectionStatus.value !== 'connected') {
      reconnectChannel()
    }
  }
})
```

### Anti-Patterns to Avoid
- **Subscribing in setup():** Subscribe in `onMounted`, not during setup - SSR doesn't have WebSocket
- **Missing cleanup:** Always `removeChannel()` in `onUnmounted` to prevent memory leaks
- **Polling as backup:** Don't add polling "just in case" - rely on reconnection logic
- **Multiple channels per row:** Use one channel per logical subscription, not per component instance

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WebSocket connection | Raw WebSocket | Supabase Realtime | Handles auth, reconnection, heartbeat |
| Visibility detection | window events | useDocumentVisibility | Cross-browser, reactive |
| Channel cleanup | Manual tracking | RealtimeChannel.unsubscribe() | Built-in proper cleanup |
| Filter syntax | Query builder | String filter format | Realtime uses different API than PostgREST |

**Key insight:** Supabase Realtime handles the hard parts (connection management, auth token refresh, reconnection). Your code just subscribes and reacts.

## Common Pitfalls

### Pitfall 1: Table Not Added to Publication
**What goes wrong:** Subscription works but no events arrive
**Why it happens:** Table must be explicitly added to `supabase_realtime` publication
**How to avoid:** Run migration: `ALTER PUBLICATION supabase_realtime ADD TABLE pickup_requests;`
**Warning signs:** Subscribe succeeds, but callback never fires on data changes

### Pitfall 2: Missing Channel Cleanup (Memory Leak)
**What goes wrong:** TooManyChannels error, ChannelRateLimitReached
**Why it happens:** Channels accumulate without cleanup on navigation
**How to avoid:** Always call `client.removeChannel(channel)` in `onUnmounted`
**Warning signs:** Growing memory usage, quota errors after navigation

### Pitfall 3: SSR Subscription Attempt
**What goes wrong:** "window is not defined" or silent failures
**Why it happens:** WebSocket only works in browser, not during SSR
**How to avoid:** Subscribe only in `onMounted`, not in setup or computed
**Warning signs:** Errors during server render, works on client navigation

### Pitfall 4: Stale Data After Reconnection
**What goes wrong:** UI shows outdated data after connection restored
**Why it happens:** Events during disconnection are lost (no queue)
**How to avoid:** Full data refresh on reconnection, not just resuming stream
**Warning signs:** Data inconsistencies after tab switch or network hiccup

### Pitfall 5: OLD Record Expectation with RLS
**What goes wrong:** DELETE/UPDATE events only contain primary key in `old` field
**Why it happens:** Security: RLS prevents leaking data in old records
**How to avoid:** Use only `new` record; for DELETE, just remove by ID
**Warning signs:** `payload.old` contains only `{id: 'uuid'}` not full row

### Pitfall 6: Filter Not Working on DELETE
**What goes wrong:** All DELETE events arrive, not just filtered ones
**Why it happens:** Supabase limitation - filter params don't work with DELETE
**How to avoid:** Filter in callback: `if (payload.old.id !== targetId) return`
**Warning signs:** DELETE callbacks fire for unrelated rows

## Code Examples

Verified patterns from official sources:

### Migration to Enable Realtime
```sql
-- Source: https://supabase.com/docs/guides/realtime/postgres-changes
-- Enable realtime for pickup_requests table
ALTER PUBLICATION supabase_realtime ADD TABLE pickup_requests;
```

### Staff Dashboard Composable
```typescript
// Source: Combined from official docs
// composables/useRealtimeQueue.ts
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useDocumentVisibility } from '@vueuse/core'

type SubscriptionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export function useRealtimeQueue() {
  const client = useSupabaseClient()
  const visibility = useDocumentVisibility()

  const status = ref<SubscriptionStatus>('connecting')
  let channel: RealtimeChannel | null = null

  const subscribe = (onEvent: () => void) => {
    channel = client
      .channel('pickup-requests-staff')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pickup_requests' },
        onEvent
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
  }

  // Auto-reconnect on visibility change
  watch(visibility, (current, previous) => {
    if (current === 'visible' && previous === 'hidden') {
      if (status.value !== 'connected') {
        unsubscribe()
        // Caller should re-fetch and re-subscribe
      }
    }
  })

  return { status, subscribe, unsubscribe }
}
```

### Customer Status Composable
```typescript
// composables/useRealtimeStatus.ts
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

type PickupRequest = Database['public']['Tables']['pickup_requests']['Row']

export function useRealtimeStatus(requestId: string) {
  const client = useSupabaseClient<Database>()

  const status = ref<'connecting' | 'connected' | 'disconnected'>('connecting')
  let channel: RealtimeChannel | null = null

  const subscribe = (
    onUpdate: (payload: RealtimePostgresChangesPayload<PickupRequest>) => void
  ) => {
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
          // Extra safety for DELETE filter limitation
          if (payload.eventType === 'DELETE' && payload.old?.id !== requestId) {
            return
          }
          onUpdate(payload as RealtimePostgresChangesPayload<PickupRequest>)
        }
      )
      .subscribe((subscribeStatus) => {
        status.value = subscribeStatus === 'SUBSCRIBED' ? 'connected' : 'disconnected'
      })
  }

  const unsubscribe = () => {
    if (channel) {
      client.removeChannel(channel)
      channel = null
    }
  }

  return { status, subscribe, unsubscribe }
}
```

### Connection Status UI Component
```vue
<!-- components/ConnectionStatus.vue -->
<template>
  <div
    v-if="status !== 'connected'"
    class="fixed bottom-4 right-4 px-4 py-2 rounded-lg text-sm"
    :class="{
      'bg-yellow-100 text-yellow-800': status === 'connecting',
      'bg-red-100 text-red-800': status === 'disconnected' || status === 'error'
    }"
  >
    <span v-if="status === 'connecting'">Connecting...</span>
    <span v-else-if="status === 'disconnected'">Reconnecting...</span>
    <span v-else-if="status === 'error'">Connection lost. Retrying...</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
}>()
</script>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Polling every N seconds | Realtime subscriptions | 2020+ | Lower latency, less DB load |
| Custom WebSocket | Supabase Realtime | 2020+ | Built-in auth, reconnection |
| anon key only | publishable key (sb_publishable_) | 2025+ | Better security, rotation support |

**Deprecated/outdated:**
- Manual WebSocket management: Use Supabase Realtime
- Realtime v1 API: Current is v2 with `channel()` method

## Open Questions

Things that couldn't be fully resolved:

1. **Token refresh during long sessions**
   - What we know: Access tokens expire, realtime may stop working
   - What's unclear: Does @nuxtjs/supabase auto-refresh tokens for realtime?
   - Recommendation: Monitor for token issues, may need manual refresh logic

2. **Exact reconnection timeout**
   - What we know: TIMED_OUT status indicates connection loss
   - What's unclear: Optimal timeout before showing "reconnecting" UI
   - Recommendation: Show after 3-5 seconds of non-SUBSCRIBED status

3. **DELETE filter limitation workaround**
   - What we know: Filter doesn't work for DELETE events
   - What's unclear: Whether this will be fixed in future Supabase versions
   - Recommendation: Filter in callback for now, check for updates periodically

## Sources

### Primary (HIGH confidence)
- [Supabase Realtime Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes) - Channel API, filters, payload structure
- [Supabase Subscribe API Reference](https://supabase.com/docs/reference/javascript/subscribe) - Status values, callback pattern
- [@nuxtjs/supabase Documentation](https://supabase.nuxtjs.org/) - Module configuration, composables
- [VueUse useDocumentVisibility](https://vueuse.org/core/useDocumentVisibility/) - Visibility tracking API

### Secondary (MEDIUM confidence)
- [Supabase Realtime Changes in Nuxt](https://dev.to/jacobandrewsky/supabase-realtime-changes-in-nuxt-i6b) - Integration pattern, cleanup
- [GitHub: Handling Realtime Idle Reconnects](https://github.com/orgs/supabase/discussions/19387) - Reconnection strategies
- [Supabase Realtime Error Codes](https://supabase.com/docs/guides/realtime/error_codes) - Connection status codes

### Tertiary (LOW confidence)
- [GitHub: OLD record with RLS](https://github.com/orgs/supabase/discussions/12471) - RLS limitation documentation
- [GitHub: DELETE filter limitation](https://github.com/supabase/supabase/issues/34356) - Confirmed behavior

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - @nuxtjs/supabase already installed and documented
- Architecture: HIGH - Patterns verified from official docs
- Pitfalls: HIGH - Multiple sources confirm issues and workarounds
- Connection handling: MEDIUM - Some edge cases not fully documented

**Research date:** 2026-01-29
**Valid until:** 2026-02-28 (30 days - Supabase Realtime is stable)
