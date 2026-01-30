# Domain Pitfalls: v1.1 Gate Operator Experience

**Domain:** Warehouse pickup queue system - adding gate operator views, processing workflow, business hours management
**Researched:** 2026-01-30
**Confidence:** HIGH (based on existing codebase analysis + verified research)

---

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Status Transition Race Conditions with "Processing" State

**What goes wrong:** Adding `processing` status between `in_queue` and `completed` creates a new intermediate state. Two gate operators (or supervisor + gate operator) can attempt transitions on the same request simultaneously. Without atomic guards, request can end up in inconsistent state or skip states entirely.

**Why it happens:** The current system uses direct `.update()` calls for `completeRequest()` (see `useQueueActions.ts` lines 52-72) without status guards. Adding `processing` means: `in_queue -> processing -> completed`. If operator A clicks "Start Processing" while supervisor B clicks "Complete", both updates can succeed, potentially completing a request that was never marked as processing.

**Consequences:**
- Customer sees status jump from "Queued" to "Completed" without "Processing" intermediate
- Audit trail missing processing timestamp
- If processing has business logic (e.g., time tracking), it gets skipped
- Real-time subscriptions may fire in wrong order

**Prevention:**
1. Add `processing_started_at` timestamp column (not just status change)
2. Use database function with `WHERE status = 'in_queue'` guard for `start_processing`
3. Use database function with `WHERE status = 'processing'` guard for `complete_request`
4. Return old status from function to detect race (if NULL returned, transition failed)

**Detection (warning signs):**
- Test: Two browser tabs completing same request simultaneously
- Monitor: Requests with `completed_at` but no `processing_started_at`
- Logs: "Failed to start processing" errors in production

**Phase:** Address in database migration phase (before UI)

---

### Pitfall 2: Queue Position Gaps on Processing Status

**What goes wrong:** Current system clears `queue_position` on completion (see `completeRequest()` line 60). If `processing` status means "being loaded at gate", does the customer still occupy position 1? If not, when do other customers shift up? Inconsistent handling creates queue position gaps or duplicate positions.

**Why it happens:** The existing `assign_to_queue`, `reorder_queue`, and `move_to_gate` functions all assume `status = 'in_queue'` for queue position logic. Adding `processing` breaks this assumption unless explicitly handled.

**Consequences:**
- Customer in position 2 never advances to position 1 (stuck behind "processing" customer)
- Or: Two customers both show position 1 (one processing, one "next")
- Wait time estimates become incorrect
- Drag-drop reordering breaks for processing customers

**Prevention:**
1. Define clear semantic: `processing` means "position 1 is being served, don't show in queue UI"
2. Keep `queue_position = 1` during processing OR create separate "serving" semantic
3. Update all queue functions to handle: `WHERE status IN ('in_queue', 'processing')`
4. On processing completion, run gap compaction (shift all positions down)

**Detection:**
- Test: Start processing position 1, verify position 2 customer now shows as "next up"
- Query: `SELECT * FROM pickup_requests WHERE queue_position = 1 GROUP BY assigned_gate_id HAVING COUNT(*) > 1`

**Phase:** Database migration + queue function updates

---

### Pitfall 3: Business Hours Timezone Storage Mismatch

**What goes wrong:** Current `business_hours` table stores `open_time` and `close_time` as `time` type without timezone. The customer app will compare "now" against these times, but "now" and "stored time" may be in different timezones, causing warehouse to appear open/closed at wrong times.

**Why it happens:** PostgreSQL `time` type has no timezone context. If server is in UTC, staff enters "8:00 AM" local time, it stores as "8:00 AM" with no timezone. Customer's browser sends "8:15 AM" local time for comparison. If customer and warehouse are in same timezone, it works. If server does timezone conversion, it breaks.

**Consequences:**
- Warehouse shows "closed" during business hours (frustrated customers)
- Warehouse shows "open" outside business hours (customers arrive to closed warehouse)
- Daylight Saving Time transitions cause 1-hour windows of wrong behavior twice yearly

**Prevention:**
1. Store timezone explicitly in config table (e.g., `America/Los_Angeles`)
2. All time comparisons happen server-side using warehouse timezone
3. Never compare raw `time` values from different sources
4. Add DST-specific test cases (2 AM on spring-forward day)

**Detection:**
- Test: Set local machine to different timezone, verify business hours check still correct
- Test: Manually adjust system clock around DST boundary

**Phase:** Business hours schema design (before UI)

**Source:** [DEV Community - How to Handle Date and Time Correctly](https://dev.to/kcsujeet/how-to-handle-date-and-time-correctly-to-avoid-timezone-bugs-4o03)

---

### Pitfall 4: Holiday Table Design - Recurring vs One-Time

**What goes wrong:** Adding holidays table without clear recurring vs. one-time model. Team stores "Christmas 2026" as one-time, then next year it's missing. Or team stores "Christmas" as recurring without year, then can't add "Christmas Eve closure 2026 only".

**Why it happens:** Holiday patterns are complex: some fixed date (Jan 1), some floating (Thanksgiving = 4th Thursday November), some one-time (special closure), some recurring annual. Single table design rarely handles all cases.

**Consequences:**
- Holidays must be re-entered annually (operational burden)
- Can't schedule one-time closures alongside recurring holidays
- Floating holidays (Easter, Thanksgiving) require manual date calculation each year

**Prevention:**
1. Separate tables: `recurring_holidays` (rules) + `holiday_overrides` (specific dates)
2. Or: Single `closures` table with `date DATE` for specific closures + manual annual entry
3. For v1.1 MVP: Use simple `closures` table with explicit dates. Recurring can be v2.
4. Always store full `DATE` not just month/day

**Detection:**
- Review: Can admin schedule "closed Dec 24-26, 2026" AND "closed for inventory Jan 15, 2027"?
- Review: What happens on Jan 1, 2027 - are 2026 holidays still working?

**Phase:** Business hours schema design

**Source:** [Medium - The Complex World of Calendars: Database Design](https://medium.com/tomorrowapp/the-complex-world-of-calendars-database-design-fccb3a71a74b)

---

## Moderate Pitfalls

Mistakes that cause delays or technical debt.

### Pitfall 5: Gate Operator View - Mobile Realtime Reconnection

**What goes wrong:** Gate operator uses mobile phone at warehouse. Phone screen turns off, or operator walks to dead zone, WebSocket disconnects. When reconnecting, Supabase Realtime resumes but misses events that occurred during disconnection. Operator sees stale queue state.

**Why it happens:** Existing `useRealtimeQueue.ts` has visibility change handler (lines 46-56) that calls `eventCallback()` on tab visible. But this only refreshes if `status.value !== 'connected'`. If connection "looks" connected but missed events, stale data persists.

**Consequences:**
- Gate operator marks wrong customer as processing
- Gate shows "empty" when customer is actually waiting
- Supervisor dashboard and gate view show different states

**Prevention:**
1. Always refetch on visibility change regardless of connection status (already partially implemented)
2. Add `lastEventTimestamp` tracking - if gap > threshold, force refetch
3. Add "pull to refresh" or manual refresh button on gate view
4. Consider optimistic reconnection: refetch immediately, then resume subscription

**Detection:**
- Test: Lock phone for 30 seconds, unlock, verify data matches supervisor dashboard
- Test: Airplane mode toggle, verify recovery

**Phase:** Gate operator view implementation

**Source:** [GitHub Discussion - How to obtain reliable realtime updates](https://github.com/orgs/supabase/discussions/5641)

---

### Pitfall 6: Mobile Touch Targets Too Small

**What goes wrong:** Gate operator view designed on desktop with small buttons. On mobile, gate operators wearing gloves or in hurry can't accurately tap "Start Processing" or "Complete" buttons. Mis-taps cause wrong actions.

**Why it happens:** Desktop-first development, shadcn-vue default button sizes, not testing on actual mobile devices at warehouse scale.

**Consequences:**
- Wrong customer marked complete
- Frustrated operators
- Slower processing time
- Accessibility compliance issues (WCAG 2.5.8 requires 24x24px minimum, recommends 44x44px for touch)

**Prevention:**
1. Gate view buttons minimum 44x44 CSS pixels (WCAG AAA recommendation)
2. Add spacing between destructive actions (don't put "Complete" next to "Cancel")
3. Test on actual phone with gloves or stylus
4. Consider confirmation dialogs for critical actions (Complete, Cancel)

**Detection:**
- Audit: Measure button sizes in mobile inspector
- Test: Use phone in one hand, try to tap buttons quickly

**Phase:** Gate operator view UI design

**Source:** [W3C WCAG 2.5.8 - Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)

---

### Pitfall 7: Manual Override vs Automated Rules Conflict

**What goes wrong:** Business hours has weekly schedule (automated) plus holiday closures (automated) plus manual "open/close" override. When multiple rules apply, which wins? Manual override set to "open", but it's Christmas - is warehouse open or closed?

**Why it happens:** Three-way priority not explicitly defined. Each feature implemented independently without integration testing.

**Consequences:**
- Warehouse marked open on Christmas (customers arrive, nobody there)
- Warehouse marked closed during manual override "open" (lost business)
- Staff confused about which setting "wins"

**Prevention:**
1. Define explicit priority order: Manual Override > Holiday > Weekly Schedule
2. Store `manual_override_until` timestamp - override expires automatically
3. UI shows "currently: CLOSED (holiday override)" with clear explanation
4. Admin can see all three layers and which one is "winning"

**Detection:**
- Test matrix: All combinations of override + holiday + weekly schedule
- UI shows "effective status" with reason

**Phase:** Business hours logic implementation

---

### Pitfall 8: Processing State Without Timeout

**What goes wrong:** Gate operator taps "Start Processing", then walks away, forgets, or app crashes. Customer stuck in `processing` status forever. No one else can serve them. Customer waits indefinitely.

**Why it happens:** Intermediate states without timeout recovery. Processing state is "owned" by the operator who started it, but no mechanism to release it.

**Consequences:**
- Customer stuck in limbo
- Queue backs up
- Manual database intervention required to fix

**Prevention:**
1. Add `processing_started_at` timestamp
2. Background job or periodic check: if `processing` > 30 minutes, alert supervisor
3. UI shows "processing for X minutes" with warning after threshold
4. Supervisor can "reset to queued" for stuck requests
5. Consider auto-timeout: processing > 1 hour reverts to `in_queue`

**Detection:**
- Query: `SELECT * FROM pickup_requests WHERE status = 'processing' AND processing_started_at < now() - interval '30 minutes'`

**Phase:** Processing status implementation + monitoring

**Source:** [Red Hat - How to design state machines for microservices](https://developers.redhat.com/articles/2021/11/23/how-design-state-machines-microservices)

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

### Pitfall 9: Gate Route Not Protected

**What goes wrong:** `/gate/[id]` route accessible without authentication. Random person finds URL, can view queue state or worse, perform actions.

**Why it happens:** New route added without checking auth middleware coverage. Gate view might be in different app section than dashboard.

**Prevention:**
1. Verify auth middleware applies to `/gate/*` routes
2. Consider additional gate-specific auth (operator assigned to gate?)
3. Audit all routes before deployment

**Detection:**
- Test: Access `/gate/1` in incognito browser without login

**Phase:** Gate view routing setup

---

### Pitfall 10: Real-time Subscription per Gate Creates Too Many Channels

**What goes wrong:** Each `/gate/[id]` page creates its own Supabase channel subscription filtered to that gate. With 10 gates open, 10 channels. Not terrible, but wasteful and can hit connection limits.

**Why it happens:** Copy-paste from dashboard subscription without considering gate-specific filtering at subscription vs. client level.

**Prevention:**
1. Option A: Single channel for all pickup_requests, filter client-side by gate
2. Option B: Gate-specific channel with RLS filter (may need schema adjustment)
3. For v1.1 with few gates, Option A is simpler

**Detection:**
- Monitor: Check Supabase Realtime connection count with multiple gates open

**Phase:** Gate view realtime implementation

---

### Pitfall 11: Business Hours UI Doesn't Show Current State

**What goes wrong:** Admin configures business hours but can't tell at a glance if warehouse is currently open or closed. Must mentally combine weekly schedule + holidays + override.

**Why it happens:** Configuration UI separate from status display.

**Prevention:**
1. Business hours page shows "CURRENT STATUS: OPEN" banner at top
2. Shows why: "Open until 5:00 PM (Monday schedule)"
3. Shows next change: "Will close in 3 hours"

**Detection:**
- Usability: Can admin answer "is warehouse open right now?" without calculation?

**Phase:** Business hours management UI

---

### Pitfall 12: Processing Status Not Visible on Customer Status Page

**What goes wrong:** Customer sees "Queued at Gate 3, Position 1" then suddenly "Complete". Never saw "Processing" state. Confusing - when did they get served?

**Why it happens:** Customer status page wasn't updated to show new `processing` status. Only checks for old statuses.

**Prevention:**
1. Update customer status page to recognize `processing` status
2. Show: "Your order is being processed at Gate 3"
3. Consider: Different color/animation for "processing" vs "queued"

**Detection:**
- E2E test: Full flow from submission through processing to complete on customer view

**Phase:** Customer status page update (after processing status exists)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Processing status migration | Race conditions, queue position gaps | Atomic database functions with status guards |
| Gate operator view | Touch targets, reconnection | Mobile-first design, aggressive refresh |
| Business hours schema | Timezone bugs, holiday complexity | Store timezone explicitly, simple closure table for MVP |
| Business hours UI | Override priority confusion | Clear visual hierarchy showing "effective" status |
| Customer status update | Missing processing state display | Add processing state to status page |

---

## Integration with Existing System

### Safe Migration Path for Adding "processing" Status

The existing `pickup_requests.status` uses CHECK constraint (not ENUM), which allows adding values without table lock:

```sql
-- Step 1: Add new status value (non-breaking)
ALTER TABLE pickup_requests
DROP CONSTRAINT IF EXISTS pickup_requests_status_check;

ALTER TABLE pickup_requests
ADD CONSTRAINT pickup_requests_status_check
CHECK (status IN ('pending', 'approved', 'in_queue', 'processing', 'completed', 'cancelled'));

-- Step 2: Add tracking timestamp
ALTER TABLE pickup_requests
ADD COLUMN processing_started_at timestamptz;
```

**Warning:** The existing queue functions (`assign_to_queue`, `reorder_queue`, `move_to_gate`, `set_priority`) all filter by `status = 'in_queue'`. They need updating to handle `processing` appropriately before the status can be used.

### Existing Code Assumptions to Update

1. `useQueueActions.ts` - `completeRequest()` assumes direct `in_queue -> completed` transition
2. `useRealtimeQueue.ts` - No explicit handling of `processing` status
3. Dashboard filtering - May need to show `processing` requests distinctly
4. Queue position queries - Partial index `WHERE status = 'in_queue'` excludes processing

---

## Sources

- [DEV Community - How to Handle Date and Time Correctly](https://dev.to/kcsujeet/how-to-handle-date-and-time-correctly-to-avoid-timezone-bugs-4o03)
- [GitHub Discussion - How to obtain reliable realtime updates](https://github.com/orgs/supabase/discussions/5641)
- [W3C WCAG 2.5.8 - Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- [Red Hat - How to design state machines for microservices](https://developers.redhat.com/articles/2021/11/23/how-design-state-machines-microservices)
- [Medium - The Complex World of Calendars: Database Design](https://medium.com/tomorrowapp/the-complex-world-of-calendars-database-design-fccb3a71a74b)
- [Medium - 7 UX Design Best Practices for Warehouse Mobile Apps](https://medium.com/@stefan.karabin/7-ux-design-best-practices-for-warehouse-mobile-apps-b6e2a0a6940f)
- [Smashing Magazine - Accessible Target Sizes Cheatsheet](https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/)
