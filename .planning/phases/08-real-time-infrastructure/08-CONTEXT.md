# Phase 8: Real-time Infrastructure - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable real-time updates across all connected clients via Supabase Realtime. Configure subscriptions for pickup_requests table so changes broadcast to staff dashboard and customer status pages. This phase sets up the infrastructure; consuming the updates in UI is Phase 9 (staff) and Phase 10 (customer).

</domain>

<decisions>
## Implementation Decisions

### Subscription scope
- Subscribe to `pickup_requests` table (gates table changes handled via manual refresh)
- Track INSERT, UPDATE, and DELETE events
- Staff dashboard receives ALL request changes (queue size ~30-40 max, no need for filtering)
- Customer app receives only changes to THEIR specific request (filtered by request ID)

### Client connection
- Establish subscription AFTER initial data fetch (fetch first, then subscribe for changes)
- Show "reconnecting" status indicator when connection drops
- Auto-reconnect in background with visual feedback to user
- Full data refresh on reconnect to ensure accuracy

### Event payload
- Broadcast full row on every event (not just changed fields)
- Client computes derived values like wait time estimate from queue position
- Broadcast all fields including email/phone (channel filtering already limits customer to their own row)

### Channel design
- Single global channel for staff dashboard (all requests, all gates)
- Customer channel filtered by request ID
- Customer identifies their request via BOTH URL parameter (/status/{id}) AND local storage
- Human-readable channel names for easier debugging (e.g., `pickup-requests-staff`, `pickup-request-{id}`)

### Claude's Discretion
- Whether to include old record in UPDATE/DELETE payloads (for UI animations)
- Exact timeout before showing "connection lost" indicator
- Channel authentication approach (RLS vs request-ID-as-token)
- Whether gates table needs realtime (likely no, given rare changes)

</decisions>

<specifics>
## Specific Ideas

- Queue size context: max 30-40 people waiting at once — no need for gate-based filtering on staff side
- Customer should be able to return to their status page via bookmarked URL OR by app remembering their request

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-real-time-infrastructure*
*Context gathered: 2026-01-29*
