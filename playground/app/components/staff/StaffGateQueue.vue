<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import Sortable from 'sortablejs'
import { Star } from 'lucide-vue-next'
import { PICKUP_STATUS } from '@/constants/status'
import { ANIMATION, cssMs } from '@/constants/animations'
import { useQueueStore } from '@/stores/queue'
import { useSimulationActions } from '@/composables/useSimulationActions'
import { useProcessingProgress } from '@/composables/useProcessingProgress'
import { Button } from '@/components/ui/button'
import StaffStatusBadge from './StaffStatusBadge.vue'
import StaffRequestActions from './StaffRequestActions.vue'
import ProcessingProgressBar from './ProcessingProgressBar.vue'

const props = defineProps<{
  gateId: string
}>()

const queue = useQueueStore()
const actions = useSimulationActions()
const enterMs = cssMs(ANIMATION.QUEUE_ITEM_ENTER_MS)
const leaveMs = cssMs(ANIMATION.QUEUE_ITEM_LEAVE_MS)
const listRef = ref<InstanceType<typeof TransitionGroup> | null>(null)
let sortableInstance: Sortable | null = null

const processingItem = computed(() =>
  queue.processingItems.find(r => r.gate_id === props.gateId),
)

const queueItems = computed(() =>
  queue.requests
    .filter(r => r.gate_id === props.gateId && r.status === PICKUP_STATUS.IN_QUEUE)
    .sort((a, b) => (a.queue_position ?? 0) - (b.queue_position ?? 0)),
)

const { progress: processingProgress } = useProcessingProgress(processingItem)

onMounted(() => {
  const el = listRef.value?.$el as HTMLElement | undefined
  if (!el) return
  sortableInstance = Sortable.create(el, {
    animation: ANIMATION.SORTABLE_REORDER_MS,
    onEnd: () => {
      const container = listRef.value?.$el as HTMLElement | undefined
      if (!container) return
      const children = container.querySelectorAll('[data-request-id]')
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
      <ProcessingProgressBar :progress="processingProgress" class="mt-2" />
    </div>

    <!-- Queue list -->
    <div v-if="queueItems.length === 0 && !processingItem" class="py-8 text-center text-sm text-muted-foreground">
      No items in this gate's queue
    </div>

    <TransitionGroup ref="listRef" tag="div" name="queue-item" class="space-y-1">
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
    </TransitionGroup>
  </div>
</template>

<style scoped>
.queue-item-enter-active {
  transition:
    opacity v-bind(enterMs) ease,
    transform v-bind(enterMs) ease;
}
.queue-item-leave-active {
  transition: opacity v-bind(leaveMs) ease;
  position: absolute;
  width: 100%;
}
.queue-item-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.queue-item-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .queue-item-enter-active,
  .queue-item-leave-active {
    transition: none;
  }
}
</style>
