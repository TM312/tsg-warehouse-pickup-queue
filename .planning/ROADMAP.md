# Roadmap: Warehouse Pickup Queue System

**Created:** 2026-01-28
**Depth:** Comprehensive (8-12 phases)
**Coverage:** 28/28 v1 requirements mapped

## Overview

This roadmap delivers the Warehouse Pickup Queue System in 10 phases, progressing from infrastructure through complete customer and staff experiences. Phases are ordered by dependencies: database and auth foundation first, then NetSuite integration (required for validation), then staff tools (to manage queue), then customer-facing features (that depend on backend), and finally real-time features that tie everything together.

## Phases

### Phase 1: Database Foundation

**Goal:** Establish the data layer that all other features depend on.

**Dependencies:** None (starting point)

**Requirements:**
- INFRA-01: Supabase database schema (SQL files in supabase/)

**Success Criteria:**
1. Database tables exist for pickup_requests, gates, and business_hours
2. Row-level security policies are in place for appropriate access control
3. Database migrations can be applied via Supabase CLI
4. Schema supports all queue states: pending, approved, in_queue, completed, cancelled

**Plans:** 2 plans (Complete)

Plans:
- [x] 01-01-PLAN.md - Initialize Supabase and create core tables (gates, pickup_requests, business_hours)
- [x] 01-02-PLAN.md - Add RLS policies, triggers, and seed data

**Completed:** 2026-01-28

---

### Phase 2: NetSuite Integration

**Goal:** Enable order validation against the source of truth ERP system.

**Dependencies:** Phase 1 (need database to cache results)

**Requirements:**
- INFRA-02: AWS Lambda for NetSuite integration (OpenTofu in infra/)
- VAL-01: Validate sales order exists in NetSuite and is valid for pickup
- VAL-02: Retrieve order details from NetSuite (company name, item count, PO number)
- VAL-03: Email domain verification against NetSuite customer record

**Success Criteria:**
1. Lambda function deployed via OpenTofu and callable from application
2. Given a valid sales order number, system returns order details (company, items, PO)
3. Given an invalid or non-existent order number, system returns clear error
4. System can compare submitted email domain against NetSuite customer record
5. Order data is cached per session to reduce API calls

**Plans:** 3 plans (Code Complete, Deployment Deferred)

Plans:
- [x] 02-01-PLAN.md - Create OpenTofu infrastructure (Lambda, API Gateway, IAM)
- [x] 02-02-PLAN.md - Implement Lambda function with NetSuite SuiteQL integration
- [x] 02-03-PLAN.md - Build layer, deploy, and verify endpoint (deployment deferred)

**Code Completed:** 2026-01-28
**Deployment:** Deferred — run `make deploy ENV=dev` when credentials ready

---

### Phase 3: Staff Authentication

**Goal:** Warehouse staff can securely access their dashboard.

**Dependencies:** Phase 1 (need users table and auth config)

**Requirements:**
- INFRA-03: Supabase Auth configuration
- STAFF-01: Email/password authentication via Supabase

**Success Criteria:**
1. Staff can create account with email/password (or admin creates for them)
2. Staff can log in and session persists across browser refreshes
3. Staff can log out from any page
4. Unauthenticated users are redirected to login page
5. Only authenticated users can access staff dashboard routes

**Plans:** 2 plans (Complete)

Plans:
- [x] 03-01-PLAN.md — Initialize Nuxt 4 app with Supabase module and shadcn-vue
- [x] 03-02-PLAN.md — Create auth pages (login, forgot password, settings) and protected routes

**Completed:** 2026-01-29

---

### Phase 4: Staff Dashboard Core

**Goal:** Staff can view all pickup requests and identify those needing attention.

**Dependencies:** Phase 3 (need authentication), Phase 2 (requests have NetSuite data)

**Requirements:**
- STAFF-02: Dashboard with table view of all pickup requests
- STAFF-03: Visual highlighting of requests requiring attention (flagged/pending)
- VAL-04: Flag indicator for email-mismatched requests

**Success Criteria:**
1. Staff sees table of all pickup requests with key info (order number, company, status, gate)
2. Pending requests are visually distinct from approved/in-queue requests
3. Email-mismatched requests show clear flag icon
4. Table updates when new requests come in (manual refresh initially, real-time later)

**Plans:** 1 plan (Complete)

Plans:
- [x] 04-01-PLAN.md — Dashboard data table with TanStack Table, status badges, and visual highlighting

**Completed:** 2026-01-29

---

### Phase 5: Staff Queue Management

**Goal:** Staff can process pickup requests through the basic workflow.

**Dependencies:** Phase 4 (need dashboard to see requests)

**Requirements:**
- STAFF-04: Gate assignment functionality
- STAFF-05: Add to queue / Cancel request actions
- STAFF-06: Mark pickup as complete

**Success Criteria:**
1. Staff can assign a request to a specific gate
2. Staff can add a pending/approved request to the queue
3. Staff can cancel a request (removes from queue, marks as cancelled)
4. Staff can mark an in-queue pickup as complete
5. Status transitions are reflected immediately in the dashboard

**Plans:** 3 plans (Complete)

Plans:
- [x] 05-01-PLAN.md — Foundation: atomic queue function, UI components (sonner, select, alert-dialog, tabs, sheet)
- [x] 05-02-PLAN.md — Queue actions composable, GateSelect and ActionButtons components
- [x] 05-03-PLAN.md — Dashboard integration with tabs, sheet, and wired actions

**Completed:** 2026-01-29

---

### Phase 6: Staff Advanced Queue Operations

**Goal:** Staff can fine-tune queue order and manage gates.

**Dependencies:** Phase 5 (need basic queue operations working)

**Requirements:**
- STAFF-07: Reorder queue positions within a gate
- STAFF-08: Move customer between gates
- STAFF-09: Priority override capability
- STAFF-10: Gate enable/disable (gates must be empty to disable)

**Success Criteria:**
1. Staff can drag/drop or use controls to reorder positions within a gate
2. Staff can move a customer from one gate to another
3. Staff can mark a request as priority (moves to front or near-front)
4. Staff can disable an empty gate (greyed out, no new assignments)
5. System prevents disabling a gate that has customers in queue

**Plans:** 3 plans (Complete)

Plans:
- [x] 06-01-PLAN.md — PostgreSQL functions for reorder, priority, and cross-gate move
- [x] 06-02-PLAN.md — Gate management UI with CRUD dialogs and enable/disable toggle
- [x] 06-03-PLAN.md — Drag-and-drop reorder with useSortable and priority button

**Completed:** 2026-01-29

---

### Phase 7: Customer Submission Flow

**Goal:** Customers can submit pickup requests with order validation.

**Dependencies:** Phase 2 (need NetSuite validation), Phase 1 (need database)

**Requirements:**
- CUST-01: Mobile-responsive web app accessible via static QR code/URL
- CUST-02: Business hours check with message when warehouse is closed
- CUST-03: Submission form with sales order number, email, optional phone
- VAL-05: Rate limiting to prevent brute-force order number attempts

**Success Criteria:**
1. Customer accesses app via QR code scan on mobile device
2. During closed hours, customer sees informational message (no form submission)
3. During open hours, customer can enter sales order number, email, and optional phone
4. Valid order submission creates pickup request in pending status
5. Invalid order shows clear error message
6. Repeated failed attempts are rate-limited with appropriate messaging

**Plans:** 3 plans (Complete)

Plans:
- [x] 07-01-PLAN.md — Initialize customer Nuxt 4 app with shadcn-vue and rate limiting
- [x] 07-02-PLAN.md — Add anonymous RLS INSERT policy for pickup requests
- [x] 07-03-PLAN.md — Business hours check, submission form, and server routes

**Completed:** 2026-01-29

---

### Phase 8: Real-time Infrastructure

**Goal:** Enable real-time updates across all connected clients.

**Dependencies:** Phase 1 (need database with proper structure)

**Requirements:**
- INFRA-04: Supabase Realtime subscriptions

**Success Criteria:**
1. Supabase Realtime is configured for pickup_requests table
2. Changes to requests are broadcast to subscribed clients within 2 seconds
3. Both customer app and staff dashboard can establish subscriptions
4. Subscriptions properly filter to relevant data (customer sees only their request)

**Plans:** 2 plans (Complete)

Plans:
- [x] 08-01-PLAN.md — Enable realtime publication and staff subscription composable
- [x] 08-02-PLAN.md — Customer realtime subscription composable with ID filtering

**Completed:** 2026-01-29

---

### Phase 9: Real-time Queue Updates

**Goal:** Queue changes are immediately visible to all affected parties.

**Dependencies:** Phase 8 (need realtime infrastructure), Phase 5 (need queue operations)

**Requirements:**
- RT-01: Queue position updates via Supabase Realtime
- RT-02: Wait time estimate recalculation on queue changes
- RT-03: Gate assignment change notifications
- RT-04: Status change notifications (pending -> approved -> in_queue -> completed)

**Success Criteria:**
1. When queue positions change, affected customers see updated position instantly
2. Wait time estimates recalculate when queue changes (based on average processing time)
3. When staff assigns/changes gate, customer sees new gate assignment
4. When status changes, customer sees status transition in real-time
5. Staff dashboard updates in real-time when any request changes

**Plans:** 3 plans (Complete)

Plans:
- [x] 09-01-PLAN.md - Customer status page and position display with animations
- [x] 09-02-PLAN.md - Wait time estimation and TurnTakeover component
- [x] 09-03-PLAN.md - Staff dashboard realtime integration and full notification wiring

**Completed:** 2026-01-29

---

### Phase 10: Customer Queue Experience

**Goal:** Customers have full visibility into their queue status.

**Dependencies:** Phase 9 (need real-time updates), Phase 7 (need submission flow)

**Requirements:**
- CUST-04: Real-time queue status display (position, gate, estimated wait)
- CUST-05: Visual confirmation when pickup is complete

**Success Criteria:**
1. After submission, customer sees their current queue position
2. Customer sees assigned gate when staff assigns it
3. Customer sees estimated wait time based on queue position
4. When pickup is marked complete, customer sees clear completion confirmation
5. All updates appear without manual page refresh

**Plans:** 2 plans (Complete)

Plans:
- [x] 10-01-PLAN.md - Foundation components (Skeleton, LiveIndicator, CompletedStatus)
- [x] 10-02-PLAN.md - Status page integration and enhanced states

**Completed:** 2026-01-29

---

## Progress

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 1 | Database Foundation | INFRA-01 | Complete |
| 2 | NetSuite Integration | INFRA-02, VAL-01, VAL-02, VAL-03 | Code Complete (deploy deferred) |
| 3 | Staff Authentication | INFRA-03, STAFF-01 | Complete |
| 4 | Staff Dashboard Core | STAFF-02, STAFF-03, VAL-04 | Complete |
| 5 | Staff Queue Management | STAFF-04, STAFF-05, STAFF-06 | Complete |
| 6 | Staff Advanced Queue Operations | STAFF-07, STAFF-08, STAFF-09, STAFF-10 | Complete |
| 7 | Customer Submission Flow | CUST-01, CUST-02, CUST-03, VAL-05 | Complete |
| 8 | Real-time Infrastructure | INFRA-04 | Complete |
| 9 | Real-time Queue Updates | RT-01, RT-02, RT-03, RT-04 | Complete |
| 10 | Customer Queue Experience | CUST-04, CUST-05 | Complete |

---

*Roadmap created: 2026-01-28*
*Last updated: 2026-01-29 after Phase 10 complete*
