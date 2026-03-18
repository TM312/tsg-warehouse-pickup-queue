<script setup lang="ts">
import type { PickupStatus } from '@/constants/status'
import { STATUS_LABELS } from '@/constants/status'
import { STATUS_VARIANT } from '@/constants/status-ui'
import { Badge } from '@/components/ui/badge'

defineProps<{
  status: PickupStatus
}>()
</script>

<template>
  <Badge
    :variant="STATUS_VARIANT[status].variant"
    :class="STATUS_VARIANT[status].class"
    data-testid="staff-status-badge"
  >
    {{ STATUS_LABELS[status] }}
  </Badge>
</template>
