<script setup lang="ts">
import { useSimulationStore } from '@/stores/simulation'
import { EVENT_TYPE_CONFIG } from '@/constants/analytics'
import { formatDurationMs } from '@/utils/formatDuration'

const simulation = useSimulationStore()

function formatRelativeTime(eventTimestamp: number): string {
  const diff = simulation.elapsedMs - eventTimestamp
  if (diff < 0) return 'just now'
  return formatDurationMs(diff) + ' ago'
}
</script>

<template>
  <div data-testid="analytics-activity-feed">
    <h3 class="mb-2 text-sm font-semibold">Activity Feed</h3>

    <div v-if="simulation.activityFeed.length > 0" class="max-h-[240px] space-y-1 overflow-y-auto">
      <div
        v-for="event in simulation.activityFeed"
        :key="event.id"
        data-testid="feed-event"
        class="flex items-center gap-2 rounded px-2 py-1 text-sm"
      >
        <component
          :is="EVENT_TYPE_CONFIG[event.type].icon"
          class="size-4 shrink-0"
          :class="EVENT_TYPE_CONFIG[event.type].colorClass"
        />
        <span class="min-w-0 flex-1 truncate">{{ event.label }}</span>
        <span class="shrink-0 text-xs text-muted-foreground">{{ formatRelativeTime(event.timestamp) }}</span>
      </div>
    </div>

    <p v-else class="text-sm text-muted-foreground">No activity yet</p>
  </div>
</template>
