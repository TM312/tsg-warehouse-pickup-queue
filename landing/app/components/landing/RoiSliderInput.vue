<script setup lang="ts">
import type { RoiSliderConfig } from '@/types/roi'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

const props = defineProps<{
  modelValue: number
  config: RoiSliderConfig
  label: string
  testId: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

function onSliderUpdate(value: number[]) {
  emit('update:modelValue', value[0])
}
</script>

<template>
  <div :data-testid="testId" class="space-y-3">
    <div class="flex items-center justify-between">
      <Label class="text-sm font-medium text-muted-foreground">{{ label }}</Label>
      <span class="text-sm font-semibold tabular-nums text-foreground">{{ modelValue }}</span>
    </div>
    <Slider
      :model-value="[modelValue]"
      :min="config.min"
      :max="config.max"
      :step="config.step"
      @update:model-value="onSliderUpdate"
    />
  </div>
</template>
