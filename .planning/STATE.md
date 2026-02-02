# State: Warehouse Pickup Queue System

**Session:** 2026-02-02
**Status:** v2.0 IN PROGRESS - Phase 17 Plans 01-03 COMPLETE

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-30)

**Core value:** Customers always know their queue position and which gate to go to
**Current focus:** v2.0 Architecture Overhaul - Phase 17 in progress (Plans 01-03 complete)

## Current Milestone: v2.0 Architecture Overhaul

**Goal:** Improve code quality with Pinia state management, centralized types, and modernize UI with sidebar navigation and dashboard visualization.

**Phases:**
- Phase 14: Type Foundation (COMPLETE)
- Phase 15: Pinia Infrastructure (COMPLETE)
- Phase 16: Sidebar Layout (COMPLETE)
- Phase 17: Dashboard & Visualization (DASH-01 through DASH-05)
- Phase 18: Gate Operator & Bug Fixes (GATE-12, GATE-13, BUG-01)

## Current Position

**Phase:** 17 of 18 (Dashboard & Visualization)
**Plan:** 03 of 05 complete (17-03)
**Status:** In progress
**Last activity:** 2026-02-02 - Completed 17-03-PLAN.md (Dashboard Components)

**Progress:**
```
v1.0 MVP - SHIPPED (Phases 1-10)
v1.1 Gate Operator Experience - SHIPPED (Phases 11-13)
v2.0 Architecture Overhaul - Phase 14-16 complete, Phase 17 in progress

[=================   ] 90%
```

## Deferred Items

| Item | Phase | How to Complete |
|------|-------|-----------------|
| NetSuite Lambda deployment | v1-02 | Fill `infra/dev.tfvars`, run `make deploy ENV=dev` |

## Accumulated Context

### Key Decisions

See .planning/PROJECT.md for consolidated key decisions.

v2.0 decisions implemented:
- Use `as const` pattern: not TypeScript enums (better tree-shaking) - 14-01
- Duplicate minimal types in customer app rather than cross-app shared package - 14-01
- Re-export from columns.ts for backward compatibility during transition - 14-02
- Keep variantMap/labelMap with string keys (local display logic) - 14-02
- Derive GateStatus narrow type from PICKUP_STATUS for component-specific constraints - 14-02
- StatusPageRequest extends PickupRequest for page-specific fields - 14-04
- PICKUP_STATUS usable directly in Vue template conditionals - 14-04
- Type assertions for .includes() on readonly arrays - 14-03
- GateStatus type in shared types for gate operator views - 14-03

v2.0 decisions implemented (continued):
- Use Object.assign for Partial updates (avoids TypeScript spread inference issues) - 15-02
- Use auto-imported defineStore (no manual import from pinia) - 15-02
- Sort gates by gate_number in sortedGates getter for consistent UI ordering - 15-02
- Transform Supabase array response to single object for gate relation - 15-03
- Keep refresh callback for gate changes (queue counts require full refresh) - 15-03
- Server confirms before store update in useGateManagement (not optimistic) - 15-03
- App-level subscription in app.vue prevents duplicate subscriptions on navigation - 15-04
- Gate page uses hybrid pattern: local enriched fetch + store lastUpdated watcher - 15-04
- Explicit type annotations required for storeToRefs callback parameters - 15-04

v2.0 decisions implemented (Phase 16):
- Tooltip installed as sidebar dependency (collapsed mode labels) - 16-01
- Skeleton installed as sidebar dependency (menu loading states) - 16-01
- Fullscreen layout minimal (div with bg, slot) - gate page has own header - 16-02
- definePageMeta layout property for route-specific layouts - 16-02
- House, DoorOpen, Calendar icons for Dashboard, Gates, Schedule nav items - 16-03
- Dropdown opens upward (side="top") from footer position - 16-03
- Avatar initials derived from first 2 characters of email - 16-03
- SidebarProvider at layout level with SidebarInset for main content - 16-04
- settings.vue parent route needs NuxtPage to render child routes - 16-04

v2.0 decisions implemented (Phase 17):
- Use @unovis/vue for chart visualization primitives (shadcn-vue charts dependency) - 17-01
- 1024px default SSR width for desktop-first chart rendering - 17-01
- SSR width plugin pattern: provideSSRWidth in Nuxt plugin for hydration-safe responsive components - 17-01
- 30-second refresh interval for KPI data - 17-02
- Return null from composable when no data, caller formats as '--' - 17-02
- Use startOfDay from date-fns for timezone-aware today filtering - 17-02
- Add @unovis/ts as direct dependency for GroupedBar.selectors type export - 17-03
- Use hsl(var(--chart-1)) for bar color theming - 17-03

v2.0 decisions pending implementation:
- Gate navigation alphabetical: consistent ordering for prev/next buttons

### Technical Debt

| Item | Priority | Introduced |
|------|----------|------------|
| Generate database types with `supabase gen types typescript` | Low | v1-05 |
| Pre-existing type errors in native-select component | Low | Unknown |
| Pre-existing type errors in customer/server/ (missing database types) | Low | v1-05 |

### Blockers

None

## Session Continuity

### Last Session Summary

Completed Plan 17-03: Dashboard Components
- Created KpiCard component with value/label display and skeleton loading state
- Created QueueBarChart component using Unovis (VisXYContainer, VisGroupedBar)
- Added @unovis/ts as direct dependency for type exports
- Both components handle empty/null data gracefully

### Next Actions

1. Execute 17-04-PLAN.md (KPI Cards Row)
2. Execute 17-05-PLAN.md (Dashboard Page Assembly)

### Context for Next Session

- Staff app in `staff/` directory (Nuxt 4)
- Chart components in staff/app/components/ui/chart/ (ChartContainer, ChartTooltip, etc.)
- SSR width plugin at staff/app/plugins/ssr-width.ts (provideSSRWidth 1024px)
- useDashboardKpis composable provides completedCount, avgWaitTimeMinutes, avgProcessingTimeMinutes
- formatDuration utility formats minutes as "Xh Ym" or "--" for null
- New: KpiCard component at staff/app/components/dashboard/KpiCard.vue
- New: QueueBarChart component at staff/app/components/dashboard/QueueBarChart.vue
- Layouts: default.vue (sidebar), fullscreen.vue (gate operator), auth.vue
- Pinia stores: useQueueStore, useGatesStore
- Phase 17 remaining: KPI cards row, dashboard page assembly (Plans 04-05)

---

*State initialized: 2026-01-28*
*Last updated: 2026-02-02 (Plan 17-03 complete)*
