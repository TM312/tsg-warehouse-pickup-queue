# Feature Research: v2.0 Architecture Overhaul

**Domain:** Admin Dashboard Architecture (Vue/Nuxt with shadcn-vue)
**Researched:** 2026-01-30
**Confidence:** HIGH

## Feature Landscape

This research covers the four key architectural areas for v2.0:
1. Sidebar navigation patterns
2. Dashboard visualization (bar charts)
3. Pinia state management
4. TypeScript type organization

### Table Stakes (Users Expect These)

Features users assume exist in professional admin UIs. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Collapsible sidebar navigation** | Every modern admin has one; users know the pattern | MEDIUM | Use shadcn-vue Sidebar component with `collapsible="icon"` variant |
| **Mobile sidebar as sheet/overlay** | Mobile users expect hamburger menu pattern | LOW | shadcn-vue handles via `useSidebar().isMobile` + `openMobile` state |
| **Active route highlighting** | Users need visual confirmation of current location | LOW | Vue Router provides `router-link-active` and `router-link-exact-active` classes |
| **Keyboard shortcut for sidebar toggle** | Power users expect cmd/ctrl+b | LOW | shadcn-vue Sidebar has this built-in by default |
| **Main content area that respects sidebar** | Content should not overlap with sidebar | LOW | Use `SidebarInset` component from shadcn-vue |
| **Sticky header in main content** | Navigation should remain accessible while scrolling | LOW | Use sticky positioning within SidebarInset |
| **No sidebar on gate operator routes** | /gate/[id] is mobile-first, fullscreen experience | LOW | Use Nuxt layouts: `default` (sidebar) vs `minimal` (no sidebar) |
| **Centralized TypeScript types** | Type safety across components/composables | MEDIUM | Create `types/` directory with domain types |
| **Replace magic strings with type constants** | Prevent typos in status values, improve autocomplete | LOW | Define `RequestStatus` union type |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but add polish.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Dashboard overview page with bar chart** | At-a-glance queue status improves supervisor efficiency | MEDIUM | Bar chart showing queue length per gate using vue3-apexcharts |
| **SidebarRail for icon-only collapsed state** | Compact but still navigable sidebar | LOW | Add `<SidebarRail />` inside Sidebar component |
| **Animated transitions between sidebar states** | Smooth UX feels professional | LOW | shadcn-vue Sidebar has CSS transitions built-in |
| **Sidebar state persistence** | Remembers collapsed/expanded across sessions | LOW | Use `storage-key` prop on SidebarProvider |
| **Sidebar footer with user/settings** | Standard admin pattern for account actions | LOW | Use `<SidebarFooter>` slot |
| **Pinia store for shared queue state** | Single source of truth, eliminates prop drilling | MEDIUM | Setup store pattern with composables |
| **Computed derivations in store** | Efficient re-use of filtered/grouped data | LOW | `requestsByGate`, `activeRequests` as computed |
| **Hybrid Pinia + composables architecture** | Keep action logic in composables, shared state in store | MEDIUM | Store for state, composables for operations |

### Anti-Features (Deliberately NOT Building for v2.0)

Features that seem good but create complexity without proportional value.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Nested/multi-level sidebar menus** | "We might have more navigation later" | Adds complexity for 3-4 items; YAGNI | Flat navigation with 3-4 items |
| **Sidebar search/command palette** | "Power users want quick navigation" | Overkill for 3-page app | Direct links are faster |
| **Draggable/resizable sidebar** | "Users want control" | Adds state complexity, edge cases | Fixed width with collapsible option |
| **Multiple sidebar variants (floating, inset)** | "Looks nice in demos" | Pick one and stick with it | Use `inset` variant consistently |
| **Real-time chart updates** | "Live dashboard!" | Polling/subscriptions for charts adds complexity | Refresh on page load + manual refresh button |
| **Dark mode toggle in sidebar** | "Everyone has dark mode" | Already in settings; duplicating controls | Single location in Settings |
| **Complex Pinia module structure** | "Scalable architecture" | Over-engineering for this app size | 1-2 stores max: `queueStore`, maybe `gateStore` |
| **Server-side rendered Pinia state** | "SSR best practices" | App requires auth anyway, no SEO benefit | Client-side hydration is fine |
| **Breadcrumb navigation** | "Additional wayfinding" | Only 3 pages; sidebar already shows location | Save for when we have deeper nesting |
| **Type generation from database schema** | "Single source of truth" | Additional tooling, build step complexity | Manual types are fine for this app size |

## Feature Dependencies

```
[Sidebar Layout]
    |--requires--> [SidebarProvider wrapping layout]
    |--requires--> [Multiple Nuxt layouts (default vs minimal)]
    |--enhances--> [Keyboard shortcuts (built-in)]
    |--enhances--> [State persistence (storage-key)]

[Dashboard Overview Page]
    |--requires--> [Sidebar navigation in place]
    |--requires--> [Access to gate queue data]
    |--optional--> [Pinia store for shared state]

[Centralized Types]
    |--enables--> [Type-safe Pinia stores]
    |--enables--> [Type-safe composables]
    |--enables--> [Autocomplete for status values]
    |--independent-- (can do first)

[Pinia Store]
    |--benefits-from--> [Centralized types]
    |--replaces--> [Per-page useAsyncData for shared data]
    |--coexists-with--> [Existing composables for actions]
```

### Dependency Notes

- **Sidebar Layout requires SidebarProvider:** Must wrap layout (not whole app) in SidebarProvider
- **Gate routes need separate layout:** definePageMeta({ layout: 'minimal' }) excludes sidebar
- **Dashboard Page requires Sidebar:** Dashboard is only useful once there's navigation to reach it
- **Types can be done first:** No dependencies; purely organizational improvement
- **Pinia benefits from types but doesn't require them:** Can add types later, but cleaner if done first

## Phase Recommendations for v2.0

### Launch With (v2.0 Core)

Minimum set to achieve architecture overhaul goals.

- [x] **Sidebar navigation layout** - Primary architectural change
- [x] **Route-specific layouts** - Gate operator view stays minimal (fullscreen)
- [x] **Active route highlighting** - Basic UX requirement
- [x] **Mobile sidebar as overlay** - Mobile support is non-negotiable
- [x] **Centralized TypeScript types** - Foundation for cleaner code
- [x] **Dashboard overview page** - Primary new feature for supervisors

### Add After Core (v2.0 Polish)

Features to add once core sidebar and dashboard work.

- [ ] **Bar chart visualization** - Trigger: Dashboard page exists and works
- [ ] **Pinia store for queue state** - Trigger: Want to reduce prop drilling further
- [ ] **SidebarRail for collapsed state** - Trigger: Sidebar feels cramped
- [ ] **Sidebar state persistence** - Trigger: Users complain about losing state

### Future Consideration (v2.1+)

Features to defer until v2.0 is stable.

- [ ] **Advanced keyboard shortcuts** - Why defer: cmd+b is enough for now
- [ ] **Sidebar footer with user info** - Why defer: Logout in header works fine
- [ ] **Vuex-style devtools integration** - Why defer: Pinia devtools work by default

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Sidebar navigation | HIGH | MEDIUM | P1 |
| Mobile sidebar overlay | HIGH | LOW | P1 |
| Route-specific layouts | HIGH | LOW | P1 |
| Active route highlighting | HIGH | LOW | P1 |
| Centralized types | MEDIUM | LOW | P1 |
| Dashboard overview page | HIGH | MEDIUM | P1 |
| Bar chart visualization | MEDIUM | MEDIUM | P2 |
| Pinia store for queue | MEDIUM | HIGH | P2 |
| SidebarRail collapsed mode | LOW | LOW | P2 |
| Sidebar state persistence | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for v2.0 launch
- P2: Should have, add if time permits
- P3: Nice to have, consider for v2.1

## Implementation Patterns

### Sidebar Component Structure (shadcn-vue)

The shadcn-vue Sidebar is composed of multiple parts:
- **SidebarProvider** - Handles collapsible state, wraps everything
- **Sidebar** - The sidebar container with variants (`sidebar`, `floating`, `inset`)
- **SidebarHeader/Footer** - Sticky at top/bottom
- **SidebarContent** - Scrollable content area
- **SidebarGroup** - Section within content
- **SidebarMenu/MenuItem/MenuButton** - Navigation items
- **SidebarRail** - Thin rail for collapsed state
- **SidebarTrigger** - Toggle button
- **SidebarInset** - Main content wrapper

```vue
<!-- layouts/default.vue -->
<template>
  <SidebarProvider :default-open="true" storage-key="sidebar-state">
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <span class="font-semibold">Warehouse Queue</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in navItems" :key="item.to">
              <SidebarMenuButton as-child :is-active="isActive(item.to)">
                <NuxtLink :to="item.to">
                  <component :is="item.icon" />
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      <header class="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" class="h-6" />
        <h1 class="text-lg font-semibold">{{ pageTitle }}</h1>
      </header>
      <main class="flex-1 p-4 lg:p-6">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { LayoutDashboard, DoorOpen, Clock } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Gates', to: '/gates', icon: DoorOpen },
  { label: 'Opening Schedule', to: '/settings/business-hours', icon: Clock },
]

const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

const pageTitle = computed(() => {
  const item = navItems.find(n => isActive(n.to))
  return item?.label ?? 'Warehouse Queue'
})
</script>
```

### Mobile Sidebar Behavior

The `useSidebar` hook provides:
- `state`: 'expanded' | 'collapsed'
- `open`: Desktop open state
- `setOpen`: Set desktop state
- `isMobile`: Boolean detecting mobile viewport
- `openMobile`: Mobile overlay state
- `setOpenMobile`: Control mobile overlay
- `toggleSidebar`: Toggle appropriate state based on viewport

On mobile, sidebar renders as a Sheet overlay. Desktop keyboard shortcut (cmd/ctrl+b) toggles sidebar.

### Route-Specific Layouts (Nuxt)

```vue
<!-- layouts/default.vue - WITH sidebar (for staff dashboard) -->
<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <slot />
    </SidebarInset>
  </SidebarProvider>
</template>

<!-- layouts/minimal.vue - NO sidebar (for gate operator) -->
<template>
  <div class="min-h-screen bg-background">
    <slot />
  </div>
</template>
```

```vue
<!-- pages/gate/[id].vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'minimal',  // No sidebar for gate operator view
  middleware: 'auth'
})
</script>
```

### Active Route Highlighting

Vue Router automatically adds classes to `<router-link>` (or `<NuxtLink>`):
- `router-link-active`: Route matches (including children)
- `router-link-exact-active`: Exact route match

For custom active state in SidebarMenuButton:

```vue
<SidebarMenuButton
  as-child
  :is-active="route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to))"
>
  <NuxtLink :to="item.to">
    <!-- ... -->
  </NuxtLink>
</SidebarMenuButton>
```

### Type Organization Pattern

```
app/
  types/
    index.ts          # Re-exports all types
    domain.ts         # Core domain types (PickupRequest, Gate, etc.)
    navigation.ts     # Navigation-specific types
```

```typescript
// types/domain.ts
export type RequestStatus = 'pending' | 'in_queue' | 'processing' | 'completed' | 'cancelled'

export interface Gate {
  id: string
  gate_number: number
  is_active: boolean
}

export interface PickupRequest {
  id: string
  sales_order_number: string
  company_name: string | null
  customer_email: string
  status: RequestStatus
  email_flagged: boolean
  assigned_gate_id: string | null
  queue_position: number | null
  is_priority: boolean
  processing_started_at: string | null
  created_at: string
  gate?: Gate | null
}

export interface GateWithCount extends Gate {
  queue_count: number
}

// types/navigation.ts
import type { Component } from 'vue'

export interface NavItem {
  label: string
  to: string
  icon: Component
}

// types/index.ts
export * from './domain'
export * from './navigation'
```

### Pinia Store Pattern (Setup Store)

Setup stores work well with composables and provide full TypeScript support:

```typescript
// stores/queue.ts
import { defineStore } from 'pinia'
import type { PickupRequest, Gate, RequestStatus } from '~/types'

export const useQueueStore = defineStore('queue', () => {
  const client = useSupabaseClient()

  // State
  const requests = ref<PickupRequest[]>([])
  const gates = ref<Gate[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Getters
  const activeRequests = computed(() =>
    requests.value.filter(r => !['completed', 'cancelled'].includes(r.status))
  )

  const requestsByGate = computed(() => {
    const map = new Map<string, PickupRequest[]>()
    for (const gate of gates.value) {
      map.set(
        gate.id,
        requests.value.filter(r => r.assigned_gate_id === gate.id && r.status === 'in_queue')
      )
    }
    return map
  })

  const processingRequests = computed(() =>
    requests.value.filter(r => r.status === 'processing')
  )

  const queueCountByGate = computed(() => {
    const counts: Record<string, number> = {}
    for (const [gateId, reqs] of requestsByGate.value) {
      counts[gateId] = reqs.length
    }
    return counts
  })

  // Actions
  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const [requestsRes, gatesRes] = await Promise.all([
        client.from('pickup_requests').select('*, gate:gates(*)').order('created_at', { ascending: false }),
        client.from('gates').select('*').order('gate_number'),
      ])

      if (requestsRes.error) throw requestsRes.error
      if (gatesRes.error) throw gatesRes.error

      requests.value = requestsRes.data ?? []
      gates.value = gatesRes.data ?? []
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  // Expose for reactivity
  return {
    // State
    requests,
    gates,
    loading,
    error,
    // Getters
    activeRequests,
    requestsByGate,
    processingRequests,
    queueCountByGate,
    // Actions
    fetchAll,
  }
})
```

### Bar Chart Visualization Pattern

Using vue3-apexcharts for the gate queue bar chart:

```vue
<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'

const props = defineProps<{
  gates: Array<{ gate_number: number; queue_count: number }>
}>()

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '60%',
    },
  },
  xaxis: {
    categories: props.gates.map(g => `Gate ${g.gate_number}`),
  },
  yaxis: {
    title: { text: 'Queue Length' },
    min: 0,
    forceNiceScale: true,
  },
  colors: ['hsl(var(--primary))'],
  dataLabels: { enabled: true },
}))

const series = computed(() => [{
  name: 'In Queue',
  data: props.gates.map(g => g.queue_count),
}])
</script>

<template>
  <VueApexCharts
    type="bar"
    :options="chartOptions"
    :series="series"
    height="300"
  />
</template>
```

## Sources

### HIGH Confidence (Official Documentation)
- [shadcn-vue Sidebar Component](https://www.shadcn-vue.com/docs/components/sidebar) - Component API, variants, collapsible options, useSidebar hook
- [shadcn-vue Sidebar Blocks](https://www.shadcn-vue.com/blocks/sidebar) - 16 pre-built sidebar patterns (sidebar-01 through sidebar-16)
- [shadcn/ui Sidebar Documentation](https://ui.shadcn.com/docs/components/sidebar) - Mobile behavior, SidebarInset, SidebarTrigger
- [Vue Router Active Links](https://router.vuejs.org/guide/essentials/active-links) - router-link-active and router-link-exact-active classes
- [Pinia Composables Guide](https://pinia.vuejs.org/cookbook/composables.html) - Setup stores with composables, SSR considerations
- [Pinia Defining Stores](https://pinia.vuejs.org/core-concepts/) - Setup stores vs Option stores
- [Nuxt 4 Layouts](https://nuxt.com/docs/4.x/directory-structure/app/layouts) - Route-specific layouts, definePageMeta
- [Nuxt 4 TypeScript](https://nuxt.com/docs/4.x/guide/concepts/typescript) - Types folder, shared/ directory, auto-imports

### MEDIUM Confidence (Verified Patterns)
- [vue3-apexcharts](https://github.com/apexcharts/vue3-apexcharts) - Bar chart component for Vue 3, Nuxt integration
- [ApexCharts Vue Documentation](https://apexcharts.com/docs/vue-charts/) - Chart options, series format
- [Vue 3 TypeScript Best Practices](https://medium.com/@nakiboddin.saiyad/vue-js-with-typescript-best-practices-for-large-scale-projects-c3529e21969b) - Centralized types approach
- [Pinia + Composables Architecture](https://medium.com/@webappcode/mastering-composable-with-pinia-store-in-vue-3-59d1d57e3c01) - Hybrid pattern recommendations
- [CoreUI Vue Sidebar](https://coreui.io/answers/how-to-build-a-sidebar-in-vue/) - Responsive sidebar patterns

### Referenced Blocks (shadcn-vue)
- **sidebar-01**: Simple sidebar with navigation grouped by section
- **sidebar-07**: Sidebar that collapses to icons (collapsible="icon")
- **sidebar-08**: Inset sidebar with secondary navigation (variant="inset")
- **dashboard-01**: Dashboard with sidebar, charts, and data table

---
*Feature research for: v2.0 Architecture Overhaul - Admin Dashboard with Sidebar*
*Researched: 2026-01-30*
