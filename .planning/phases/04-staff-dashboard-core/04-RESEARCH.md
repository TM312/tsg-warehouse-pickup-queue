# Phase 4: Staff Dashboard Core - Research

**Researched:** 2026-01-29
**Domain:** Vue Data Tables, Supabase Data Fetching, Visual Status Indicators
**Confidence:** HIGH

## Summary

This phase builds the core staff dashboard - a data table displaying all pickup requests with visual highlighting for items needing attention. The existing Nuxt 4 + shadcn-vue stack (established in Phase 3) provides all necessary tools.

The standard approach uses shadcn-vue's `<Table>` component powered by `@tanstack/vue-table` for the data table, combined with `@nuxtjs/supabase` composables for data fetching. Status highlighting uses shadcn-vue Badge components and conditional Tailwind classes on table rows. The project already has lucide-vue-next installed for icons.

Key findings: TanStack Table v8 is fully supported by shadcn-vue with Vue 3 patterns. The valueUpdater utility must be added to lib/utils.ts. Supabase realtime requires enabling replication on the pickup_requests table (done via ALTER PUBLICATION). Manual refresh is the MVP approach; realtime can be added incrementally.

**Primary recommendation:** Use shadcn-vue Table + TanStack Table with useAsyncData for data fetching, Badge components for status, and lucide-vue-next icons (Flag, CircleAlert) for visual flags.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/vue-table | ^8.x | Headless table logic (sorting, filtering, pagination) | Only add this - official TanStack adapter for Vue 3 |
| shadcn-vue Table | - | Pre-styled table components | Already using shadcn-vue, just need to add Table component |
| @nuxtjs/supabase | ^2.0.3 | Supabase client + composables | Already installed in Phase 3 |
| lucide-vue-next | ^0.563.0 | Icons (Flag, CircleAlert, RefreshCw) | Already installed in Phase 3 |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vueuse/core | ^14.1.0 | Vue composition utilities | useIntervalFn for auto-refresh |
| zod | ^3.25.76 | Schema validation | Type-safe query results |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack Table | AG Grid | AG Grid more powerful but heavy, overkill for this use case |
| Manual refresh | Supabase Realtime | Realtime more complex, manual refresh sufficient for MVP |
| Badge component | Custom status chips | Badge is pre-built in shadcn-vue, consistent styling |

**Installation:**
```bash
# From staff/ directory
pnpm add @tanstack/vue-table

# Add shadcn-vue components
pnpm dlx shadcn-vue@latest add table badge
```

## Architecture Patterns

### Recommended Project Structure
```
staff/app/
├── components/
│   ├── ui/
│   │   ├── table/           # shadcn-vue Table (add via CLI)
│   │   └── badge/           # shadcn-vue Badge (add via CLI)
│   └── dashboard/
│       ├── DataTable.vue    # Generic data table wrapper
│       ├── columns.ts       # Column definitions for pickup requests
│       └── StatusBadge.vue  # Reusable status indicator
├── composables/
│   └── usePickupRequests.ts # Data fetching + refresh logic
├── lib/
│   └── utils.ts             # Add valueUpdater function
└── pages/
    └── index.vue            # Dashboard page (update existing)
```

### Pattern 1: TanStack Table with shadcn-vue
**What:** Use useVueTable composable with shadcn-vue Table components
**When to use:** Any data table with sorting, filtering, or pagination needs

**Column Definition Example:**
```typescript
// Source: https://www.shadcn-vue.com/docs/components/data-table
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Flag } from 'lucide-vue-next'

interface PickupRequest {
  id: string
  sales_order_number: string
  company_name: string | null
  status: 'pending' | 'approved' | 'in_queue' | 'completed' | 'cancelled'
  email_flagged: boolean
  assigned_gate_id: string | null
  created_at: string
}

export const columns: ColumnDef<PickupRequest>[] = [
  {
    accessorKey: 'sales_order_number',
    header: 'Order #',
  },
  {
    accessorKey: 'company_name',
    header: 'Company',
    cell: ({ row }) => row.getValue('company_name') || 'N/A',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const variant = status === 'pending' ? 'destructive' : 'secondary'
      return h(Badge, { variant }, () => status)
    },
  },
  {
    accessorKey: 'email_flagged',
    header: 'Flag',
    cell: ({ row }) => {
      if (row.getValue('email_flagged')) {
        return h(Flag, { class: 'h-4 w-4 text-destructive' })
      }
      return null
    },
  },
]
```

### Pattern 2: valueUpdater Utility for TanStack Table
**What:** Bridge function between TanStack's updater pattern and Vue refs
**When to use:** Required for any TanStack Table state management (sorting, filtering, etc.)

**Add to lib/utils.ts:**
```typescript
// Source: https://www.shadcn-vue.com/docs/components/data-table
import type { Updater } from '@tanstack/vue-table'
import type { Ref } from 'vue'

export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value = typeof updaterOrValue === 'function'
    ? updaterOrValue(ref.value)
    : updaterOrValue
}
```

### Pattern 3: Supabase Data Fetching with useAsyncData
**What:** Server-side data fetching that hydrates to client
**When to use:** Initial page load data

```typescript
// Source: https://supabase.nuxtjs.org/composables/usesupabaseclient
const client = useSupabaseClient()

const { data: requests, refresh, pending } = await useAsyncData(
  'pickup-requests',
  async () => {
    const { data, error } = await client
      .from('pickup_requests')
      .select('id, sales_order_number, company_name, status, email_flagged, assigned_gate_id, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
)
```

### Pattern 4: Manual Refresh with Visual Feedback
**What:** Button-triggered data refresh with loading state
**When to use:** MVP approach before implementing realtime

```vue
<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'

const { refresh, pending } = await useAsyncData('pickup-requests', ...)
</script>

<template>
  <Button variant="outline" size="sm" :disabled="pending" @click="refresh">
    <RefreshCw :class="['h-4 w-4 mr-2', { 'animate-spin': pending }]" />
    Refresh
  </Button>
</template>
```

### Pattern 5: Conditional Row Styling
**What:** Visual highlighting for rows needing attention
**When to use:** Pending status or flagged requests

```vue
<TableRow
  v-for="row in table.getRowModel().rows"
  :key="row.id"
  :class="{
    'bg-destructive/10': row.original.status === 'pending' || row.original.email_flagged,
    'hover:bg-muted/50': true
  }"
>
```

### Anti-Patterns to Avoid
- **Fetching in onMounted:** Use useAsyncData for SSR-compatible fetching
- **Mixing client/server sorting:** Be consistent - use client-side sorting for small datasets (<1000 rows)
- **Direct status strings in UI:** Use Badge component for consistent status display
- **Inline column definitions:** Keep in separate columns.ts file for maintainability

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table sorting | Custom sort functions | TanStack Table getSortedRowModel | Handles edge cases, stable sort, multi-column |
| Table filtering | String matching loop | TanStack Table getFilteredRowModel | Built-in filter functions, debouncing |
| Table pagination | Manual slice/offset | TanStack Table getPaginationRowModel | Page size, navigation, row count |
| Status badges | Custom styled divs | shadcn-vue Badge component | Consistent variants, accessible |
| Icon library | SVG imports | lucide-vue-next | Tree-shakable, consistent sizing |
| Data fetching | Manual fetch + state | useAsyncData | SSR, caching, loading states |

**Key insight:** TanStack Table's "headless" approach means all logic is solved - you only style. Attempting to replicate sorting/filtering logic leads to bugs with edge cases (undefined values, stable sort, type coercion).

## Common Pitfalls

### Pitfall 1: Missing valueUpdater Function
**What goes wrong:** TanStack Table state changes don't update Vue refs
**Why it happens:** TanStack uses an updater pattern that can be a value OR function
**How to avoid:** Add valueUpdater to lib/utils.ts before creating DataTable
**Warning signs:** Clicking sort headers does nothing, filters don't apply

### Pitfall 2: Wrong Generic Syntax in Vue SFC
**What goes wrong:** TypeScript errors on generic DataTable component
**Why it happens:** Vue 3.3+ requires specific syntax for generic components
**How to avoid:** Use `<script setup lang="ts" generic="TData, TValue">`
**Warning signs:** "Generic type 'X' requires Y type argument(s)"

### Pitfall 3: Realtime Without Publication
**What goes wrong:** Supabase realtime subscriptions never fire
**Why it happens:** Table not added to supabase_realtime publication
**How to avoid:** Run `ALTER PUBLICATION supabase_realtime ADD TABLE pickup_requests;`
**Warning signs:** Channel connects but no events received

### Pitfall 4: useAsyncData Key Collisions
**What goes wrong:** Data doesn't refresh, stale data displayed
**Why it happens:** Same key used for different queries
**How to avoid:** Use unique, descriptive keys like 'pickup-requests-list'
**Warning signs:** Navigating away and back shows stale data

### Pitfall 5: Inconsistent Status Styling
**What goes wrong:** Status colors/styles inconsistent across app
**Why it happens:** Inline styling instead of centralized Badge variants
**How to avoid:** Create StatusBadge component with status-to-variant mapping
**Warning signs:** Same status looks different in different places

### Pitfall 6: Large Dataset Performance
**What goes wrong:** UI freezes when loading 1000+ rows
**Why it happens:** Rendering all rows without virtualization
**How to avoid:** Add pagination (10-25 rows per page) or virtualization for large sets
**Warning signs:** Scroll lag, initial render delay >500ms

## Code Examples

Verified patterns from official sources:

### Complete DataTable Component
```vue
<!-- Source: https://www.shadcn-vue.com/docs/components/data-table -->
<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef, SortingState } from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { ref } from 'vue'
import { valueUpdater } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}>()

const sorting = ref<SortingState>([])

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  state: {
    get sorting() { return sorting.value },
  },
})
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
          >
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </TableCell>
          </TableRow>
        </template>
        <TableRow v-else>
          <TableCell :colspan="columns.length" class="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
```

### Sortable Column Header
```typescript
// Source: https://www.shadcn-vue.com/docs/components/data-table
import { ArrowUpDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

{
  accessorKey: 'created_at',
  header: ({ column }) => {
    return h(Button, {
      variant: 'ghost',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Created', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })])
  },
  cell: ({ row }) => {
    const date = new Date(row.getValue('created_at'))
    return h('div', {}, date.toLocaleString())
  },
}
```

### Supabase Realtime Setup (Future Enhancement)
```typescript
// Source: https://supabase.com/docs/guides/realtime/postgres-changes
import type { RealtimeChannel } from '@supabase/supabase-js'

const client = useSupabaseClient()
let channel: RealtimeChannel

onMounted(() => {
  channel = client
    .channel('pickup-requests-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'pickup_requests',
      },
      () => refresh()
    )
    .subscribe()
})

onUnmounted(() => {
  client.removeChannel(channel)
})
```

### Status Badge Component
```vue
<script setup lang="ts">
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  status: 'pending' | 'approved' | 'in_queue' | 'completed' | 'cancelled'
}>()

const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'destructive',
  approved: 'default',
  in_queue: 'default',
  completed: 'secondary',
  cancelled: 'outline',
}

const labelMap: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  in_queue: 'In Queue',
  completed: 'Completed',
  cancelled: 'Cancelled',
}
</script>

<template>
  <Badge :variant="variantMap[status]">
    {{ labelMap[status] }}
  </Badge>
</template>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vue 2 options API tables | Vue 3 Composition API + TanStack | 2023 | Use useVueTable composable |
| react-table v7 | TanStack Table v8 | 2022 | API completely different, use v8 patterns |
| Vuetify/Quasar tables | Headless + shadcn-vue | 2024 | More flexibility, smaller bundle |
| Polling for updates | Supabase Realtime | 2023 | Use realtime when mature enough |

**Deprecated/outdated:**
- `@tanstack/vue-table` < v8: API incompatible with current shadcn-vue examples
- `vue-good-table`: Abandoned, use TanStack Table instead
- Manual realtime polling: Supabase Realtime is production-ready

## Open Questions

Things that couldn't be fully resolved:

1. **Supabase Types Generation**
   - What we know: Types can be generated via `supabase gen types typescript`
   - What's unclear: Whether local Supabase needs special handling vs cloud
   - Recommendation: Generate types as first task, verify against local instance

2. **Pagination Strategy**
   - What we know: TanStack supports both client and server-side pagination
   - What's unclear: Expected data volume for pickup_requests table
   - Recommendation: Start with client-side (simpler), switch to server-side if >500 rows typical

3. **Realtime vs Polling Timing**
   - What we know: Requirements say "manual refresh initially, real-time later"
   - What's unclear: When "later" is - same phase or future phase?
   - Recommendation: MVP with manual refresh button, add realtime as optional task

## Sources

### Primary (HIGH confidence)
- [shadcn-vue Data Table](https://www.shadcn-vue.com/docs/components/data-table) - Column definitions, DataTable component, sorting, filtering patterns
- [shadcn-vue Badge](https://www.shadcn-vue.com/docs/components/badge) - Variant options (default, secondary, destructive, outline)
- [TanStack Table Vue Docs](https://tanstack.com/table/v8/docs/framework/vue/vue-table) - useVueTable API, state management
- [Supabase Realtime Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes) - Channel setup, table subscription

### Secondary (MEDIUM confidence)
- [@nuxtjs/supabase](https://supabase.nuxtjs.org/) - useSupabaseClient composable
- [Lucide Icons](https://lucide.dev/icons/) - Flag, CircleAlert, RefreshCw icons
- [TanStack Sorting Guide](https://tanstack.com/table/v8/docs/guide/sorting) - sortUndefined handling, multi-column sort

### Tertiary (LOW confidence)
- WebSearch results on conditional row styling - patterns work but not officially documented

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified in official docs, most already installed
- Architecture: HIGH - Patterns directly from shadcn-vue official examples
- Pitfalls: MEDIUM - Based on official docs + community patterns

**Research date:** 2026-01-29
**Valid until:** 2026-02-28 (30 days - stack is stable)
