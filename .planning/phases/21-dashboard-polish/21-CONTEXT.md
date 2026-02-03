# Phase 21: Dashboard Polish - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix UX issues on the dashboard: remove "Manage Gates" tab (now on /gates), update the "Now Processing" section to show a table with one row per active gate, and fix action button states so processing orders show the correct actions.

</domain>

<decisions>
## Implementation Decisions

### Tabs cleanup
- Remove "Manage Gates" tab entirely (functionality moved to /gates page)
- Remaining tabs: "All" + one tab per gate (e.g., "Gate 1", "Gate 2")
- Only active gates appear as tabs (inactive gates excluded)
- Add "Show only unassigned" checkbox/toggle above the table
- Checkbox filters current tab view to orders with no gate assignment

### Processing section
- Show a table with one row per active gate (not per order)
- When gate has processing order: show order info (using existing order display pattern)
- When gate is idle: show "Idle" text (muted styling)
- Only active gates appear in processing table (inactive gates excluded)
- Reuse existing order display patterns to maintain DRY principle

### Action buttons
- Processing orders: "Complete" as primary visible button
- "Return to Queue" and "Cancel" moved to dropdown menu (not visible buttons)
- This keeps the UI clean with one clear primary action
- Dropdown pattern applies to processing state; other states follow existing patterns

### Claude's Discretion
- Exact checkbox/toggle placement above table
- Styling of "Idle" text in processing table
- Dropdown trigger icon/styling (dots, chevron, etc.)

</decisions>

<specifics>
## Specific Ideas

- Unified order display model — avoid defining how to depict an order in every component (DRY principle)
- Processing section should use same order representation as other parts of the app

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 21-dashboard-polish*
*Context gathered: 2026-02-03*
