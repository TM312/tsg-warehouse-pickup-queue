# Architecture Research: v2.0 Architecture Overhaul

**Domain:** Nuxt 4 Pinia + composables hybrid pattern, sidebar layouts, centralized types
**Researched:** 2026-01-30
**Confidence:** HIGH (verified with official Nuxt 4 and Pinia documentation)

## Executive Summary

The v2.0 architecture overhaul introduces three key changes that integrate cleanly with the existing codebase:

1. **Pinia + composables hybrid pattern:** Stores manage shared state, composables handle realtime/RPC side effects
2. **Sidebar layout with route exclusion:** New `sidebar.vue` layout for dashboard pages, gate routes use `layout: false`
3. **Centralized types:** Use Nuxt 4's `shared/types/` directory for auto-imported type definitions

These changes are **evolutionary refinements** rather than rewrites. Existing composables remain functional; Pinia stores add centralized state on top.

## Current Architecture Analysis

### Existing Composables

```
staff/app/composables/
├── useRealtimeQueue.ts      # Realtime subscription management
├── useQueueActions.ts       # RPC calls (assignGate, completeRequest, etc.)
├── useGateManagement.ts     # Gate CRUD operations
└── useBusinessHoursSettings.ts  # Business hours CRUD
```

**Current Pattern:**
- Each composable manages its own local state (`pending`, `status`)
- Data fetching via `useAsyncData` in page components
- Realtime subscriptions trigger callback-based refreshes
- No shared state between pages (each page fetches independently)

**Pain Points Solved by v2.0:**
1. Dashboard index.vue has 300+ lines mixing state, UI, and logic
2. Types duplicated across files (PickupRequest defined in columns.ts)
3. Magic strings for statuses ('pending', 'in_queue', etc.)
4. No centralized state for cross-component communication

### Current Layout Structure

```
staff/app/layouts/
├── default.vue   # Header with nav links + slot
└── auth.vue      # Minimal layout for login pages
```

**Current default.vue behavior:**
- Header with "Warehouse Pickup Queue" title
- Settings link + Logout button
- Main content via `<slot />`
- Used on all authenticated pages

**Problem:** Gate operator view (`/gate/[id]`) currently uses default layout but needs simpler, full-screen mobile experience.

## v2.0 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vue App                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      Layouts                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │   sidebar    │  │    gate      │  │    auth      │   │    │
│  │  │  (dashboard) │  │ (fullscreen) │  │   (login)    │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                        Pages                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ index   │  │ gates   │  │settings │  │gate/[id]│            │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘            │
├───────┴────────────┴────────────┴────────────┴──────────────────┤
│                     Pinia Stores (state)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  useQueue    │  │  useGates    │  │ useSettings  │          │
│  │   Store      │  │    Store     │  │    Store     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                   Composables (side effects)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │useRealtime   │  │useQueueRpc   │  │useGateRpc    │          │
│  │  Queue       │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                     Supabase Client                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              useSupabaseClient()                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| **Pinia Stores** | Shared reactive state, derived computations | `app/stores/*.ts` with `defineStore` |
| **Composables** | Realtime subscriptions, RPC calls, side effects | `app/composables/*.ts` with `useSupabaseClient` |
| **Layouts** | Page structure, navigation chrome | `app/layouts/*.vue` |
| **Pages** | Route handling, composition root | `app/pages/**/*.vue` |
| **Components** | UI presentation, local interactions | `app/components/**/*.vue` |

## Recommended Project Structure

```
staff/
├── app/
│   ├── stores/                    # NEW: Pinia stores
│   │   ├── queue.ts               # Pickup requests state
│   │   ├── gates.ts               # Gates state
│   │   └── settings.ts            # Business hours state
│   │
│   ├── composables/               # EXISTING: Side effects
│   │   ├── useRealtimeQueue.ts    # Realtime subscriptions
│   │   ├── useQueueRpc.ts         # Queue RPC operations
│   │   ├── useGateRpc.ts          # Gate RPC operations
│   │   └── useBusinessHoursRpc.ts # Business hours RPC
│   │
│   ├── layouts/
│   │   ├── sidebar.vue            # NEW: Sidebar layout for dashboard
│   │   ├── auth.vue               # EXISTING: Login pages
│   │   └── default.vue            # KEEP: Fallback (or remove)
│   │
│   ├── pages/
│   │   ├── index.vue              # Dashboard (uses sidebar layout)
│   │   ├── gates.vue              # NEW: Gate management page
│   │   ├── settings/
│   │   │   └── business-hours.vue # Business hours (uses sidebar)
│   │   └── gate/
│   │       └── [id].vue           # Gate operator (layout: false)
│   │
│   └── components/
│       ├── layout/                # NEW: Layout components
│       │   ├── AppSidebar.vue     # Sidebar navigation
│       │   └── SidebarNav.vue     # Nav items
│       └── ...                    # Existing components
│
└── shared/                        # NEW: Shared types (Nuxt 4)
    └── types/
        ├── index.ts               # Re-exports
        ├── pickup-request.ts      # PickupRequest interface + Status enum
        ├── gate.ts                # Gate interface
        └── business-hours.ts      # BusinessHours interfaces
```

### Structure Rationale

- **`app/stores/`:** Pinia auto-discovers stores in this directory (Nuxt 4 convention)
- **`app/composables/`:** Keep composables for non-state logic (realtime, RPC)
- **`shared/types/`:** Auto-imported types available in both app and server code
- **`app/components/layout/`:** Isolate layout-specific components from feature components

## Architectural Patterns

### Pattern 1: Hybrid Pinia + Composables

**What:** Pinia stores hold shared state; composables handle side effects and update stores

**When to use:** When multiple components need the same data, or when state needs to survive navigation

**Trade-offs:**
- (+) Clear separation: state vs side effects
- (+) DevTools integration for debugging state
- (+) Computed getters for derived data
- (-) Slight learning curve for team

**Example:**

```typescript
// stores/queue.ts
export const useQueueStore = defineStore('queue', () => {
  // State
  const requests = ref<PickupRequest[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Getters (computed)
  const pendingRequests = computed(() =>
    requests.value.filter(r => r.status === Status.PENDING)
  )
  const requestsByGate = computed(() => {
    const map = new Map<string, PickupRequest[]>()
    for (const r of requests.value) {
      if (r.assigned_gate_id) {
        const list = map.get(r.assigned_gate_id) || []
        list.push(r)
        map.set(r.assigned_gate_id, list)
      }
    }
    return map
  })

  // Actions (called by composables)
  function setRequests(data: PickupRequest[]) {
    requests.value = data
  }
  function updateRequest(updated: PickupRequest) {
    const idx = requests.value.findIndex(r => r.id === updated.id)
    if (idx >= 0) requests.value[idx] = updated
  }

  return {
    requests: readonly(requests),
    loading: readonly(loading),
    error: readonly(error),
    pendingRequests,
    requestsByGate,
    setRequests,
    updateRequest,
  }
})
```

```typescript
// composables/useQueueRpc.ts
export function useQueueRpc() {
  const client = useSupabaseClient()
  const store = useQueueStore()
  const pending = ref<Record<string, boolean>>({})

  async function fetchRequests() {
    store.loading = true
    try {
      const { data, error } = await client
        .from('pickup_requests')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      store.setRequests(data)
    } finally {
      store.loading = false
    }
  }

  async function completeRequest(requestId: string, gateId?: string) {
    pending.value[requestId] = true
    try {
      const { error } = await client
        .from('pickup_requests')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', requestId)
      if (error) throw error
      // Optimistic update via store
      store.updateRequest({ ...store.requests.find(r => r.id === requestId)!, status: Status.COMPLETED })
      toast.success('Pickup marked complete')
    } finally {
      pending.value[requestId] = false
    }
  }

  return { pending: readonly(pending), fetchRequests, completeRequest }
}
```

### Pattern 2: Layout Exclusion for Gate Routes

**What:** Use `definePageMeta({ layout: false })` for gate operator pages to opt out of sidebar

**When to use:** Mobile-first pages that need full-screen experience

**Trade-offs:**
- (+) Clean separation of operator vs admin experience
- (+) Nuxt-native, no workarounds
- (-) Must manage layout manually in excluded pages

**Example:**

```vue
<!-- app/layouts/sidebar.vue -->
<script setup lang="ts">
const supabase = useSupabaseClient()
async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex min-h-screen">
    <AppSidebar />
    <div class="flex-1 flex flex-col">
      <header class="border-b px-6 py-4 flex justify-between items-center">
        <h1 class="text-lg font-semibold">Warehouse Pickup Queue</h1>
        <Button variant="ghost" size="sm" @click="logout">Logout</Button>
      </header>
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
```

```vue
<!-- app/pages/index.vue (Dashboard) -->
<script setup lang="ts">
definePageMeta({
  layout: 'sidebar',
  middleware: 'auth'
})
</script>
```

```vue
<!-- app/pages/gate/[id].vue (Operator View) -->
<script setup lang="ts">
definePageMeta({
  layout: false,  // No sidebar, fullscreen mobile experience
  middleware: 'auth'
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Gate-specific header -->
    <header class="bg-primary text-primary-foreground p-4">
      <h1 class="text-2xl font-bold text-center">Gate {{ gate?.gate_number }}</h1>
    </header>
    <!-- Full-screen content -->
    <main class="flex-1 p-4">
      <!-- ... -->
    </main>
  </div>
</template>
```

### Pattern 3: Centralized Types with shared/types/

**What:** Define interfaces and enums in `shared/types/` for auto-import across app and server

**When to use:** Any type used in multiple files or across app/server boundary

**Trade-offs:**
- (+) Single source of truth
- (+) Auto-imported (no manual imports needed)
- (+) Works with Nuxt 4's separate TypeScript projects
- (-) Only `shared/types/` and `shared/utils/` are auto-imported

**Example:**

```typescript
// shared/types/pickup-request.ts
export enum PickupStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_QUEUE = 'in_queue',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface PickupRequest {
  id: string
  sales_order_number: string
  company_name: string | null
  customer_email: string
  status: PickupStatus
  email_flagged: boolean
  assigned_gate_id: string | null
  queue_position: number | null
  is_priority: boolean
  processing_started_at: string | null
  created_at: string
  completed_at: string | null
  gate?: Gate | null
}
```

```typescript
// shared/types/gate.ts
export interface Gate {
  id: string
  gate_number: number
  is_active: boolean
}

export interface GateWithQueueCount extends Gate {
  queue_count: number
}
```

```typescript
// shared/types/index.ts
export * from './pickup-request'
export * from './gate'
export * from './business-hours'
```

**Usage (no import needed):**

```typescript
// In any .vue or .ts file
const request: PickupRequest = { ... }
if (request.status === PickupStatus.PROCESSING) { ... }
```

## Data Flow

### Request Flow with Pinia

```
[User Action]
    |
    v
[Component] -----> [Composable RPC] -----> [Supabase]
    |                    |                      |
    |                    v                      |
    |              [Pinia Store] <-------------+
    |                    |       (on success)
    v                    v
[Reactive UI] <---- [Store State]
```

### Realtime Integration

```
[Supabase Realtime]
    |
    | postgres_changes event
    v
[useRealtimeQueue composable]
    |
    | calls store.refresh() or store.patch()
    v
[Pinia Store]
    |
    | reactive state update
    v
[All subscribed components]
```

### Key Data Flows

1. **Initial load:** Page calls `composable.fetchData()` -> updates store -> components react
2. **User action:** Component calls `composable.action()` -> RPC call -> updates store on success
3. **Realtime event:** Subscription callback -> calls `composable.fetchData()` or patches store directly
4. **Navigation:** Store persists across routes, no refetch needed (unless explicitly cleared)

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 pickups/day | Current architecture is fine. Single Pinia store, client-side filtering. |
| 100-500 pickups/day | Consider per-gate realtime filters to reduce event volume. |
| 500+ pickups/day | Split stores by domain (queueStore, historyStore). Consider server-side pagination. |

### Scaling Priorities

1. **First bottleneck:** Realtime event volume. Fix: Add `filter` to postgres_changes subscription.
2. **Second bottleneck:** Client memory with large request history. Fix: Paginate historical data, keep only active in store.

## Anti-Patterns

### Anti-Pattern 1: Store Logic in Components

**What people do:** Put data transformation and business logic in page components
**Why it's wrong:** Logic gets duplicated, components become untestable
**Do this instead:** Keep transformations in store getters, actions in composables

### Anti-Pattern 2: Direct Supabase Calls from Components

**What people do:** Call `useSupabaseClient()` directly in components
**Why it's wrong:** Bypasses store, leads to inconsistent state
**Do this instead:** All data mutations go through composables that update stores

### Anti-Pattern 3: Multiple Realtime Subscriptions for Same Table

**What people do:** Create new subscription in each component that needs data
**Why it's wrong:** Wasteful, can cause duplicate updates and race conditions
**Do this instead:** Single subscription per table in composable, updates central store

### Anti-Pattern 4: Mixing Layout Concerns

**What people do:** Conditionally render sidebar inside layout based on route
**Why it's wrong:** Complex, error-prone, violates single responsibility
**Do this instead:** Use separate layouts, set via `definePageMeta({ layout: 'name' })`

## Integration Points

### Existing to New

| Existing | New | Migration Strategy |
|----------|-----|-------------------|
| `useQueueActions` composable | `useQueueRpc` + `useQueueStore` | Keep composable, add store integration |
| `useGateManagement` composable | `useGateRpc` + `useGatesStore` | Keep composable, add store integration |
| `useRealtimeQueue` composable | Keep as-is | Update callback to refresh store |
| Types in `columns.ts` | Move to `shared/types/` | Delete old, use auto-imports |
| Magic strings | Enums in `shared/types/` | Find-replace with enum values |

### Migration Approach

**Phase 1 (Non-breaking):**
1. Add `shared/types/` with enums and interfaces
2. Update existing code to use new types (no functionality change)
3. Add Pinia module to nuxt.config.ts
4. Create empty stores

**Phase 2 (Incremental):**
1. Add store state, connect composables to stores
2. Update components to read from stores
3. Test with realtime updates

**Phase 3 (Layout):**
1. Create sidebar.vue layout with AppSidebar component
2. Update dashboard pages to use sidebar layout
3. Add `layout: false` to gate/[id].vue
4. Remove old default.vue header

## Suggested Build Order

Based on dependencies and integration complexity:

### Phase 1: Type Foundation

1. Create `shared/types/` directory
2. Move/create PickupRequest, Gate, BusinessHours interfaces
3. Create Status enum with typed values
4. Update existing files to use centralized types
5. Verify TypeScript compilation

**Rationale:** Types are foundational. Must exist before Pinia stores reference them.

### Phase 2: Pinia Infrastructure

1. Add `@pinia/nuxt` module
2. Create `useQueueStore` with state, getters
3. Create `useGatesStore` with state, getters
4. Update `useQueueActions` to update stores
5. Update `useRealtimeQueue` to refresh stores
6. Update dashboard to read from stores

**Rationale:** Pinia stores depend on types. Dashboard is primary consumer.

### Phase 3: Sidebar Layout

1. Create `AppSidebar.vue` component using shadcn-vue Sidebar
2. Create `sidebar.vue` layout
3. Update dashboard pages to use `layout: 'sidebar'`
4. Add `layout: false` to gate/[id].vue
5. Test navigation between layouts

**Rationale:** Layout is independent of store implementation. Can be done in parallel.

### Phase 4: Dashboard Restructure

1. Extract inline data fetching to composables/stores
2. Create dedicated gate management page (`/gates`)
3. Simplify dashboard to use store data
4. Add gate queue visualization (bar chart)

**Rationale:** Depends on both stores and layout being in place.

## Sources

- [Nuxt 4 State Management](https://nuxt.com/docs/4.x/getting-started/state-management) - Official Nuxt state management guide
- [Pinia Nuxt Integration](https://pinia.vuejs.org/ssr/nuxt.html) - Official Pinia SSR/Nuxt documentation
- [Pinia + Composables Cookbook](https://pinia.vuejs.org/cookbook/composables.html) - Using composables with Pinia stores
- [Nuxt 4 Layouts](https://nuxt.com/docs/4.x/directory-structure/app/layouts) - Official layouts documentation
- [Nuxt 4 Shared Directory](https://nuxt.com/docs/4.x/directory-structure/shared) - Auto-imported types/utils
- [definePageMeta](https://nuxt.com/docs/4.x/api/utils/define-page-meta) - Layout assignment per page
- Codebase analysis: existing composables, layouts, and component patterns

---
*Architecture research for: v2.0 Architecture Overhaul*
*Researched: 2026-01-30*
