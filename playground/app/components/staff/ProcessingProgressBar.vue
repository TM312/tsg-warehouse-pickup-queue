<script setup lang="ts">
import { computed } from 'vue'
import { ANIMATION, cssMs } from '@/constants/animations'
import { GATE_STATUS_COLORS, GATE_OPERATIONAL_STATUS } from '@/constants/gate-status'

const props = defineProps<{
  progress: number
}>()

const clampedPercent = computed(() => Math.max(0, Math.min(props.progress, 1)) * 100)
const progressColor = GATE_STATUS_COLORS[GATE_OPERATIONAL_STATUS.PROCESSING]
const transitionMs = cssMs(ANIMATION.PROGRESS_BAR_TRANSITION_MS)
</script>

<template>
  <div
    data-testid="processing-progress-bar"
    class="h-1 rounded-full bg-muted"
    role="progressbar"
    :aria-valuenow="Math.round(clampedPercent)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div
      class="progress-fill h-full rounded-full"
      :class="progressColor"
      :style="{ width: clampedPercent + '%' }"
    />
  </div>
</template>

<style scoped>
.progress-fill {
  transition: width v-bind(transitionMs) linear;
}
@media (prefers-reduced-motion: reduce) {
  .progress-fill {
    transition: none;
  }
}
</style>
