# Phase 17: Dashboard & Visualization - Research

**Researched:** 2026-02-02
**Domain:** Vue 3 charting with shadcn-vue/Unovis, KPI dashboard components
**Confidence:** HIGH

## Summary

This phase implements a supervisor dashboard with KPI cards and a bar chart visualization. The project already uses shadcn-nuxt (shadcn-vue for Nuxt), which includes chart components built on Unovis - a modular, tree-shakable data visualization framework. Using the built-in chart components ensures visual consistency with the existing UI.

The dashboard requires four KPI metrics (completed today, avg wait time, avg processing time, currently waiting) that can be calculated from existing database fields (`created_at`, `processing_started_at`, `completed_at`). The bar chart visualizes queue length per gate, data already available via the existing `GateWithCount` type's `queue_count` field.

Key technical considerations include handling SSR hydration for chart components (requires VueUse plugin), periodic refresh for KPI calculations (not on every realtime event), and proper loading states with skeleton placeholders.

**Primary recommendation:** Use shadcn-vue chart components (`VisGroupedBar`, `VisXYContainer`, `VisAxis`) with `ChartTooltip` for tooltips, plus custom KPI card components following existing Card patterns.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @unovis/vue | Latest | Bar chart visualization | Used by shadcn-vue chart components, already peer dependency |
| shadcn-vue chart | Latest | Chart container and tooltip | Matches existing UI system, copy-paste components |
| date-fns | 4.1.0 | Time calculations and formatting | Already in project, used for KPI time formatting |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vueuse/core | 14.1.0 | useIntervalFn for periodic refresh, provideSSRWidth for SSR | Already in project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Unovis (shadcn-vue) | vue-chartjs + Chart.js | Would require separate styling, less integrated with existing UI |
| Unovis (shadcn-vue) | ApexCharts | Heavier bundle, more features than needed for simple bar chart |

**Installation:**
```bash
# Chart component via shadcn-vue CLI (generates into components/ui/chart)
pnpm dlx shadcn-vue@latest add chart

# Unovis Vue package (peer dependency for chart component)
pnpm add @unovis/vue
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── pages/
│   └── dashboard.vue         # Dashboard page (supervisor view)
├── components/
│   └── dashboard/
│       ├── KpiCard.vue       # Reusable KPI card component
│       ├── KpiCardsRow.vue   # Container for 4 KPI cards
│       └── QueueBarChart.vue # Bar chart component
├── composables/
│   └── useDashboardKpis.ts   # KPI calculations and data fetching
└── plugins/
    └── ssr-width.ts          # SSR hydration fix for charts
```

### Pattern 1: Composition-Based Chart Building
**What:** Build charts using Unovis components directly within a ChartContainer
**When to use:** All chart implementations with shadcn-vue
**Example:**
```typescript
// Source: shadcn-vue docs + unovis docs
<script setup lang="ts">
import { VisXYContainer, VisGroupedBar, VisAxis } from '@unovis/vue'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface GateData {
  gate: string
  count: number
}

const props = defineProps<{
  data: GateData[]
}>()

// Accessor functions for Unovis
const x = (d: GateData) => d.gate
const y = (d: GateData) => d.count
</script>

<template>
  <ChartContainer class="h-[400px] w-full">
    <VisXYContainer :data="data">
      <VisGroupedBar :x="x" :y="[y]" />
      <VisAxis type="x" :grid-line="false" />
      <VisAxis type="y" :grid-line="true" />
      <ChartTooltip>
        <ChartTooltipContent />
      </ChartTooltip>
    </VisXYContainer>
  </ChartContainer>
</template>
```

### Pattern 2: Periodic Data Refresh
**What:** Refresh KPI data at intervals, not on every realtime event
**When to use:** Derived metrics that are expensive to calculate
**Example:**
```typescript
// Source: VueUse docs, project patterns
import { useIntervalFn } from '@vueuse/core'

const REFRESH_INTERVAL = 30_000 // 30 seconds

const { pause, resume } = useIntervalFn(() => {
  refreshKpis()
}, REFRESH_INTERVAL, { immediate: true })

// Pause when tab is hidden (already handled by existing realtime composable pattern)
```

### Pattern 3: Duration Formatting
**What:** Format time durations as "Xh Ym" for display
**When to use:** Wait time and processing time KPIs
**Example:**
```typescript
// Source: date-fns patterns, user requirements
import { differenceInMinutes } from 'date-fns'

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// Calculate average wait time from completed pickups today
function calculateAvgWaitTime(completedToday: PickupRequest[]): number | null {
  const validRequests = completedToday.filter(r =>
    r.processing_started_at && r.created_at
  )
  if (validRequests.length === 0) return null

  const totalMinutes = validRequests.reduce((sum, r) => {
    return sum + differenceInMinutes(
      new Date(r.processing_started_at!),
      new Date(r.created_at)
    )
  }, 0)

  return Math.round(totalMinutes / validRequests.length)
}
```

### Anti-Patterns to Avoid
- **Recalculating KPIs on every realtime event:** Will cause excessive queries; use interval-based refresh instead
- **Using raw CSS for chart colors:** Use CSS variables (--vis-primary-color) for dark mode support
- **Fetching all historical data:** Query only today's data for KPIs using date filters
- **Client-side chart on initial SSR:** Use provideSSRWidth plugin to prevent hydration mismatch

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bar chart | SVG/Canvas drawing | Unovis VisGroupedBar | Handles responsiveness, tooltips, accessibility |
| Tooltip positioning | Manual position calc | ChartTooltip component | Handles edge cases, viewport boundaries |
| Time formatting | Custom format function | date-fns + formatDuration helper | Handles edge cases, localization-ready |
| Responsive charts | resize observers | ChartContainer + Unovis | Built-in responsive handling |
| SSR width | Conditional rendering | provideSSRWidth plugin | Prevents hydration mismatch properly |

**Key insight:** Unovis and shadcn-vue handle chart rendering complexity (responsive sizing, tooltips, accessibility, dark mode). Focus implementation effort on data fetching and KPI calculations.

## Common Pitfalls

### Pitfall 1: SSR Hydration Mismatch
**What goes wrong:** Chart renders differently on server vs client, causing Vue warnings and visual glitches
**Why it happens:** Charts depend on viewport width which doesn't exist during SSR
**How to avoid:** Add SSR width plugin that provides consistent width during SSR
**Warning signs:** Console warnings about hydration mismatch, chart "jumps" on load

```typescript
// app/plugins/ssr-width.ts
import { provideSSRWidth } from '@vueuse/core'

export default defineNuxtPlugin((nuxtApp) => {
  provideSSRWidth(1024, nuxtApp.vueApp)
})
```

### Pitfall 2: Empty Data State Display
**What goes wrong:** Chart or KPIs show 0 or undefined when no data exists
**Why it happens:** No completed pickups yet today, or initial load
**How to avoid:** Show dash ("-") as specified in requirements, use skeleton during loading
**Warning signs:** Seeing "0h 0m" for avg times when no data, blank chart areas

### Pitfall 3: Excessive Database Queries
**What goes wrong:** Every realtime event triggers KPI recalculation
**Why it happens:** Using realtime subscription for KPI updates
**How to avoid:** Separate realtime (queue counts) from periodic (KPI calculations)
**Warning signs:** Sluggish UI, high Supabase query count

### Pitfall 4: Chart Colors in Dark Mode
**What goes wrong:** Chart colors don't adapt to dark mode
**Why it happens:** Using hardcoded colors instead of CSS variables
**How to avoid:** Use CSS variables or pass colors from theme
**Warning signs:** Poor contrast in dark mode, colors don't change on theme toggle

## Code Examples

Verified patterns from official sources:

### KPI Card Component
```vue
<!-- Source: shadcn-vue Card patterns, user requirements -->
<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

defineProps<{
  label: string
  value: string | null
  loading?: boolean
}>()
</script>

<template>
  <Card>
    <CardContent class="p-6">
      <div v-if="loading">
        <Skeleton class="h-8 w-20 mb-2" />
        <Skeleton class="h-4 w-24" />
      </div>
      <template v-else>
        <div class="text-2xl font-bold">
          {{ value ?? '—' }}
        </div>
        <p class="text-sm text-muted-foreground">
          {{ label }}
        </p>
      </template>
    </CardContent>
  </Card>
</template>
```

### Queue Bar Chart
```vue
<!-- Source: shadcn-vue chart docs, unovis docs -->
<script setup lang="ts">
import { VisXYContainer, VisGroupedBar, VisAxis } from '@unovis/vue'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

interface GateQueueData {
  gate: string
  count: number
  gateId: string
}

const props = defineProps<{
  data: GateQueueData[]
  loading?: boolean
}>()

// Chart configuration for colors and labels
const chartConfig = {
  count: {
    label: 'Waiting',
    color: 'hsl(var(--chart-1))'
  }
} satisfies ChartConfig

// Accessor functions
const x = (d: GateQueueData) => d.gate
const y = (d: GateQueueData) => d.count
</script>

<template>
  <ChartContainer :config="chartConfig" class="min-h-[300px] w-full">
    <template v-if="loading">
      <div class="flex items-end justify-around h-full p-4 gap-4">
        <Skeleton v-for="i in 4" :key="i" class="flex-1 h-3/4" />
      </div>
    </template>
    <template v-else-if="data.length === 0">
      <div class="flex items-center justify-center h-full text-muted-foreground">
        No gates configured
      </div>
    </template>
    <VisXYContainer v-else :data="data">
      <VisGroupedBar
        :x="x"
        :y="[y]"
        :color="chartConfig.count.color"
        :rounded-corners="4"
      />
      <VisAxis
        type="x"
        :grid-line="false"
        :domain-line="false"
      />
      <VisAxis
        type="y"
        :grid-line="true"
        :domain-line="false"
        :tick-format="(v: number) => String(Math.round(v))"
      />
      <ChartTooltip>
        <ChartTooltipContent />
      </ChartTooltip>
    </VisXYContainer>
  </ChartContainer>
</template>
```

### Dashboard KPIs Composable
```typescript
// Source: Project patterns, Supabase docs
import { ref, computed } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { startOfDay, differenceInMinutes } from 'date-fns'
import type { PickupRequest } from '#shared/types/pickup-request'
import { PICKUP_STATUS } from '#shared/types/pickup-request'

export function useDashboardKpis() {
  const client = useSupabaseClient()

  const completedToday = ref<PickupRequest[]>([])
  const loading = ref(true)
  const lastRefreshed = ref<Date | null>(null)

  async function fetchKpis() {
    loading.value = true
    const todayStart = startOfDay(new Date()).toISOString()

    const { data, error } = await client
      .from('pickup_requests')
      .select('*')
      .eq('status', PICKUP_STATUS.COMPLETED)
      .gte('completed_at', todayStart)

    if (!error && data) {
      completedToday.value = data as PickupRequest[]
    }

    loading.value = false
    lastRefreshed.value = new Date()
  }

  // Computed KPIs
  const completedCount = computed(() => completedToday.value.length)

  const avgWaitTimeMinutes = computed(() => {
    const valid = completedToday.value.filter(r =>
      r.processing_started_at && r.created_at
    )
    if (valid.length === 0) return null

    const total = valid.reduce((sum, r) => {
      return sum + differenceInMinutes(
        new Date(r.processing_started_at!),
        new Date(r.created_at)
      )
    }, 0)
    return Math.round(total / valid.length)
  })

  const avgProcessingTimeMinutes = computed(() => {
    const valid = completedToday.value.filter(r =>
      r.completed_at && r.processing_started_at
    )
    if (valid.length === 0) return null

    const total = valid.reduce((sum, r) => {
      return sum + differenceInMinutes(
        new Date(r.completed_at!),
        new Date(r.processing_started_at!)
      )
    }, 0)
    return Math.round(total / valid.length)
  })

  // Periodic refresh (30 seconds)
  const { pause, resume } = useIntervalFn(fetchKpis, 30_000, { immediate: true })

  return {
    loading,
    lastRefreshed,
    completedCount,
    avgWaitTimeMinutes,
    avgProcessingTimeMinutes,
    refresh: fetchKpis,
    pause,
    resume
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| vue-chartjs (Chart.js wrapper) | Unovis via shadcn-vue | 2025 | Consistent UI, tree-shakable, CSS variable theming |
| Manual responsive handling | ChartContainer built-in | Current | Automatic responsive charts |
| Hardcoded chart colors | CSS variables (--chart-1, etc.) | Current | Dark mode support out of box |

**Deprecated/outdated:**
- Chart.js v3 patterns: v4 has different registration approach
- c3.js, Flot: Dead libraries, don't use

## Open Questions

Things that couldn't be fully resolved:

1. **Exact chart color scheme**
   - What we know: User specified "Claude's discretion" for bar chart colors
   - What's unclear: Specific hue preferences
   - Recommendation: Use shadcn-vue default chart colors (--chart-1 through --chart-5), which integrate with theme

2. **Mobile chart breakpoint**
   - What we know: Chart needs to be responsive
   - What's unclear: Whether KPI cards should stack 2x2 or 4x1 on mobile
   - Recommendation: Stack KPI cards vertically on mobile (single column), chart takes full width

3. **"Last updated" timestamp**
   - What we know: User specified "Claude's discretion"
   - What's unclear: Whether to show it and where
   - Recommendation: Show subtle timestamp below chart ("Last updated: X seconds ago")

## Sources

### Primary (HIGH confidence)
- [shadcn-vue Chart docs](https://www.shadcn-vue.com/docs/components/chart) - Chart component installation and usage
- [Unovis GroupedBar docs](https://unovis.dev/docs/xy-charts/GroupedBar) - VisGroupedBar props and configuration
- [Unovis Axis docs](https://unovis.dev/docs/auxiliary/Axis/) - VisAxis configuration
- [Chart.js Tooltip docs](https://www.chartjs.org/docs/latest/configuration/tooltip.html) - Tooltip patterns (Unovis follows similar patterns)
- [VueUse useSSRWidth](https://vueuse.org/core/usessrwidth/) - SSR hydration fix

### Secondary (MEDIUM confidence)
- [shadcn-vue Nuxt installation](https://www.shadcn-vue.com/docs/installation/nuxt) - SSR plugin requirement
- [Unovis Tooltip docs](https://unovis.dev/docs/auxiliary/Tooltip/) - Tooltip component configuration

### Tertiary (LOW confidence)
- WebSearch results for Vue 3 charting library comparisons - Used for context on ecosystem

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - shadcn-vue docs, existing project patterns
- Architecture: HIGH - Project patterns established, Unovis docs clear
- Pitfalls: HIGH - SSR issues documented, patterns verified
- KPI calculations: HIGH - Database schema examined, timestamps available

**Research date:** 2026-02-02
**Valid until:** 60 days (stable libraries, well-documented patterns)
