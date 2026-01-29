# Phase 6: Staff Advanced Queue Operations - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Fine-tune queue order and manage gates. Staff can reorder positions within a gate, move customers between gates, mark requests as priority, and enable/disable gates. Gate CRUD (create, rename, delete) is included.

</domain>

<decisions>
## Implementation Decisions

### Reorder interaction
- Drag-and-drop for reordering queue positions
- Reordering happens within a per-gate filtered view (not across mixed table of all gates)
- Gate reassignment is a separate action via dropdown — no cross-gate dragging
- No undo needed — staff can drag again if they made a mistake

### Priority behavior
- Priority moves request to position 2 (behind whoever is currently being served)
- Priority can only be set on requests already in the queue (not pending/approved)
- Multiple priorities stack FIFO — first priority stays at 2, next goes to 3, etc.

### Gate management
- Full CRUD — staff can create new gates, rename existing gates, and delete unused gates
- Gates with customers in queue cannot be disabled (or deleted)
- Disabled gates appear greyed out but remain visible (can see history)

### Visual feedback
- Optimistic updates during drag-and-drop (rollback on server failure)

### Claude's Discretion
- Gate management UI placement (dedicated area vs inline vs per-tab controls)
- Behavior when disabling a gate with customers (block with error vs offer to reassign)
- Drag state visual treatment (ghost preview, lift effect, drop zone highlighting)
- Toast notification strategy (every action, errors only, or balanced approach)
- Priority visual indicator (badge, icon, or position alone)
- Real-time update feedback for changes from other staff members

</decisions>

<specifics>
## Specific Ideas

- "Reordering while looking at all pickups across all gates may not be very intuitive" — filtering by gate first makes sense for the reorder interaction

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-staff-advanced-queue-operations*
*Context gathered: 2026-01-29*
