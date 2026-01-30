<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import type { PickupStatus } from '#shared/types/pickup-request'
import { PICKUP_STATUS } from '#shared/types/pickup-request'

const props = defineProps<{
  status: PickupStatus
  processingStartedAt?: string | null
}>()

const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'default',  // Will be styled blue via class
  approved: 'default',
  in_queue: 'default',
  processing: 'default',
  completed: 'secondary',
  cancelled: 'outline',
}

const labelMap: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  in_queue: 'In Queue',
  processing: 'Processing',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

// Elapsed time calculation for processing status
const elapsed = ref('')

function calculateElapsed() {
  if (props.status === PICKUP_STATUS.PROCESSING && props.processingStartedAt) {
    const start = new Date(props.processingStartedAt).getTime()
    const now = Date.now()
    const minutes = Math.floor((now - start) / 60000)

    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      elapsed.value = `${hours}h ${remainingMinutes}m`
    } else {
      elapsed.value = `${minutes}m`
    }
  } else {
    elapsed.value = ''
  }
}

const { pause, resume } = useIntervalFn(calculateElapsed, 60000, {
  immediate: true,
  immediateCallback: true
})

// Pause/resume timer based on status
watch(() => props.status, (status) => {
  if (status === PICKUP_STATUS.PROCESSING) {
    calculateElapsed() // Recalculate immediately when status changes
    resume()
  } else {
    pause()
  }
}, { immediate: true })

// Blue styling for pending status, amber for processing
const customClass = computed(() => {
  if (props.status === PICKUP_STATUS.PENDING) {
    return 'bg-blue-500 hover:bg-blue-600 text-white'
  }
  if (props.status === PICKUP_STATUS.PROCESSING) {
    return 'bg-amber-500 hover:bg-amber-600 text-white'
  }
  return ''
})

// Display label with elapsed time for processing
const displayLabel = computed(() => {
  if (props.status === PICKUP_STATUS.PROCESSING && elapsed.value) {
    return `Processing (${elapsed.value})`
  }
  return labelMap[props.status]
})
</script>

<template>
  <Badge :variant="variantMap[status]" :class="customClass">
    <Loader2 v-if="status === PICKUP_STATUS.PROCESSING" class="h-3 w-3 animate-spin mr-1" />
    {{ displayLabel }}
  </Badge>
</template>
