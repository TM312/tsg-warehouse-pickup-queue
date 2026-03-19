<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useAnimatedNumber } from '@/composables/useAnimatedNumber'
import { ANIMATION } from '@/constants/animations'

const props = defineProps<{
  icon: Component
  label: string
  value: string
  testId: string
  numericValue?: number
}>()

const animatedNum = props.numericValue !== undefined
  ? useAnimatedNumber(computed(() => props.numericValue!), { duration: ANIMATION.KPI_TWEEN_MS })
  : null

const displayValue = computed(() =>
  animatedNum ? String(animatedNum.displayValue.value) : props.value,
)
</script>

<template>
  <div :data-testid="testId" class="rounded-lg border bg-card p-3">
    <div class="flex items-center gap-2">
      <component :is="icon" class="size-5 shrink-0 text-muted-foreground" />
      <div class="min-w-0">
        <p class="text-xs text-muted-foreground">{{ label }}</p>
        <p class="text-lg font-semibold leading-tight">{{ displayValue }}</p>
      </div>
    </div>
  </div>
</template>
