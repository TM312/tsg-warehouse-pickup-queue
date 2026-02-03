# Requirements: Warehouse Pickup Queue v2.0

**Defined:** 2026-01-30
**Core Value:** Customers always know their queue position and which gate to go to

## v2.0 Requirements

Requirements for v2.0 Architecture Overhaul. Each maps to roadmap phases.

### Sidebar & Navigation

- [x] **SIDE-01**: Staff app has sidebar layout using shadcn-vue Sidebar component
- [x] **SIDE-02**: Sidebar contains navigation: Dashboard, Gates, Opening Schedule
- [x] **SIDE-03**: Sidebar collapses to icon-only mode
- [x] **SIDE-04**: Sidebar shows mobile overlay on small screens
- [x] **SIDE-05**: Active route is visually highlighted in sidebar
- [x] **SIDE-06**: Gate operator routes (/gate/[id]) have no sidebar (minimal layout)

### Dashboard

- [x] **DASH-01**: Dashboard page serves as main index with overview
- [x] **DASH-02**: Bar chart visualization showing queue length per gate
- [x] **DASH-03**: KPI card: Total pickups completed today
- [x] **DASH-04**: KPI card: Average waiting time (queue to processing)
- [x] **DASH-05**: KPI card: Average processing time (processing to complete)

### Architecture

- [x] **ARCH-01**: Pinia installed and configured with @pinia/nuxt
- [x] **ARCH-02**: Queue store manages shared queue state
- [x] **ARCH-03**: Gates store manages shared gate state
- [x] **ARCH-04**: Composables handle realtime subscriptions (hybrid pattern)
- [x] **ARCH-05**: Composables handle RPC/mutation calls (hybrid pattern)
- [x] **ARCH-06**: Centralized type definitions in shared/types/ directory
- [x] **ARCH-07**: Request status uses typed constant (as const pattern)
- [x] **ARCH-08**: Gate status uses typed constant
- [x] **ARCH-09**: All magic strings replaced with typed constants

### Gate Operator Improvements

- [x] **GATE-12**: Prev/next gate navigation buttons (alphabetical order)
- [x] **GATE-13**: No scroll on mobile when content fits viewport

### Bug Fixes

- [x] **BUG-01**: Show completed/cancelled toggle filters correctly

## Future Requirements

Deferred to v2.1 or later.

### Enhancements

- **SIDE-07**: Sidebar collapsed state persists across sessions
- **DASH-06**: Real-time KPI updates (currently refreshes on page load)
- **ARCH-10**: Full TypeScript strict mode compliance

## Out of Scope

Explicitly excluded from v2.0.

| Feature | Reason |
|---------|--------|
| Customer app changes | v2.0 focuses on staff app architecture |
| Role-based sidebar items | All staff have equal access |
| Dashboard filtering by date range | Keep simple for v2.0 |
| Theming/dark mode | Not requested |

## Traceability

Which phases cover which requirements.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-06 | 14 | Complete |
| ARCH-07 | 14 | Complete |
| ARCH-08 | 14 | Complete |
| ARCH-09 | 14 | Complete |
| ARCH-01 | 15 | Complete |
| ARCH-02 | 15 | Complete |
| ARCH-03 | 15 | Complete |
| ARCH-04 | 15 | Complete |
| ARCH-05 | 15 | Complete |
| SIDE-01 | 16 | Complete |
| SIDE-02 | 16 | Complete |
| SIDE-03 | 16 | Complete |
| SIDE-04 | 16 | Complete |
| SIDE-05 | 16 | Complete |
| SIDE-06 | 16 | Complete |
| DASH-01 | 17 | Complete |
| DASH-02 | 17 | Complete |
| DASH-03 | 17 | Complete |
| DASH-04 | 17 | Complete |
| DASH-05 | 17 | Complete |
| GATE-12 | 18 | Complete |
| GATE-13 | 18 | Complete |
| BUG-01 | 18 | Complete |

**Coverage:**
- v2.0 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0

---
*Requirements defined: 2026-01-30*
*Last updated: 2026-02-03 (Phase 18 complete - all v2.0 requirements done)*
