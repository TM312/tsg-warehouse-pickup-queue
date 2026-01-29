<template>
  <div v-if="estimate" class="text-muted-foreground">
    <span class="font-medium">Estimated wait:</span>
    <span v-if="estimate.min === estimate.max">~{{ estimate.min }} min</span>
    <span v-else>{{ estimate.min }}-{{ estimate.max }} min</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  estimate: { min: number; max: number } | null
}>()
</script>
