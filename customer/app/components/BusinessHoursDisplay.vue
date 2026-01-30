<script setup lang="ts">
interface DayHours {
  dayOfWeek: number
  dayName: string
  isClosed: boolean
  openTime: string | null
  closeTime: string | null
}

defineProps<{
  hours: DayHours[]
}>()

// Get current day of week (0 = Sunday)
const currentDay = new Date().getDay()
</script>

<template>
  <div class="text-sm text-muted-foreground">
    <div class="font-medium mb-2">Business Hours</div>
    <div class="grid grid-cols-7 gap-1 text-center text-xs">
      <div
        v-for="day in hours"
        :key="day.dayOfWeek"
        class="space-y-0.5 p-1 rounded"
        :class="{
          'bg-primary/10 text-primary font-medium': day.dayOfWeek === currentDay
        }"
      >
        <div class="font-medium">{{ day.dayName }}</div>
        <template v-if="day.isClosed">
          <div class="text-muted-foreground/60">Closed</div>
        </template>
        <template v-else>
          <div>{{ day.openTime }}</div>
          <div>{{ day.closeTime }}</div>
        </template>
      </div>
    </div>
  </div>
</template>
