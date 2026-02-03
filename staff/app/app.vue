<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import type { TransitionProps } from 'vue'

const { fetchRequests, fetchGates, refresh } = useQueueActions()
const { subscribe, unsubscribe } = useRealtimeQueue()
const { direction, clear: clearNavDirection } = useGateNavDirection()

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

// Dynamic page transition based on gate navigation direction
const pageTransition = computed<TransitionProps | false>(() => {
  if (!direction.value) return false
  return {
    name: direction.value === 'right' ? 'slide-right' : 'slide-left',
    mode: 'out-in' as const,
    onAfterLeave: () => clearNavDirection()
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
/* Gate navigation transitions - slide in direction of navigation */

/* Slide right (navigating to next gate): old slides left, new slides from right */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease-out;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Slide left (navigating to prev gate): old slides right, new slides from left */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.2s ease-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
