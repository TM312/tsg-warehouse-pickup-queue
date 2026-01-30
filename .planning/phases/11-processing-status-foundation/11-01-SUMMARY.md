---
phase: 11-processing-status-foundation
plan: 01
subsystem: database
tags: [postgres, plpgsql, migrations, queue-management, status-workflow]

# Dependency graph
requires:
  - phase: v1-02 (Database Foundation)
    provides: pickup_requests table, gates table, assign_to_queue function
provides:
  - processing_started_at column on pickup_requests
  - 'processing' status in pickup lifecycle
  - start_processing database function
  - revert_to_queue database function
affects: [11-02 (StatusBadge), 12-gate-operator-view]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SECURITY DEFINER functions for atomic state transitions
    - Partial indexes for status-based queries
    - Constraint-validated state machine in database layer

key-files:
  created:
    - supabase/migrations/20260130200000_add_processing_status.sql
  modified: []

key-decisions:
  - "Only position 1 can start processing (enforced in database)"
  - "Only one pickup can be processing per gate at a time"
  - "Queue position preserved during processing for fair revert"

patterns-established:
  - "State transition functions use SELECT ... INTO validation before UPDATE"
  - "Processing status retains queue_position for revert capability"

# Metrics
duration: 4min
completed: 2026-01-30
---

# Phase 11 Plan 01: Processing Status Migration Summary

**Database schema and atomic functions for 'processing' status lifecycle between in_queue and completed**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-30T04:19:17Z
- **Completed:** 2026-01-30T04:22:39Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Added processing_started_at column to track when pickup enters processing state
- Extended status CHECK constraint to include 'processing' value
- Created start_processing function with position-1 and one-per-gate constraints
- Created revert_to_queue function that preserves original queue position

## Task Commits

Each task was committed atomically:

1. **Task 1: Create processing status migration** - `3575f46` (feat)
2. **Task 2: Verify database functions work correctly** - No commit (verification only, all tests passed)

## Files Created/Modified

- `supabase/migrations/20260130200000_add_processing_status.sql` - Schema changes and atomic database functions

## Decisions Made

- **Position 1 enforcement:** Only the customer at position 1 (front of queue) can start processing. This matches physical reality where only the next-up customer approaches the gate.
- **One processing per gate:** Database enforces only one pickup can be processing per gate at a time, preventing confusion about who is being served.
- **Queue position preservation:** When reverting from processing back to queue, the original queue_position is preserved. This ensures fairness - a customer who was position 1 returns to position 1, not the end of the line.
- **SECURITY DEFINER pattern:** Both functions use SECURITY DEFINER to ensure atomic operations work correctly across RLS boundaries.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - migration applied cleanly on first attempt, all function tests passed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Database layer for processing status is complete
- Ready for Plan 02: StatusBadge component updates
- TypeScript types will need regeneration via `supabase gen types typescript` when UI is updated

---
*Phase: 11-processing-status-foundation*
*Completed: 2026-01-30*
