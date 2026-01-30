---
phase: 13-business-hours-management
plan: 02
subsystem: ui, api
tags: [vue, supabase, shadcn-vue, business-hours, customer-app, closures, override]

# Dependency graph
requires:
  - phase: 13-01
    provides: business_closures table, business_settings table, useBusinessHoursSettings composable
provides:
  - Closure scheduler UI for holiday/closure management
  - Manual override toggle for immediate closure
  - Customer-facing business hours display
  - Customer API checking closures and override
affects: [customer-registration-flow]

# Tech tracking
tech-stack:
  added:
    - "@internationalized/date (staff app)"
    - "date-fns (staff app)"
    - "@date-fns/tz (staff app)"
  patterns:
    - Override auto-expiry calculation (next scheduled open time)
    - Priority-based business hours check (override > closures > weekly schedule)
    - Compact 7-day hours display grid

key-files:
  created:
    - staff/app/components/business-hours/ClosureScheduler.vue
    - staff/app/components/business-hours/ManualOverrideToggle.vue
    - customer/app/components/BusinessHoursDisplay.vue
    - staff/app/components/ui/popover/* (shadcn-vue)
  modified:
    - staff/app/composables/useBusinessHoursSettings.ts
    - staff/app/pages/settings/business-hours.vue
    - customer/server/api/business-hours.get.ts
    - customer/app/composables/useBusinessHours.ts
    - customer/app/pages/index.vue

key-decisions:
  - "Native date inputs for closure scheduling (simpler than calendar picker)"
  - "Override expiry calculated at toggle time (stored as ISO timestamp)"
  - "API checks priority: override > closures > weekly schedule"
  - "Hours display shown in both open and closed states"
  - "Current day highlighted in hours display"

patterns-established:
  - "Priority-based status check pattern for business hours"
  - "Auto-expiry calculation for temporary overrides"

# Metrics
duration: 8min
completed: 2026-01-30
---

# Phase 13 Plan 02: Closure Scheduler & Customer Display Summary

**Holiday/closure scheduling with date picker, manual override toggle, and customer-facing 7-day hours display**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-30T08:01:47Z
- **Completed:** 2026-01-30T08:09:52Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- Extended useBusinessHoursSettings with closure CRUD and override toggle
- Created ManualOverrideToggle component with auto-expiry display
- Created ClosureScheduler component with date range inputs and closures list
- Updated business-hours.vue with override toggle at top and closures card below
- Updated customer API to check override and closures before weekly schedule
- API returns weeklyHours array for customer display
- Created BusinessHoursDisplay component with compact 7-day grid
- Current day highlighted in hours display
- Hours display shown on registration page in both open/closed states

## Task Commits

Each task was committed atomically:

1. **Task 1: Add closure and override management to staff app** - `f86e006` (feat)
2. **Task 2: Update customer API to check closures and override** - `c9106e6` (feat)
3. **Task 3: Create customer-facing business hours display** - `0bc8db7` (feat)

## Files Created/Modified
- `staff/app/composables/useBusinessHoursSettings.ts` - Added closure/override CRUD and auto-expiry calculation
- `staff/app/components/business-hours/ManualOverrideToggle.vue` - Override toggle with expiry display
- `staff/app/components/business-hours/ClosureScheduler.vue` - Date range picker and closures list
- `staff/app/pages/settings/business-hours.vue` - Added override toggle and closures card
- `customer/server/api/business-hours.get.ts` - Priority check: override > closures > schedule
- `customer/app/composables/useBusinessHours.ts` - Exposed weeklyHours
- `customer/app/components/BusinessHoursDisplay.vue` - 7-day compact grid with current day highlight
- `customer/app/pages/index.vue` - Added BusinessHoursDisplay below form/message

## Decisions Made
- Used native HTML date inputs for closure scheduling (simpler, better mobile support than calendar picker)
- Override expiry stored as ISO timestamp, calculated when toggle activated
- Customer API checks in priority order: manual override, scheduled closures, weekly schedule
- Hours display shows in both open and closed states so customers can plan visits
- Current day highlighted with primary color for easy reference

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TypeScript type errors in WeeklyScheduleEditor and composable**
- **Found during:** Task 1
- **Issue:** TypeScript complained about undefined dayOfWeek in spread operations
- **Fix:** Explicitly preserved dayOfWeek in object construction
- **Files modified:** WeeklyScheduleEditor.vue, useBusinessHoursSettings.ts

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 13 complete
- Business hours management fully implemented:
  - Weekly schedule editor (13-01)
  - Closure scheduler and manual override (13-02)
  - Customer-facing hours display (13-02)
- v1.1 Gate Operator Experience complete

---
*Phase: 13-business-hours-management*
*Completed: 2026-01-30*
