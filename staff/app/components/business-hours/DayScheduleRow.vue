<script setup lang="ts">
import type { WeeklySchedule } from '@/composables/useBusinessHoursSettings'

const props = defineProps<{
  modelValue: WeeklySchedule
}>()

const emit = defineEmits<{
  'update:modelValue': [value: WeeklySchedule]
}>()

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function toggleClosed(isOpen: boolean) {
  emit('update:modelValue', {
    ...props.modelValue,
    isClosed: !isOpen
  })
}

function updateOpenTime(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', {
    ...props.modelValue,
    openTime: target.value
  })
}

function updateCloseTime(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', {
    ...props.modelValue,
    closeTime: target.value
  })
}
</script>

<template>
  <div class="flex items-center gap-4 py-3 border-b last:border-0">
    <div class="w-24 font-medium">
      {{ dayNames[modelValue.dayOfWeek] }}
    </div>

    <Switch
      :checked="!modelValue.isClosed"
      @update:checked="toggleClosed"
    />

    <template v-if="!modelValue.isClosed">
      <Input
        type="time"
        :value="modelValue.openTime"
        class="w-32"
        @input="updateOpenTime"
      />
      <span class="text-muted-foreground">to</span>
      <Input
        type="time"
        :value="modelValue.closeTime"
        class="w-32"
        @input="updateCloseTime"
      />
    </template>
    <span v-else class="text-muted-foreground">Closed</span>
  </div>
</template>
