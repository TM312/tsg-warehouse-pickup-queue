---
phase: 12-gate-operator-view
plan: 03
subsystem: ui
tags: [vue, transitions, realtime, supabase]

# Dependency graph
requires:
  - phase: 12-01
    provides: Gate operator page foundation with CurrentPickup component
  - phase: 11-01
    provides: Processing status for queue items
provides:
  - NextUpPreview component showing position 2 sales order
  - Queue count display ("X more in queue")
  - Realtime subscription via useRealtimeQueue
  - Smooth transition animations on pickup changes
affects: [gate-operator-experience, mobile-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Vue Transition with key for conditional content changes
    - Realtime subscription refresh pattern in pages

key-files:
  created:
    - staff/app/components/gate/NextUpPreview.vue
  modified:
    - staff/app/pages/gate/[id].vue

key-decisions:
  - "Reuse existing useRealtimeQueue composable for all pickup changes"
  - "200ms transition duration for snappy visual feedback"
  - "Queue count excludes current pickup (shows 'remaining' count)"

patterns-established:
  - "Vue Transition with mode='out-in' and :key for smooth conditional swaps"
  - "onMounted/onUnmounted pattern for realtime subscription lifecycle"

# Metrics
duration: 4min
completed: 2026-01-30
---

# Phase 12 Plan 03: Queue Preview and Realtime Summary

**NextUpPreview component with queue count, useRealtimeQueue subscription, and Vue Transition animations for smooth pickup changes**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-30T13:40:00Z
- **Completed:** 2026-01-30T13:44:00Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- NextUpPreview component showing position 2 sales order in compact card format
- Queue count display showing "X more in queue" when multiple pickups waiting
- Realtime subscription refreshes gate view on any pickup change
- Vue Transition provides smooth fade + slide animation on pickup changes (200ms)
- Connection status indicator shows when reconnecting

## Task Commits

Each task was committed atomically:

1. **Task 1: Create NextUpPreview component and add queue count** - `ef41073` (feat)
2. **Task 2: Add real-time subscription for queue updates** - `8be2b64` (feat)
3. **Task 3: Add transition animation for smooth pickup advance** - `7219871` (feat)

## Files Created/Modified

- `staff/app/components/gate/NextUpPreview.vue` - Compact card showing next pickup's sales order number
- `staff/app/pages/gate/[id].vue` - Added nextUp/queueCount computed, realtime subscription, and transitions

## Decisions Made

- Reused existing useRealtimeQueue composable rather than creating gate-specific subscription
- 200ms transition duration chosen for snappy but visible animation feedback
- Queue count shows "X more in queue" (excluding position 1) for clarity
- Connection status uses amber-200 color on primary header for visibility

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Gate operator view feature-complete with realtime updates and smooth transitions
- Ready for mobile polish and touch optimization in future iterations
- May need performance testing with higher pickup volumes

---
*Phase: 12-gate-operator-view*
*Completed: 2026-01-30*
