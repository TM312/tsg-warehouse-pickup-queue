# Technology Stack: v2.0 Architecture Overhaul

**Project:** Warehouse Pickup Queue System
**Researched:** 2026-01-30
**Scope:** NEW additions only (Pinia, Sidebar, Dashboard visualization, TypeScript types)

## Executive Summary

The v2.0 architecture overhaul requires **three new dependencies** and one shadcn CLI addition. The existing stack (Nuxt 4, Vue 3, TailwindCSS, shadcn-vue, Supabase) remains unchanged. Pinia provides state management, vue-chartjs handles dashboard visualization, and the shadcn-vue Sidebar component provides navigation layout.

**Key decisions:**
- **Pinia:** Official Vue state management, Nuxt 4 compatible as of @pinia/nuxt v0.11.3
- **vue-chartjs:** Lightweight Chart.js wrapper for simple bar chart (gate queue visualization)
- **shadcn-vue Sidebar:** No npm install needed - add via CLI since reka-ui already installed
- **TypeScript types:** Use `as const` objects in `shared/types/` directory (Nuxt 4 convention)

## Recommended Stack Additions

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| pinia | ^3.0.4 | Global state management | Official Vue state management, composition API native, devtools support |
| @pinia/nuxt | ^0.11.3 | Nuxt integration | Auto-imports stores from `app/stores/`, SSR hydration handled automatically |

**Verified compatibility:** @pinia/nuxt v0.11.3 explicitly supports `^3.15.0 || ^4.0.0` (confirmed via [Nuxt Modules](https://nuxt.com/modules/pinia)). The project runs Nuxt 4.3.0.

**Integration pattern:** Hybrid with existing composables.
- **Pinia stores:** Global UI state (sidebar collapsed), cross-component state (dashboard metrics)
- **Composables (keep as-is):** Realtime subscriptions (`useRealtimeQueue`), Supabase RPC calls (`useQueueActions`, `useGateManagement`)

Do NOT migrate working realtime composables to Pinia - they handle Supabase channel lifecycle correctly as-is. Pinia stores can call composables internally when needed.

### UI Components (Sidebar)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| shadcn-vue Sidebar | (via CLI) | Sidebar navigation layout | Already using shadcn-vue, Sidebar is a pre-built component |

**No new npm dependencies required.** The project already has:
- `shadcn-nuxt: ^2.4.3`
- `reka-ui: ^2.7.0` (shadcn-vue's underlying component library since v1.0)
- `lucide-vue-next: ^0.563.0` (icons)

**Installation:** Run `pnpm dlx shadcn-vue@latest add sidebar`

**Sidebar sub-components added by CLI:**
- `SidebarProvider` - Wraps app, manages collapse state
- `Sidebar`, `SidebarContent`, `SidebarHeader`, `SidebarFooter`
- `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent`
- `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`
- `SidebarTrigger`, `SidebarRail`, `SidebarInset`

**Layout strategy:**
- Create new `sidebar.vue` layout for dashboard/settings pages
- Gate operator routes (`/gate/[id]`) continue using existing `default.vue` layout (no sidebar - full screen focus)

### Dashboard Visualization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| vue-chartjs | ^5.3.3 | Vue wrapper for Chart.js | Simple API, well-maintained, Vue 3 compatible |
| chart.js | ^4.4.x | Charting engine | Peer dependency of vue-chartjs, lightweight for simple bar charts |

**Rationale:** For a simple bar chart showing queue length per gate, vue-chartjs is ideal:
- Mature, actively maintained (379 projects depend on it)
- Minimal learning curve - import `Bar` component, pass data/options
- Lightweight - no need for D3-based solutions
- TypeScript support included

**Alternatives rejected:**
- **Vue3-Charts** (SVG-based) - More customizable but overkill
- **ApexCharts** - Beautiful but heavier than needed
- **ECharts** - Enterprise-grade, way too heavy for one chart

### TypeScript Organization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| (native TypeScript) | ^5.9.3 | Type definitions | Already installed |

**No new packages.** TypeScript organization is a pattern choice, not a dependency.

**Recommended pattern:** `as const` objects over enums.

```typescript
// shared/types/status.ts
export const PickupStatus = {
  PENDING: 'pending',
  IN_QUEUE: 'in_queue',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type PickupStatus = typeof PickupStatus[keyof typeof PickupStatus]
```

**Why `as const` over TypeScript enums:**
- No extra JavaScript generated (enums create runtime objects)
- Better tree-shaking
- More flexible with string literals from API responses
- TypeScript handbook now recommends this approach
- Avoids numeric enum reverse-mapping gotchas

**File organization (Nuxt 4 convention):**
```
shared/
  types/           # Auto-imported by Nuxt 4
    status.ts      # PickupStatus, GateStatus
    models.ts      # Gate, PickupRequest interfaces
    index.ts       # Re-exports
  utils/           # Manual import via #shared alias
```

Types in `shared/types/` are auto-imported by Nuxt 4 ([documented here](https://nuxt.com/docs/4.x/directory-structure/shared)).

## Complete Installation

```bash
cd staff

# State management
pnpm add pinia @pinia/nuxt

# Dashboard visualization
pnpm add vue-chartjs chart.js

# Sidebar (no npm install - uses shadcn CLI)
pnpm dlx shadcn-vue@latest add sidebar
```

**nuxt.config.ts update:**
```typescript
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/supabase',
    'shadcn-nuxt',
    '@pinia/nuxt',  // ADD THIS
  ],
  // ... rest unchanged
})
```

## What NOT to Add

| Avoided | Reason |
|---------|--------|
| VueX | Deprecated in favor of Pinia |
| pinia-plugin-persistedstate | No state needs browser persistence (sidebar state is minor) |
| Full dashboard framework | Overkill for one bar chart |
| D3.js | Too complex for simple bar chart |
| Additional icon library | lucide-vue-next already installed |
| @types packages | vue-chartjs and chart.js include TypeScript types |
| ApexCharts | Heavier than needed, beautiful but unnecessary |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| State | Pinia | VueX | VueX is legacy, Pinia is official successor |
| State | Pinia | useState (Nuxt) | useState is for simple SSR state, not UI state with actions |
| Charts | vue-chartjs | ApexCharts | Heavier, more features than needed |
| Charts | vue-chartjs | Vue3-Charts | Less ecosystem support, SVG approach not needed |
| Charts | vue-chartjs | ECharts | Much heavier, enterprise-focused |
| Types | `as const` | TypeScript enums | Enums generate runtime code, less flexible |
| Sidebar | shadcn-vue | Custom build | Already using shadcn-vue, Sidebar is mature |

## Integration Patterns

### Pinia + Existing Composables

```typescript
// app/stores/dashboard.ts
export const useDashboardStore = defineStore('dashboard', () => {
  // Import existing composable
  const { status, subscribe, unsubscribe } = useRealtimeQueue()

  // Pinia manages dashboard-specific state
  const gateMetrics = ref<GateMetric[]>([])
  const isLoading = ref(false)

  async function fetchMetrics() {
    isLoading.value = true
    const client = useSupabaseClient()
    // ... fetch logic
    isLoading.value = false
  }

  // Composable handles realtime events
  function initRealtime() {
    subscribe(() => fetchMetrics())
  }

  return {
    gateMetrics,
    isLoading,
    status, // expose realtime status
    fetchMetrics,
    initRealtime,
    unsubscribe
  }
})
```

### Sidebar Layout Pattern

```
app/layouts/
  default.vue      # Existing - header only (for /gate/[id] pages)
  sidebar.vue      # NEW - sidebar navigation for dashboard/settings
```

Route-to-layout via `definePageMeta`:
```vue
<!-- app/pages/dashboard.vue -->
<script setup>
definePageMeta({ layout: 'sidebar' })
</script>
```

```vue
<!-- app/pages/gate/[id].vue -->
<script setup>
definePageMeta({ layout: 'default' })  // No sidebar for gate operators
</script>
```

### Chart.js + Vue Pattern

```vue
<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip
} from 'chart.js'

// Register only needed components (tree-shaking)
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const store = useDashboardStore()

const chartData = computed(() => ({
  labels: store.gateMetrics.map(g => `Gate ${g.gate_number}`),
  datasets: [{
    label: 'Queue Length',
    data: store.gateMetrics.map(g => g.queue_count),
    backgroundColor: '#3b82f6',
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  }
}
</script>

<template>
  <div class="h-64">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
```

### TypeScript Type Pattern

```typescript
// shared/types/status.ts
export const PickupStatus = {
  PENDING: 'pending',
  IN_QUEUE: 'in_queue',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type PickupStatus = typeof PickupStatus[keyof typeof PickupStatus]

// Usage - type-safe with autocomplete
function updateStatus(id: string, status: PickupStatus) {
  // status must be one of the const values
}

updateStatus('123', PickupStatus.PROCESSING)  // OK
updateStatus('123', 'processing')              // OK (string literal)
updateStatus('123', 'invalid')                 // Type error
```

```typescript
// shared/types/models.ts
import type { PickupStatus } from './status'

export interface PickupRequest {
  id: string
  customer_name: string
  status: PickupStatus
  position: number | null
  assigned_gate_id: string | null
  created_at: string
}

export interface Gate {
  id: string
  gate_number: number
  is_active: boolean
}

export interface GateMetric {
  gate_id: string
  gate_number: number
  queue_count: number
}
```

## Directory Structure After v2.0

```
staff/
  app/
    components/
      ui/
        sidebar/           # Added via shadcn CLI
    composables/
      useRealtimeQueue.ts  # Keep as-is
      useQueueActions.ts   # Keep as-is
      useGateManagement.ts # Keep as-is
    layouts/
      default.vue          # Existing (gate operator)
      sidebar.vue          # NEW (dashboard, settings)
    pages/
      dashboard.vue        # NEW - with bar chart
      gate/[id].vue        # Existing
    stores/                # NEW directory
      dashboard.ts         # Dashboard state + metrics
      ui.ts                # Optional: sidebar collapsed state
  shared/
    types/                 # NEW directory
      status.ts            # PickupStatus, GateStatus
      models.ts            # Gate, PickupRequest interfaces
      index.ts             # Re-exports
  nuxt.config.ts           # Add @pinia/nuxt to modules
```

## Confidence Assessment

| Decision | Confidence | Basis |
|----------|------------|-------|
| Pinia + @pinia/nuxt | HIGH | Official docs confirm Nuxt 4 support, version verified |
| shadcn-vue Sidebar | HIGH | Already using shadcn-vue, official component |
| vue-chartjs + chart.js | HIGH | Mature library, npm activity, straightforward use |
| `as const` over enums | HIGH | TypeScript handbook recommendation, industry adoption |
| shared/types/ convention | HIGH | Nuxt 4 official documentation |
| Hybrid Pinia + composables | MEDIUM | Pattern is sound but may need implementation tuning |

## Sources

- [@pinia/nuxt Nuxt Module](https://nuxt.com/modules/pinia) - v0.11.3, Nuxt 4 support confirmed
- [Pinia Nuxt Documentation](https://pinia.vuejs.org/ssr/nuxt.html)
- [Pinia Composables Cookbook](https://pinia.vuejs.org/cookbook/composables.html)
- [shadcn-vue Sidebar Component](https://www.shadcn-vue.com/docs/components/sidebar)
- [shadcn-vue Changelog](https://www.shadcn-vue.com/docs/changelog) - Reka UI migration
- [vue-chartjs npm](https://www.npmjs.com/package/vue-chartjs) - v5.3.3
- [vue-chartjs Guide](https://vue-chartjs.org/guide/)
- [Nuxt 4 shared/ Directory](https://nuxt.com/docs/4.x/directory-structure/shared)
- [TypeScript Enums Handbook](https://www.typescriptlang.org/docs/handbook/enums.html)
- [TypeScript `as const` Best Practices](https://www.angularspace.com/breaking-the-enum-habit-why-typescript-developers-need-a-new-approach/)
