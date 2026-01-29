---
phase: "08"
plan: "01"
subsystem: "realtime"
tags: [supabase-realtime, websocket, vue-composable, connection-state]

dependency-graph:
  requires: ["01-01-schema", "03-01-nuxt-app"]
  provides: ["realtime-publication", "staff-subscription-composable", "connection-status-ui"]
  affects: ["08-02", "09-01", "10-01"]

tech-stack:
  added: []
  patterns: ["postgres-changes-subscription", "visibility-based-reconnection", "channel-cleanup"]

key-files:
  created:
    - supabase/migrations/20260130100000_enable_realtime_pickup_requests.sql
    - staff/app/composables/useRealtimeQueue.ts
    - staff/app/components/ConnectionStatus.vue
  modified: []

decisions:
  - id: "realtime-publication"
    choice: "ALTER PUBLICATION supabase_realtime ADD TABLE"
    rationale: "Standard Supabase pattern for enabling realtime on existing tables"
  - id: "visibility-reconnection"
    choice: "useDocumentVisibility from @vueuse/core"
    rationale: "Handles tab switching gracefully; refreshes data on visibility change to catch missed events"
  - id: "channel-naming"
    choice: "pickup-requests-staff"
    rationale: "Human-readable channel name aids debugging in Supabase logs"
  - id: "onunmounted-cleanup"
    choice: "Automatic cleanup in onUnmounted hook"
    rationale: "Prevents memory leaks and TooManyChannels errors on navigation"

metrics:
  duration: "~2 minutes"
  completed: "2026-01-29"
---

# Phase 08 Plan 01: Enable Realtime for pickup_requests Summary

**One-liner:** Supabase Realtime publication for pickup_requests with staff subscription composable and connection status UI

## What Was Built

### 1. Realtime Publication Migration
Added `pickup_requests` table to the `supabase_realtime` publication, enabling INSERT/UPDATE/DELETE events to be broadcast to all subscribed WebSocket clients.

### 2. useRealtimeQueue Composable (`staff/app/composables/useRealtimeQueue.ts`)
Staff dashboard subscription composable with:
- `subscribe(onEvent)` - Subscribe to all pickup_requests changes
- `unsubscribe()` - Clean up channel subscription
- `status` - Readonly ref tracking connection state
- Exported `SubscriptionStatus` type for type-safe component props

Key features:
- Connection status tracking: connecting, connected, disconnected, error
- Visibility-based reconnection using `useDocumentVisibility`
- Full data refresh on tab visibility change (handles missed events)
- Automatic channel cleanup in `onUnmounted`

### 3. ConnectionStatus Component (`staff/app/components/ConnectionStatus.vue`)
Visual feedback component for connection state:
- Fixed position bottom-right corner
- Hidden when connected (no UI noise during normal operation)
- Yellow background for "Connecting..." state
- Red background for "Reconnecting..." or "Connection lost. Retrying..."

## Key Technical Details

### Realtime Subscription Pattern
```typescript
// Usage in dashboard page
const { status, subscribe, unsubscribe } = useRealtimeQueue()

onMounted(() => {
  subscribe(() => refreshRequests())
})

onUnmounted(() => {
  unsubscribe()
})
```

### Connection Status Values
| Status | Meaning | Supabase Status |
|--------|---------|-----------------|
| connecting | Initial state, waiting for WebSocket | SUBSCRIBING |
| connected | Successfully subscribed | SUBSCRIBED |
| disconnected | Connection lost or closed | CLOSED, TIMED_OUT |
| error | Channel error occurred | CHANNEL_ERROR |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

1. **Database:** `pickup_requests` confirmed in `supabase_realtime` publication
2. **TypeScript:** All files pass compilation (only expected database types warning)
3. **Files:** All three artifacts created at specified paths

## Files Changed

| File | Change | Purpose |
|------|--------|---------|
| `supabase/migrations/20260130100000_enable_realtime_pickup_requests.sql` | Created | Enable realtime publication |
| `staff/app/composables/useRealtimeQueue.ts` | Created | Staff subscription composable |
| `staff/app/components/ConnectionStatus.vue` | Created | Connection status UI |

## Next Phase Readiness

This plan provides the foundational infrastructure for real-time updates:

- **08-02:** Customer app needs similar `useRealtimeStatus` composable with ID-filtered subscription
- **09-01:** Dashboard integration will use `useRealtimeQueue` in the queue page
- **10-01:** Customer status page will use filtered subscription for single-request updates

No blockers identified. Ready to proceed with 08-02 (Customer Realtime Subscription).
