<script setup lang="ts">
defineProps<{
  show: boolean
}>()
</script>

<template>
  <span
    v-if="show"
    class="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
  >
    <span class="relative flex h-2 w-2">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
    </span>
    Live
  </span>
</template>
