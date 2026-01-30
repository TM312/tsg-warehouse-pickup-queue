# Project Research Summary

**Project:** Warehouse Pickup Queue v2.0 Architecture Overhaul
**Domain:** Nuxt 4 Admin Dashboard with Pinia state management, sidebar navigation, and centralized types
**Researched:** 2026-01-30
**Confidence:** HIGH

## Executive Summary

The v2.0 architecture overhaul introduces three evolutionary refinements to the existing Nuxt 4 codebase: (1) Pinia stores for shared state management while keeping existing composables for realtime subscriptions and RPC operations, (2) shadcn-vue Sidebar navigation for dashboard pages while preserving the fullscreen gate operator experience, and (3) centralized TypeScript types using Nuxt 4's `shared/types/` auto-import convention.

The recommended approach is a **hybrid Pinia + composables pattern** where Pinia stores manage global reactive state (queue data, gate status) and computed derivations, while existing composables retain responsibility for side effects (realtime subscriptions, RPC calls). This separation prevents lifecycle cleanup issues and maintains the working realtime infrastructure. The sidebar layout applies only to dashboard/admin pages via explicit `layout: 'sidebar'` metadata, while gate operator routes use `layout: false` to preserve their mobile-first, fullscreen experience. For visualization, use shadcn-vue's Chart component (based on unovis) instead of vue-chartjs for bar chart rendering.

**Key risks:** (1) Realtime subscription leaks if subscriptions move from composables into Pinia stores, (2) reactivity loss if store state is destructured without `storeToRefs()`, (3) gate operator mobile view broken if sidebar layout inadvertently applies to `/gate/[id]` routes. Mitigation: Establish clear composable-vs-store boundaries in Phase 1, mandate `storeToRefs()` in all store consumers, and test gate view on mobile after every layout change.

## Key Findings

### Recommended Stack

v2.0 adds three new dependencies plus one shadcn CLI component to the existing stack (Nuxt 4, Vue 3, TailwindCSS, shadcn-vue, Supabase). Pinia provides official Vue state management with Composition API support and devtools integration. The shadcn-vue Sidebar component requires no new npm dependencies since the project already has reka-ui (shadcn's underlying library) and lucide-vue-next icons. For dashboard visualization, use **shadcn-vue Chart** (based on unovis) instead of vue-chartjs.

**Core technologies:**
- **Pinia + @pinia/nuxt**: Global state management — official Vue successor to Vuex, Nuxt 4 compatible as of v0.11.3, auto-imports stores from `app/stores/`
- **shadcn-vue Sidebar**: Sidebar navigation layout — pre-built component from existing shadcn-vue library, add via `pnpm dlx shadcn-vue@latest add sidebar`
- **shadcn-vue Chart**: Dashboard visualization — add via `pnpm dlx shadcn-vue@latest add chart-bar`, provides recharts-style API using unovis for rendering
- **TypeScript `as const` pattern**: Type organization — use `as const` objects instead of enums for status values (no runtime overhead, better tree-shaking)

**Critical version note:** @pinia/nuxt v0.11.3 explicitly supports Nuxt `^3.15.0 || ^4.0.0`. The project runs Nuxt 4.3.0, so compatibility is verified.

**What NOT to add:** VueX (deprecated), pinia-plugin-persistedstate (not needed), vue-chartjs (replaced by shadcn-vue Chart), ApexCharts (heavier than needed), TypeScript enums (use `as const`).

### Expected Features

The v2.0 architecture overhaul targets four key areas: sidebar navigation, dashboard visualization, state management, and type safety. Users expect standard admin UI patterns: collapsible sidebar with mobile overlay, active route highlighting, keyboard shortcuts, and layout that doesn't interfere with content. The dashboard should provide at-a-glance queue status through simple bar chart visualization.

**Must have (table stakes):**
- Collapsible sidebar navigation — every modern admin has one, users know the pattern
- Mobile sidebar as overlay — mobile users expect hamburger menu behavior (shadcn handles via `useSidebar().isMobile`)
- Active route highlighting — users need visual confirmation of current location
- No sidebar on gate operator routes — `/gate/[id]` must remain fullscreen mobile experience
- Centralized TypeScript types — replace magic strings with type constants
- Dashboard overview page — supervisors need at-a-glance queue status

**Should have (competitive):**
- Bar chart visualization — shows queue length per gate (use shadcn-vue Chart with bar chart)
- Pinia store for shared state — eliminates prop drilling, single source of truth
- SidebarRail for collapsed state — compact icon-only sidebar
- Sidebar state persistence — remembers collapsed/expanded via `storage-key` prop
- Computed derivations in store — efficient `requestsByGate`, `activeRequests` getters

**Defer (v2+):**
- Nested/multi-level sidebar menus — YAGNI for 3-4 navigation items
- Sidebar search/command palette — overkill for 3-page app
- Real-time chart updates — polling/subscriptions for charts adds complexity, manual refresh is fine
- Server-side Pinia state — app requires auth, no SEO benefit to SSR hydration
- Type generation from database schema — manual types sufficient for this app size

### Architecture Approach

The v2.0 architecture uses a **hybrid Pinia + composables pattern** where state and side effects have clear separation. Pinia stores own shared reactive state (pickup requests, gates) and computed derivations (filtered lists, counts by gate). Existing composables retain responsibility for realtime subscriptions and RPC calls, updating stores via actions. This preserves working lifecycle cleanup in `useRealtimeQueue.ts` while centralizing state access.

**Major components:**
1. **Pinia Stores** (`app/stores/`) — Shared reactive state, computed getters. `useQueueStore` holds pickup requests array, `useGatesStore` holds gates. Actions like `setRequests()` called by composables. Return `readonly()` refs to prevent external mutation.
2. **Composables** (`app/composables/`) — Side effects only. `useRealtimeQueue` manages Supabase channel subscriptions with proper `onUnmounted` cleanup. `useQueueRpc` and `useGateRpc` make RPC calls and update stores on success. Hybrid pattern: composables can call stores internally.
3. **Sidebar Layout** (`app/layouts/sidebar.vue`) — Uses shadcn-vue SidebarProvider, Sidebar components. Wraps dashboard/settings pages. Gate operator routes use `layout: false` to opt out. Mobile sidebar renders as Sheet overlay.
4. **Centralized Types** (`shared/types/`) — Auto-imported by Nuxt 4. Use `as const` objects for status enums. Interfaces for PickupRequest, Gate, etc. Single source of truth prevents drift.

**Key patterns:**
- Store consumers MUST use `storeToRefs()` for state/getters, destructure actions directly
- Realtime subscriptions stay in composables, never in stores (lifecycle cleanup)
- Route-specific layouts via `definePageMeta({ layout: 'sidebar' })` or `layout: false`
- Status values as `as const` objects, not TypeScript enums (no runtime overhead)

### Critical Pitfalls

Research identified six critical pitfalls that would cause rewrites or major issues if not addressed:

1. **Realtime subscription leak during composable-to-Pinia migration** — If `useRealtimeQueue` subscription moves into Pinia store or is called after `await`, the `onUnmounted` cleanup never registers. Causes memory leaks, duplicate events, connection exhaustion. **Prevention:** Keep subscriptions in composables, call from component `onMounted`, never from store initialization.

2. **Store reactivity loss on destructuring** — Destructuring state directly from Pinia store (`const { requests } = useQueueStore()`) loses reactivity. UI freezes on initial values. **Prevention:** Always use `storeToRefs()` for state/getters: `const { requests } = storeToRefs(store)`. Actions can be destructured directly.

3. **Type definition migration breaking components** — Moving types from inline definitions (e.g., `columns.ts`) to `shared/types/` breaks imports across multiple files simultaneously. Hard to iterate. **Prevention:** Create central types first, re-export from old location initially, migrate incrementally, remove re-exports last.

4. **Sidebar layout breaking gate operator mobile view** — Default layouts apply to all pages unless overridden. Sidebar would interfere with fullscreen gate operator experience. **Prevention:** Create `sidebar.vue` layout only for dashboard, use `layout: false` on `/gate/[id]`, test mobile after every layout change.

5. **Pinia store hydration mismatch in SSR** — If store state differs between server and client render (e.g., using `Date.now()`, `localStorage` in initialization), Vue throws hydration warnings and UI flickers. **Prevention:** Initialize stores with static defaults, fetch data in `onMounted`, use `@pinia/nuxt` for SSR serialization.

6. **Calling Pinia store outside setup context** — Error "getActivePinia() was called but there was no active Pinia" when using stores in utility functions or during store definition. **Prevention:** Call stores only inside component setup, Nuxt middleware (works), or inside other store actions. Pass stores as parameters to utilities.

## Implications for Roadmap

Based on research, suggested phase structure follows dependency order: types first (foundational), then Pinia infrastructure (depends on types), then sidebar layout (independent), then dashboard restructure (depends on both).

### Phase 1: Type Foundation

**Rationale:** TypeScript types are foundational and have no dependencies. Must exist before Pinia stores reference them. Creates single source of truth, eliminates magic strings, enables autocomplete.

**Delivers:**
- `shared/types/` directory with auto-imported types
- PickupRequest, Gate, BusinessHours interfaces
- Status constants using `as const` pattern (not enums)
- Re-export pattern for gradual migration from inline types

**Addresses:**
- Table stakes: Centralized TypeScript types, replace magic strings
- Pitfall 3: Use re-export migration pattern to avoid breaking all imports simultaneously

**Key tasks:**
- Create `shared/types/pickup-request.ts` with PickupStatus as `as const` object
- Create `shared/types/gate.ts` with Gate interface
- Add re-exports from old locations (`columns.ts`) temporarily
- Update imports incrementally (one file at a time is safe)
- Verify `pnpm build` passes with no type errors

**Research flag:** Standard patterns, skip deep research

### Phase 2: Pinia Infrastructure

**Rationale:** Pinia stores depend on types from Phase 1. State management is core to reducing prop drilling and establishing single source of truth. Must define composable-vs-store boundaries early to prevent pitfalls.

**Delivers:**
- `@pinia/nuxt` module added to `nuxt.config.ts`
- `useQueueStore` with state, getters (pendingRequests, requestsByGate)
- `useGatesStore` with state, getters
- Hybrid pattern: composables call store actions, stores never call composables
- Dashboard reads from stores via `storeToRefs()`

**Addresses:**
- Table stakes: Pinia store for shared state
- Pitfall 1: Keep realtime subscriptions in composables, not stores
- Pitfall 2: Mandate `storeToRefs()` for all store consumers
- Pitfall 5: Use static defaults, no browser APIs in store definition
- Pitfall 6: Only call stores inside setup context

**Uses stack:**
- pinia ^3.0.4
- @pinia/nuxt ^0.11.3 (Nuxt 4 verified compatible)

**Key tasks:**
- Install Pinia dependencies
- Create setup stores using `defineStore('name', () => { ... })`
- Update `useQueueActions` and `useGateManagement` to call store actions
- Update `useRealtimeQueue` callback to refresh store
- Update dashboard index.vue to use `storeToRefs()`
- Test with Vue DevTools that reactivity works

**Research flag:** Standard patterns (official Pinia docs), but needs validation of hybrid pattern with existing composables

### Phase 3: Sidebar Layout

**Rationale:** Sidebar layout is independent of Pinia implementation and can be developed in parallel. Primary architectural change for v2.0. Must explicitly exclude gate operator routes to preserve mobile UX.

**Delivers:**
- shadcn-vue Sidebar component added via CLI
- `AppSidebar.vue` navigation component
- `sidebar.vue` layout wrapping dashboard/settings pages
- Gate routes explicitly use `layout: false` for fullscreen experience
- Mobile sidebar as overlay via `useSidebar().isMobile`
- Sidebar state persistence via `storage-key` prop

**Addresses:**
- Table stakes: Collapsible sidebar, mobile overlay, active route highlighting, no sidebar on gate routes
- Should have: SidebarRail, sidebar state persistence
- Pitfall 4: Create sidebar.vue layout ONLY for dashboard, test gate view on mobile

**Uses stack:**
- shadcn-vue Sidebar (via CLI: `pnpm dlx shadcn-vue@latest add sidebar`)
- Existing reka-ui and lucide-vue-next dependencies

**Implements architecture:**
- Sidebar Layout component from ARCHITECTURE.md
- Route-specific layout pattern via `definePageMeta`

**Key tasks:**
- Run `pnpm dlx shadcn-vue@latest add sidebar`
- Create `app/components/layout/AppSidebar.vue` with navigation items
- Create `app/layouts/sidebar.vue` with SidebarProvider
- Update dashboard/settings pages: `definePageMeta({ layout: 'sidebar' })`
- Update gate pages: `definePageMeta({ layout: false })`
- Test on 320px mobile viewport, verify no sidebar on gate routes

**Research flag:** Standard component (shadcn docs), skip deep research

### Phase 4: Dashboard Restructure & Visualization

**Rationale:** Depends on both Pinia stores (Phase 2) and sidebar layout (Phase 3) being in place. Adds primary new feature (dashboard overview with chart) and simplifies existing dashboard by removing inline data fetching.

**Delivers:**
- Simplified dashboard index.vue using store data
- Gate management page (`/gates`) with queue counts
- Bar chart showing queue length per gate using shadcn-vue Chart
- Dashboard metrics refresh on mount
- Existing showCompleted toggle bug (BUG-01) verification

**Addresses:**
- Table stakes: Dashboard overview page
- Should have: Bar chart visualization
- Pitfall 7: Fix/verify showCompleted toggle after store migration

**Uses stack:**
- shadcn-vue Chart (via CLI: `pnpm dlx shadcn-vue@latest add chart-bar`)
- Based on unovis, provides recharts-style API

**Key tasks:**
- Run `pnpm dlx shadcn-vue@latest add chart-bar`
- Create `GateQueueChart.vue` component using Bar chart from shadcn-vue
- Extract dashboard data fetching to store actions
- Create `/gates` page with queue counts table
- Simplify dashboard to focus on overview metrics
- Test showCompleted toggle with store state

**Research flag:** May need shadcn-vue Chart documentation review (less common than other components)

### Phase Ordering Rationale

- **Types first:** Zero dependencies, enables everything else. Safe incremental migration via re-exports.
- **Pinia before dashboard:** Dashboard restructure depends on stores existing. Better to establish state patterns early.
- **Sidebar parallel to Pinia:** Sidebar layout is independent. Can be developed alongside Pinia work.
- **Dashboard last:** Requires both stores and layout. Primary deliverable, benefits from all other work.

**Dependency chain:**
```
Types (Phase 1)
    |
    └─> Pinia (Phase 2) ──┐
                           ├─> Dashboard (Phase 4)
    ┌─> Sidebar (Phase 3) ─┘
```

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4:** May need shadcn-vue Chart API research — recharts-style API but using unovis, less documented than other shadcn components

Phases with standard patterns (skip research-phase):
- **Phase 1:** TypeScript patterns well-documented, `as const` is standard approach
- **Phase 2:** Pinia official docs comprehensive, setup store pattern clear
- **Phase 3:** shadcn-vue Sidebar is mature component with extensive docs

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All dependencies verified compatible with Nuxt 4.3.0. @pinia/nuxt v0.11.3 explicitly supports Nuxt 4. shadcn-vue Sidebar and Chart are official components. |
| Features | HIGH | Feature expectations drawn from official shadcn-vue component docs and standard admin dashboard patterns. Dashboard visualization using shadcn-vue Chart instead of vue-chartjs. |
| Architecture | HIGH | Hybrid Pinia + composables pattern verified with Pinia cookbook. Layout exclusion via `definePageMeta` is Nuxt-native. `shared/types/` auto-import is Nuxt 4 official convention. |
| Pitfalls | HIGH | Pitfalls based on official documentation (storeToRefs, lifecycle hooks), codebase analysis (existing realtime subscription pattern), and established Vue 3 patterns. |

**Overall confidence:** HIGH

### Gaps to Address

Minor gaps that need validation during implementation:

- **shadcn-vue Chart documentation:** Less comprehensive than other shadcn components. May need to reference unovis docs directly for advanced customization. Handle by: Start with simple bar chart example from shadcn-vue docs, escalate to unovis docs only if needed.
- **Hybrid Pinia + composables pattern:** Standard pattern but specific integration with existing `useRealtimeQueue` needs validation. Handle by: Test subscription cleanup thoroughly in Phase 2, verify DevTools shows single subscription after navigation.
- **showCompleted toggle bug (BUG-01):** Existing bug may interact with Pinia migration. Handle by: Verify bug still exists before Phase 2, test immediately after store migration, create test case for future regression prevention.

## Sources

### Primary (HIGH confidence)
- [Nuxt 4 State Management](https://nuxt.com/docs/4.x/getting-started/state-management) — Official state management guide
- [Pinia Nuxt Integration](https://pinia.vuejs.org/ssr/nuxt.html) — SSR/Nuxt documentation
- [Pinia + Composables Cookbook](https://pinia.vuejs.org/cookbook/composables.html) — Using composables with stores
- [@pinia/nuxt Module](https://nuxt.com/modules/pinia) — v0.11.3 Nuxt 4 compatibility verified
- [shadcn-vue Sidebar Component](https://www.shadcn-vue.com/docs/components/sidebar) — Component API, variants, mobile behavior
- [shadcn-vue Chart Component](https://www.shadcn-vue.com/docs/components/chart) — Chart component using unovis
- [Nuxt 4 Layouts](https://nuxt.com/docs/4.x/directory-structure/app/layouts) — Route-specific layouts, definePageMeta
- [Nuxt 4 Shared Directory](https://nuxt.com/docs/4.x/directory-structure/shared) — Auto-imported types/utils
- [Vue Router Active Links](https://router.vuejs.org/guide/essentials/active-links) — router-link-active classes
- [TypeScript Handbook Enums](https://www.typescriptlang.org/docs/handbook/enums.html) — Enum patterns

### Secondary (MEDIUM confidence)
- [Mastering Pinia: Top 5 Mistakes](https://masteringpinia.com/blog/top-5-mistakes-to-avoid-when-using-pinia) — storeToRefs, common pitfalls
- [Composables vs Pinia patterns](https://iamjeremie.me/post/2025-01/composables-vs-pinia-vs-provide-inject/) — When to use each
- [TypeScript as const Best Practices](https://www.angularspace.com/breaking-the-enum-habit-why-typescript-developers-need-a-new-approach/) — Enum alternatives
- [Pinia storeToRefs discussion](https://github.com/vuejs/pinia/discussions/1448) — Reactivity loss prevention
- [shadcn-vue Sidebar Blocks](https://www.shadcn-vue.com/blocks/sidebar) — 16 pre-built sidebar patterns
- Codebase analysis: Existing composables, layouts, realtime subscription patterns

---
*Research completed: 2026-01-30*
*Ready for roadmap: yes*
