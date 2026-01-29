<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { computed } from 'vue'

const props = defineProps<{
  status: 'pending' | 'approved' | 'in_queue' | 'completed' | 'cancelled'
}>()

const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'default',  // Will be styled blue via class
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

// Blue styling for pending status
const customClass = computed(() => {
  if (props.status === 'pending') {
    return 'bg-blue-500 hover:bg-blue-600 text-white'
  }
  return ''
})
</script>

<template>
  <Badge :variant="variantMap[status]" :class="customClass">
    {{ labelMap[status] }}
  </Badge>
</template>
