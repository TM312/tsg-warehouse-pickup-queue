<script setup lang="ts" generic="TData extends QueueItem, TValue">
import type { ColumnDef, SortingState } from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { ref, shallowRef, watch, useTemplateRef, nextTick } from 'vue'
import { useSortable, moveArrayElement } from '@vueuse/integrations/useSortable'
import type { SortableEvent } from 'sortablejs'
import { GripVertical, Check, X, Flag } from 'lucide-vue-next'
import { valueUpdater } from '@/lib/utils'
import { useKeyboardReorder } from '@/composables/useKeyboardReorder'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PriorityButton from './PriorityButton.vue'
import StatusBadge from './StatusBadge.vue'
import type { QueueItem } from './queueTableColumns'

const props = defineProps<{
  mode: 'sort' | 'drag'
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  gateId?: string
}>()

const emit = defineEmits<{
  'row-click': [row: TData]
  'reorder': [requestIds: string[]]
  'set-priority': [requestId: string]
  'clear-priority': [requestId: string]
  'complete': [requestId: string]
}>()

// ============================================
// SORT MODE - TanStack Table
// ============================================

// Default sort: created_at descending (newest first)
const sorting = ref<SortingState>([
  { id: 'created_at', desc: true }
])

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

// ============================================
// DRAG MODE - useSortable
// ============================================

const listRef = useTemplateRef('listRef')
const localItems = shallowRef<TData[]>([...props.data])

// Watch for external updates (e.g., after server sync or other staff changes)
watch(() => props.data, (newItems) => {
  localItems.value = [...newItems]
}, { deep: true })

useSortable(listRef, localItems, {
  animation: 150,
  handle: '.drag-handle',
  ghostClass: 'opacity-50',
  dragClass: 'bg-accent',
  onUpdate: async (e: SortableEvent) => {
    // Optimistic update: moveArrayElement updates localItems in place
    moveArrayElement(localItems, e.oldIndex!, e.newIndex!, e)
    await nextTick()

    // Emit new order for server sync
    const newOrder = localItems.value.map(item => item.id)
    emit('reorder', newOrder)
  }
})

// ============================================
// KEYBOARD ACCESSIBILITY - Drag Mode
// ============================================

// Store original order for Escape cancellation
const originalOrder = ref<string[]>([])

const {
  reorderState,
  grabbedIndex,
  announcement,
  handleKeydown: keyboardHandler
} = useKeyboardReorder({
  items: localItems,
  onReorder: (newOrder) => emit('reorder', newOrder)
})

function handleRowKeydown(e: KeyboardEvent, index: number) {
  if (props.mode !== 'drag') return

  // Capture original order when starting keyboard reorder
  if (reorderState.value === 'idle' && e.key === ' ') {
    originalOrder.value = localItems.value.map(i => i.id)
  }

  const newIndex = keyboardHandler(e, index)

  // Handle Escape - restore original order
  if (e.key === 'Escape' && originalOrder.value.length > 0) {
    // Restore original order by matching IDs
    localItems.value = originalOrder.value.map(id =>
      localItems.value.find(item => item.id === id)!
    )
    originalOrder.value = []
  }

  // Refocus moved row
  if (newIndex !== null && newIndex !== index) {
    nextTick(() => {
      const rows = listRef.value?.querySelectorAll('[tabindex="0"]')
      if (rows && rows[newIndex]) {
        (rows[newIndex] as HTMLElement).focus()
      }
    })
  }
}

function handleRowClick(e: MouseEvent, item: TData) {
  // Don't open detail if clicking on buttons or drag handle
  const target = e.target as HTMLElement
  if (target.closest('button') || target.closest('.drag-handle')) {
    return
  }
  emit('row-click', item)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString()
}
</script>

<template>
  <div class="rounded-md border">
    <!-- Sort mode: standard table with TanStack -->
    <Table v-if="mode === 'sort'">
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
            class="cursor-pointer hover:bg-muted/50"
            @click="emit('row-click', row.original)"
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
            No pickup requests.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <!-- Drag mode: table structure with drag handles and action buttons -->
    <div v-else>
      <!-- Screen reader announcements for keyboard reordering -->
      <div
        aria-live="assertive"
        aria-atomic="true"
        class="sr-only"
      >
        {{ announcement }}
      </div>

      <div v-if="localItems.length === 0" class="text-center py-8 text-muted-foreground">
        No customers in queue
      </div>
      <template v-else>
        <!-- Column headers (visible but not clickable in drag mode) -->
        <div class="flex items-center gap-3 px-3 py-2 border-b bg-muted/50 text-sm font-medium text-muted-foreground">
          <div class="w-6"></div> <!-- Space for drag handle -->
          <div class="flex-1 grid grid-cols-[minmax(100px,1fr)_minmax(100px,1fr)_100px_60px_100px] gap-4 items-center">
            <div>Order #</div>
            <div>Company</div>
            <div>Status</div>
            <div>Flag</div>
            <div>Position</div>
          </div>
          <div class="w-[180px]">Actions</div>
        </div>

        <!-- Rows with drag handles - keyboard accessible -->
        <div
          ref="listRef"
          role="listbox"
          aria-label="Reorderable queue"
        >
          <div
            v-for="(item, index) in localItems"
            :key="item.id"
            tabindex="0"
            role="option"
            :aria-selected="grabbedIndex === index"
            :class="[
              'flex items-center gap-3 p-3 border-b cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
              grabbedIndex === index ? 'bg-accent' : 'hover:bg-muted/50'
            ]"
            @click="(e) => handleRowClick(e, item)"
            @keydown="(e) => handleRowKeydown(e, index)"
          >
            <div class="drag-handle cursor-grab active:cursor-grabbing">
              <GripVertical class="h-5 w-5 text-muted-foreground" />
            </div>
            <div class="flex-1 grid grid-cols-[minmax(100px,1fr)_minmax(100px,1fr)_100px_60px_100px] gap-4 items-center">
              <div class="font-medium truncate">{{ item.sales_order_number }}</div>
              <div class="text-sm text-muted-foreground truncate">{{ item.company_name || 'N/A' }}</div>
              <StatusBadge :status="item.status" :processing-started-at="item.processing_started_at" />
              <Flag v-if="item.email_flagged" class="h-4 w-4 text-destructive" />
              <div v-else class="text-muted-foreground">-</div>
              <div>#{{ item.queue_position }}</div>
            </div>
            <!-- Action buttons (from GateQueueList) -->
            <div class="flex items-center gap-2 w-[180px] justify-end">
              <Badge
                v-if="item.is_priority"
                variant="destructive"
                class="shrink-0 cursor-pointer hover:bg-destructive/80"
                title="Click to remove priority"
                @click.stop="emit('clear-priority', item.id)"
              >
                Priority
                <X class="h-3 w-3 ml-1" />
              </Badge>
              <PriorityButton
                v-if="!item.is_priority"
                @click.stop="emit('set-priority', item.id)"
              />
              <Button
                variant="outline"
                size="sm"
                title="Mark complete"
                @click.stop="emit('complete', item.id)"
              >
                <Check class="h-4 w-4 mr-1" />
                Complete
              </Button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
