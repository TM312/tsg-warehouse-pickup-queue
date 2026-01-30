# Project Research Summary

**Project:** Warehouse Pickup Queue System - v1.1 Gate Operator Experience
**Domain:** Warehouse management - pickup queue workflow
**Researched:** 2026-01-30
**Confidence:** HIGH

## Executive Summary

The v1.1 milestone adds gate operator tooling, processing status workflow, and business hours management to an existing warehouse pickup queue system. Research confirms this is an **additive expansion** requiring zero new dependencies - the existing Nuxt 4/Vue 3/Supabase/shadcn-vue stack fully supports all features.

The recommended approach builds on proven patterns from the v1 codebase: (1) extend the existing status workflow with a new "processing" state using database functions with atomic guards, (2) create a mobile-first gate operator view at `/gate/[id]` reusing existing composables, and (3) build business hours UI as CRUD over the existing `business_hours` table. The only additions needed are `date-fns` and `@date-fns/tz` in the staff app for time formatting, plus shadcn-vue's date picker component for future holiday scheduling.

The primary risk is **status transition race conditions** when adding the intermediate "processing" state. Prevention requires atomic database functions with explicit status guards (WHERE status = 'in_queue'), queue position handling logic for processing customers, and timestamp tracking for timeout detection. Secondary risks include mobile reconnection handling, timezone bugs in business hours, and touch target accessibility on gate operator mobile interfaces.

## Key Findings

### Recommended Stack

The existing stack requires no architectural changes. All v1.1 features work with current technologies: Nuxt 4 for routing (`/gate/[id]`, `/settings/business-hours`), shadcn-vue for UI components (Card, Button, Input, Switch), Supabase for data and realtime updates, and Tailwind for mobile-responsive design.

**Core technologies (already installed):**
- Nuxt 4 / Vue 3: Dynamic routing, component framework — powers both staff and customer apps
- Supabase: PostgreSQL + Realtime — handles queue state with existing SECURITY DEFINER functions
- shadcn-vue / reka-ui: Component library — all needed components already present (Card, Button, Input, Switch, Dialog)
- TailwindCSS: Mobile-first styling — existing responsive patterns extend to gate view
- @vueuse/core: Composables library — already used for gestures, can support useSwipe if needed

**Staff app additions (install only):**
- date-fns: Time formatting (`08:00:00` -> `8:00 AM`) — already proven in customer app
- @date-fns/tz: Timezone handling for warehouse local time — needed for business hours preview

**Recommended NOT to add:**
- Time picker libraries (@vuepic/vue-datepicker, v-calendar): Native `<input type="time">` is sufficient and provides excellent mobile UX
- Swipe gesture libraries (hammer.js, vue-swipe-actions): Large tap buttons are clearer for gate operators
- Business hours libraries (vue-business-hours): Simple form with existing components is adequate
- State management (Pinia): Per-page data fetching is simpler for two-page addition

**User preference noted:** Use shadcn-vue date picker component for holiday scheduling (future phase).

### Expected Features

Research identified clear table stakes vs differentiators across three feature areas.

**Must have (table stakes):**
- Current pickup display with sales order number prominently shown (primary warehouse identifier)
- "Start Processing" and "Complete" quick actions for gate operators
- Processing status state to distinguish "next up" from "actively being served"
- Weekly schedule editor for business hours (Mon-Fri 8am-5pm pattern)
- Holiday/closure date scheduling (Christmas, inventory day, etc.)
- Mobile-responsive layout with real-time updates on gate operator view

**Should have (competitive differentiators):**
- Next-up preview on gate view (see who's coming after current customer)
- Manual override toggle for business hours ("Closed today" emergency control)
- Schedule preview showing next 7 days including holidays
- Elapsed time indicator on gate view (processing duration tracking)
- Auto-advance to next customer after completion

**Defer (v2+):**
- Recurring holidays ("every July 4th" logic)
- Processing timeout alerts (needs usage metrics first)
- Estimated completion times (requires historical data)
- Skip/defer actions (edge case, uncommon need)
- Customer contact info on gate view (only needed for problem scenarios)

### Architecture Approach

All v1.1 features integrate as extensions of existing architecture patterns. Processing status is a database migration adding a value to the existing CHECK constraint. Gate operator view is a new route reusing existing composables (`useRealtimeQueue`, `useQueueActions`). Business hours management is straightforward CRUD on an existing table.

**Major components:**
1. **Gate Operator Page** (`/gate/[id]`) — Mobile-first view showing current pickup (position 1), quick actions (Start Processing, Complete), and next-up preview. Reuses `useRealtimeQueue` for live updates and `useQueueActions` for RPC calls. Independent data fetching per page, no shared store needed.

2. **Processing Status Workflow** — New "processing" status value between "in_queue" and "completed". Requires database migration updating CHECK constraint, new `start_processing()` SECURITY DEFINER function with atomic guards, StatusBadge component update for new variant, and customer status page recognition of processing state.

3. **Business Hours Management** (`/settings/business-hours`) — Weekly schedule editor (7-row grid) plus holiday/closure table for date-based overrides. Uses existing form components (Input with type="time", Switch for open/closed toggle, Label). CRUD operations directly against `business_hours` table. Future holiday table uses shadcn-vue date picker per user preference.

**Key architectural decisions:**
- Single realtime channel for all gates (client-side filtering) — volume too low to warrant per-gate channels
- Native HTML5 `<input type="time">` for time picking — zero dependencies, excellent mobile native pickers
- Processing status retains queue_position during service — enables "put back in queue" recovery
- Independent data fetching per page — simpler than shared Pinia store for two-page addition

### Critical Pitfalls

1. **Status transition race conditions** — Adding "processing" state creates new intermediate step. Without atomic guards, two operators can transition same request simultaneously (e.g., one starts processing while another completes it). Prevention: database functions with `WHERE status = 'in_queue'` guard for start_processing, `WHERE status = 'processing'` guard for complete. Return old status to detect failed transitions.

2. **Queue position gaps during processing** — Current system clears queue_position on completion. If customer is "processing" at position 1, does position 2 advance to position 1? Inconsistent handling creates gaps or duplicates. Prevention: Define clear semantic (processing = position 1 being served, hide from queue UI), keep queue_position = 1 during processing, update all queue functions to handle `WHERE status IN ('in_queue', 'processing')`.

3. **Business hours timezone storage mismatch** — PostgreSQL `time` type has no timezone context. Staff enters "8:00 AM" local, but comparison with customer's "now" can be in different timezone. Prevention: Store warehouse timezone explicitly in config, all comparisons happen server-side using warehouse timezone, add DST-specific test cases.

4. **Holiday table design complexity** — Mixing recurring holidays (every Christmas) with one-time closures (inventory day) in single table creates maintenance burden. Prevention: For v1.1, use simple `closures` table with explicit DATE values. Manual annual entry is acceptable for 50-100 pickups/day volume. Recurring logic deferred to v2.

5. **Mobile realtime reconnection** — Gate operator's phone screen locks or hits dead zone, WebSocket disconnects. On reconnection, may miss events during disconnection window. Prevention: Always refetch on visibility change regardless of connection status, add "pull to refresh" on gate view, track last event timestamp with gap detection.

6. **Touch targets too small** — Desktop-designed buttons don't work for gate operators wearing gloves or in hurry. Prevention: Minimum 44x44px touch targets (WCAG AAA), spacing between destructive actions, test on actual mobile devices at warehouse.

## Implications for Roadmap

Based on research, the natural dependency order and risk mitigation strategy suggests this phase structure:

### Phase 1: Processing Status Foundation
**Rationale:** Processing status is foundational for gate operator workflow. Must exist before gate view can use "Start Processing" action. Database schema changes should be isolated to reduce risk.

**Delivers:**
- Database migration adding 'processing' to status CHECK constraint
- New `processing_started_at` timestamp column for timeout tracking
- `start_processing()` SECURITY DEFINER function with atomic guards
- Updated `completeRequest()` to allow transitions from 'processing'
- StatusBadge component update with processing variant (yellow/amber)

**Addresses:**
- Processing status workflow (table stakes from FEATURES.md)
- Avoids status transition race conditions (critical pitfall #1)
- Sets foundation for queue position handling (critical pitfall #2)

**Research flag:** Standard pattern (database migrations, status state machines). No additional research needed beyond PITFALLS.md guidance on atomic guards.

### Phase 2: Gate Operator View
**Rationale:** Core v1.1 value delivery. Depends on processing status from Phase 1. Mobile-first implementation addresses operator workflow needs. Highest operational impact.

**Delivers:**
- `/gate/[id]` dynamic route with gate validation
- CurrentPickup component showing position 1 customer (large sales order number, company name)
- QuickActions component with Start Processing and Complete buttons (44x44px minimum)
- UpNextList showing next 2-3 in queue as preview
- Real-time subscription reusing `useRealtimeQueue` composable
- Reconnection handling and pull-to-refresh

**Uses:**
- Existing Nuxt routing, shadcn-vue Card/Button components
- Existing `useQueueActions` extended with startProcessing method
- Existing `useRealtimeQueue` with visibility change refetch
- TailwindCSS responsive utilities for mobile-first design

**Implements:**
- Gate operator view architecture component
- All gate operator table stakes from FEATURES.md
- Next-up preview differentiator

**Avoids:**
- Mobile reconnection issues (moderate pitfall #5)
- Touch target accessibility issues (moderate pitfall #6)

**Research flag:** Standard pattern (mobile-responsive CRUD, realtime subscriptions). Existing codebase provides all patterns. No additional research needed.

### Phase 3: Business Hours Weekly Schedule
**Rationale:** Independent of gate operator workflow. Can be built in parallel or after Phase 2. Addresses core business hours table stakes without holiday complexity.

**Delivers:**
- `/settings/business-hours` route in staff app
- WeeklyScheduleEditor component (7-day grid)
- DayHoursRow component with native time inputs, open/closed toggle
- Current status banner ("OPEN until 5:00 PM")
- Install date-fns and @date-fns/tz in staff app
- Time formatting utilities (DB format <-> input format <-> display format)

**Addresses:**
- Weekly schedule editor (table stakes from FEATURES.md)
- Time zone handling differentiator
- Schedule preview differentiator

**Avoids:**
- Timezone storage bugs (critical pitfall #3)
- Manual override conflicts (deferred to Phase 4)

**Research flag:** Standard pattern (form CRUD, time input handling). date-fns usage proven in customer app. Native time inputs well-documented. No additional research needed.

### Phase 4: Holiday Scheduling & Manual Override
**Rationale:** Completes business hours feature. Builds on Phase 3 foundation. Moderate complexity requires careful priority handling.

**Delivers:**
- `scheduled_closures` table for date-based closures
- HolidayManager component with shadcn-vue date picker (per user preference)
- Manual override toggle with expiration timestamp
- Override priority logic (Manual Override > Holiday > Weekly Schedule)
- "Effective status" display showing which rule is active
- Schedule preview showing next 7 days with closures highlighted

**Addresses:**
- Holiday/closure scheduling (table stakes from FEATURES.md)
- Manual override toggle (differentiator)
- Closure message customization (nice-to-have)

**Avoids:**
- Holiday table design complexity (critical pitfall #4) — uses simple date-based closures, defers recurring logic
- Manual override conflicts (moderate pitfall #7) — explicit priority hierarchy

**Research flag:** Moderate complexity. Priority resolution logic and date picker integration patterns are well-documented. Calendar/holiday patterns covered in PITFALLS.md. No additional research needed if following simple closures approach.

### Phase 5: Customer Status Update
**Rationale:** Final integration pass ensuring customer app reflects new processing status. Low complexity, completes end-to-end workflow.

**Delivers:**
- Customer status page recognition of 'processing' status
- Updated status display: "Your order is being processed at Gate 3"
- Processing state styling/animation distinct from queued state
- E2E test coverage for full submission -> processing -> completion flow

**Addresses:**
- Customer notification of processing (table stakes from FEATURES.md)

**Avoids:**
- Processing status not visible to customers (minor pitfall #12)

**Research flag:** Trivial. Simple component update. No research needed.

### Phase Ordering Rationale

- **Dependency-driven:** Processing status must exist before gate operator view can use it. Weekly schedule must work before layering holiday complexity.
- **Risk isolation:** Database migrations in dedicated phase reduce risk of UI/DB coupling issues.
- **Value delivery:** Gate operator view (Phase 2) delivers core v1.1 value immediately after foundation (Phase 1).
- **Parallel potential:** Phase 3 (business hours) can be built in parallel with Phase 2 (gate view) — no shared dependencies.
- **Incremental complexity:** Start with simple weekly schedule, then add holiday/override complexity in Phase 4 when foundation is proven.

### Research Flags

**Phases with standard patterns (no additional research needed):**
- **Phase 1:** Database migrations and status state machines are well-documented. PITFALLS.md provides atomic guard patterns.
- **Phase 2:** Mobile-responsive Vue components and Supabase realtime patterns proven in existing v1 codebase.
- **Phase 3:** Form CRUD and native time inputs well-documented. date-fns usage patterns proven in customer app.
- **Phase 5:** Trivial component update.

**Phase needing moderate planning attention:**
- **Phase 4:** Holiday scheduling and override priority logic requires careful design. Not complex enough for `/gsd:research-phase`, but merits extra planning review. FEATURES.md and PITFALLS.md provide sufficient guidance — recommend simple closures table over complex recurring logic.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified against existing codebase package.json files and official documentation. No unknowns. |
| Features | HIGH | Table stakes identified from WMS UI/UX research, order workflow patterns, and business hours management best practices. Clear consensus on expectations. |
| Architecture | HIGH | Based on existing v1 codebase patterns. All integration points identified in code. Extensions are straightforward. |
| Pitfalls | HIGH | Critical pitfalls backed by authoritative sources (W3C, Supabase discussions, database design articles). Race conditions and timezone bugs are well-documented domains. |

**Overall confidence:** HIGH

All research backed by authoritative sources (official docs, W3C standards, established pattern articles) or verified existing codebase analysis. No speculation or single-source findings in critical areas.

### Gaps to Address

**Resolved during research:**
- Time picker approach (native HTML5 inputs selected over libraries)
- State management approach (per-page fetching selected over Pinia)
- Realtime channel strategy (single channel with client filtering selected)
- Holiday complexity (simple closures table selected for v1.1, recurring deferred to v2)

**Minor validations during implementation:**
- Confirm shadcn-vue date picker component installed, add if missing
- Verify auth middleware coverage extends to `/gate/*` routes
- Test actual mobile device with gloves at warehouse for touch target sizing
- Validate timezone handling on DST boundary dates

No major gaps requiring additional research. Implementation can proceed with current findings.

## Sources

### Primary (HIGH confidence)
- **Existing codebase** (`/Users/thomas/Projects/tsg/warehouse-pickup-queue/`) — Architecture patterns, component inventory, database schema, composables
- **package.json files** (staff/, customer/) — Technology versions, installed dependencies
- **shadcn-vue documentation** (https://www.shadcn-vue.com/) — Component library usage, date picker patterns
- **Supabase documentation** — Realtime subscriptions, SECURITY DEFINER functions, RLS patterns
- **date-fns documentation** (https://date-fns.org/) — Time formatting patterns
- **W3C WCAG 2.5.8** (https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) — Touch target size requirements

### Secondary (MEDIUM confidence)
- **LoadProof - WMS UI/UX Best Practices** — Training reduction, simplified warehouse UI design
- **Adobe Commerce - Order Processing** — Pending -> Processing -> Complete state patterns
- **Zendesk - Business Hours & Holidays** — Weekly schedule, holiday exception patterns
- **ShipStation - Customer Pickup Processing** — Order identification for pickup workflows
- **Medium - Complex World of Calendars: Database Design** — Holiday table design patterns
- **GitHub Discussion - Supabase Realtime reliability** — Reconnection handling best practices
- **Red Hat - State Machines for Microservices** — Status transition patterns, timeout handling
- **DEV Community - Date and Time Timezone Bugs** — Timezone storage and comparison patterns

### Tertiary (LOW confidence)
- None — all findings backed by primary or secondary sources with community consensus

---
*Research completed: 2026-01-30*
*Ready for roadmap: yes*
