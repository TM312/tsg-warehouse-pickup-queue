# Phase 5: Staff Queue Management - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Staff can process pickup requests through the basic workflow: assign a gate (which adds to queue), cancel a request, and mark a pickup as complete. This phase adds action capabilities to the dashboard built in Phase 4. Advanced operations (reordering, priority override, gate management) are Phase 6.

</domain>

<decisions>
## Implementation Decisions

### Action triggers
- Action buttons visible directly in table rows (not dropdown menu)
- Click row to open detail panel with full request info and actions
- No batch actions — one request at a time is sufficient
- Claude's discretion on contextual vs always-visible buttons

### Gate assignment flow
- Inline dropdown in row for gate selection
- Dropdown shows: Gate name + queue count (e.g., "Gate 1 (3 in queue)")
- Assigning a gate automatically adds to queue (pending → in_queue directly, no separate "approved" step)
- Reassignment allowed with confirmation dialog
- Note: Customer notification on reassignment handled by Phase 9 (real-time updates)

### Status transitions
- pending → in_queue: Happens when gate assigned (one action)
- Cancel: Simple "Are you sure?" confirmation (yes/no)
- Complete: Quick "Mark complete?" confirmation
- Completed/cancelled requests: Fade out after ~30 seconds from active view
- Two tabs in dashboard: "Active Queue" and "History" for accessing all requests

### Feedback & updates
- Both toast notification AND inline visual feedback on success
- Buttons show spinner while action processing, disabled until complete
- Claude's discretion on optimistic updates vs wait for server
- Claude's discretion on error display pattern

</decisions>

<specifics>
## Specific Ideas

- Completed/cancelled requests must always be easily accessible for cross-checking — History tab serves this need
- When reassigning to different gate, customer interface should show clear message about new gate assignment (Phase 9 will implement the real-time notification)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-staff-queue-management*
*Context gathered: 2026-01-29*
