# Roadmap: Warehouse Pickup Queue

## Milestones

- Archived: **v1.0 MVP** — Phases 1-10 (shipped 2026-01-28) — see milestones/v1-ROADMAP.md
- Archived: **v1.1 Gate Operator Experience** — Phases 11-13 (shipped 2026-01-30) — see milestones/v1.1-ROADMAP.md
- Archived: **v2.0 Architecture Overhaul** — Phases 14-18 (shipped 2026-02-03) — see milestones/v2.0-ROADMAP.md

## v2.1 Dashboard Polish & Gates View

Polish the dashboard experience by refactoring for maintainability, creating a dedicated gates management page, and fixing UX issues with action states and processing display.

## Phases

- [x] **Phase 19: Dashboard Refactoring** - Extract components and reduce complexity in index.vue
- [ ] **Phase 20: Gates View** - Create /gates route with table and management functionality
- [ ] **Phase 21: Dashboard Polish** - Fix tabs, processing section, and action button states

## Phase Details

### Phase 19: Dashboard Refactoring
**Goal**: index.vue is maintainable with clear separation of concerns
**Depends on**: Nothing (first phase of milestone)
**Requirements**: ARCH-10, ARCH-11
**Success Criteria** (what must be TRUE):
  1. index.vue follows DRY principle with no duplicated logic
  2. Components are extracted where appropriate (computed data, handlers grouped logically)
  3. Template sections map clearly to single-responsibility components
  4. Code is easier to modify for DASH-06/07/08 changes
**Plans**: 1 plan

Plans:
- [x] 19-01-PLAN.md — Create useDashboardData composable and refactor index.vue

### Phase 20: Gates View
**Goal**: Staff can manage all gates from a dedicated /gates page
**Depends on**: Phase 19 (clean codebase)
**Requirements**: GATE-14, GATE-15, GATE-16, GATE-17
**Success Criteria** (what must be TRUE):
  1. /gates route exists and is accessible from sidebar
  2. Gates table shows all gates with their current status (active/inactive, queue count)
  3. Each gate row links to the gate operator view (/gate/[id])
  4. Staff can create new gates from the /gates page
  5. Staff can enable/disable gates from the /gates page
**Plans**: TBD

Plans:
- [ ] 20-01: Create gates overview page with table and management

### Phase 21: Dashboard Polish
**Goal**: Dashboard has clean UX with correct action states and processing display
**Depends on**: Phase 19 (refactored dashboard), Phase 20 (gates management moved)
**Requirements**: DASH-06, DASH-07, DASH-08, FIX-01, FIX-02
**Success Criteria** (what must be TRUE):
  1. Dashboard tabs contain only queue filtering (All, Gate 1, Gate 2, etc.) — no "Manage Gates"
  2. "Now processing" section shows a table with one row per active gate
  3. Processing table shows order info when gate is busy, "Idle" when gate has no processing order
  4. Processing orders in DataTable show Complete + Return to Queue actions (not assign to gate)
  5. Cancel action appears as secondary (outline/ghost) throughout all order states
**Plans**: TBD

Plans:
- [ ] 21-01: Update dashboard tabs and processing section
- [ ] 21-02: Fix DataTable action states

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 19. Dashboard Refactoring | 1/1 | ✓ Complete | 2026-02-03 |
| 20. Gates View | 0/1 | Not started | - |
| 21. Dashboard Polish | 0/2 | Not started | - |

---

*Roadmap created: 2026-02-03*
*Milestone: v2.1 Dashboard Polish & Gates View*
