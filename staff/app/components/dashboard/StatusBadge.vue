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
