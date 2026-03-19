<script setup lang="ts">
import { computed } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import { EVENT_TYPE_CONFIG } from '@/constants/analytics'
import { ANIMATION, cssMs } from '@/constants/animations'
import { HIGHLIGHT_TARGET } from '@/constants/highlights'
import { useCrossPanelHighlight } from '@/composables/useCrossPanelHighlight'
import { EmptyState } from '@/components/ui/empty-state'
import { EMPTY_STATE } from '@/constants/empty-states'
import { formatDurationMs } from '@/utils/formatDuration'

const simulation = useSimulationStore()
const enterMs = cssMs(ANIMATION.FEED_ITEM_ENTER_MS)
const { isHighlighted } = useCrossPanelHighlight()
const feedHighlighted = computed(() => isHighlighted(HIGHLIGHT_TARGET.ACTIVITY_FEED))

function formatRelativeTime(eventTimestamp: number): string {
  const diff = simulation.elapsedMs - eventTimestamp
  if (diff < 0) return 'just now'
  return formatDurationMs(diff) + ' ago'
}
</script>

<template>
  <div data-testid="analytics-activity-feed">
    <h3 class="mb-2 text-sm font-semibold">Activity Feed</h3>

    <TransitionGroup
      v-if="simulation.activityFeed.length > 0"
      tag="div"
      name="feed-item"
      class="max-h-[240px] space-y-1 overflow-y-auto"
    >
      <div
        v-for="(event, index) in simulation.activityFeed"
        :key="event.id"
        data-testid="feed-event"
        :class="['flex items-center gap-2 rounded px-2 py-1 text-sm', { 'animate-cross-panel-highlight': index === 0 && feedHighlighted }]"
      >
        <component
          :is="EVENT_TYPE_CONFIG[event.type].icon"
          class="size-4 shrink-0"
          :class="EVENT_TYPE_CONFIG[event.type].colorClass"
        />
        <span class="min-w-0 flex-1 truncate">{{ event.label }}</span>
        <span class="shrink-0 text-xs text-muted-foreground">{{ formatRelativeTime(event.timestamp) }}</span>
      </div>
    </TransitionGroup>

    <EmptyState
      v-else
      :icon="EMPTY_STATE.ANALYTICS_ACTIVITY_FEED.icon"
      :heading="EMPTY_STATE.ANALYTICS_ACTIVITY_FEED.heading"
      :subtext="EMPTY_STATE.ANALYTICS_ACTIVITY_FEED.subtext"
    />
  </div>
</template>

<style scoped>
.feed-item-enter-active {
  transition:
    opacity v-bind(enterMs) ease,
    transform v-bind(enterMs) ease;
}
.feed-item-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
@media (prefers-reduced-motion: reduce) {
  .feed-item-enter-active {
    transition: none;
  }
}
</style>
