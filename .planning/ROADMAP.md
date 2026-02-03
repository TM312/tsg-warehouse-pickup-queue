# Roadmap: Warehouse Pickup Queue v2.0

## Overview

The v2.0 Architecture Overhaul transforms the staff application from an organically-grown codebase into a well-structured architecture. Starting with foundational type definitions, we build Pinia stores for centralized state management, implement sidebar navigation for improved UX, create a dashboard with visualization, and complete with gate operator enhancements and bug fixes.

## Milestones

- Archived: **v1.0 MVP** - Phases 1-10 (shipped 2026-01-28)
- Archived: **v1.1 Gate Operator Experience** - Phases 11-13 (shipped 2026-01-30)
- In Progress: **v2.0 Architecture Overhaul** - Phases 14-18

## Phases

- [x] **Phase 14: Type Foundation** - Centralized TypeScript types with as const pattern
- [x] **Phase 15: Pinia Infrastructure** - State management with hybrid composables pattern
- [x] **Phase 16: Sidebar Layout** - Navigation structure for staff application
- [x] **Phase 17: Dashboard & Visualization** - Overview page with gate queue chart
- [x] **Phase 18: Gate Operator & Bug Fixes** - Navigation improvements and filter fix

## Phase Details

### Phase 14: Type Foundation

**Goal**: All status values and data types are centrally defined with TypeScript constants
**Depends on**: Nothing (foundational phase)
**Requirements**: ARCH-06, ARCH-07, ARCH-08, ARCH-09
**Success Criteria** (what must be TRUE):
  1. Status values use typed constants throughout codebase (no magic strings)
  2. PickupRequest and Gate types are imported from shared/types/
  3. IDE autocomplete works for all status values
  4. Build passes with no type errors
**Plans**: 4 plans

Plans:
- [x] 14-01-PLAN.md - Create centralized type definitions (staff + customer shared types)
- [x] 14-02-PLAN.md - Migrate staff dashboard components
- [x] 14-03-PLAN.md - Migrate staff pages and composables
- [x] 14-04-PLAN.md - Migrate customer app files

### Phase 15: Pinia Infrastructure

**Goal**: Shared state is managed through Pinia stores with proper composable boundaries
**Depends on**: Phase 14 (types needed for store definitions)
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05
**Success Criteria** (what must be TRUE):
  1. Queue state is accessible from any component via useQueueStore()
  2. Gate state is accessible from any component via useGatesStore()
  3. Realtime updates flow through stores (UI updates when data changes)
  4. Vue DevTools shows store state and reactive updates
  5. No duplicate subscriptions after page navigation
**Plans**: 4 plans

Plans:
- [x] 15-01-PLAN.md - Install @pinia/nuxt and configure Pinia
- [x] 15-02-PLAN.md - Create queue and gates stores
- [x] 15-03-PLAN.md - Refactor composables to use stores (hybrid pattern)
- [x] 15-04-PLAN.md - Migrate pages to read from stores

### Phase 16: Sidebar Layout

**Goal**: Staff app has consistent navigation via collapsible sidebar
**Depends on**: Phase 14 (can work in parallel with Phase 15)
**Requirements**: SIDE-01, SIDE-02, SIDE-03, SIDE-04, SIDE-05, SIDE-06
**Success Criteria** (what must be TRUE):
  1. Dashboard, Gates, and Opening Schedule are accessible via sidebar navigation
  2. Sidebar collapses to icons on desktop, shows as overlay on mobile
  3. Current page is visually highlighted in sidebar
  4. Gate operator routes (/gate/[id]) show fullscreen without sidebar
  5. Sidebar state persists across page navigation
**Plans**: 4 plans

Plans:
- [x] 16-01-PLAN.md — Install shadcn-vue sidebar, avatar, dropdown-menu, tooltip components
- [x] 16-02-PLAN.md — Create fullscreen layout and update gate page to use it
- [x] 16-03-PLAN.md — Create AppSidebar and NavUser components
- [x] 16-04-PLAN.md — Update default layout with sidebar structure

### Phase 17: Dashboard & Visualization

**Goal**: Supervisors can see queue status at a glance via dashboard overview
**Depends on**: Phase 15 (stores), Phase 16 (layout)
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
**Success Criteria** (what must be TRUE):
  1. Dashboard page shows overview of all gates and queues
  2. Bar chart visualizes queue length per gate
  3. Total pickups completed today is displayed
  4. Average waiting time (queue to processing) is displayed
  5. Average processing time (processing to complete) is displayed
**Plans**: 4 plans

Plans:
- [x] 17-01-PLAN.md — Install chart dependencies and SSR plugin
- [x] 17-02-PLAN.md — Create KPI composable and utilities
- [x] 17-03-PLAN.md — Create dashboard UI components
- [x] 17-04-PLAN.md — Integrate dashboard page

### Phase 18: Gate Operator & Bug Fixes

**Goal**: Gate operators can navigate between gates and filter bug is resolved
**Depends on**: Phase 16 (layout ensures gate routes remain fullscreen)
**Requirements**: GATE-12, GATE-13, BUG-01
**Success Criteria** (what must be TRUE):
  1. Gate operator can navigate to previous/next gate via buttons
  2. Gate order follows alphabetical sorting (consistent ordering)
  3. Gate page does not scroll when content fits viewport on mobile
  4. Show completed/cancelled toggle correctly filters the queue table
**Plans**: 3 plans

Plans:
- [x] 18-01-PLAN.md — Create gate navigation composable and button component
- [x] 18-02-PLAN.md — Fix filter toggle and mobile viewport bugs
- [x] 18-03-PLAN.md — Integrate navigation into gate page and verify

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 14. Type Foundation | v2.0 | 4/4 | Complete | 2026-01-30 |
| 15. Pinia Infrastructure | v2.0 | 4/4 | Complete | 2026-01-30 |
| 16. Sidebar Layout | v2.0 | 4/4 | Complete | 2026-02-02 |
| 17. Dashboard & Visualization | v2.0 | 4/4 | Complete | 2026-02-03 |
| 18. Gate Operator & Bug Fixes | v2.0 | 3/3 | Complete | 2026-02-03 |

---

*Roadmap created: 2026-01-30*
*Previous milestones archived: .planning/milestones/*
