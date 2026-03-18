<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import Sortable from 'sortablejs'
import { Star } from 'lucide-vue-next'
import { PICKUP_STATUS } from '@/constants/status'
import { useQueueStore } from '@/stores/queue'
import { useSimulationActions } from '@/composables/useSimulationActions'
import { Button } from '@/components/ui/button'
import StaffStatusBadge from './StaffStatusBadge.vue'
import StaffRequestActions from './StaffRequestActions.vue'

const props = defineProps<{
  gateId: string
}>()

const queue = useQueueStore()
const actions = useSimulationActions()
const listRef = ref<HTMLElement | null>(null)
let sortableInstance: Sortable | null = null

const processingItem = computed(() =>
  queue.processingItems.find(r => r.gate_id === props.gateId),
)

const queueItems = computed(() =>
  queue.requests
    .filter(r => r.gate_id === props.gateId && r.status === PICKUP_STATUS.IN_QUEUE)
    .sort((a, b) => (a.queue_position ?? 0) - (b.queue_position ?? 0)),
)

onMounted(() => {
  if (!listRef.value) return
  sortableInstance = Sortable.create(listRef.value, {
    animation: 150,
    onEnd: () => {
      if (!listRef.value) return
      const children = listRef.value.querySelectorAll('[data-request-id]')
      const orderedIds = Array.from(children).map(el => el.getAttribute('data-request-id')!)
      actions.reorderQueue(props.gateId, orderedIds)
    },
  })
})

onBeforeUnmount(() => {
  sortableInstance?.destroy()
})
</script>

<template>
  <div data-testid="staff-gate-queue" class="space-y-3">
    <!-- Currently processing -->
    <div v-if="processingItem" class="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
      <div class="mb-1 text-xs font-medium text-muted-foreground">Now Processing</div>
      <div class="flex items-center justify-between">
        <div>
          <span class="font-medium">{{ processingItem.sales_order_number }}</span>
          <span class="ml-2 text-sm text-muted-foreground">{{ processingItem.company_name }}</span>
        </div>
        <StaffRequestActions :request="processingItem" />
      </div>
    </div>

    <!-- Queue list -->
    <div v-if="queueItems.length === 0 && !processingItem" class="py-8 text-center text-sm text-muted-foreground">
      No items in this gate's queue
    </div>

    <div ref="listRef" class="space-y-1">
      <div
        v-for="item in queueItems"
        :key="item.id"
        :data-request-id="item.id"
        class="flex cursor-move items-center justify-between rounded-md border bg-card p-3"
      >
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            :class="item.is_priority ? 'text-amber-500' : 'text-muted-foreground'"
            @click="actions.setPriority(item.id, !item.is_priority)"
          >
            <Star :class="`size-4 ${item.is_priority ? 'fill-current' : ''}`" />
          </Button>
          <span class="font-medium">{{ item.sales_order_number }}</span>
          <span class="text-sm text-muted-foreground">{{ item.company_name }}</span>
          <StaffStatusBadge :status="item.status" />
        </div>
        <StaffRequestActions :request="item" />
      </div>
    </div>
  </div>
</template>
