<template>
  <div class="flex items-center gap-2">
    <Switch
      :checked="showCompleted"
      @update:checked="$emit('update:showCompleted', $event)"
    />
    <span class="text-sm text-muted-foreground">Show completed/cancelled</span>
  </div>
</template>

<script setup lang="ts">
import { Switch } from '@/components/ui/switch'

defineProps<{
  showCompleted: boolean
}>()

defineEmits<{
  'update:showCompleted': [value: boolean]
}>()
</script>
