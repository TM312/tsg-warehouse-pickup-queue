<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  label: string
  value: string
  testId: string
}>()
</script>

<template>
  <div :data-testid="testId" class="rounded-lg border bg-card p-3">
    <div class="flex items-center gap-2">
      <component :is="icon" class="size-5 shrink-0 text-muted-foreground" />
      <div class="min-w-0">
        <p class="text-xs text-muted-foreground">{{ label }}</p>
        <p class="text-lg font-semibold leading-tight">{{ value }}</p>
      </div>
    </div>
  </div>
</template>
