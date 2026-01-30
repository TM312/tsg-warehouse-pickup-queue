# Warehouse Pickup Queue System

## What This Is

A two-part web application that streamlines warehouse pickup operations. Customers scan a QR code, enter their sales order number, and get real-time queue updates. Warehouse staff manage the queue, assign gates, and process pickups through an internal dashboard. The system integrates with NetSuite ERP for order validation.

## Core Value

Customers always know their queue position and which gate to go to — no confusion, no manual coordination overhead.

## Current State

**Version:** v1 shipped 2026-01-30
**Codebase:** ~6,700 LOC (Vue, TypeScript, SQL, Python, Terraform)
**Tech Stack:** Nuxt 4, Vue 3, TailwindCSS, shadcn-vue, Supabase (PostgreSQL, Auth, Realtime), AWS Lambda

**What's working:**
- Customer app: submission form, business hours check, real-time status tracking
- Staff app: dashboard, queue management, gate management, drag-drop reordering
- Real-time updates across both apps via Supabase Realtime
- Rate limiting on customer submissions

**What's pending:**
- NetSuite Lambda deployment (code complete, awaiting credentials)
- SMS notifications (v2 scope)

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

### Active

**v1.1 — Gate Operator Experience:**
- Gate operator mobile-first view (/gate/[id])
- Processing status for explicit pickup acceptance
- Business hours configuration UI (weekly schedule, holidays, manual override)

### Out of Scope

- Native mobile apps (iOS/Android) — web-first approach
- Multiple warehouse locations — single warehouse for v1
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
- v1 deployed, ready for production testing

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

## Current Milestone: v1.1 Gate Operator Experience

**Goal:** Empower gate operators with a focused mobile view and explicit workflow states while giving supervisors business hours control.

**Target features:**
- Gate operator view — mobile-first /gate/[id] sub-page with current pickup, order/customer details, quick actions
- Processing status — explicit "processing" state between queued and completed for clear acceptance workflow
- Business hours management — weekly schedule, holiday/closure scheduling, manual override

---
*Last updated: 2026-01-30 after v1.1 milestone started*
