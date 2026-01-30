# Warehouse Pickup Queue System

## What This Is

A two-part web application that streamlines warehouse pickup operations. Customers scan a QR code, enter their sales order number, and get real-time queue updates. Warehouse staff manage the queue, assign gates, and process pickups through an internal dashboard. Gate operators have a dedicated mobile view for accepting and completing pickups. The system integrates with NetSuite ERP for order validation.

## Core Value

Customers always know their queue position and which gate to go to — no confusion, no manual coordination overhead.

## Current State

**Version:** v1.1 shipped 2026-01-30
**Codebase:** ~11,550 LOC (Vue, TypeScript, SQL, Python, Terraform)
**Tech Stack:** Nuxt 4, Vue 3, TailwindCSS, shadcn-vue, Supabase (PostgreSQL, Auth, Realtime), AWS Lambda

**What's working:**
- Customer app: submission form, business hours check, real-time status tracking, hours display
- Staff app: dashboard, queue management, gate management, drag-drop reordering
- Gate operator view: mobile-first /gate/[id] with processing workflow
- Business hours: weekly schedule, closures, manual override
- Real-time updates across all views via Supabase Realtime
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

### Active

(None — planning next milestone)

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

---
*Last updated: 2026-01-30 after v1.1 milestone*
