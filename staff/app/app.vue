<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import type { TransitionProps } from 'vue'

const { fetchRequests, fetchGates, refresh } = useQueueActions()
const { subscribe, unsubscribe } = useRealtimeQueue()
const { isGateNav, clear: clearGateNav } = useGateNavState()

// Fetch initial data and subscribe at app level
onMounted(async () => {
  // Fetch initial data
  await Promise.all([fetchRequests(), fetchGates()])
  // Subscribe to realtime updates, pass refresh for gate changes
  subscribe(refresh)
})

onUnmounted(() => {
  unsubscribe()
})

// Quick crossfade transition for gate navigation
const pageTransition = computed<TransitionProps | false>(() => {
  if (!isGateNav.value) return false
  return {
    name: 'gate-fade',
    mode: 'out-in' as const,
    onAfterLeave: () => clearGateNav()
  }
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" />
  </NuxtLayout>
  <Toaster position="top-right" />
</template>

<style>
/* Quick crossfade for gate navigation - fast enough that empty state is barely noticeable */
.gate-fade-enter-active,
.gate-fade-leave-active {
  transition: opacity 0.15s ease;
}

.gate-fade-enter-from,
.gate-fade-leave-to {
  opacity: 0;
}
</style>
