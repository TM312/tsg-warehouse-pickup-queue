<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  title: string
  description: string
}>()
</script>

<template>
  <div class="flex items-center gap-3 border-b px-4 py-3" data-testid="panel-header" data-walkthrough="panel-header">
    <component :is="icon" class="size-5 shrink-0 text-muted-foreground" />
    <div class="min-w-0">
      <h2 class="text-sm font-semibold leading-tight">{{ title }}</h2>
      <p class="truncate text-xs text-muted-foreground">{{ description }}</p>
    </div>
  </div>
</template>
