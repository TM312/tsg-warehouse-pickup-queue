# Phase 19: Dashboard Refactoring - Research

**Researched:** 2026-02-03
**Domain:** Vue 3 Composition API refactoring, Nuxt 4 component extraction
**Confidence:** HIGH

## Summary

This phase refactors `staff/app/pages/index.vue` (410 lines) into maintainable code with clear separation of concerns. The research examined existing codebase patterns, Vue 3/Nuxt 4 best practices, and identified specific extraction candidates.

The codebase already follows good patterns with Pinia stores, composables for side effects, and extracted dashboard components. The main issue is that `index.vue` concentrates too much orchestration logic. The solution is to extract computed properties into composables and group related handlers, following patterns already established in the codebase.

**Primary recommendation:** Extract dashboard-specific computed properties into `useDashboardData.ts` composable, keeping page-level handlers in `index.vue` with clear logical grouping.

## Standard Stack

No new libraries needed. This phase uses existing codebase patterns.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 | 3.5.x | Composition API, computed refs | Already in use |
| Pinia | 3.x | State management stores | Already in use |
| Nuxt 4 | 4.x | Auto-imports, file-based routing | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vueuse/core | 12.x | Utility composables | Already in use for visibility |
| storeToRefs | Pinia | Reactive store destructuring | Already in use |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Composables | Pinia getters | Composables allow computed with parameters; getters are simpler but less flexible |
| Page-level handlers | Component-level handlers | Page-level keeps event flow clear; component-level increases encapsulation |

## Architecture Patterns

### Recommended Project Structure

Current structure is appropriate:
```
staff/app/
├── pages/
│   └── index.vue              # Dashboard page (refactor target)
├── components/
│   └── dashboard/             # Dashboard-specific components (already well-organized)
├── composables/
│   ├── useQueueActions.ts     # RPC/mutations (keep as-is)
│   ├── useDashboardKpis.ts    # KPI fetching (keep as-is)
│   ├── useDashboardData.ts    # NEW: Dashboard computed properties
│   └── useRealtimeQueue.ts    # Realtime subscriptions (keep as-is)
└── stores/
    ├── queue.ts               # Queue state (keep as-is)
    └── gates.ts               # Gates state (keep as-is)
```

### Pattern 1: Composable for Derived Data

**What:** Extract page-specific computed properties into a composable that returns reactive refs.
**When to use:** When a page has 5+ computed properties that derive from store state.
**Example:**
```typescript
// composables/useDashboardData.ts
export function useDashboardData() {
  const queueStore = useQueueStore()
  const gatesStore = useGatesStore()
  const { requests } = storeToRefs(queueStore)
  const { activeGates, sortedActiveGates } = storeToRefs(gatesStore)

  // Currently waiting items
  const currentlyWaiting = computed(() =>
    requests.value.filter(r => r.status === PICKUP_STATUS.IN_QUEUE).length
  )

  // Chart data for bar chart
  const chartData = computed(() =>
    sortedActiveGates.value.map(gate => ({
      gate: `Gate ${gate.gate_number}`,
      count: requests.value.filter(
        r => r.assigned_gate_id === gate.id && r.status === PICKUP_STATUS.IN_QUEUE
      ).length,
      gateId: gate.id
    }))
  )

  // Processing items for NowProcessingSection
  const processingItems = computed(() =>
    requests.value
      .filter(r => r.status === PICKUP_STATUS.PROCESSING && r.gate)
      .map(r => ({
        id: r.id,
        sales_order_number: r.sales_order_number,
        company_name: r.company_name,
        gate_number: r.gate!.gate_number,
        gate_id: r.assigned_gate_id!,
        processing_started_at: r.processing_started_at!
      }))
      .sort((a, b) => a.gate_number - b.gate_number)
  )

  // Gates with queue data
  const gatesWithQueues = computed(() =>
    activeGates.value.map(gate => {
      const queueItems = requests.value
        .filter(r => r.assigned_gate_id === gate.id && r.status === PICKUP_STATUS.IN_QUEUE)
        .sort((a, b) => (a.queue_position ?? 0) - (b.queue_position ?? 0))
        .map(r => ({
          id: r.id,
          sales_order_number: r.sales_order_number,
          company_name: r.company_name,
          queue_position: r.queue_position ?? 0,
          is_priority: r.is_priority ?? false
        }))

      const processingCount = requests.value
        .filter(r => r.assigned_gate_id === gate.id && r.status === PICKUP_STATUS.PROCESSING)
        .length

      return {
        ...gate,
        queue: queueItems,
        totalActive: queueItems.length + processingCount
      }
    })
  )

  return {
    currentlyWaiting,
    chartData,
    processingItems,
    gatesWithQueues
  }
}
```

### Pattern 2: Handler Grouping by Domain

**What:** Group related event handlers together with clear section comments.
**When to use:** When a page has 10+ handler functions.
**Example:**
```typescript
// === Queue Action Handlers ===
async function handleGateSelect(requestId: string, gateId: string) { ... }
async function handleComplete(requestId: string) { ... }
async function handleCancel(requestId: string) { ... }
async function handleReorder(gateId: string, requestIds: string[]) { ... }

// === Priority Handlers ===
async function handleSetPriority(requestId: string) { ... }
async function handleClearPriority(requestId: string) { ... }

// === Processing Handlers ===
async function handleProcessingComplete(requestId: string, gateId: string) { ... }
async function handleProcessingRevert(requestId: string) { ... }

// === Gate Management Handlers ===
async function handleCreateGate(gateNumber: number) { ... }
async function handleToggleGateActive(gateId: string, isActive: boolean) { ... }

// === Detail Panel Delegates ===
async function handleDetailGateSelect(gateId: string) { ... }
async function handleDetailComplete() { ... }
async function handleDetailCancel() { ... }
```

### Pattern 3: Sheet State Encapsulation

**What:** Keep sheet/dialog state in the page for clear control flow.
**When to use:** When UI state doesn't need to be shared across components.
**Example:**
```typescript
// Sheet state - stays in page for clear event handling
const selectedRequest = ref<PickupRequest | null>(null)
const sheetOpen = computed({
  get: () => selectedRequest.value !== null,
  set: (v) => { if (!v) selectedRequest.value = null }
})

function handleRowClick(request: PickupRequest) {
  selectedRequest.value = request
}
```

### Anti-Patterns to Avoid

- **Over-extraction:** Don't extract single-use handlers into composables. Keep them in the page.
- **Prop drilling:** Don't pass store data through multiple component layers. Use composables at each level.
- **Mixing concerns:** Don't put API calls in computed properties. Keep side effects in action functions.
- **Premature abstraction:** Don't create wrapper components that just pass through props. Only extract when there's clear reuse or complexity.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reactive store refs | Manual `ref()` wrappers | `storeToRefs(store)` | Maintains reactivity, avoids double wrapping |
| Debounced search | Manual setTimeout | `useDebounceFn()` from VueUse | Edge case handling |
| Async state | Manual loading/error refs | Existing pattern in composables | Consistent with codebase |

**Key insight:** The codebase already has good patterns. The refactoring should consolidate, not reinvent.

## Common Pitfalls

### Pitfall 1: Breaking Reactivity with Destructuring

**What goes wrong:** Store properties become non-reactive when destructured directly.
**Why it happens:** Destructuring a reactive object extracts the current value, not the reactive reference.
**How to avoid:** Always use `storeToRefs()` when destructuring store state.
**Warning signs:** Template values don't update when store changes.

```typescript
// WRONG - loses reactivity
const queueStore = useQueueStore()
const { requests } = queueStore  // Not reactive!

// CORRECT - maintains reactivity
const { requests } = storeToRefs(queueStore)
```

### Pitfall 2: Computed Properties with Side Effects

**What goes wrong:** Data fetching or API calls inside computed properties.
**Why it happens:** Trying to "auto-refresh" data when dependencies change.
**How to avoid:** Keep computed pure. Use `watch()` for side effects.
**Warning signs:** Infinite loops, inconsistent data.

### Pitfall 3: Over-Extraction Creating Prop Drilling

**What goes wrong:** Extracting components that need many props passed through.
**Why it happens:** Extracting based on visual boundaries rather than data boundaries.
**How to avoid:** Extract components that own their data (via composables) or are truly reusable.
**Warning signs:** Parent component has to pass 5+ props to child.

### Pitfall 4: Handler Duplication After Extraction

**What goes wrong:** Copying handlers into multiple components.
**Why it happens:** Each component seems to need "its own" handler.
**How to avoid:** Keep handlers in page, pass callbacks to components. Or use composables for shared logic.
**Warning signs:** Same async/refresh pattern repeated in multiple places.

## Code Examples

### Example 1: Page After Refactoring

```typescript
// pages/index.vue (structure after refactoring)
<script setup lang="ts">
// === Imports ===
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
// ... UI component imports ...

// === Page Meta ===
definePageMeta({ middleware: 'auth' })

// === Store & Composable Setup ===
const client = useSupabaseClient()
const queueStore = useQueueStore()
const gatesStore = useGatesStore()
const { requests, loading: requestsLoading } = storeToRefs(queueStore)
const { gates: allGates, activeGates } = storeToRefs(gatesStore)

// Composables
const { pending, assignGate, cancelRequest, completeRequest, /* ... */ } = useQueueActions()
const { createGate, toggleGateActive } = useGateManagement()
const { status: realtimeStatus } = useRealtimeQueue()
const { loading: kpiLoading, completedCount, avgWaitTimeMinutes, avgProcessingTimeMinutes } = useDashboardKpis()

// Dashboard-specific derived data
const { currentlyWaiting, chartData, processingItems, gatesWithQueues, filteredRequests } = useDashboardData()

// === Local UI State ===
const showCompleted = ref(false)
const selectedRequest = ref<PickupRequest | null>(null)
const sheetOpen = computed({ /* ... */ })

// === Column Configuration ===
const columns = computed(() => createColumns({
  gates: activeGates.value,
  pendingIds: pending.value,
  onGateSelect: handleGateSelect,
  onComplete: handleComplete,
  onCancel: handleCancel,
}))

// === Queue Action Handlers ===
async function handleGateSelect(requestId: string, gateId: string) { /* ... */ }
async function handleComplete(requestId: string) { /* ... */ }
async function handleCancel(requestId: string) { /* ... */ }
async function handleReorder(gateId: string, requestIds: string[]) { /* ... */ }

// === Priority Handlers ===
async function handleSetPriority(requestId: string) { /* ... */ }
async function handleClearPriority(requestId: string) { /* ... */ }

// === Processing Section Handlers ===
async function handleProcessingComplete(requestId: string, gateId: string) { /* ... */ }
async function handleProcessingRevert(requestId: string) { /* ... */ }

// === Gate Management Handlers ===
async function handleCreateGate(gateNumber: number) { /* ... */ }
async function handleToggleGateActive(gateId: string, isActive: boolean) { /* ... */ }

// === Manual Order Creation ===
async function handleCreateOrder(data: { /* ... */ }) { /* ... */ }

// === UI Interaction Handlers ===
function handleRowClick(request: PickupRequest) { /* ... */ }
function handleQueueRowClick(requestId: string) { /* ... */ }

// === Detail Panel Delegates ===
async function handleDetailGateSelect(gateId: string) { /* ... */ }
async function handleDetailComplete() { /* ... */ }
async function handleDetailCancel() { /* ... */ }
</script>
```

### Example 2: Composable for Filtered Requests

```typescript
// Part of useDashboardData.ts
export function useDashboardData() {
  const queueStore = useQueueStore()
  const { requests } = storeToRefs(queueStore)

  // External ref for showCompleted toggle
  const showCompleted = ref(false)

  const filteredRequests = computed(() => {
    if (showCompleted.value) {
      return requests.value
    }
    return requests.value.filter(r =>
      !(TERMINAL_STATUSES as readonly string[]).includes(r.status)
    )
  })

  return {
    showCompleted,  // Reactive ref that page can v-model
    filteredRequests
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Options API | Composition API | Vue 3 (2020) | Better TypeScript, composability |
| Vuex | Pinia | Vue 3 (2022) | Simpler API, better DevTools |
| Mixins | Composables | Vue 3 | No naming collisions, explicit deps |

**Deprecated/outdated:**
- Options API `data()`, `computed:`, `methods:` blocks: Use `<script setup>` with Composition API
- Vuex modules: Use Pinia stores with composition syntax
- Mixins: Use composables

## Open Questions

1. **Should `showCompleted` live in composable or page?**
   - What we know: It's UI state that controls filtering. Currently in page.
   - What's unclear: Whether it should be shared (e.g., persisted to localStorage).
   - Recommendation: Keep in page for now. Easy to move to composable if needed later.

2. **Should column configuration move to a separate file?**
   - What we know: `columns.ts` already exists with `createColumns()`.
   - What's unclear: Whether the computed wrapper should also move.
   - Recommendation: Keep computed in page. The factory function is already extracted.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `staff/app/pages/index.vue`, `staff/app/composables/*.ts`, `staff/app/stores/*.ts`
- Codebase patterns: `staff/app/pages/gate/[id].vue` (well-structured page example)
- Codebase components: `staff/app/components/dashboard/*.vue`

### Secondary (MEDIUM confidence)
- Vue 3 Composition API patterns (from training data, verified against codebase)
- Pinia documentation patterns (from training data, verified against codebase)

### Tertiary (LOW confidence)
- None - all patterns verified against existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries, using existing codebase patterns
- Architecture: HIGH - Patterns derived from existing codebase analysis
- Pitfalls: HIGH - Based on Vue 3 fundamentals and codebase observation

**Research date:** 2026-02-03
**Valid until:** Indefinite (internal refactoring, patterns are stable)
