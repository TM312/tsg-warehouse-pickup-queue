# Phase 11: Processing Status Foundation - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable explicit acceptance of pickups with a new "processing" status between queued and completed. This includes schema changes, StatusBadge component updates, and dashboard integration. The gate operator view itself is Phase 12.

</domain>

<decisions>
## Implementation Decisions

### Status Badge Styling
- Yellow/amber color family for processing status
- Spinning loader icon (no additional icon, just the spinner)
- Badge text says "Processing"
- Duration shown inside badge: "Processing (5m)"
- Minutes-only format for duration (5m, 12m, 1h 5m)

### Timestamp Display
- Live duration counter that updates in real-time
- Duration displayed inside the badge itself
- Processing start timestamp recorded in database

### Claude's Discretion
- Whether to add visual warning (color change) if processing takes too long
- Exact threshold for "too long" if warning implemented

### Dashboard Behavior
- Separate "Now Processing" section above the queue list
- All gates shown vertically beneath each other
- Each processing item shows gate number prominently
- Checkbox filter to hide closed gates
- Gates with no active pickup show "Available" state
- Supervisors can see which gates are unused at a glance

### State Transitions
- Both gate operator and supervisor can trigger "Start Processing"
- Anyone (gate operator or supervisor) can revert processing back to queued
- When reverted, pickup returns to original queue position (not position 1)
- Only one pickup can be processing per gate at a time

</decisions>

<specifics>
## Specific Ideas

- Dashboard should give supervisors visibility into gate utilization
- "Now Processing" section provides at-a-glance status of all active work
- Revert-to-queue preserves original position for fairness to other customers

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-processing-status-foundation*
*Context gathered: 2026-01-30*
