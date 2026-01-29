<script setup lang="ts">
import { shallowRef, watch, useTemplateRef, nextTick } from 'vue'
import { useSortable, moveArrayElement } from '@vueuse/integrations/useSortable'
import type { SortableEvent } from 'sortablejs'
import { GripVertical } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import PriorityButton from './PriorityButton.vue'

interface QueueItem {
  id: string
  sales_order_number: string
  company_name: string | null
  queue_position: number
  is_priority: boolean
}

const props = defineProps<{
  gateId: string
  items: QueueItem[]
}>()

const emit = defineEmits<{
  reorder: [requestIds: string[]]
  'set-priority': [requestId: string]
}>()

const listRef = useTemplateRef('listRef')
const localItems = shallowRef<QueueItem[]>([...props.items])

// Track previous order for rollback support by caller
let previousOrder: string[] = []

// Watch for external updates (e.g., after server sync or other staff changes)
watch(() => props.items, (newItems) => {
  localItems.value = [...newItems]
}, { deep: true })

useSortable(listRef, localItems, {
  animation: 150,
  handle: '.drag-handle',
  ghostClass: 'opacity-50',
  dragClass: 'bg-accent',
  onStart: () => {
    // Capture state before drag for potential rollback
    previousOrder = localItems.value.map(i => i.id)
  },
  onUpdate: async (e: SortableEvent) => {
    // Optimistic update: moveArrayElement updates localItems in place
    moveArrayElement(localItems, e.oldIndex!, e.newIndex!, e)
    await nextTick()

    // Emit new order for server sync
    const newOrder = localItems.value.map(item => item.id)
    emit('reorder', newOrder)
  }
})
</script>

<template>
  <div v-if="localItems.length === 0" class="text-center py-8 text-muted-foreground">
    No customers in queue
  </div>
  <div v-else ref="listRef" class="space-y-2">
    <div
      v-for="item in localItems"
      :key="item.id"
      class="flex items-center gap-3 p-3 border rounded-lg bg-background"
    >
      <div class="drag-handle cursor-grab active:cursor-grabbing">
        <GripVertical class="h-5 w-5 text-muted-foreground" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-medium truncate">{{ item.sales_order_number }}</div>
        <div v-if="item.company_name" class="text-sm text-muted-foreground truncate">
          {{ item.company_name }}
        </div>
      </div>
      <Badge v-if="item.is_priority" variant="destructive" class="shrink-0">
        Priority
      </Badge>
      <PriorityButton
        v-if="!item.is_priority"
        @click="emit('set-priority', item.id)"
      />
    </div>
  </div>
</template>
