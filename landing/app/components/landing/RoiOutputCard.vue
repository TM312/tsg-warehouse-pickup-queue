<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { RoiOutputFormat } from '@/types/roi'
import { useAnimatedNumber } from '@/composables/useAnimatedNumber'

const props = defineProps<{
  label: string
  value: number | string
  format: RoiOutputFormat
  testId: string
  highlighted?: boolean
}>()

const numericValue = computed(() => {
  if (typeof props.value !== 'number') return 0
  return props.format === 'multiplier' ? Math.round(props.value * 10) : props.value
})
const { displayed } = useAnimatedNumber(numericValue)

const formattedValue = computed(() => {
  switch (props.format) {
    case 'minutes':
      return `${displayed.value} minutes`
    case 'currency':
      return `$${displayed.value.toLocaleString()}`
    case 'multiplier':
      return `${(displayed.value / 10).toFixed(1)}x`
    case 'text':
      return String(props.value)
    default:
      return String(props.value)
  }
})
</script>

<template>
  <div
    :data-testid="testId"
    class="flex items-center justify-between rounded-lg border border-border px-4 py-3"
    :class="{ 'bg-primary/5': highlighted }"
  >
    <span class="text-sm text-muted-foreground">{{ label }}</span>
    <span
      class="font-semibold tabular-nums"
      :class="highlighted ? 'text-lg text-primary' : 'text-foreground'"
    >
      {{ formattedValue }}
    </span>
  </div>
</template>
