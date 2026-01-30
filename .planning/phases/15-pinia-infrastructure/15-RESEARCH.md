# Phase 15: Pinia Infrastructure - Research

**Researched:** 2026-01-30
**Domain:** State management with Pinia + Nuxt 4 + Supabase realtime
**Confidence:** HIGH

## Summary

This phase establishes Pinia as the centralized state management layer for the staff application, implementing the "hybrid pattern" where Pinia stores hold shared state while composables manage side effects (realtime subscriptions, RPC calls). The existing composables already handle Supabase interactions; this phase extracts shared state into stores while preserving composable responsibilities for side effects.

The standard approach is:
1. Install `@pinia/nuxt` which auto-configures Pinia for Nuxt 4
2. Create setup stores (composition API style) for queue and gate state
3. Refactor existing composables to update store state instead of local refs
4. Move realtime subscription logic into a dedicated composable that updates stores
5. Ensure proper cleanup to prevent duplicate subscriptions on navigation

**Primary recommendation:** Use Pinia Setup Stores (composition API style) with stores in `app/stores/`, keeping realtime subscriptions in composables that call store actions to update state.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pinia | ^2.3.0 | Vue state management | Official Vue state library, replaces Vuex |
| @pinia/nuxt | ^0.11.3 | Nuxt integration | Auto-imports, SSR handling, DevTools |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vueuse/core | ^14.1.0 | Vue composables | Already installed; useDocumentVisibility for reconnection |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pinia | useState (Nuxt) | Simpler but no DevTools, no cross-component reactivity |
| Setup stores | Option stores | Option stores are simpler but less flexible with composables |
| Store-based realtime | Component-based | Component-based doesn't share state across pages |

**Installation:**
```bash
cd staff && npx nuxi module add pinia
```

This command installs both `@pinia/nuxt` and `pinia`.

## Architecture Patterns

### Recommended Project Structure
```
staff/
├── app/
│   ├── stores/                    # Pinia stores (auto-imported)
│   │   ├── queue.ts               # Queue state: requests, processing items
│   │   └── gates.ts               # Gate state: all gates, active gates
│   ├── composables/
│   │   ├── useQueueActions.ts     # RPC/mutation calls (refactored)
│   │   ├── useGateManagement.ts   # Gate CRUD operations (refactored)
│   │   ├── useRealtimeQueue.ts    # Realtime subscriptions (refactored)
│   │   └── useBusinessHoursSettings.ts  # Keep as-is (self-contained)
│   └── pages/
│       ├── index.vue              # Uses stores + composables
│       └── gate/[id].vue          # Uses stores + composables
└── nuxt.config.ts                 # Add @pinia/nuxt module
```

### Pattern 1: Setup Store Definition
**What:** Define stores using composition API syntax
**When to use:** Always (provides flexibility for composables and watchers)
**Example:**
```typescript
// app/stores/queue.ts
// Source: https://pinia.vuejs.org/core-concepts/

import { defineStore } from 'pinia'
import type { PickupRequest } from '#shared/types/pickup-request'

export const useQueueStore = defineStore('queue', () => {
  // State as refs
  const requests = ref<PickupRequest[]>([])
  const loading = ref(false)
  const lastUpdated = ref<Date | null>(null)

  // Getters as computed
  const processingItems = computed(() =>
    requests.value.filter(r => r.status === 'processing')
  )

  const pendingRequests = computed(() =>
    requests.value.filter(r => r.status === 'pending')
  )

  // Actions as functions
  function setRequests(data: PickupRequest[]) {
    requests.value = data
    lastUpdated.value = new Date()
  }

  function updateRequest(id: string, updates: Partial<PickupRequest>) {
    const index = requests.value.findIndex(r => r.id === id)
    if (index !== -1) {
      requests.value[index] = { ...requests.value[index], ...updates }
    }
  }

  // MUST return all state for DevTools and SSR
  return {
    requests,
    loading,
    lastUpdated,
    processingItems,
    pendingRequests,
    setRequests,
    updateRequest,
  }
})
```

### Pattern 2: Composable Updating Store State
**What:** Composables fetch data and call store actions
**When to use:** For data fetching and mutations
**Example:**
```typescript
// app/composables/useQueueActions.ts (refactored)
// Source: https://github.com/nuxt-modules/supabase/issues/141

import type { SupabaseClient } from '@supabase/supabase-js'

export function useQueueActions() {
  // Call useSupabaseClient inside the composable, not at module level
  const client = useSupabaseClient() as SupabaseClient
  const queueStore = useQueueStore()

  const pending = ref<Record<string, boolean>>({})

  async function fetchRequests() {
    queueStore.loading = true
    try {
      const { data, error } = await client
        .from('pickup_requests')
        .select('...')
        .order('created_at', { ascending: false })

      if (error) throw error
      queueStore.setRequests(data as PickupRequest[])
    } finally {
      queueStore.loading = false
    }
  }

  async function completeRequest(requestId: string, gateId?: string) {
    pending.value[requestId] = true
    try {
      const { error } = await client
        .from('pickup_requests')
        .update({ status: PICKUP_STATUS.COMPLETED, ... })
        .eq('id', requestId)

      if (error) throw error
      // Optimistic update: store is updated, realtime confirms
      queueStore.updateRequest(requestId, { status: PICKUP_STATUS.COMPLETED })
      toast.success('Pickup marked complete')
    } catch (e) {
      toast.error('Failed to complete pickup')
      throw e
    } finally {
      pending.value[requestId] = false
    }
  }

  return { pending: readonly(pending), fetchRequests, completeRequest, ... }
}
```

### Pattern 3: Realtime Subscription Updating Store
**What:** Subscription callback updates store state
**When to use:** For realtime features
**Example:**
```typescript
// app/composables/useRealtimeQueue.ts (refactored)
// Source: https://supabase.com/docs/guides/realtime/postgres-changes

export function useRealtimeQueue() {
  const client = useSupabaseClient()
  const queueStore = useQueueStore()
  const gatesStore = useGatesStore()

  const status = ref<SubscriptionStatus>('connecting')
  let channel: RealtimeChannel | null = null

  function subscribe() {
    if (channel) return // Prevent duplicate subscriptions

    status.value = 'connecting'
    channel = client
      .channel('pickup-requests-staff')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pickup_requests' },
        (payload) => {
          // Update store based on event type
          if (payload.eventType === 'INSERT') {
            queueStore.addRequest(payload.new as PickupRequest)
          } else if (payload.eventType === 'UPDATE') {
            queueStore.updateRequest(payload.new.id, payload.new)
          } else if (payload.eventType === 'DELETE') {
            queueStore.removeRequest(payload.old.id)
          }
        }
      )
      .subscribe((subscribeStatus) => {
        status.value = subscribeStatus === 'SUBSCRIBED' ? 'connected' : 'disconnected'
      })
  }

  function unsubscribe() {
    if (channel) {
      client.removeChannel(channel)
      channel = null
    }
    status.value = 'disconnected'
  }

  return { status: readonly(status), subscribe, unsubscribe }
}
```

### Pattern 4: App-Level Subscription Management
**What:** Initialize subscriptions at app level to prevent duplicates on navigation
**When to use:** When state needs to persist across page navigation
**Example:**
```vue
<!-- app/app.vue -->
<script setup lang="ts">
const { subscribe, unsubscribe } = useRealtimeQueue()
const { fetchRequests } = useQueueActions()
const { fetchGates } = useGateManagement()

// Fetch initial data and subscribe once at app level
onMounted(async () => {
  await Promise.all([fetchRequests(), fetchGates()])
  subscribe()
})

onUnmounted(() => {
  unsubscribe()
})
</script>
```

### Anti-Patterns to Avoid

- **Calling useSupabaseClient() at module level:** Causes "nuxt instance unavailable" error. Always call inside composable functions or store setup.

- **Subscribing in each page component:** Leads to duplicate subscriptions when navigating. Subscribe once at app level.

- **Storing channel reference in store:** Stores should hold serializable state only. Keep channel refs in composables.

- **Mixing state storage locations:** Don't have some state in store and some in composable refs. Consolidate shared state in stores.

- **Directly mutating store state from components:** Use store actions for mutations to maintain traceability in DevTools.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State reactivity | Custom event emitters | Pinia stores | Built-in reactivity, DevTools support |
| Subscription deduplication | Manual ref tracking | Single subscription at app level | Simpler, less error-prone |
| SSR hydration | Custom serialization | @pinia/nuxt auto-handles | Nuxt handles state hydration automatically |
| DevTools debugging | console.log everywhere | Pinia DevTools integration | Time-travel, state inspection built-in |

**Key insight:** @pinia/nuxt handles SSR, auto-imports, and DevTools setup automatically. Manual configuration is unnecessary and error-prone.

## Common Pitfalls

### Pitfall 1: Duplicate Realtime Subscriptions
**What goes wrong:** Each page creates its own subscription, causing multiple events per database change
**Why it happens:** Subscriptions created in page `onMounted`, not cleaned up properly, or recreated on navigation
**How to avoid:**
- Subscribe once at app level (app.vue or a layout)
- Check if channel exists before subscribing
- Use a ref to track subscription state
**Warning signs:** Multiple toast notifications for single action, console shows duplicate payload logs

### Pitfall 2: Nuxt Instance Unavailable
**What goes wrong:** Error thrown when calling `useSupabaseClient()` at module top level
**Why it happens:** Composables must run within Nuxt context (setup function or action)
**How to avoid:** Call `useSupabaseClient()` inside the store setup function or inside action functions, not at import time
**Warning signs:** Immediate error on app load: "nuxt instance unavailable"

### Pitfall 3: Store State Not Visible in DevTools
**What goes wrong:** State changes happen but DevTools doesn't show them
**Why it happens:** Setup store didn't return all state properties, or used private refs
**How to avoid:** Return ALL state refs from the setup function, even loading flags
**Warning signs:** DevTools shows empty state object, but app works

### Pitfall 4: Stale Data After Navigation
**What goes wrong:** User sees old data when returning to a page
**Why it happens:** Data fetched per-page rather than centrally, realtime didn't update store
**How to avoid:** Store acts as single source of truth, realtime updates store, pages read from store
**Warning signs:** Data doesn't match between pages, manual refresh fixes it

### Pitfall 5: Breaking Reactivity with Destructuring
**What goes wrong:** Component doesn't update when store state changes
**Why it happens:** Destructured store state loses reactivity: `const { requests } = useQueueStore()`
**How to avoid:** Use `storeToRefs()` for reactive destructuring: `const { requests } = storeToRefs(useQueueStore())`
**Warning signs:** Initial data renders, but realtime updates don't appear

## Code Examples

Verified patterns from official sources:

### Store Definition with Types
```typescript
// app/stores/queue.ts
// Source: https://pinia.vuejs.org/core-concepts/

import { defineStore } from 'pinia'
import type { PickupRequest } from '#shared/types/pickup-request'
import { PICKUP_STATUS } from '#shared/types/pickup-request'

export const useQueueStore = defineStore('queue', () => {
  // === State ===
  const requests = ref<PickupRequest[]>([])
  const loading = ref(false)

  // === Getters ===
  const processingItems = computed(() =>
    requests.value.filter(r => r.status === PICKUP_STATUS.PROCESSING)
  )

  const inQueueItems = computed(() =>
    requests.value.filter(r => r.status === PICKUP_STATUS.IN_QUEUE)
  )

  const pendingItems = computed(() =>
    requests.value.filter(r => r.status === PICKUP_STATUS.PENDING)
  )

  // === Actions ===
  function setRequests(data: PickupRequest[]) {
    requests.value = data
  }

  function addRequest(request: PickupRequest) {
    // Add at beginning (newest first)
    requests.value.unshift(request)
  }

  function updateRequest(id: string, updates: Partial<PickupRequest>) {
    const index = requests.value.findIndex(r => r.id === id)
    if (index !== -1) {
      requests.value[index] = { ...requests.value[index], ...updates }
    }
  }

  function removeRequest(id: string) {
    requests.value = requests.value.filter(r => r.id !== id)
  }

  // Return everything for DevTools visibility
  return {
    // State
    requests,
    loading,
    // Getters
    processingItems,
    inQueueItems,
    pendingItems,
    // Actions
    setRequests,
    addRequest,
    updateRequest,
    removeRequest,
  }
})
```

### Gates Store
```typescript
// app/stores/gates.ts
import { defineStore } from 'pinia'
import type { Gate, GateWithCount } from '#shared/types/gate'

export const useGatesStore = defineStore('gates', () => {
  const gates = ref<GateWithCount[]>([])
  const loading = ref(false)

  const activeGates = computed(() =>
    gates.value.filter(g => g.is_active)
  )

  function setGates(data: GateWithCount[]) {
    gates.value = data
  }

  function updateGate(id: string, updates: Partial<GateWithCount>) {
    const index = gates.value.findIndex(g => g.id === id)
    if (index !== -1) {
      gates.value[index] = { ...gates.value[index], ...updates }
    }
  }

  return {
    gates,
    loading,
    activeGates,
    setGates,
    updateGate,
  }
})
```

### Using storeToRefs in Components
```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
// Source: https://pinia.vuejs.org/core-concepts/state.html

import { storeToRefs } from 'pinia'

const queueStore = useQueueStore()
const gatesStore = useGatesStore()

// Use storeToRefs for reactive state
const { requests, processingItems, loading } = storeToRefs(queueStore)
const { activeGates } = storeToRefs(gatesStore)

// Actions can be destructured directly (they're not reactive)
const { fetchRequests } = useQueueActions()
</script>
```

### Nuxt Config
```typescript
// nuxt.config.ts
// Source: https://pinia.vuejs.org/ssr/nuxt.html

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',  // Add Pinia
    'shadcn-nuxt'
  ],
  // Optional: customize stores directory (default is app/stores for Nuxt 4)
  // pinia: {
  //   storesDirs: ['./stores/**'],
  // },
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vuex | Pinia | 2022 | Simpler API, better TypeScript, Vue 3 native |
| Option stores | Setup stores | Pinia 2.0 | Better composable integration |
| Manual SSR hydration | @pinia/nuxt auto-hydration | @pinia/nuxt 0.5+ | Zero config SSR |
| Separate imports | Auto-imports | @pinia/nuxt 0.5+ | defineStore, storeToRefs auto-imported |

**Deprecated/outdated:**
- Vuex: Replaced by Pinia as official Vue store
- `autoImports` config option: Removed in @pinia/nuxt, auto-imports enabled by default
- `this.$nuxt` in stores: Use `useNuxtApp()` instead (since @pinia/nuxt 0.3.0)

## Open Questions

Things that couldn't be fully resolved:

1. **Optimistic updates vs. realtime sync**
   - What we know: Can update store optimistically, then realtime confirms
   - What's unclear: Best strategy when optimistic update conflicts with realtime
   - Recommendation: Let realtime be source of truth; don't optimistically update if latency is acceptable

2. **Gate page subscription scope**
   - What we know: Gate page only needs data for one gate
   - What's unclear: Should it use global subscription or gate-specific filter?
   - Recommendation: Use global subscription (simpler), filter in computed. Optimize with filtered subscription later if performance issue arises.

3. **Pinia plugin for Supabase**
   - What we know: `pinia-supabase` library exists with ORM-like features
   - What's unclear: Whether it adds value over manual integration
   - Recommendation: Don't use it; our use case is simple, manual integration is clearer

## Sources

### Primary (HIGH confidence)
- [Pinia Nuxt SSR Documentation](https://pinia.vuejs.org/ssr/nuxt.html) - Installation, auto-imports, SSR handling
- [Pinia Core Concepts](https://pinia.vuejs.org/core-concepts/) - Setup stores, state, getters, actions
- [Pinia Composables Cookbook](https://pinia.vuejs.org/cookbook/composables.html) - Using composables in stores
- [Pinia State Documentation](https://pinia.vuejs.org/core-concepts/state.html) - $subscribe, storeToRefs
- [Supabase Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes) - Realtime subscription API

### Secondary (MEDIUM confidence)
- [nuxt-modules/supabase Issue #141](https://github.com/nuxt-modules/supabase/issues/141) - Supabase + Pinia integration pattern
- [@pinia/nuxt Nuxt Modules](https://nuxt.com/modules/pinia) - Module configuration
- [Socket.IO + Pinia pattern](https://socket.io/how-to/use-with-vue) - WebSocket subscription management in stores

### Tertiary (LOW confidence)
- [pinia-supabase library](https://github.com/MartinMalinda/pinia-supabase) - ORM-like integration (not recommended for this project)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Pinia/Nuxt documentation is authoritative
- Architecture: HIGH - Patterns verified against Pinia cookbook and Nuxt module docs
- Pitfalls: MEDIUM - Based on GitHub issues and common patterns, some project-specific

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (Pinia/Nuxt ecosystem is stable)
