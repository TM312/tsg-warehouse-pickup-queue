---
phase: 21-dashboard-polish
plan: 01
subsystem: ui
tags: [vue, nuxt, dashboard, tabs, table, toggle]

# Dependency graph
requires:
  - phase: 20-gates-view
    provides: GatesTable pattern and /gates page for gate management
  - phase: 19-dashboard-refactoring
    provides: useDashboardData composable structure
provides:
  - ShowUnassignedToggle component for filtering unassigned orders
  - Table-based NowProcessingSection with per-gate rows
  - activeGatesForProcessing computed in useDashboardData
  - Cleaned dashboard tabs (removed "Manage Gates")
affects: [21-02, dashboard-polish, processing-actions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-gate processing table with idle state display"
    - "Dual filter toggles (showCompleted, showOnlyUnassigned)"
    - "ProcessingGateRow interface for gate-centric display"

key-files:
  created:
    - staff/app/components/dashboard/ShowUnassignedToggle.vue
  modified:
    - staff/app/composables/useDashboardData.ts
    - staff/app/components/dashboard/NowProcessingSection.vue
    - staff/app/pages/index.vue

key-decisions:
  - "DEC-21-01-01: Table layout for processing section with one row per active gate"
  - "DEC-21-01-02: Idle gates show 'Idle' text in muted italic styling"
  - "DEC-21-01-03: O(1) processing order lookup using computed Map pattern"

patterns-established:
  - "ProcessingGateRow interface: { id, gate_number, order: {...} | null }"
  - "Dual toggle filters in composable with chained filtering"

# Metrics
duration: 4min
completed: 2026-02-03
---

# Phase 21 Plan 01: Dashboard Polish Summary

**Table-based processing section with per-gate rows showing idle/busy status, plus "Show only unassigned" filter toggle**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-03T06:21:19Z
- **Completed:** 2026-02-03T06:25:16Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Created ShowUnassignedToggle component for filtering orders without gate assignment
- Converted NowProcessingSection from cards to table format with one row per active gate
- Added activeGatesForProcessing computed with O(1) Map lookup for processing orders
- Removed "Manage Gates" tab (functionality now on /gates page)
- Wired both filter toggles into useDashboardData composable

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ShowUnassignedToggle and update useDashboardData** - `3a06a74` (feat)
2. **Task 2: Convert NowProcessingSection to table format** - `cc4367f` (feat)
3. **Task 3: Update index.vue tabs and wire up new components** - `9f68453` (feat)

Note: Task 3 commit was labeled as 21-02 due to concurrent execution, but contains 21-01 Task 3 changes.

## Files Created/Modified
- `staff/app/components/dashboard/ShowUnassignedToggle.vue` - Toggle for filtering unassigned orders
- `staff/app/composables/useDashboardData.ts` - Added showOnlyUnassigned parameter and activeGatesForProcessing computed
- `staff/app/components/dashboard/NowProcessingSection.vue` - Table with Gate, Order, Company, Status, Actions columns
- `staff/app/pages/index.vue` - Removed "Manage Gates" tab, added toggles, wired new props

## Decisions Made
- DEC-21-01-01: Table layout for processing section instead of cards, showing all active gates
- DEC-21-01-02: Idle gates display "Idle" text with muted-foreground italic class
- DEC-21-01-03: Used computed Map pattern (from GatesTable.vue) for O(1) processing order lookup by gate ID

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing onRevert callback to createColumns**
- **Found during:** Task 3 (Update index.vue)
- **Issue:** ColumnCallbacks interface requires onRevert, not in original plan
- **Fix:** Added onRevert: handleProcessingRevert to createColumns call
- **Files modified:** staff/app/pages/index.vue
- **Verification:** TypeScript compiles without errors
- **Committed in:** 9f68453 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required to satisfy existing interface contract. No scope creep.

## Issues Encountered
None - typecheck passed with only pre-existing errors (native-select, gate/[id].vue pinia import)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Dashboard tabs now clean: "All Requests" + per-gate tabs only
- Processing section shows table with all active gates (idle or busy)
- Ready for Plan 02: Action button improvements (dropdown menu for processing orders)

---
*Phase: 21-dashboard-polish*
*Completed: 2026-02-03*
