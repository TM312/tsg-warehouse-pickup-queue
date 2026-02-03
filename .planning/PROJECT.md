# Warehouse Pickup Queue System

## What This Is

A two-part web application that streamlines warehouse pickup operations. Customers scan a QR code, enter their sales order number, and get real-time queue updates. Warehouse staff manage the queue, assign gates, and process pickups through an internal dashboard. Gate operators have a dedicated mobile view for accepting and completing pickups. The system integrates with NetSuite ERP for order validation.

## Core Value

Customers always know their queue position and which gate to go to — no confusion, no manual coordination overhead.

## Current State

**Version:** v2.2 shipped (2026-02-03)
**Codebase:** ~8,808 LOC staff app (Vue, TypeScript)
**Tech Stack:** Nuxt 4, Vue 3, TailwindCSS, shadcn-vue, Pinia, Unovis, Supabase (PostgreSQL, Auth, Realtime), AWS Lambda

**What's working:**
- Customer app: submission form, business hours check, real-time status tracking, hours display
- Staff app: sidebar navigation, dashboard with KPIs and chart, queue management
- Staff app: dedicated /gates page for gate management with table view
- Staff app: ProcessingGatesTable showing all active gates with idle/busy state
- Staff app: unified QueueTable component with sort mode (All Requests) and drag mode (Gate tabs)
- Staff app: keyboard accessible queue reordering with screen reader support
- Gate operator view: mobile-first /gate/[id] with processing workflow and gate navigation
- Business hours: weekly schedule, closures, manual override
- Real-time updates across all views via Supabase Realtime
- Centralized TypeScript types with Pinia state management
- Rate limiting on customer submissions

**What's pending:**
- NetSuite Lambda deployment (code complete, awaiting credentials)
- SMS notifications (future scope)

## Requirements

### Validated

**v1 — shipped 2026-01-30:**
- CUST-01: Mobile-responsive web app accessible via static QR code/URL
- CUST-02: Business hours check with message when warehouse is closed
- CUST-03: Submission form with sales order number, email, optional phone
- CUST-04: Real-time queue status display (position, gate, estimated wait)
- CUST-05: Visual confirmation when pickup is complete
- STAFF-01: Email/password authentication via Supabase
- STAFF-02: Dashboard with table view of all pickup requests
- STAFF-03: Visual highlighting of requests requiring attention
- STAFF-04: Gate assignment functionality
- STAFF-05: Add to queue / Cancel request actions
- STAFF-06: Mark pickup as complete
- STAFF-07: Reorder queue positions within a gate
- STAFF-08: Move customer between gates
- STAFF-09: Priority override capability
- STAFF-10: Gate enable/disable (gates must be empty to disable)
- VAL-01: Validate sales order exists in NetSuite *(code complete, deployment deferred)*
- VAL-02: Retrieve order details from NetSuite *(code complete, deployment deferred)*
- VAL-03: Email domain verification against NetSuite *(code complete, deployment deferred)*
- VAL-04: Flag indicator for email-mismatched requests
- VAL-05: Rate limiting to prevent brute-force attempts
- RT-01: Queue position updates via Supabase Realtime
- RT-02: Wait time estimate recalculation
- RT-03: Gate assignment change notifications
- RT-04: Status change notifications
- INFRA-01: Supabase database schema
- INFRA-02: AWS Lambda for NetSuite integration *(code complete, deployment deferred)*
- INFRA-03: Supabase Auth configuration
- INFRA-04: Supabase Realtime subscriptions

**v1.1 — shipped 2026-01-30:**
- GATE-01: Gate operator view at /gate/[id]
- GATE-02: Sales order displayed prominently (large, scannable text)
- GATE-03: Customer name/company shown for verification
- GATE-04: Quick action to complete pickup
- GATE-05: Quick action to start processing
- GATE-06: Mobile-responsive layout with 44px touch targets
- GATE-07: Real-time updates when queue changes
- GATE-08: Next-up preview shows who's coming after current
- GATE-09: Order details displayed (item count, PO#)
- PROC-01: Processing status between queued and completed
- PROC-02: StatusBadge displays processing with amber styling
- PROC-03: Processing timestamp recorded
- PROC-04: Customer notified when pickup enters processing
- PROC-05: Auto-advance to next pickup after completing
- HOUR-01: Weekly schedule editor (7-day grid)
- HOUR-02: Holiday/closure scheduling
- HOUR-03: View current configured hours
- HOUR-04: Hours changes take effect immediately
- HOUR-05: Manual override toggle

**v2.0 — shipped 2026-02-03:**
- SIDE-01: Sidebar layout with shadcn-vue Sidebar component
- SIDE-02: Navigation structure (Dashboard, Gates, Opening Schedule)
- SIDE-03: Sidebar collapses to icon-only mode
- SIDE-04: Sidebar shows mobile overlay on small screens
- SIDE-05: Active route is visually highlighted in sidebar
- SIDE-06: Gate operator routes have no sidebar (fullscreen layout)
- DASH-01: Dashboard page with gate queue visualization (bar chart)
- DASH-02: Bar chart showing queue length per gate
- DASH-03: KPI card: Total pickups completed today
- DASH-04: KPI card: Average waiting time
- DASH-05: KPI card: Average processing time
- ARCH-01: Pinia state management with @pinia/nuxt
- ARCH-02: Queue store manages shared queue state
- ARCH-03: Gates store manages shared gate state
- ARCH-04: Composables handle realtime subscriptions (hybrid pattern)
- ARCH-05: Composables handle RPC/mutation calls (hybrid pattern)
- ARCH-06: Centralized type definitions in shared/types/
- ARCH-07: Request status uses typed constant (as const pattern)
- ARCH-08: Gate status uses typed constant
- ARCH-09: All magic strings replaced with typed constants
- GATE-12: Prev/next gate navigation buttons (alphabetical order)
- GATE-13: No scroll on mobile when content fits viewport
- BUG-01: Show completed/cancelled toggle filters correctly

**v2.1 — shipped 2026-02-03:**
- FIX-01: DataTable actions respect processing state (Complete + Return to Queue for processing orders)
- FIX-02: Cancel/Return to Queue as secondary actions throughout
- GATE-14: Gates overview page at /gates with table of all gates
- GATE-15: Gates page links to individual gate operator views
- GATE-16: Move "Manage gates" functionality from dashboard to /gates route
- GATE-17: Staff can create/enable/disable gates from /gates page
- DASH-06: Remove "Manage gates" tab from dashboard, keep queue filtering
- DASH-07: "Now processing" section shows table with one row per active gate
- DASH-08: Processing table shows order info or "Idle" state per gate
- ARCH-10: Refactor index.vue for DRY principle and separation of concerns
- ARCH-11: Clear separation of concerns with useDashboardData composable

**v2.2 — shipped 2026-02-03:**
- UI-01: Gates page "Open" button uses link variant with ExternalLink icon
- UI-02: Sidebar footer uses two-line NavUser layout (name + smaller email)
- UI-03: Sidebar dropdown positions correctly (bottom on mobile, right on desktop)
- UI-04: Tab queue count badges use Badge variant="secondary" for visibility
- UI-05: ProcessingGatesTable idle rows show only "Idle" text (no dashes/empty cells)
- TBL-01: QueueTable component supports mode='sort' with column sorting
- TBL-02: QueueTable component supports mode='drag' with row reordering
- TBL-03: Drag-and-drop uses drag handles (not entire row)
- TBL-04: Keyboard arrow keys provide accessible reordering alternative
- TBL-05: All Requests tab uses QueueTable with sort mode
- TBL-06: Gate tabs use QueueTable with drag mode
- TBL-07: Drag operations optimistically update UI before server response
- CLN-01: Remove refresh button from queue view
- CLN-02: Remove deprecated GateQueueList component after migration

### Active

None — planning next milestone.

### Out of Scope

- Native mobile apps (iOS/Android) — web-first approach, PWA works well
- Multiple warehouse locations — single warehouse for now
- Role-based permissions — all staff have equal access
- Customer accounts/login — public access with order number
- Other ERP integrations — NetSuite only
- Automated gate assignment — all assignments manual
- Multi-language support — English only
- Offline functionality — online required

## Context

**Business Environment:**
- Expected daily volume: 50-100 pickups
- Customers arrive with sales order number from purchase confirmation
- v1.1 deployed, ready for production testing

**Technical Environment:**
- Staff app: `staff/` directory (Nuxt 4, port 3000)
- Customer app: `customer/` directory (Nuxt 4)
- Local Supabase: `supabase start` (test user: staff@example.com / password123)
- NetSuite Lambda: `infra/` directory (OpenTofu), deployment pending

## Constraints

- **Tech Stack**: Nuxt 4 + Vue 3 + TailwindCSS + shadcn-vue — non-negotiable
- **Database/Auth**: Supabase Cloud (PostgreSQL, Auth, Realtime) — non-negotiable
- **NetSuite Integration**: AWS Lambda + python-netsuite — required for Python library
- **Real-time Latency**: < 2 seconds for queue updates
- **Browser Support**: Modern browsers (Chrome, Safari, Firefox, Edge)
- **Mobile Support**: Full functionality on devices >= 320px width

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| CHECK constraints over ENUM | Easier schema evolution without table locks | Good |
| SECURITY DEFINER for queue functions | Required for atomic MAX calculation | Good |
| Separate staff/ and customer/ apps | Clean separation, different auth requirements | Good |
| Local Supabase for development | Faster iteration, no cloud setup | Good |
| Dev mode mock for NetSuite | Allows testing without Lambda deployment | Good |
| Phone number optional | Not all customers want SMS | Good |
| Static QR code | Simpler implementation, single URL | Good |
| Gate must be empty to disable | Prevents orphaned customers | Good |
| Position 2 for priority insertion | Priority goes behind current service | Good |
| Only position 1 can start processing | Matches physical reality | Good |
| One processing per gate at a time | Prevents confusion about who is being served | Good |
| Queue position preserved during processing | Fairness on revert | Good |
| Amber color for processing status | Distinguishes from other states | Good |
| Queue positions compact after completion | Auto-advance to next customer | Good |
| 7-row list layout for weekly schedule | Simple, mobile-friendly | Good |
| Priority-based hours check | Override > closures > weekly schedule | Good |
| Hybrid Pinia + composables | Stores for state, composables for side effects | Good |
| No sidebar on gate routes | Gate operators need simplified mobile view | Good |
| Gate navigation alphabetical | Consistent ordering for prev/next buttons | Good |
| Crossfade gate transitions | Simpler than slide, user preferred | Good |
| Index-based x-axis for charts | Unovis requires numeric x values for categories | Good |
| svh unit for mobile viewport | Modern devices support, cleaner than fallbacks | Good |
| Dual mode QueueTable | Single component with mode prop (sort/drag) reduces duplication | Good |
| Space to enter grabbed state | Prevents accidental reordering vs immediate arrow movement | Good |
| Cmd/Ctrl modifiers for jump | Plain arrows move single step, modifiers jump to top/bottom | Good |
| Escape reverts to original | Captures order at grab time, restores on cancel | Good |
| displayName from email | Extract username, title case, prefer user_metadata.name if available | Good |
| colspan for idle rows | Spans Order/Company/Status columns for clean "Idle" text | Good |

---
*Last updated: 2026-02-03 after v2.2 milestone complete*
