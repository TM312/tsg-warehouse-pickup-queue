<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'

const { fetchRequests, fetchGates, refresh } = useQueueActions()
const { subscribe, unsubscribe } = useRealtimeQueue()

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
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster position="top-right" />
</template>
