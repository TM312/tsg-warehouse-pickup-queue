<script setup lang="ts">
import { FEATURE_UNAVAILABLE, FEATURE_BETA } from '@/constants/pricing'

defineProps<{
  label: string
  value: string
}>()
</script>

<template>
  <div data-testid="pricing-feature-row" class="flex items-center justify-between py-2 text-sm">
    <span class="text-muted-foreground">{{ label }}</span>
    <span
      :class="[
        value === FEATURE_UNAVAILABLE ? 'text-muted-foreground' :
        value === FEATURE_BETA ? 'text-primary font-medium' :
        'font-medium text-foreground'
      ]"
    >
      {{ value }}
    </span>
  </div>
</template>
