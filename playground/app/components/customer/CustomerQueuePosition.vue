<script setup lang="ts">
import { computed } from 'vue'
import { useGatesStore } from '@/stores/gates'
import { useQueueStore } from '@/stores/queue'
import { useWaitTimeEstimate } from '@/composables/useWaitTimeEstimate'
import { formatDurationMs } from '@/utils/formatDuration'
import type { PickupRequest } from '@/types/pickup-request'

const props = defineProps<{
  request: PickupRequest
}>()

const gates = useGatesStore()
const queue = useQueueStore()

const gate = computed(() =>
  props.request.gate_id ? gates.gateById(props.request.gate_id) : undefined,
)

const waitEstimate = useWaitTimeEstimate(
  computed(() => props.request.queue_position),
  computed(() => queue.completedItems),
)

const waitDisplay = computed(() => {
  const est = waitEstimate.value
  if (!est) return 'Calculating...'
  if (est.min === 0 && est.max === 0) return 'You\'re next!'
  return `~${formatDurationMs(est.min)} – ${formatDurationMs(est.max)}`
})
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-4" data-testid="customer-queue-position">
    <div v-if="gate" class="text-center">
      <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Gate</p>
      <p class="text-4xl font-bold">{{ gate.gate_number }}</p>
    </div>

    <div
      v-if="request.queue_position !== null"
      class="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700"
    >
      <span class="relative flex size-2">
        <span class="absolute inline-flex size-full animate-ping rounded-full bg-blue-400 opacity-75" />
        <span class="relative inline-flex size-2 rounded-full bg-blue-500" />
      </span>
      Position {{ request.queue_position }}
    </div>

    <p class="text-sm text-muted-foreground">{{ waitDisplay }}</p>
  </div>
</template>
