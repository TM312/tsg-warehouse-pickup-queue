<template>
  <div
    v-if="status !== 'connected'"
    class="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-50"
    :class="{
      'bg-yellow-50 text-yellow-800 border border-yellow-200': status === 'connecting',
      'bg-orange-50 text-orange-800 border border-orange-200': status === 'disconnected'
    }"
  >
    <div class="flex items-center gap-2">
      <span class="relative flex h-2 w-2">
        <span
          class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          :class="{
            'bg-yellow-400': status === 'connecting',
            'bg-orange-400': status === 'disconnected'
          }"
        />
        <span
          class="relative inline-flex rounded-full h-2 w-2"
          :class="{
            'bg-yellow-500': status === 'connecting',
            'bg-orange-500': status === 'disconnected'
          }"
        />
      </span>
      <span v-if="status === 'connecting'">Connecting...</span>
      <span v-else-if="status === 'disconnected'">Reconnecting to live updates...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConnectionStatus } from '~/composables/useRealtimeStatus'

defineProps<{
  status: ConnectionStatus
}>()
</script>
