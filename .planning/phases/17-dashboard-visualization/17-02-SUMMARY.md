---
phase: 17-dashboard-visualization
plan: 02
subsystem: api
tags: [supabase, date-fns, vueuse, composables, kpis]

# Dependency graph
requires:
  - phase: 15-pinia-infrastructure
    provides: Supabase client patterns, useSupabaseClient composable
provides:
  - useDashboardKpis composable with completedCount, avgWaitTimeMinutes, avgProcessingTimeMinutes
  - formatDuration utility for human-readable duration formatting
  - PickupRequest type with completed_at field
affects: [17-03-PLAN, 17-04-PLAN, dashboard-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useIntervalFn for periodic data refresh (30s)"
    - "Return null for missing data, format as '--' in UI"
    - "startOfDay for timezone-aware date filtering"

key-files:
  created:
    - staff/app/composables/useDashboardKpis.ts
    - staff/app/utils/formatDuration.ts
  modified:
    - staff/shared/types/pickup-request.ts

key-decisions:
  - "30-second refresh interval for KPI data"
  - "Return null from composable when no data, caller formats as '--'"
  - "Use startOfDay from date-fns for timezone-aware today filtering"

patterns-established:
  - "KPI composable pattern: fetch + computed metrics + periodic refresh"
  - "Duration formatting: minutes input, 'Xh Ym' output, '--' for null"

# Metrics
duration: 5min
completed: 2026-02-02
---

# Phase 17 Plan 02: KPI Data Layer Summary

**Dashboard KPI composable with completedCount, avgWaitTimeMinutes, avgProcessingTimeMinutes calculations and 30-second periodic refresh**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-02
- **Completed:** 2026-02-02
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Added completed_at field to PickupRequest TypeScript type
- Created formatDuration utility for human-readable duration display
- Created useDashboardKpis composable with today's completed pickups query
- Implemented average wait time calculation (created_at to processing_started_at)
- Implemented average processing time calculation (processing_started_at to completed_at)
- Set up 30-second periodic refresh using useIntervalFn

## Task Commits

Each task was committed atomically:

1. **Task 1: Add completed_at to PickupRequest type** - `f3cbf52` (feat)
2. **Task 2: Create formatDuration utility** - `b7959f8` (feat)
3. **Task 3: Create useDashboardKpis composable** - `c12b7e0` (feat)

## Files Created/Modified
- `staff/shared/types/pickup-request.ts` - Added completed_at field to PickupRequest interface
- `staff/app/utils/formatDuration.ts` - Duration formatting utility (minutes to "Xh Ym")
- `staff/app/composables/useDashboardKpis.ts` - KPI data layer with Supabase query and calculations

## Decisions Made
- **30-second refresh interval:** Balances freshness with server load, as specified in CONTEXT.md
- **Null for missing data:** Composable returns null when no valid data exists; caller uses formatDuration to display "--"
- **startOfDay for filtering:** Uses date-fns startOfDay for timezone-aware "today" filtering in Supabase query

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- KPI data layer ready for dashboard UI components
- formatDuration utility available for KPI cards
- useDashboardKpis provides all three metrics: completedCount, avgWaitTimeMinutes, avgProcessingTimeMinutes
- Plan 17-03 (Bar Chart) and 17-04 (KPI Cards) can proceed

---
*Phase: 17-dashboard-visualization*
*Completed: 2026-02-02*
