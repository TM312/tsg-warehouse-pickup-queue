<template>
  <div class="flex items-center gap-2">
    <Switch v-model="showCompleted" />
    <span class="text-sm text-muted-foreground">Show completed/cancelled</span>
  </div>
</template>

<script setup lang="ts">
import { Switch } from '@/components/ui/switch'

const showCompleted = defineModel<boolean>('showCompleted', { default: false })
</script>
