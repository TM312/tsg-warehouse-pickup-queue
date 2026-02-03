# Phase 24: Unified Queue Table - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Single QueueTable component replaces separate table implementations. Supports two modes: sort mode (All Requests tab) for viewing/filtering, and drag mode (gate tabs) for manual queue reordering. Deprecated GateQueueList component removed.

</domain>

<decisions>
## Implementation Decisions

### Drag Interaction
- Drag handle on far left edge of each row (grip icon before any content)
- Ghost row follows cursor during drag (semi-transparent copy of row)
- No touch/mobile drag support — use keyboard arrows on mobile instead

### Sort Mode Behavior
- Default sort: created time, newest first
- Sort direction indicated by arrow in column header (up/down)

### Mode Switching
- Column headers visible in both modes (but not clickable in drag mode)
- Same columns in both modes for consistency

### Keyboard Reordering
- Single step only (no Shift+Arrow for multi-row jumps)
- Cmd/Ctrl+Up jumps to top, Cmd/Ctrl+Down jumps to bottom
- Visual feedback only (animation + screen reader announcement, no sound)

### Claude's Discretion
- Which columns are sortable (pick based on queue management needs)
- Sort preference persistence (localStorage or reset on refresh)
- How table determines mode (tab-based vs explicit prop)
- Whether to show mode indicator (sort arrows vs drag handles may be self-evident)
- Drop zone indication style (line between rows vs row highlight)
- Keyboard reorder initiation method (immediate arrows vs enter-mode-first)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for drag-and-drop tables.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 24-unified-queue-table*
*Context gathered: 2026-02-03*
