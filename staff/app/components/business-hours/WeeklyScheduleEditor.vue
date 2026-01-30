<script setup lang="ts">
import type { WeeklySchedule } from '@/composables/useBusinessHoursSettings'

const props = defineProps<{
  modelValue: WeeklySchedule[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: WeeklySchedule[]]
}>()

function updateDay(index: number, value: WeeklySchedule) {
  const updated = [...props.modelValue]
  updated[index] = value
  emit('update:modelValue', updated)
}

function applyMondayToWeekdays() {
  const monday = props.modelValue[1]
  if (!monday) return

  const updated = [...props.modelValue]
  // Days 1-5 are Mon-Fri
  for (let i = 1; i <= 5; i++) {
    updated[i] = {
      ...updated[i],
      isClosed: monday.isClosed,
      openTime: monday.openTime,
      closeTime: monday.closeTime
    }
  }
  emit('update:modelValue', updated)
}
</script>

<template>
  <div>
    <div class="space-y-0">
      <DayScheduleRow
        v-for="(day, index) in modelValue"
        :key="day.dayOfWeek"
        :model-value="day"
        @update:model-value="updateDay(index, $event)"
      />
    </div>

    <div class="mt-4 pt-4 border-t">
      <Button
        variant="outline"
        size="sm"
        @click="applyMondayToWeekdays"
      >
        Apply Monday hours to weekdays
      </Button>
    </div>
  </div>
</template>
