# Phase 17: Dashboard & Visualization - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Supervisors can see queue status at a glance via a dashboard overview page. Includes bar chart visualization of queue length per gate and KPI cards showing operational metrics. The dashboard is read-only — no actions or drill-downs to detail views.

</domain>

<decisions>
## Implementation Decisions

### Page layout
- KPI cards row at top, bar chart takes remaining space below
- 4 KPI cards: completed today, avg wait time, avg processing time, currently waiting
- Cards display in a row on desktop

### Bar chart design
- Vertical bar chart (gates on x-axis, queue count on y-axis)
- Shows current queue length per gate (customers waiting)
- Tooltip on hover/click shows details, but no navigation on click
- Chart is visualization only, not interactive beyond tooltip

### KPI cards
- Display value + label only (no trends, no icons)
- Time-based metrics formatted as hours and minutes (e.g., "1h 12m")
- Cards are not clickable — display only
- Show dash ("—") when no data exists yet today

### Data freshness
- Queue counts update via existing real-time Supabase subscriptions
- KPI calculations (avg times, completed count) recalculate periodically (not on every change)
- Skeleton placeholders during loading

### Claude's Discretion
- Mobile responsive behavior for KPI cards and chart
- Bar chart color scheme
- Whether to show "last updated" timestamp
- Periodic refresh interval for KPI calculations
- Tooltip content and styling

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 17-dashboard-visualization*
*Context gathered: 2026-02-02*
