---
phase: 14-type-foundation
plan: 02
subsystem: types
tags: [typescript, vue, as-const, imports, refactor]

# Dependency graph
requires:
  - phase: 14-01
    provides: PICKUP_STATUS, PickupStatus, PickupRequest, ACTIVE_STATUSES from #shared/types
provides:
  - columns.ts re-exports types for backward compatibility
  - StatusBadge uses PICKUP_STATUS constants for comparisons
  - ActionButtons uses PickupStatus type for status prop
  - RequestDetail uses ACTIVE_STATUSES for filtering
  - CurrentPickup uses typed GateStatus derived from PICKUP_STATUS
  - No magic status strings in any dashboard components
affects: [14-03-PLAN, 15-pinia-infrastructure]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Import types from #shared/types for consistency"
    - "Re-export from old location for backward compatibility"
    - "Derive narrow types from PICKUP_STATUS constants"

key-files:
  created: []
  modified:
    - staff/app/components/dashboard/columns.ts
    - staff/app/components/dashboard/StatusBadge.vue
    - staff/app/components/dashboard/ActionButtons.vue
    - staff/app/components/dashboard/RequestDetail.vue
    - staff/app/components/gate/CurrentPickup.vue

key-decisions:
  - "Keep variantMap/labelMap with string keys in StatusBadge (local display logic, not type-sensitive)"
  - "Re-export from columns.ts for backward compatibility during transition"
  - "Derive GateStatus type from PICKUP_STATUS.IN_QUEUE | PICKUP_STATUS.PROCESSING for narrower typing"

patterns-established:
  - "ACTIVE_STATUSES cast to readonly string[] for .includes() calls"
  - "Narrow types derived from PICKUP_STATUS for component-specific constraints"

# Metrics
duration: 4min
completed: 2026-01-30
---

# Phase 14 Plan 02: Dashboard Type Migration Summary

**Migrated 5 dashboard components to use centralized PICKUP_STATUS constants, eliminating all magic status strings**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-30T09:42:45Z
- **Completed:** 2026-01-30T09:46:11Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Replaced inline PickupRequest interface in columns.ts with import from #shared
- Added re-exports for backward compatibility (PickupRequest, PickupStatus, PICKUP_STATUS, ACTIVE_STATUSES)
- Migrated StatusBadge to use PICKUP_STATUS constants for all status comparisons
- Migrated ActionButtons to use PickupStatus type and PICKUP_STATUS constants
- Migrated RequestDetail to use ACTIVE_STATUSES for showActions filtering
- Migrated CurrentPickup to use GateStatus type derived from PICKUP_STATUS constants

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate columns.ts with re-exports** - `ef215c8` (feat)
2. **Task 2: Migrate StatusBadge, ActionButtons, RequestDetail, CurrentPickup** - `84aef4c` (feat)

## Files Modified

- `staff/app/components/dashboard/columns.ts` - Removed inline PickupRequest, added imports and re-exports from #shared, uses ACTIVE_STATUSES
- `staff/app/components/dashboard/StatusBadge.vue` - Uses PickupStatus type and PICKUP_STATUS constants for all comparisons
- `staff/app/components/dashboard/ActionButtons.vue` - Uses PickupStatus type and PICKUP_STATUS constants for status checks
- `staff/app/components/dashboard/RequestDetail.vue` - Imports from #shared, uses ACTIVE_STATUSES for showActions
- `staff/app/components/gate/CurrentPickup.vue` - Uses GateStatus type derived from PICKUP_STATUS constants

## Decisions Made

1. **Keep variantMap/labelMap as Record<string, ...>** - These are display-only mappings that work with any string key. Changing them to use PICKUP_STATUS keys would add complexity without type safety benefit.

2. **Re-export from columns.ts** - Other files may still import PickupRequest from columns.ts. Re-exports maintain backward compatibility during migration. TODO comment marks them for removal once all imports updated.

3. **Derive GateStatus narrower type** - CurrentPickup only shows in_queue or processing statuses, so we derive a narrow type `typeof PICKUP_STATUS.IN_QUEUE | typeof PICKUP_STATUS.PROCESSING` for better type safety.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**Pre-existing type errors in native-select component**: The `npx nuxi typecheck staff` command shows errors in `app/components/ui/native-select/` which is an untracked directory not part of this plan. Verified these errors exist on main branch before any changes. All migrated files pass type checking when checked individually.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 5 dashboard-related component files now use imports from #shared
- No magic status strings remain in dashboard components
- Re-exports in columns.ts provide backward compatibility for any files still importing from there
- Ready for 14-03 to continue migrating composables and remaining files

---
*Phase: 14-type-foundation*
*Completed: 2026-01-30*
