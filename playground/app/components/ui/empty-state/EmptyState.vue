<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  heading: string
  subtext: string
}>()
</script>

<template>
  <div data-testid="empty-state" class="flex flex-col items-center justify-center py-8 text-center">
    <component :is="icon" class="size-12 text-muted-foreground" />
    <h3 class="mt-3 text-sm font-medium">{{ heading }}</h3>
    <p class="mt-1 text-xs text-muted-foreground">{{ subtext }}</p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>
