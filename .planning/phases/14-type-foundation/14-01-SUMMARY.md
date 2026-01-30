---
phase: 14-type-foundation
plan: 01
subsystem: types
tags: [typescript, as-const, nuxt4, shared-types]

# Dependency graph
requires:
  - phase: none
    provides: n/a (first phase of v2.0)
provides:
  - PICKUP_STATUS constant with all 6 status values
  - PickupStatus type derived via as const pattern
  - PickupRequest interface for staff and customer apps
  - Gate and GateWithCount interfaces
  - ACTIVE_STATUSES and TERMINAL_STATUSES arrays
  - isActiveStatus type guard function
affects: [14-02-PLAN, 15-pinia-infrastructure]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "as const for typed constants"
    - "satisfies readonly Type[] for typed arrays"
    - "Nuxt 4 shared/types/ auto-import"

key-files:
  created:
    - staff/shared/types/pickup-request.ts
    - staff/shared/types/gate.ts
    - customer/shared/types/pickup-request.ts
  modified: []

key-decisions:
  - "Duplicate minimal types in customer app rather than cross-app shared package (simplicity over DRY)"
  - "Customer PickupRequest omits staff-only fields (email_flagged, is_priority, processing_started_at)"

patterns-established:
  - "as const pattern: export const X = {...} as const; export type X = typeof X[keyof typeof X]"
  - "Status groupings: ACTIVE_STATUSES/TERMINAL_STATUSES with satisfies readonly PickupStatus[]"
  - "Type guards: isActiveStatus() for narrowing status types"

# Metrics
duration: 3min
completed: 2026-01-30
---

# Phase 14 Plan 01: Shared Type Definitions Summary

**Centralized TypeScript type definitions for pickup requests and gates using as const pattern with Nuxt 4 auto-import**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-30T09:38:54Z
- **Completed:** 2026-01-30T09:42:00Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments
- Created PICKUP_STATUS constant with all 6 status values matching database CHECK constraint
- Established PickupStatus derived type using `as const` pattern (single source of truth)
- Created staff PickupRequest interface with typed status field
- Created Gate and GateWithCount interfaces for gate management
- Created minimal customer PickupRequest interface with customer-relevant fields only
- Configured Nuxt 4 auto-import via shared/types/ directory

## Task Commits

Each task was committed atomically:

1. **Task 1: Create staff shared type definitions** - `18eb6b6` (feat)
2. **Task 2: Create customer shared type definitions** - `553b2bc` (feat)

## Files Created

- `staff/shared/types/pickup-request.ts` - PICKUP_STATUS, PickupStatus, ACTIVE_STATUSES, TERMINAL_STATUSES, isActiveStatus, PickupRequest
- `staff/shared/types/gate.ts` - Gate, GateWithCount interfaces
- `customer/shared/types/pickup-request.ts` - PICKUP_STATUS, PickupStatus, minimal PickupRequest

## Decisions Made

1. **Duplicate types in customer app** - Rather than setting up a shared workspace package, duplicated the minimal PICKUP_STATUS and PickupStatus in customer app. Customer PickupRequest is intentionally minimal with only fields the customer UI needs.

2. **Customer PickupRequest omits staff fields** - Customer interface excludes `email_flagged`, `is_priority`, `processing_started_at`, and `customer_email` as these are staff-only concerns.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Type definitions ready for consumption by all components
- Next plan (14-02) will migrate existing files to use these centralized types
- Auto-import verified working via nuxi prepare (PICKUP_STATUS, ACTIVE_STATUSES, TERMINAL_STATUSES, isActiveStatus all appear in .nuxt/types/imports.d.ts)

---
*Phase: 14-type-foundation*
*Completed: 2026-01-30*
