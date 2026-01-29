# Phase 9: Real-time Queue Updates - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Make queue changes immediately visible to all affected parties. Customers see position updates, wait time estimates, gate assignments, and status transitions in real-time. Staff dashboard reflects all changes without manual refresh.

Infrastructure (Supabase Realtime subscriptions) already exists from Phase 8. This phase implements the display and notification logic that consumes those subscriptions.

</domain>

<decisions>
## Implementation Decisions

### Wait time calculation
- Rolling average based on last 10 completed pickups
- Wait time = (average completion time) × (position - 1)
- Hide wait time display entirely when no history exists (e.g., start of day)
- Display as a range (e.g., "10-15 minutes") not exact estimate

### Position display
- Show absolute position: "You are #3 in queue"
- Position updates with subtle transition animation (fade or slide)
- Position #1: Still show "#1" with supportive text like "Your turn any moment"
- When actually called (status change): Full-screen takeover with "Proceed to Gate X"
- Gate-focused instruction only, no visual map needed

### Notification moments
- Position changes: Visual feedback only for significant changes (reaching position 3 or lower, or moving up 2+ spots)
- No special "almost your turn" alert — position display is sufficient
- Gate assignment changes: Toast notification to ensure customer notices
- Turn arrival (status change to being served): Full-screen takeover, unmissable

### Staff dashboard refresh
- Row-level updates, not full table refresh — maintains scroll position
- No highlight on changed rows — data updates silently
- New requests auto-add to table at sorted position
- Completed/cancelled rows stay visible briefly with final status
- Toggle switch to show/hide completed/cancelled (not separate tabs)

### Claude's Discretion
- Exact transition animation implementation (CSS or Vue transition)
- Range calculation for wait time display (e.g., ±20% of estimate)
- Toast notification styling and duration
- Full-screen takeover design and dismissal behavior
- Toggle switch placement and default state

</decisions>

<specifics>
## Specific Ideas

- When customer is #1, show something like "Your turn any moment" to set expectations that staff still needs to accept them
- Full-screen takeover when it's their turn should clearly say "Proceed to Gate X" — action-oriented, not just status

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-realtime-queue-updates*
*Context gathered: 2026-01-29*
