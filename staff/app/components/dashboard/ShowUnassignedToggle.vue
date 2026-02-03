<template>
  <div class="flex items-center gap-2">
    <Switch v-model="showOnlyUnassigned" />
    <span class="text-sm text-muted-foreground">Show only unassigned</span>
  </div>
</template>

<script setup lang="ts">
import { Switch } from '@/components/ui/switch'

const showOnlyUnassigned = defineModel<boolean>('showOnlyUnassigned', { default: false })
</script>
