<script setup lang="ts">
import { format } from 'date-fns'
import type { Override } from '@/composables/useBusinessHoursSettings'

const props = defineProps<{
  modelValue: Override
  pending?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [Override]
  toggle: [active: boolean]
}>()

function handleToggle(checked: boolean) {
  emit('toggle', checked)
}

// Format expiry time for display
const expiryDisplay = computed(() => {
  if (!props.modelValue.active || !props.modelValue.expiresAt) return null
  try {
    const date = new Date(props.modelValue.expiresAt)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString()

    if (isToday) {
      return `Resumes at ${format(date, 'h:mm a')} today`
    } else if (isTomorrow) {
      return `Resumes at ${format(date, 'h:mm a')} tomorrow`
    } else {
      return `Resumes ${format(date, 'EEEE')} at ${format(date, 'h:mm a')}`
    }
  } catch {
    return null
  }
})
</script>

<template>
  <Card class="border-destructive/20" :class="{ 'bg-destructive/5': modelValue.active }">
    <CardContent class="pt-6">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-medium">Closed now</span>
            <Badge v-if="modelValue.active" variant="destructive" class="text-xs">
              Active
            </Badge>
          </div>
          <p v-if="modelValue.active && expiryDisplay" class="text-sm text-muted-foreground">
            {{ expiryDisplay }}
          </p>
          <p v-else class="text-sm text-muted-foreground">
            Temporarily close the warehouse to new registrations
          </p>
        </div>
        <Switch
          :checked="modelValue.active"
          :disabled="pending"
          @update:checked="handleToggle"
        />
      </div>
    </CardContent>
  </Card>
</template>
