# Phase 10: Customer Queue Experience - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Customers have full visibility into their queue status after submitting a pickup request. This includes real-time queue position display, gate assignment, wait time estimate, and visual confirmation when pickup is complete.

Note: Phase 9 already implemented the core status page with position display, wait time estimation (WaitTimeDisplay), TurnTakeover for position 1, and gate assignment toasts. This phase refines the experience and adds completion confirmation.

</domain>

<decisions>
## Implementation Decisions

### Status page layout
- Context-aware prominence: use queue management best practice, simple approach
- Position prominent when waiting, gate prominent when assigned (not overcomplicated)
- Wait time shown as time range (e.g., "~5-10 minutes") to acknowledge variability
- Minimal order info: just order number displayed, keep focus on queue status
- Gate queue details: follow decisions from earlier phases (already discussed)

### Completion confirmation
- Status change approach, not full-screen takeover
- Page updates to show "Completed" status clearly but not intrusively
- Show pickup summary: "Order #12345 completed at Gate B" — receipt-like confirmation
- Subtle success visuals: green checkmark, success colors — professional but positive
- Stay on page after completion — customer manually closes or navigates away

### Loading & error states
- Skeleton UI while status page is loading — placeholder shapes where content will appear
- "Request not found" error includes link to submit new request
- Live indicator (pulsing dot or "Live" badge) to show data is real-time

### Cancelled/rejected handling
- Clear status change with explanation — informative, not minimal
- Include link to submit new request: "Request was cancelled. Submit a new request"
- Neutral/informative styling — muted colors, not warning red (not customer's fault)
- Generic cancellation message — no staff-provided reason displayed

### Claude's Discretion
- Connection loss handling (silent retry vs banner warning)
- Exact skeleton UI shape and animation
- Live indicator placement and style
- Specific wording for error and status messages

</decisions>

<specifics>
## Specific Ideas

- Wait time range format already implemented in Phase 9 with +/- 20% buffer — maintain consistency
- TurnTakeover already handles position 1 with gate assigned — completion is a different flow (status change, not takeover)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-customer-queue-experience*
*Context gathered: 2026-01-29*
