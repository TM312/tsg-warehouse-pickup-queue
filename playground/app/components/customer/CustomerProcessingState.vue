<script setup lang="ts">
import { computed, toRef } from 'vue'
import { formatElapsedTime } from '@/utils/formatDuration'
import { useProcessingProgress } from '@/composables/useProcessingProgress'
import { ANIMATION, cssMs } from '@/constants/animations'
import type { PickupRequest } from '@/types/pickup-request'

const props = defineProps<{
  request: PickupRequest
}>()

const { progress, elapsedMs } = useProcessingProgress(toRef(props, 'request'))

const progressPercent = computed(() => Math.round(progress.value * 100))

const elapsed = computed(() => formatElapsedTime(elapsedMs.value))

const radius = 34
const circumference = 2 * Math.PI * radius
const strokeOffset = computed(() => circumference * (1 - progress.value))
const transitionMs = cssMs(ANIMATION.CIRCULAR_PROGRESS_TRANSITION_MS)
</script>

<template>
  <div
    class="flex flex-col items-center gap-3 py-6"
    data-testid="customer-processing-state"
    role="progressbar"
    :aria-valuenow="progressPercent"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle
        cx="40"
        cy="40"
        :r="radius"
        fill="none"
        stroke="currentColor"
        stroke-width="4"
        class="text-muted-foreground/20"
      />
      <circle
        cx="40"
        cy="40"
        :r="radius"
        fill="none"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        class="circular-progress text-amber-500"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeOffset"
        transform="rotate(-90 40 40)"
      />
      <text
        x="40"
        y="40"
        text-anchor="middle"
        dominant-baseline="central"
        class="fill-foreground text-sm font-medium"
        style="font-family: ui-monospace, monospace"
      >
        {{ elapsed }}
      </text>
    </svg>
    <p class="text-sm font-medium">Your order is being loaded!</p>
  </div>
</template>

<style scoped>
.circular-progress {
  transition: stroke-dashoffset v-bind(transitionMs) ease;
}
@media (prefers-reduced-motion: reduce) {
  .circular-progress {
    transition: none;
  }
}
</style>
