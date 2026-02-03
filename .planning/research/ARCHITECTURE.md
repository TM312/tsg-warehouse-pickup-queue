# Architecture Research: Unified Table Component (v2.2)

**Domain:** Unified table component supporting both sorting and drag-and-drop
**Researched:** 2026-02-03
**Confidence:** HIGH (verified with existing codebase, VueUse docs, TanStack Table docs)

## Executive Summary

The project currently uses two separate components for displaying queue data:
1. **RequestsTable.vue** - TanStack Table with sortable columns (All Requests tab)
2. **GateQueueList.vue** - VueUse useSortable with drag-and-drop (Gate tabs)

This research recommends a **mode-based unified component** architecture that:
- Keeps TanStack Table as the core for both views
- Adds drag-and-drop capability via useSortable on the tbody element
- Uses a `mode` prop to switch between "sort" and "drag" behaviors
- Maintains existing Pinia store integration patterns

## Current Architecture Analysis

### RequestsTable.vue (Sorting)

```
Location: staff/app/components/dashboard/RequestsTable.vue
Dependencies: @tanstack/vue-table
Features:
  - Column definitions with sortable headers
  - FlexRender for cell rendering
  - SortingState management
  - Row click events
```

**Key characteristics:**
- Generic component `<TData, TValue>` supporting any data type
- Receives columns and data as props
- Uses shadcn-vue Table primitives (Table, TableHeader, TableBody, etc.)
- Sorting state managed internally via `ref<SortingState>`

### GateQueueList.vue (Drag-and-Drop)

```
Location: staff/app/components/dashboard/GateQueueList.vue
Dependencies: @vueuse/integrations/useSortable, sortablejs
Features:
  - Drag handle with GripVertical icon
  - Optimistic reorder with rollback support
  - Priority badge toggle
  - Complete button per row
```

**Key characteristics:**
- Uses div-based list layout (not HTML table)
- Local state (`localItems`) with watch for external updates
- Emits `reorder` event with new ID order
- Prevents click events on buttons/handles

### Data Flow Differences

| Aspect | RequestsTable | GateQueueList |
|--------|---------------|---------------|
| Data source | `filteredRequests` (all statuses) | `gate.queue` (IN_QUEUE only) |
| Row structure | TanStack Row with cells | Simple div with flex layout |
| Actions | Via column callbacks | Inline buttons |
| State updates | No local state | Local copy with sync |

## Recommended Architecture

### Approach: Mode-Based Unified Component

Create a single `QueueTable.vue` component that switches behavior based on a `mode` prop.

```
┌────────────────────────────────────────────────────────────────┐
│                        QueueTable.vue                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Props:                                                   │  │
│  │    - columns: ColumnDef[]                                 │  │
│  │    - data: PickupRequest[]                                │  │
│  │    - mode: 'sort' | 'drag'                                │  │
│  │    - gateId?: string (required when mode='drag')          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────┐       ┌─────────────────┐                 │
│  │  mode='sort'    │       │  mode='drag'    │                 │
│  │                 │       │                 │                 │
│  │ - Sort headers  │       │ - Drag handle   │                 │
│  │ - No drag       │       │ - No sort       │                 │
│  │ - Full columns  │       │ - Subset cols   │                 │
│  └─────────────────┘       └─────────────────┘                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Shared:                                                  │  │
│  │    - TanStack Table core                                  │  │
│  │    - shadcn-vue Table primitives                          │  │
│  │    - Row click handling                                   │  │
│  │    - Empty state                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
staff/app/components/
├── dashboard/
│   ├── QueueTable.vue              # NEW: Unified table component
│   ├── queueTableColumns.ts        # NEW: Column definitions (renamed from requestsTableColumns.ts)
│   ├── RequestsTable.vue           # DEPRECATED: Keep temporarily for backwards compat
│   ├── GateQueueList.vue           # DEPRECATED: Keep temporarily for backwards compat
│   ├── StatusBadge.vue             # KEEP: Used by both modes
│   ├── PriorityButton.vue          # KEEP: Used by drag mode
│   ├── GateSelect.vue              # KEEP: Used by sort mode
│   └── RequestActionButtons.vue    # KEEP: Used by sort mode
└── ui/
    └── table/                      # KEEP: shadcn-vue primitives
```

### Implementation Strategy

#### Step 1: Create Column Definitions for Both Modes

```typescript
// queueTableColumns.ts

// Columns for "All Requests" view (sort mode)
export function createSortColumns(callbacks: SortColumnCallbacks): ColumnDef<PickupRequest>[] {
  return [
    {
      accessorKey: 'sales_order_number',
      header: ({ column }) => h(SortableHeader, { column, label: 'Order #' }),
    },
    { accessorKey: 'company_name', header: 'Company' },
    { accessorKey: 'status', header: 'Status', cell: StatusBadgeCell },
    { id: 'gate', header: 'Gate', cell: GateSelectCell },
    { id: 'position', header: 'Position' },
    { accessorKey: 'created_at', header: SortableCreatedHeader },
    { id: 'actions', header: '', cell: ActionButtonsCell },
  ]
}

// Columns for "Gate Queue" view (drag mode)
export function createDragColumns(callbacks: DragColumnCallbacks): ColumnDef<QueueItem>[] {
  return [
    { id: 'drag-handle', header: '', cell: DragHandleCell, size: 40 },
    { accessorKey: 'sales_order_number', header: 'Order #' },
    { accessorKey: 'company_name', header: 'Company' },
    { id: 'priority', header: '', cell: PriorityCell },
    { id: 'actions', header: '', cell: CompleteButtonCell },
  ]
}
```

#### Step 2: QueueTable Component Structure

```vue
<!-- QueueTable.vue -->
<script setup lang="ts" generic="TData extends { id: string }, TValue">
import { shallowRef, watch, useTemplateRef, nextTick, computed } from 'vue'
import { useSortable, moveArrayElement } from '@vueuse/integrations/useSortable'
import type { SortableEvent } from 'sortablejs'
import type { ColumnDef, SortingState } from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  mode: 'sort' | 'drag'
  gateId?: string  // Required when mode='drag'
}>()

const emit = defineEmits<{
  'row-click': [row: TData]
  'reorder': [requestIds: string[]]
}>()

// === Sorting State (only used in sort mode) ===
const sorting = ref<SortingState>([])

// === Drag State (only used in drag mode) ===
const tbodyRef = useTemplateRef('tbodyRef')
const localData = shallowRef<TData[]>([...props.data])

watch(() => props.data, (newData) => {
  localData.value = [...newData]
}, { deep: true })

// === TanStack Table Instance ===
const table = useVueTable({
  get data() {
    return props.mode === 'drag' ? localData.value : props.data
  },
  get columns() { return props.columns },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: props.mode === 'sort' ? getSortedRowModel() : undefined,
  onSortingChange: props.mode === 'sort'
    ? (updater) => valueUpdater(updater, sorting)
    : undefined,
  state: {
    get sorting() { return props.mode === 'sort' ? sorting.value : [] },
  },
})

// === Drag-and-Drop Setup ===
if (props.mode === 'drag') {
  useSortable(tbodyRef, localData, {
    animation: 150,
    handle: '[data-drag-handle]',
    ghostClass: 'opacity-50',
    dragClass: 'bg-accent',
    onUpdate: async (e: SortableEvent) => {
      moveArrayElement(localData, e.oldIndex!, e.newIndex!, e)
      await nextTick()
      emit('reorder', localData.value.map(item => item.id))
    }
  })
}

function handleRowClick(e: MouseEvent, row: TData) {
  const target = e.target as HTMLElement
  if (target.closest('button') || target.closest('[data-drag-handle]')) {
    return
  }
  emit('row-click', row)
}
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
      <TableBody ref="tbodyRef">
        <template v-if="table.getRowModel().rows?.length">
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.original.id"
            :data-row-id="row.original.id"
            class="cursor-pointer hover:bg-muted/50"
            @click="(e) => handleRowClick(e, row.original)"
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
            No items in queue.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
```

### Props and Events API

```typescript
// QueueTable Props
interface QueueTableProps<TData, TValue> {
  /** Column definitions from TanStack Table */
  columns: ColumnDef<TData, TValue>[]

  /** Data array - each item must have an 'id' field */
  data: TData[]

  /**
   * Display mode:
   * - 'sort': Sortable columns, no drag-and-drop
   * - 'drag': Drag-and-drop rows, no column sorting
   */
  mode: 'sort' | 'drag'

  /** Gate ID for drag mode - required for reorder RPC */
  gateId?: string
}

// QueueTable Events
interface QueueTableEvents<TData> {
  /** Emitted when a row is clicked (not on buttons or drag handle) */
  'row-click': [row: TData]

  /** Emitted after drag reorder with new ID order (drag mode only) */
  'reorder': [requestIds: string[]]
}
```

### Integration with Pinia Stores

The component remains stateless regarding data persistence. Parent components (index.vue) handle:

1. **Data fetching:** Via `useQueueActions().fetchRequests()`
2. **Reorder persistence:** Via `useQueueActions().reorderQueue(gateId, ids)`
3. **Store updates:** Via `queueStore.updateRequest()` after actions

```vue
<!-- index.vue usage example -->
<script setup>
const { filteredRequests, gatesWithQueues } = useDashboardData(showCompleted, showOnlyUnassigned)
const { reorderQueue } = useQueueActions()

const sortColumns = computed(() => createSortColumns({ /* callbacks */ }))
const dragColumns = computed(() => createDragColumns({ /* callbacks */ }))

async function handleReorder(gateId: string, ids: string[]) {
  await reorderQueue(gateId, ids)
  await refresh()
}
</script>

<template>
  <Tabs default-value="all">
    <TabsContent value="all">
      <QueueTable
        :columns="sortColumns"
        :data="filteredRequests"
        mode="sort"
        @row-click="handleRowClick"
      />
    </TabsContent>

    <TabsContent v-for="gate in gatesWithQueues" :key="gate.id" :value="`gate-${gate.id}`">
      <QueueTable
        :columns="dragColumns"
        :data="gate.queue"
        mode="drag"
        :gate-id="gate.id"
        @row-click="handleQueueRowClick"
        @reorder="(ids) => handleReorder(gate.id, ids)"
      />
    </TabsContent>
  </Tabs>
</template>
```

## Technical Considerations

### Why Not Combine Sort + Drag?

Combining column sorting with row drag-and-drop creates UX confusion:
- If user sorts by "Created At", then drags rows, what happens?
- Does manual position override sort? Does sort reset position?
- The "All Requests" view shows multiple gates - drag position is meaningless

**Recommendation:** Keep modes mutually exclusive. Sorting for overview, dragging for per-gate queue management.

### useSortable with TanStack Table tbody

The key insight from research: useSortable needs a reference to the container element (tbody), not the individual items. TanStack Table renders standard HTML `<tbody>`, so we can:

1. Get a template ref to TableBody
2. Pass it to useSortable
3. Use data attributes for row identification

**Critical:** useSortable modifies DOM directly during drag. TanStack Table's row model must use `row.original.id` as key to maintain sync.

### Performance with Large Lists

| List Size | Concern | Mitigation |
|-----------|---------|------------|
| < 50 rows | None | Standard implementation works |
| 50-200 rows | Drag animation smoothness | SortableJS handles this well |
| 200+ rows | Consider virtualization | TanStack Virtual + custom drag (out of scope for v2.2) |

The current use case (warehouse queues) unlikely exceeds 50 items per gate.

### Drag Handle Implementation

```typescript
// DragHandle cell component
const DragHandleCell = ({ row }) => h('div', {
  'data-drag-handle': true,
  class: 'cursor-grab active:cursor-grabbing'
}, h(GripVertical, { class: 'h-5 w-5 text-muted-foreground' }))
```

The `data-drag-handle` attribute is targeted by useSortable's `handle` option.

## File Locations

### New Files

| File | Purpose |
|------|---------|
| `staff/app/components/dashboard/QueueTable.vue` | Unified table component |
| `staff/app/components/dashboard/queueTableColumns.ts` | Column factories for both modes |
| `staff/app/components/dashboard/cells/DragHandleCell.vue` | Drag handle cell component |
| `staff/app/components/dashboard/cells/SortableHeader.vue` | Sortable column header |

### Modified Files

| File | Changes |
|------|---------|
| `staff/app/pages/index.vue` | Replace RequestsTable/GateQueueList with QueueTable |
| `staff/app/components/dashboard/requestsTableColumns.ts` | Deprecate, migrate to queueTableColumns.ts |

### Deprecated Files (Keep for Transition)

| File | Status |
|------|--------|
| `staff/app/components/dashboard/RequestsTable.vue` | Deprecated, remove after migration |
| `staff/app/components/dashboard/GateQueueList.vue` | Deprecated, remove after migration |

## Migration Strategy

### Phase 1: Build QueueTable

1. Create QueueTable.vue with sort mode only
2. Create queueTableColumns.ts with createSortColumns()
3. Test in parallel with existing RequestsTable

### Phase 2: Add Drag Mode

1. Add drag mode to QueueTable
2. Create createDragColumns()
3. Test in parallel with existing GateQueueList

### Phase 3: Integrate

1. Update index.vue to use QueueTable for All Requests tab
2. Update index.vue to use QueueTable for Gate tabs
3. Verify all functionality preserved

### Phase 4: Cleanup

1. Remove RequestsTable.vue
2. Remove GateQueueList.vue
3. Remove requestsTableColumns.ts

## Anti-Patterns to Avoid

### Anti-Pattern 1: Mixing Drag State in Pinia Store

**Problem:** Storing `localItems` in Pinia during drag operations
**Why bad:** Creates race conditions with realtime updates, defeats optimistic UI
**Solution:** Keep drag state local to component, emit final order to parent

### Anti-Pattern 2: Conditional Column Rendering

**Problem:** Single column array with `v-if` inside cells
**Why bad:** TanStack Table optimizes based on column definitions; runtime conditionals break memoization
**Solution:** Separate column factories per mode

### Anti-Pattern 3: Re-initializing useSortable on Data Change

**Problem:** Calling `useSortable()` in a watcher or computed
**Why bad:** Creates multiple Sortable instances, memory leaks, erratic behavior
**Solution:** Initialize once with reactive ref, use `shallowRef` for data array

## Sources

- [VueUse useSortable Documentation](https://vueuse.org/integrations/useSortable/) - Official API reference
- [TanStack Table Vue Documentation](https://tanstack.com/table/v8/docs/framework/vue/vue-table) - Vue adapter guide
- [TanStack Table Row DnD Example (React)](https://tanstack.com/table/v8/docs/framework/react/examples/row-dnd) - Implementation patterns
- [SortableJS Vue.Draggable Table Example](https://github.com/SortableJS/Vue.Draggable/blob/master/example/components/table-example.vue) - tbody wrapping technique
- [shadcn-vue Data Table](https://www.shadcn-vue.com/docs/components/data-table) - shadcn table patterns
- Codebase analysis: RequestsTable.vue, GateQueueList.vue, useQueueActions.ts, useDashboardData.ts

---
*Architecture research for: v2.2 Unified Table Component*
*Researched: 2026-02-03*
