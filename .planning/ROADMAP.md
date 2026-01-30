# Roadmap: Warehouse Pickup Queue v1.1

## Milestones

- [x] **v1.0 MVP** - Phases 1-10 (shipped 2026-01-30)
- [ ] **v1.1 Gate Operator Experience** - Phases 11-13 (in progress)

## Overview

This milestone adds gate operator tooling to the existing pickup queue system. Gate operators need a mobile-first view to accept and complete pickups at their assigned gate, which requires a new "processing" status to distinguish "next up" from "actively being served." Business hours management gives supervisors control over weekly schedules and closures. The three phases build in dependency order: processing status foundation enables gate operator workflow, and business hours is independent.

## Phases

<details>
<summary>v1.0 MVP (Phases 1-10) - SHIPPED 2026-01-30</summary>

See `.planning/archive/v1-milestone.md` for complete v1 phase history.

</details>

### v1.1 Gate Operator Experience (In Progress)

**Milestone Goal:** Empower gate operators with a focused mobile view and explicit workflow states while giving supervisors business hours control.

- [ ] **Phase 11: Processing Status Foundation** - Schema changes and StatusBadge for new processing state
- [ ] **Phase 12: Gate Operator View** - Mobile-first /gate/[id] with quick actions and real-time updates
- [ ] **Phase 13: Business Hours Management** - Weekly schedule editor, holiday scheduling, manual override

## Phase Details

### Phase 11: Processing Status Foundation
**Goal**: Enable explicit acceptance of pickups with a new "processing" status between queued and completed
**Depends on**: Nothing (first phase of v1.1)
**Requirements**: PROC-01, PROC-02, PROC-03
**Success Criteria** (what must be TRUE):
  1. Pickup requests can have status "processing" in addition to existing statuses
  2. StatusBadge component displays processing status with distinct visual styling (yellow/amber)
  3. Processing start timestamp is recorded when a pickup enters processing state
  4. Staff dashboard shows processing status for requests being actively served
**Plans**: 2 plans

Plans:
- [ ] 11-01-PLAN.md - Processing status schema migration and database functions (start_processing, revert_to_queue)
- [ ] 11-02-PLAN.md - StatusBadge with live duration, NowProcessingSection, useQueueActions updates, customer status page

### Phase 12: Gate Operator View
**Goal**: Gate operators can efficiently manage pickups at their assigned gate from a mobile device
**Depends on**: Phase 11 (requires processing status)
**Requirements**: GATE-01, GATE-02, GATE-03, GATE-04, GATE-05, GATE-06, GATE-07, GATE-08, GATE-09, PROC-04, PROC-05
**Success Criteria** (what must be TRUE):
  1. Gate operator can view /gate/[id] showing the current pickup (position 1) at their gate
  2. Sales order number is displayed prominently (large, scannable text) with customer name/company
  3. Gate operator can tap "Start Processing" to accept the current pickup
  4. Gate operator can tap "Complete" to finish the current pickup and auto-advance to next
  5. Gate operator sees real-time updates when queue changes (new assignments, reorders)
  6. Customer sees "Your order is being processed at Gate X" when their pickup enters processing
  7. Layout is mobile-responsive with 44x44px minimum touch targets
**Plans**: TBD

Plans:
- [ ] 12-01: Gate operator page foundation and current pickup display
- [ ] 12-02: Quick actions (start processing, complete) and customer notification
- [ ] 12-03: Next-up preview and real-time updates

### Phase 13: Business Hours Management
**Goal**: Supervisors can configure when the warehouse is open for pickups
**Depends on**: Nothing (independent of Phases 11-12)
**Requirements**: HOUR-01, HOUR-02, HOUR-03, HOUR-04, HOUR-05
**Success Criteria** (what must be TRUE):
  1. Supervisor can view current configured business hours at /settings/business-hours
  2. Supervisor can edit weekly schedule using a 7-day grid with time pickers
  3. Supervisor can schedule holiday/closure dates using a date picker
  4. Hours changes take effect immediately without requiring deployment
  5. Supervisor can toggle manual override ("Closed now" / "Open late") for immediate effect
**Plans**: TBD

Plans:
- [ ] 13-01: Weekly schedule editor
- [ ] 13-02: Holiday scheduling and manual override

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-10 | v1.0 | 24/24 | Complete | 2026-01-30 |
| 11. Processing Status | v1.1 | 0/2 | Planned | - |
| 12. Gate Operator View | v1.1 | 0/3 | Not started | - |
| 13. Business Hours | v1.1 | 0/2 | Not started | - |

---
*Roadmap created: 2026-01-30*
*Last updated: 2026-01-30*
