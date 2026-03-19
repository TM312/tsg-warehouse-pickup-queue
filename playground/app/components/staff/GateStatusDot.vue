<script setup lang="ts">
import {
  GATE_STATUS_COLORS,
  GATE_STATUS_LABELS,
  type GateOperationalStatus,
} from '@/constants/gate-status'

const props = withDefaults(
  defineProps<{
    status: GateOperationalStatus
    size?: 'sm' | 'md'
  }>(),
  { size: 'md' },
)

const sizeClasses = { sm: 'h-1.5 w-1.5', md: 'h-2 w-2' }
</script>

<template>
  <span
    data-testid="gate-status-dot"
    role="status"
    :aria-label="GATE_STATUS_LABELS[props.status]"
    class="inline-block shrink-0 rounded-full"
    :class="[GATE_STATUS_COLORS[props.status], sizeClasses[props.size]]"
  />
</template>
