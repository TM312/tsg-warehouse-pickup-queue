# Roadmap: Warehouse Pickup Queue

## Milestones

- Archived: **v1.0 MVP** — Phases 1-10 (shipped 2026-01-28) — see milestones/v1-ROADMAP.md
- Archived: **v1.1 Gate Operator Experience** — Phases 11-13 (shipped 2026-01-30) — see milestones/v1.1-ROADMAP.md
- Archived: **v2.0 Architecture Overhaul** — Phases 14-18 (shipped 2026-02-03) — see milestones/v2.0-ROADMAP.md
- Archived: **v2.1 Dashboard Polish & Gates View** — Phases 19-21 (shipped 2026-02-03) — see milestones/v2.1-ROADMAP.md

## Current: v2.2 Polish & Bug Fixes

**Milestone Goal:** Clean up UI inconsistencies, improve tab badge visibility, unify queue table components with drag-and-drop support, and remove unnecessary refresh button.

### Phase Overview

- [x] **Phase 22: Quick Wins** - External link styling, badge visibility, refresh button removal
- [ ] **Phase 23: Component Polish** - Sidebar NavUser layout, idle state display
- [ ] **Phase 24: Unified Queue Table** - Single table component with sort and drag modes

### Phase 22: Quick Wins

**Goal:** Immediate visual improvements with zero architectural risk
**Depends on:** Nothing (first phase of v2.2)
**Requirements:** UI-01, UI-04, CLN-01

**Success Criteria** (what must be TRUE):
1. Gates page "Open" button displays as link with external arrow icon
2. Tab queue count badges are visually distinct from tab background
3. Queue view has no refresh button (realtime subscriptions trusted)

**Plans:** 1 plan

Plans:
- [x] 22-01-PLAN.md — External link icon, badge visibility, refresh button removal

### Phase 23: Component Polish

**Goal:** Refined component UX for sidebar navigation and idle state display
**Depends on:** Phase 22
**Requirements:** UI-02, UI-03, UI-05

**Success Criteria** (what must be TRUE):
1. Sidebar footer shows user name prominently with smaller email below
2. Sidebar dropdown menu positions correctly (bottom on mobile, right on desktop)
3. ProcessingGatesTable idle rows display clean "Idle" text without dashes or empty cells

**Plans:** 1 plan

Plans:
- [ ] 23-01-PLAN.md — NavUser stacked layout with right-side dropdown, ProcessingGatesTable idle state cleanup

### Phase 24: Unified Queue Table

**Goal:** Single QueueTable component replaces separate table implementations
**Depends on:** Phase 23
**Requirements:** TBL-01, TBL-02, TBL-03, TBL-04, TBL-05, TBL-06, TBL-07, CLN-02

**Success Criteria** (what must be TRUE):
1. All Requests tab displays sortable columns (click header to sort)
2. Gate tabs display drag handles for row reordering
3. Drag-and-drop reordering updates UI immediately (optimistic update)
4. Keyboard arrow keys provide accessible reordering alternative
5. Deprecated GateQueueList component is removed from codebase

**Plans:** TBD

Plans:
- [ ] 24-01: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-10 | v1.0 | 24/24 | Complete | 2026-01-28 |
| 11-13 | v1.1 | 7/7 | Complete | 2026-01-30 |
| 14-18 | v2.0 | 19/19 | Complete | 2026-02-03 |
| 19-21 | v2.1 | 4/4 | Complete | 2026-02-03 |
| 22. Quick Wins | v2.2 | 1/1 | Complete | 2026-02-03 |
| 23. Component Polish | v2.2 | 0/1 | Not started | - |
| 24. Unified Queue Table | v2.2 | 0/TBD | Not started | - |

---

*Roadmap created: 2026-01-28*
*Last updated: 2026-02-03 — Phase 23 planned*
