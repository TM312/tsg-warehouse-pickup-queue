<script setup lang="ts">
import { ref } from 'vue'
import type { RoiInputConfig } from '@/types/roi'
import { clampValue } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  modelValue: number
  config: RoiInputConfig
  label: string
  testId: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const localValue = ref(String(props.modelValue))

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  localValue.value = target.value
  const parsed = Number(target.value)
  if (!Number.isNaN(parsed)) {
    emit('update:modelValue', parsed)
  }
}

function onBlur() {
  const parsed = Number(localValue.value)
  if (Number.isNaN(parsed)) {
    localValue.value = String(props.config.default)
    emit('update:modelValue', props.config.default)
  } else {
    const clamped = clampValue(parsed, props.config.min, props.config.max)
    localValue.value = String(clamped)
    emit('update:modelValue', clamped)
  }
}
</script>

<template>
  <div :data-testid="testId" class="space-y-3">
    <Label class="text-sm font-medium text-muted-foreground">{{ label }}</Label>
    <div class="flex items-center gap-1">
      <span class="text-sm font-medium text-muted-foreground">{{ config.prefix }}</span>
      <Input
        type="number"
        :min="config.min"
        :max="config.max"
        :value="localValue"
        class="w-24"
        @input="onInput"
        @blur="onBlur"
      />
    </div>
  </div>
</template>
