<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useAnimatedNumber } from '@/composables/useAnimatedNumber'
import { ANIMATION } from '@/constants/animations'
import { useCrossPanelHighlight } from '@/composables/useCrossPanelHighlight'
import type { HighlightTarget } from '@/constants/highlights'

const props = defineProps<{
  icon: Component
  label: string
  value: string
  testId: string
  numericValue?: number
  highlightTarget?: HighlightTarget
}>()

const { isHighlighted } = useCrossPanelHighlight()
const highlighted = computed(() => props.highlightTarget ? isHighlighted(props.highlightTarget) : false)

const animatedNum = props.numericValue !== undefined
  ? useAnimatedNumber(computed(() => props.numericValue!), { duration: ANIMATION.KPI_TWEEN_MS })
  : null

const displayValue = computed(() =>
  animatedNum ? String(animatedNum.displayValue.value) : props.value,
)
</script>

<template>
  <div :data-testid="testId" :class="['rounded-lg border bg-card p-3', { 'animate-cross-panel-highlight': highlighted }]">
    <div class="flex items-center gap-2">
      <component :is="icon" class="size-5 shrink-0 text-muted-foreground" />
      <div class="min-w-0">
        <p class="text-xs text-muted-foreground">{{ label }}</p>
        <p class="text-lg font-semibold leading-tight">{{ displayValue }}</p>
      </div>
    </div>
  </div>
</template>
