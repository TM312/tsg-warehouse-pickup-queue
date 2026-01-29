<template>
  <div
    v-if="status !== 'connected'"
    class="fixed bottom-4 right-4 px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-50"
    :class="{
      'bg-yellow-100 text-yellow-800': status === 'connecting',
      'bg-red-100 text-red-800': status === 'disconnected' || status === 'error'
    }"
  >
    <span v-if="status === 'connecting'">Connecting...</span>
    <span v-else-if="status === 'disconnected'">Reconnecting...</span>
    <span v-else-if="status === 'error'">Connection lost. Retrying...</span>
  </div>
</template>

<script setup lang="ts">
import type { SubscriptionStatus } from '~/composables/useRealtimeQueue'

defineProps<{
  status: SubscriptionStatus
}>()
</script>
