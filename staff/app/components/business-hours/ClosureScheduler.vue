<script setup lang="ts">
import { X, Calendar } from 'lucide-vue-next'
import { format, parseISO, isSameDay } from 'date-fns'
import type { Closure } from '@/composables/useBusinessHoursSettings'

const props = defineProps<{
  closures: Closure[]
  pending?: boolean
}>()

const emit = defineEmits<{
  add: [startDate: string, endDate: string, reason?: string]
  delete: [id: string]
}>()

// Form state
const startDate = ref('')
const endDate = ref('')
const reason = ref('')

// Computed min date (today)
const minDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Computed max date (12 months ahead)
const maxDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date.toISOString().split('T')[0]
})

// Validate that end date is after start date
const isValidRange = computed(() => {
  if (!startDate.value || !endDate.value) return true
  return endDate.value >= startDate.value
})

// Check if form is ready to submit
const canSubmit = computed(() => {
  return startDate.value && endDate.value && isValidRange.value && !props.pending
})

function handleAdd() {
  if (!canSubmit.value) return
  emit('add', startDate.value, endDate.value, reason.value || undefined)
  // Reset form
  startDate.value = ''
  endDate.value = ''
  reason.value = ''
}

function handleDelete(id: string) {
  emit('delete', id)
}

// Format date range for display
function formatDateRange(start: string, end: string): string {
  const startDateObj = parseISO(start)
  const endDateObj = parseISO(end)

  if (isSameDay(startDateObj, endDateObj)) {
    return format(startDateObj, 'MMM d, yyyy')
  }

  // Check if same month
  if (startDateObj.getMonth() === endDateObj.getMonth() && startDateObj.getFullYear() === endDateObj.getFullYear()) {
    return `${format(startDateObj, 'MMM d')} - ${format(endDateObj, 'd, yyyy')}`
  }

  // Different months
  return `${format(startDateObj, 'MMM d')} - ${format(endDateObj, 'MMM d, yyyy')}`
}

// Auto-set end date when start date changes (if end date is empty or before start)
watch(startDate, (newStart) => {
  if (newStart && (!endDate.value || endDate.value < newStart)) {
    endDate.value = newStart
  }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Add closure form -->
    <div class="space-y-3">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1 space-y-1">
          <Label for="start-date">Start Date</Label>
          <div class="relative">
            <Input
              id="start-date"
              v-model="startDate"
              type="date"
              :min="minDate"
              :max="maxDate"
              class="w-full"
            />
          </div>
        </div>
        <div class="flex-1 space-y-1">
          <Label for="end-date">End Date</Label>
          <Input
            id="end-date"
            v-model="endDate"
            type="date"
            :min="startDate || minDate"
            :max="maxDate"
            class="w-full"
          />
        </div>
      </div>

      <div class="space-y-1">
        <Label for="reason">Reason (optional)</Label>
        <Input
          id="reason"
          v-model="reason"
          type="text"
          placeholder="e.g., Holiday, Maintenance"
          class="w-full"
        />
      </div>

      <div class="flex items-center justify-between">
        <p v-if="!isValidRange" class="text-sm text-destructive">
          End date must be on or after start date
        </p>
        <p v-else-if="startDate && endDate" class="text-sm text-muted-foreground">
          {{ formatDateRange(startDate, endDate) }}
        </p>
        <span v-else />
        <Button
          @click="handleAdd"
          :disabled="!canSubmit"
          size="sm"
        >
          <Calendar class="w-4 h-4 mr-2" />
          Add Closure
        </Button>
      </div>
    </div>

    <!-- Separator -->
    <Separator v-if="closures.length > 0" />

    <!-- List of closures -->
    <div v-if="closures.length > 0" class="space-y-2">
      <p class="text-sm font-medium text-muted-foreground">Upcoming Closures</p>
      <div class="space-y-2">
        <div
          v-for="closure in closures"
          :key="closure.id"
          class="flex items-center justify-between p-3 rounded-md border bg-muted/30"
        >
          <div>
            <p class="font-medium">
              {{ formatDateRange(closure.startDate, closure.endDate) }}
            </p>
            <p v-if="closure.reason" class="text-sm text-muted-foreground">
              {{ closure.reason }}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            @click="handleDelete(closure.id)"
            :disabled="pending"
            class="text-muted-foreground hover:text-destructive"
          >
            <X class="w-4 h-4" />
            <span class="sr-only">Remove closure</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-4 text-muted-foreground text-sm">
      No upcoming closures scheduled
    </div>
  </div>
</template>
