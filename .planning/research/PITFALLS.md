# Domain Pitfalls: v2.0 Architecture Overhaul

**Domain:** Nuxt 4 Architecture Refactoring (Pinia + Sidebar Layout + Type Centralization)
**Researched:** 2026-01-30
**Confidence:** HIGH (verified with official docs and codebase analysis)

---

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Realtime Subscription Leak During Composable-to-Pinia Migration

**What goes wrong:**
When migrating `useRealtimeQueue` composable to work with Pinia stores, the subscription cleanup in `onUnmounted` may not fire if the composable is called from within a Pinia store or after an `await` statement. This causes:
- Multiple subscriptions to same channel
- Memory leaks
- Duplicate event handling (queue updates fire multiple times)
- Connection exhaustion with Supabase Realtime

**Why it happens:**
Vue composables must be called synchronously in `<script setup>` or `setup()` for lifecycle hooks like `onUnmounted` to register correctly. If you use `await` before registering `onUnmounted`, or call the composable from a Pinia store's setup function after async operations, the lifecycle hook is never registered.

Current code (`useRealtimeQueue.ts` lines 58-62) correctly handles cleanup:
```typescript
onUnmounted(() => {
  unsubscribe()
})
```

But moving this to a Pinia store or calling after async would break it.

**How to avoid:**
1. Keep realtime subscriptions in composables, NOT in Pinia stores
2. Use the hybrid pattern: Pinia for state, composables for side effects
3. Call `subscribe()` from component's `onMounted`, not from store initialization
4. If composable must be async, register all lifecycle hooks BEFORE any `await`

**Warning signs:**
- Console shows "SUBSCRIBED" multiple times for same channel
- Queue updates appear duplicated in UI
- Memory usage grows on page navigation
- Supabase dashboard shows many concurrent connections

**Phase to address:**
Phase 1 (Pinia Integration) - Define clear boundary: stores own state, composables own subscriptions

---

### Pitfall 2: Store Reactivity Loss on Destructuring

**What goes wrong:**
Destructuring state directly from a Pinia store loses reactivity. The UI stops updating when store state changes, appearing "frozen" on initial values.

```typescript
// BROKEN - loses reactivity
const { requests, gates } = useQueueStore()

// requests will always show initial value, never updates
```

**Why it happens:**
Pinia wraps stores in `reactive()`, which unwraps all refs. When you destructure, you get plain values at that moment, not reactive references. This is a fundamental Vue reactivity limitation.

**How to avoid:**
Use `storeToRefs()` for state and getters, destructure actions directly:

```typescript
import { storeToRefs } from 'pinia'

const store = useQueueStore()
const { requests, gates } = storeToRefs(store)  // Reactive refs
const { refreshRequests, assignGate } = store   // Actions - no storeToRefs needed
```

**Warning signs:**
- UI shows stale data despite store updates visible in DevTools
- Computed properties don't recalculate
- Template bindings work, but destructured vars in script don't

**Phase to address:**
Phase 1 (Pinia Integration) - Establish destructuring pattern in first store, apply consistently

---

### Pitfall 3: Type Definition Migration Breaking Components

**What goes wrong:**
When centralizing types (e.g., moving `PickupRequest` from `columns.ts` to `types/`), imports break across multiple files simultaneously. TypeScript compilation fails, making it hard to iterate.

**Current duplicate type definitions:**
- `staff/app/components/dashboard/columns.ts` (lines 9-22): `PickupRequest` interface
- `staff/app/components/dashboard/StatusBadge.vue` (line 8): inline status union type
- `staff/app/components/dashboard/ActionButtons.vue` (line 18): same inline status union
- `staff/app/pages/gate/[id].vue` (lines 31-40): inline queue item type

**Why it happens:**
Types are currently defined inline where used. Moving to centralized location requires updating every import simultaneously, which is error-prone.

**How to avoid:**
1. Create central types file (`types/index.ts` or `types/queue.ts`)
2. Re-export from old location initially: `export { PickupRequest } from '~/types'`
3. Update imports incrementally (one file per commit if needed)
4. Remove re-exports only after all imports updated
5. Use TypeScript strict mode to catch missing imports early

**Warning signs:**
- Multiple "Cannot find name" errors after type move
- Components that were working suddenly have type errors
- IDE shows different types than runtime

**Phase to address:**
Phase 3 (Type Centralization) - Create types first, use re-export migration pattern

---

### Pitfall 4: Sidebar Layout Breaking Gate Operator Mobile View

**What goes wrong:**
Adding sidebar layout affects the `/gate/[id]` route, which must remain a full-screen mobile-first view for gate operators. The sidebar interferes with:
- Touch targets (44px requirement from v1.1)
- Full-width sales order number display
- Mobile viewport height
- Current scroll fix (`min-h-screen flex flex-col`)

**Why it happens:**
Default layouts in Nuxt apply to all pages unless explicitly overridden. Easy to forget gate pages need different treatment.

**How to avoid:**
1. Create new `sidebar.vue` layout for dashboard pages
2. Keep `default.vue` or create `gate.vue` layout for gate pages
3. Explicitly set layout in `/gate/[id].vue`:
   ```typescript
   definePageMeta({
     layout: 'gate'  // or layout: false for no layout
   })
   ```
4. Test gate view on mobile after ANY layout changes

**Warning signs:**
- Gate page shows sidebar on mobile
- Sales order number truncated
- Touch targets smaller than 44px
- Scrolling issues on gate page

**Phase to address:**
Phase 2 (Sidebar Layout) - Create sidebar layout ONLY for dashboard routes, test gate view

---

### Pitfall 5: Pinia Store Hydration Mismatch in SSR

**What goes wrong:**
Nuxt 4 uses SSR. If Pinia state differs between server and client render, Vue throws "Hydration node mismatch" warnings and UI may flicker or show wrong data initially.

**Why it happens:**
- Using `Date.now()`, `Math.random()`, or `localStorage` in store state initialization
- Store state computed from browser-only APIs
- Different data fetched on server vs client

Current code is safe (composables fetch on mount), but Pinia migration could introduce issues.

**How to avoid:**
1. Initialize store state with static defaults, not computed values
2. Fetch data in `onMounted` or use `useAsyncData` with proper SSR handling
3. For browser-only state (like preferences), use `onMounted` to set:
   ```typescript
   // In component, not store
   onMounted(() => {
     store.loadFromLocalStorage()
   })
   ```
4. Use `@pinia/nuxt` which handles SSR serialization automatically

**Warning signs:**
- Console shows "[Vue warn]: Hydration node mismatch"
- UI flickers on page load
- State briefly shows wrong value then corrects

**Phase to address:**
Phase 1 (Pinia Integration) - Use `@pinia/nuxt` module, avoid browser APIs in store definition

---

### Pitfall 6: Calling Pinia Store Outside Setup Context

**What goes wrong:**
Error: "getActivePinia() was called but there was no active Pinia."

This happens when trying to use stores in:
- Navigation guards
- Nuxt middleware
- Other stores (during definition)
- Utility functions called outside components

**Why it happens:**
`defineStore()` returns a function that needs the Pinia instance. Vue provides this through injection context, which only exists within `setup()` or composables called from setup.

**How to avoid:**
1. For middleware/guards, Nuxt + Pinia handles this - stores work in middleware:
   ```typescript
   // nuxt middleware - this works
   export default defineNuxtRouteMiddleware((to, from) => {
     const store = useQueueStore()  // OK in Nuxt middleware
   })
   ```
2. For store-to-store access, call inside actions:
   ```typescript
   // Inside store action (works)
   const otherStore = useOtherStore()
   ```
3. For utility functions, pass store as parameter or call store inside function

**Warning signs:**
- Error mentions "getActivePinia" or "no active Pinia"
- Error occurs on page navigation
- Error occurs in non-component code

**Phase to address:**
Phase 1 (Pinia Integration) - Follow Nuxt + Pinia patterns, use auto-imports

---

## Moderate Pitfalls

Mistakes that cause delays or technical debt.

### Pitfall 7: ShowCompleted Toggle Filter Bug Persists After Migration

**What goes wrong:**
The existing bug (BUG-01) where the showCompleted toggle doesn't filter correctly may persist or worsen after Pinia migration if the computed filter logic moves to the store incorrectly.

**Current implementation** (`index.vue` lines 265-272):
```typescript
const filteredRequests = computed(() => {
  const all = requests.value ?? []
  if (showCompleted.value) {
    return all
  }
  return all.filter(r => !['completed', 'cancelled'].includes(r.status))
})
```

**Why it happens:**
If `showCompleted` state moves to Pinia but the computed filter doesn't properly react to store changes, or if the filter gets duplicated between store and component.

**How to avoid:**
1. Keep UI state like `showCompleted` local to component OR in dedicated UI store
2. If moving to store, test toggle immediately after migration
3. Use `storeToRefs` if accessing store state in computed
4. Fix the existing bug first, then migrate

**Warning signs:**
- Toggle doesn't visually update filtered list
- DevTools shows correct filter value but UI doesn't reflect
- Filter works on initial load but not on toggle

**Phase to address:**
Phase 4 (Bug Fixes) - Fix bug first, verify after any state management changes

---

### Pitfall 8: Losing Existing Realtime Reconnection Logic

**What goes wrong:**
The existing `useRealtimeQueue.ts` has visibility change handling (lines 46-56) that refreshes data when tab becomes visible. During Pinia migration, this logic could be accidentally removed or broken.

**Why it happens:**
Refactoring composables without preserving all edge case handlers. Focus on "moving state" misses the side effect logic.

**How to avoid:**
1. Document existing composable behavior before migration
2. Keep composable for side effects, only move state to store
3. Test: Lock screen, unlock, verify data refreshes
4. Write test case for visibility change before refactoring

**Warning signs:**
- Data becomes stale after tab was backgrounded
- No refresh occurs when returning to app
- WebSocket shows connected but data is old

**Phase to address:**
Phase 1 (Pinia Integration) - Preserve composable, only migrate state to store

---

### Pitfall 9: Sidebar Mobile Toggle Not Persistent

**What goes wrong:**
User collapses sidebar on mobile, navigates to another page, sidebar is expanded again. Or worse, sidebar state fights between routes.

**Why it happens:**
shadcn-vue Sidebar uses SidebarProvider for state, but state isn't persisted across navigations by default.

**How to avoid:**
1. Use SidebarProvider's `storage` and `storage-key` props:
   ```vue
   <SidebarProvider storage="localStorage" storage-key="sidebar-state">
   ```
2. Or manage sidebar state in Pinia store (centralized)
3. Test: Collapse sidebar, navigate, verify it stays collapsed

**Warning signs:**
- Sidebar "jumps" on navigation
- User must repeatedly collapse sidebar
- Different sidebar state on different pages

**Phase to address:**
Phase 2 (Sidebar Layout) - Configure persistence in SidebarProvider

---

### Pitfall 10: Enum Migration Breaks Runtime Checks

**What goes wrong:**
Current status checks use string literals: `status === 'processing'`. Migrating to TypeScript enums works at compile time, but if database returns strings that don't match enum values, runtime checks fail silently.

**Why it happens:**
TypeScript enums compile to objects with string values, but comparison with raw database strings may not work as expected, especially with const enums.

**Example:**
```typescript
// Enum approach
enum Status {
  Processing = 'processing'
}

// Database returns string
const dbStatus = 'processing'

// This works
if (dbStatus === Status.Processing) {} // true

// But const enum gets inlined
const enum Status {
  Processing = 'processing'
}
// Compiles to: if (dbStatus === 'processing') {}
// Which works, but loses type safety benefits
```

**How to avoid:**
1. Use `as const` objects instead of enums (recommended for 2026):
   ```typescript
   export const PickupStatus = {
     pending: 'pending',
     approved: 'approved',
     in_queue: 'in_queue',
     processing: 'processing',
     completed: 'completed',
     cancelled: 'cancelled',
   } as const

   export type PickupStatus = typeof PickupStatus[keyof typeof PickupStatus]
   ```
2. This provides type safety AND works with database strings
3. Avoid TypeScript `enum` keyword entirely

**Warning signs:**
- Status comparisons always false
- Switch statements with status never match cases
- TypeScript happy but runtime broken

**Phase to address:**
Phase 3 (Type Centralization) - Use `as const` pattern, not enums

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keeping status strings as magic values | No refactoring needed | Type errors, invalid status bugs | Never - centralize in Phase 3 |
| Mixing composables and stores randomly | Quick feature add | Unclear data flow, debugging nightmare | Never - establish pattern in Phase 1 |
| Inline type definitions per component | Faster initial development | Drift, inconsistency, duplicate types | Only during transition |
| Skipping mobile test after layout change | Faster development | Broken gate operator view in production | Never for layout changes |
| Putting realtime subscriptions in Pinia | Seems cleaner | Memory leaks, lifecycle issues | Never - keep in composables |

## Integration Gotchas

Common mistakes when connecting components during refactoring.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Pinia + Supabase Realtime | Put subscription in store | Keep subscription in composable, update store from callback |
| Pinia + `useAsyncData` | Duplicate data (store + asyncData) | Use store as single source, asyncData populates store |
| Sidebar + Route | Apply sidebar to all routes | Use `definePageMeta({ layout: 'sidebar' })` selectively |
| Type changes + Components | Change type, update all files at once | Re-export pattern for gradual migration |
| Pinia + existing composables | Replace composable entirely | Wrap composable, delegate side effects |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Store fetches on every component mount | Slow navigation, redundant API calls | Fetch once, use stale-while-revalidate | Multiple dashboard users |
| Re-rendering entire queue list on any change | Sluggish drag-drop | Use `:key` properly, memoize computeds | 20+ items in queue |
| Watching entire store state | Excessive re-renders | Watch specific properties with `storeToRefs` | Complex dashboard view |
| Sidebar re-renders on state change | Janky animations | Isolate sidebar state from queue state | Any navigation |

## Security Mistakes

Domain-specific security issues for this refactoring.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Store exposes all data to all components | Over-fetching, privacy leak | Use getters to filter by context (gate ID) |
| Client-side status validation only | Invalid status injection | Keep database constraints (CHECK constraint exists) |
| Type centralization weakens validation | Looser types accepted | Use strict TypeScript, runtime validation for API responses |

## UX Pitfalls

Common user experience mistakes during architecture refactoring.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Sidebar pushes content on mobile | Gate operators struggle with small screen | Sidebar overlay on mobile, or exclude from gate routes |
| Layout transition flickers | Unprofessional feel | Use `layout: false` for gate, smooth transitions elsewhere |
| Lost scroll position after navigation | User loses context | Preserve scroll in store or use Vue router scroll behavior |
| Loading states inconsistent after Pinia | Confusing feedback | Centralize loading state in store, consistent UI |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Pinia store created:** Often missing `storeToRefs` in consuming components - verify ALL destructuring uses it
- [ ] **Sidebar layout added:** Often missing mobile responsiveness - verify on 320px viewport
- [ ] **Types centralized:** Often missing import updates - verify no TypeScript errors in `pnpm build`
- [ ] **Composable migrated:** Often missing cleanup - verify subscriptions unsubscribe on unmount (check DevTools)
- [ ] **Layout applied:** Often missing route exclusions - verify gate pages still work unaffected
- [ ] **Filter bug fixed:** BUG-01 exists - verify showCompleted toggle filters both completed AND cancelled
- [ ] **Sidebar persists:** Often forgotten - verify collapse state survives navigation

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Reactivity loss | LOW | Add `storeToRefs()`, immediate fix |
| Subscription leak | MEDIUM | Add explicit cleanup, may need page refresh to clear old subscriptions |
| Type migration breaks | LOW | Revert to re-export pattern, migrate incrementally |
| Gate view broken | MEDIUM | Add `layout: 'gate'` or `layout: false` to gate page, test mobile |
| SSR hydration mismatch | MEDIUM | Move browser-only code to `onMounted`, may need cache clear |
| Store outside context | LOW | Move store call inside setup or action |
| Sidebar not persisting | LOW | Add storage props to SidebarProvider |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Realtime subscription leak | Phase 1 | Subscriptions still work after navigation, DevTools shows single subscription |
| Store reactivity loss | Phase 1 | UI updates when store changes, use Vue DevTools to verify reactivity |
| Type migration breaks | Phase 3 | `pnpm build` passes with no type errors |
| Gate view broken | Phase 2 | Gate page renders correctly on 320px mobile viewport |
| SSR hydration mismatch | Phase 1 | No Vue hydration warnings in console on page load |
| Store outside context | Phase 1 | No Pinia errors on navigation or in middleware |
| ShowCompleted bug | Phase 4 | Toggle filters correctly, DevTools confirms state change |
| Sidebar persistence | Phase 2 | Collapse sidebar, navigate away, return - still collapsed |
| Enum runtime mismatch | Phase 3 | Status comparisons work with database strings |

---

## Preserved from v1.1 (Still Relevant)

The following pitfalls from v1.1 remain relevant during v2.0:

### Mobile Touch Targets
Gate operator buttons must remain 44x44px minimum. Sidebar layout must not reduce these.

### Realtime Reconnection
The visibility change handler in `useRealtimeQueue.ts` must be preserved during any composable refactoring.

### Status Transition Guards
Database functions (`start_processing`, `complete_request`) have status guards. Don't bypass these when migrating to Pinia.

---

## Sources

- [Pinia + Nuxt SSR documentation](https://pinia.vuejs.org/ssr/nuxt.html)
- [Top 5 Pinia mistakes](https://masteringpinia.com/blog/top-5-mistakes-to-avoid-when-using-pinia)
- [Composables vs Pinia patterns](https://iamjeremie.me/post/2025-01/composables-vs-pinia-vs-provide-inject/)
- [Vue composable lifecycle cleanup](https://vuejs.org/guide/reusability/composables)
- [shadcn-vue sidebar documentation](https://www.shadcn-vue.com/docs/components/sidebar)
- [Pinia storeToRefs discussion](https://github.com/vuejs/pinia/discussions/1448)
- [TypeScript enums vs const objects](https://www.angularspace.com/breaking-the-enum-habit-why-typescript-developers-need-a-new-approach/)
- Codebase analysis: `/Users/thomas/Projects/tsg/warehouse-pickup-queue/staff/app/`

---
*Pitfalls research for: Warehouse Pickup Queue v2.0 Architecture Overhaul*
*Researched: 2026-01-30*
