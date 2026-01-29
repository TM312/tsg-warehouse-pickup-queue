---
phase: 07-customer-submission-flow
plan: 02
subsystem: database
tags: [rls, supabase, postgresql, security]

# Dependency graph
requires:
  - phase: 01-database-foundation
    provides: pickup_requests table with RLS enabled
provides:
  - RLS policy allowing anonymous INSERT on pickup_requests
  - Security constraints preventing privilege escalation
affects: [07-customer-submission-flow, customer-app]

# Tech tracking
tech-stack:
  added: []
  patterns: [WITH CHECK constraints for field-level RLS control]

key-files:
  created:
    - supabase/migrations/20260130000000_add_anon_insert_policy.sql
  modified: []

key-decisions:
  - "WITH CHECK constraints enforce field defaults at policy level"
  - "Anon can only insert pending status - cannot skip approval process"

patterns-established:
  - "RLS policy with WITH CHECK for field-level write restrictions"

# Metrics
duration: 2min
completed: 2026-01-29
---

# Phase 07 Plan 02: Anonymous INSERT Policy Summary

**RLS policy allowing anonymous customers to submit pickup requests with security constraints preventing privilege escalation**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-29T09:54:16Z
- **Completed:** 2026-01-29T09:56:12Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created migration adding GRANT INSERT to anon role
- Implemented WITH CHECK policy enforcing security constraints:
  - Status must be 'pending' (cannot skip approval)
  - Cannot set assigned_gate_id (staff only)
  - Cannot set queue_position (staff only)
  - Cannot set is_priority (staff only)
  - Cannot set email_verified (verification flow only)
  - Cannot set completed_at (workflow only)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create anonymous INSERT policy migration** - `5bf5673` (feat)

**Plan metadata:** (pending)

## Files Created/Modified
- `supabase/migrations/20260130000000_add_anon_insert_policy.sql` - RLS policy for anonymous INSERT with security constraints

## Decisions Made
- Used WITH CHECK constraints at policy level to enforce field defaults
- Blocked all staff-controlled fields (gate, position, priority)
- Blocked verification fields (email_verified, completed_at)
- Rely on existing "Customers can view requests" SELECT policy for .insert().select() pattern

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Anonymous users can now submit pickup requests via Supabase client
- Ready for customer submission form implementation (07-03)
- SELECT policy already exists for returning created rows

---
*Phase: 07-customer-submission-flow*
*Completed: 2026-01-29*
