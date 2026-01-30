# Phase 13: Business Hours Management - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Supervisors can configure when the warehouse is open for pickups. Includes weekly schedule editor, holiday/closure scheduling, and manual override. Customer app displays hours and blocks registration when closed.

</domain>

<decisions>
## Implementation Decisions

### Weekly Schedule Editor
- 7-row list layout (one row per day) — simple, mobile-friendly
- Single time range per day (one open time, one close time)
- Toggle switch per day to mark closed (off = closed, times hidden)
- Copy feature: button to copy one day's hours to other days
- "Apply to weekdays" preset for quick Mon-Fri setup
- Weekly schedule is the default, applies every week automatically

### Holiday/Closure Handling
- Date range picker with optional reason field
- Closures shown as chronological list (upcoming first) with delete option
- No recurring holidays — but consider UX pattern for copying last year's closures
- Scheduling range: Claude's discretion (reasonable limit)

### Manual Override
- Toggle at top of /settings/business-hours page
- "Closed now" only (no "Open late" option)
- Instant toggle, no confirmation dialog
- Auto-expires at next scheduled open time

### Customer-Facing Display
- Hours shown on registration page, below the register button
- Full week always visible (compact 7-day format)
- When closed: show reason if available + next open time
- Registration blocked outside business hours

### Claude's Discretion
- Scheduling range limit for closures (12 months reasonable)
- Time picker component choice
- Exact layout and spacing
- How to present "copy last year's holidays" UX

</decisions>

<specifics>
## Specific Ideas

- Weekly schedule should feel like setting hours on a Google Business Profile — straightforward row-per-day
- Override is a safety valve, not a daily tool — simple toggle is fine
- Customers only need hours when deciding whether to come, so show on registration page

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 13-business-hours-management*
*Context gathered: 2026-01-30*
