# Milestone v1: Initial Release

**Status:** SHIPPED 2026-01-30
**Phases:** 1-10
**Total Plans:** 24

## Overview

This roadmap delivered the Warehouse Pickup Queue System in 10 phases, progressing from infrastructure through complete customer and staff experiences. Phases were ordered by dependencies: database and auth foundation first, then NetSuite integration (required for validation), then staff tools (to manage queue), then customer-facing features (that depend on backend), and finally real-time features that tie everything together.

## Phases

### Phase 1: Database Foundation

**Goal:** Establish the data layer that all other features depend on.
**Dependencies:** None (starting point)
**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md - Initialize Supabase and create core tables (gates, pickup_requests, business_hours)
- [x] 01-02-PLAN.md - Add RLS policies, triggers, and seed data

**Completed:** 2026-01-28

---

### Phase 2: NetSuite Integration

**Goal:** Enable order validation against the source of truth ERP system.
**Dependencies:** Phase 1 (need database to cache results)
**Plans:** 3 plans

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
**Plans:** 2 plans

Plans:
- [x] 03-01-PLAN.md — Initialize Nuxt 4 app with Supabase module and shadcn-vue
- [x] 03-02-PLAN.md — Create auth pages (login, forgot password, settings) and protected routes

**Completed:** 2026-01-29

---

### Phase 4: Staff Dashboard Core

**Goal:** Staff can view all pickup requests and identify those needing attention.
**Dependencies:** Phase 3 (need authentication), Phase 2 (requests have NetSuite data)
**Plans:** 1 plan

Plans:
- [x] 04-01-PLAN.md — Dashboard data table with TanStack Table, status badges, and visual highlighting

**Completed:** 2026-01-29

---

### Phase 5: Staff Queue Management

**Goal:** Staff can process pickup requests through the basic workflow.
**Dependencies:** Phase 4 (need dashboard to see requests)
**Plans:** 3 plans

Plans:
- [x] 05-01-PLAN.md — Foundation: atomic queue function, UI components (sonner, select, alert-dialog, tabs, sheet)
- [x] 05-02-PLAN.md — Queue actions composable, GateSelect and ActionButtons components
- [x] 05-03-PLAN.md — Dashboard integration with tabs, sheet, and wired actions

**Completed:** 2026-01-29

---

### Phase 6: Staff Advanced Queue Operations

**Goal:** Staff can fine-tune queue order and manage gates.
**Dependencies:** Phase 5 (need basic queue operations working)
**Plans:** 3 plans

Plans:
- [x] 06-01-PLAN.md — PostgreSQL functions for reorder, priority, and cross-gate move
- [x] 06-02-PLAN.md — Gate management UI with CRUD dialogs and enable/disable toggle
- [x] 06-03-PLAN.md — Drag-and-drop reorder with useSortable and priority button

**Completed:** 2026-01-29

---

### Phase 7: Customer Submission Flow

**Goal:** Customers can submit pickup requests with order validation.
**Dependencies:** Phase 2 (need NetSuite validation), Phase 1 (need database)
**Plans:** 3 plans

Plans:
- [x] 07-01-PLAN.md — Initialize customer Nuxt 4 app with shadcn-vue and rate limiting
- [x] 07-02-PLAN.md — Add anonymous RLS INSERT policy for pickup requests
- [x] 07-03-PLAN.md — Business hours check, submission form, and server routes

**Completed:** 2026-01-29

---

### Phase 8: Real-time Infrastructure

**Goal:** Enable real-time updates across all connected clients.
**Dependencies:** Phase 1 (need database with proper structure)
**Plans:** 2 plans

Plans:
- [x] 08-01-PLAN.md — Enable realtime publication and staff subscription composable
- [x] 08-02-PLAN.md — Customer realtime subscription composable with ID filtering

**Completed:** 2026-01-29

---

### Phase 9: Real-time Queue Updates

**Goal:** Queue changes are immediately visible to all affected parties.
**Dependencies:** Phase 8 (need realtime infrastructure), Phase 5 (need queue operations)
**Plans:** 3 plans

Plans:
- [x] 09-01-PLAN.md - Customer status page and position display with animations
- [x] 09-02-PLAN.md - Wait time estimation and TurnTakeover component
- [x] 09-03-PLAN.md - Staff dashboard realtime integration and full notification wiring

**Completed:** 2026-01-29

---

### Phase 10: Customer Queue Experience

**Goal:** Customers have full visibility into their queue status.
**Dependencies:** Phase 9 (need real-time updates), Phase 7 (need submission flow)
**Plans:** 2 plans

Plans:
- [x] 10-01-PLAN.md - Foundation components (Skeleton, LiveIndicator, CompletedStatus)
- [x] 10-02-PLAN.md - Status page integration and enhanced states

**Completed:** 2026-01-29

---

## Progress Summary

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

## Milestone Summary

**Key Decisions:**
- CHECK constraints over ENUM for status (easier schema evolution)
- SECURITY DEFINER for queue functions (atomic operations)
- Local Supabase for development (faster iteration)
- Separate staff/ and customer/ apps (clean separation)
- Dev mode mock for NetSuite validation (allows testing without Lambda)
- Filter DELETE events in callback (Supabase limitation workaround)

**Issues Resolved:**
- RLS policies for anonymous customer inserts
- Atomic queue position calculation
- Cross-gate move with gap compaction
- Realtime subscription filtering for customer app

**Issues Deferred:**
- NetSuite Lambda deployment (awaiting credentials)
- SMS notifications via Twilio (v2 scope)
- Business hours configuration UI (v2 scope)

**Technical Debt Incurred:**
- Database types not generated (type casting workaround in place)
- Orphaned 06-04-PLAN.md file (functionality covered by 06-01 through 06-03)

---

_Archived: 2026-01-30 as part of v1 milestone completion_
_For current project status, see .planning/MILESTONES.md_
