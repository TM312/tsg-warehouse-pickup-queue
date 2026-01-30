<script setup lang="ts">
// Placeholder - will be implemented in Task 2
defineProps<{
  salesOrderNumber: string
  companyName: string | null
  status: 'in_queue' | 'processing'
  processingStartedAt: string | null
  itemCount: number | null
  poNumber: string | null
}>()
</script>

<template>
  <div>Current Pickup Placeholder</div>
</template>
