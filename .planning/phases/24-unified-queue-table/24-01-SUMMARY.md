---
phase: 24-unified-queue-table
plan: 01
subsystem: ui
tags: [vue, tanstack-table, useSortable, drag-and-drop]

# Dependency graph
requires:
  - phase: 21-dashboard-polish
    provides: RequestsTable and GateQueueList patterns to merge
provides:
  - QueueTable component with mode prop ('sort' | 'drag')
  - queueTableColumns with direction-aware sort headers
  - QueueItem type for drag mode interface
affects: [24-02, future gate tabs, all requests tab]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dual mode component pattern: mode prop switches between sort and drag behaviors"
    - "Direction-aware sort headers: ArrowUp/ArrowDown/ArrowUpDown based on sort state"

key-files:
  created:
    - staff/app/components/dashboard/QueueTable.vue
    - staff/app/components/dashboard/queueTableColumns.ts
  modified: []

key-decisions:
  - "Default sort: created_at descending (newest first)"
  - "Same columns in both modes for visual consistency"
  - "Drag mode headers visible but not clickable"
  - "Keep requestsTableColumns.ts for backward compatibility until CLN-02 cleanup"

patterns-established:
  - "Dual mode component: single component with mode prop to switch rendering strategy"
  - "createSortableHeader helper for consistent sortable column headers with direction arrows"

# Metrics
duration: 8min
completed: 2026-02-03
---

# Phase 24 Plan 01: Unified Queue Table Summary

**QueueTable component with dual mode support (TanStack sort mode / useSortable drag mode), direction-aware column headers, and inline action buttons for drag mode**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-03T09:52:04Z
- **Completed:** 2026-02-03T10:00:00Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments
- Created unified QueueTable component with mode prop ('sort' | 'drag')
- Sort mode uses TanStack table with default created_at descending sort
- Drag mode uses useSortable with grip handles and action buttons (Priority, Complete)
- Column headers show direction-specific arrows (ArrowUp when ascending, ArrowDown when descending, ArrowUpDown when unsorted)
- Same columns rendered in both modes per CONTEXT.md decision

## Task Commits

Each task was committed atomically:

1. **Task 1: Create QueueTable component with dual mode support** - `2b9d9c3` (feat)
2. **Task 2: Update column definitions with sort direction indicators** - `6af3803` (feat)

## Files Created

- `staff/app/components/dashboard/QueueTable.vue` - Unified table component with mode prop, sort mode uses TanStack, drag mode uses useSortable
- `staff/app/components/dashboard/queueTableColumns.ts` - Column definitions with direction-aware sort headers, QueueItem type export

## Decisions Made

1. **Default sort created_at descending** - Per CONTEXT.md, newest requests appear first
2. **Same columns in both modes** - Per CONTEXT.md, visual consistency between tabs
3. **Drag mode headers visible but not clickable** - Headers provide column context without sort functionality in drag mode
4. **Keep original requestsTableColumns.ts** - Backward compatibility maintained until CLN-02 cleanup phase

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- QueueTable ready for integration in All Requests tab (sort mode)
- QueueTable ready for integration in gate-specific tabs (drag mode)
- Plan 24-02 can add keyboard accessibility to existing component
- Original RequestsTable and GateQueueList can be deprecated after integration

---
*Phase: 24-unified-queue-table*
*Completed: 2026-02-03*
