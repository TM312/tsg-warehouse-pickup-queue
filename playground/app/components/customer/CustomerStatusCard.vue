<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { PICKUP_STATUS, STATUS_LABELS } from '@/constants/status'
import { STATUS_VARIANT } from '@/constants/status-ui'
import { ANIMATION } from '@/constants/animations'
import { HIGHLIGHT_TARGET } from '@/constants/highlights'
import { useCrossPanelHighlight } from '@/composables/useCrossPanelHighlight'
import type { PickupRequest } from '@/types/pickup-request'

const crossfadeMs = `${ANIMATION.STATUS_CROSSFADE_MS}ms`

const { isHighlighted } = useCrossPanelHighlight()
const highlighted = computed(() => isHighlighted(HIGHLIGHT_TARGET.CUSTOMER_STATUS))

defineProps<{
  request: PickupRequest
}>()
</script>

<template>
  <div :class="['flex flex-col gap-4 p-4', { 'animate-cross-panel-highlight': highlighted }]" data-testid="customer-status-card" data-walkthrough="customer-status">
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium">{{ request.sales_order_number }}</p>
      <UiBadge
        :variant="STATUS_VARIANT[request.status].variant"
        :class="STATUS_VARIANT[request.status].class"
      >
        {{ STATUS_LABELS[request.status] }}
      </UiBadge>
    </div>

    <Transition mode="out-in" name="status-fade">
      <div :key="request.status">
        <!-- Pending -->
        <div v-if="request.status === PICKUP_STATUS.PENDING" class="flex flex-col items-center gap-3 py-6">
          <Loader2 class="size-8 animate-spin text-muted-foreground" />
          <p class="text-sm text-muted-foreground">Waiting for approval...</p>
        </div>

        <!-- Approved -->
        <div v-else-if="request.status === PICKUP_STATUS.APPROVED" class="flex flex-col items-center gap-3 py-6">
          <p class="text-sm text-muted-foreground">Approved! Waiting for gate assignment...</p>
        </div>

        <!-- In Queue -->
        <CustomerQueuePosition v-else-if="request.status === PICKUP_STATUS.IN_QUEUE" :request="request" />

        <!-- Processing -->
        <div v-else-if="request.status === PICKUP_STATUS.PROCESSING" class="flex flex-col items-center gap-3 py-6">
          <Loader2 class="size-8 animate-spin text-amber-500" />
          <p class="text-sm font-medium">Your order is being loaded!</p>
        </div>

        <!-- Completed -->
        <CustomerCompletedState v-else-if="request.status === PICKUP_STATUS.COMPLETED" :request="request" />

        <!-- Cancelled -->
        <div v-else-if="request.status === PICKUP_STATUS.CANCELLED" class="flex flex-col items-center gap-3 py-6">
          <p class="text-sm text-destructive">Request cancelled</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.status-fade-enter-active,
.status-fade-leave-active {
  transition: opacity v-bind(crossfadeMs) ease;
}
.status-fade-enter-from,
.status-fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .status-fade-enter-active,
  .status-fade-leave-active {
    transition: none;
  }
}
</style>
