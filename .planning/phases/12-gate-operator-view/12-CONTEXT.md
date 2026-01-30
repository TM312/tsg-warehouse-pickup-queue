# Phase 12: Gate Operator View - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Gate operators can efficiently manage pickups at their assigned gate from a mobile device. This includes viewing the current pickup, starting/completing processing, and seeing what's next. The view is focused on a single gate — no cross-gate management.

</domain>

<decisions>
## Implementation Decisions

### Current pickup display
- Company name only (no individual customer name)
- No wait time displayed — keep it simple with just order details
- Gate number shown at top as header — confirms operator is viewing correct gate

### Action button behavior
- "Start Processing" — no confirmation required, single tap starts immediately
- "Complete" — requires confirmation dialog showing what was completed before finalizing
- "Revert to Queue" — available but de-emphasized (secondary action, not prominent)

### Next-up preview
- Show only the next pickup (position 2), not full queue
- Show queue count for this gate (e.g., "3 more in queue")
- Sales order number only for next-up — minimal detail
- Queue count updates in real-time as pickups are assigned

### Empty/idle states
- Friendly message with illustration when no pickups assigned
- No cross-gate info — operator focuses only on their gate
- Auto-refresh when a pickup gets assigned (real-time updates)
- Brief transition animation between completing one pickup and showing next

### Claude's Discretion
- Sales order prominence/hierarchy in layout
- Visual feedback after successful actions (toast vs inline transition)
- Next-up preview placement (below current vs footer)
- Specific illustration for empty state

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 12-gate-operator-view*
*Context gathered: 2026-01-30*
