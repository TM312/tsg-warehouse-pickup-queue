# Phase 20: Gates View - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Create a dedicated /gates page for managing gates. Staff can view all gates, create new gates, and enable/disable gates. The gate operator view (/gate/[id]) already exists — this page provides the management overview.

</domain>

<decisions>
## Implementation Decisions

### Table layout
- Standard columns: Gate name, status, queue count, currently processing order
- Status displayed as colored badge (green/gray) with "Active" or "Inactive" text
- Queue count as plain number
- Processing order shows order ID only, "—" when no order is processing

### Create gate flow
- Modal dialog triggered by button
- Only field required: gate name
- New gates start as active by default

### Enable/disable behavior
- Toggle switch in the table controls gate state
- Confirmation required only if gate has active orders (queued or processing)
- Cannot disable a gate that has orders — must reassign or complete first
- Error message should include specific count and clear action guidance

### Page structure
- Header style matches dashboard pattern
- No sorting or filtering — static list sufficient
- Explicit "Open" link in actions column to navigate to /gate/[id]
- Row itself is not clickable

### Claude's Discretion
- "Create Gate" button placement
- Empty state design when no gates exist
- Exact error message wording for blocked disable

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches that match existing app patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 20-gates-view*
*Context gathered: 2026-02-03*
