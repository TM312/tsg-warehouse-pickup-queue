<script setup lang="ts">
import { computed } from 'vue'
import { ANIMATION } from '@/constants/animations'
import type { ScenarioStep } from '@/types/scenario'

const props = defineProps<{
  currentStep: number
  totalSteps: number
  steps: ScenarioStep[]
  visible: boolean
}>()

const progressPercent = computed(() => {
  if (props.totalSteps === 0) return 0
  return (props.currentStep / props.totalSteps) * 100
})

const stepMarkers = computed(() => {
  if (props.steps.length <= 1) return []

  const cumulative: number[] = []
  let sum = 0
  for (const step of props.steps) {
    cumulative.push(sum)
    sum += step.delayMs
  }

  if (sum === 0) return []

  return cumulative
    .filter((c) => c > 0)
    .map((c) => ({ position: (c / sum) * 100 }))
})
</script>

<template>
  <Transition name="progress-slide">
    <div v-if="visible" class="relative h-1 w-full bg-muted">
      <!-- Fill -->
      <div
        class="absolute inset-y-0 left-0 bg-primary transition-[width] ease-out"
        :style="{ width: `${progressPercent}%`, transitionDuration: `${ANIMATION.PROGRESS_BAR_TRANSITION_MS}ms` }"
        role="progressbar"
        :aria-valuenow="currentStep"
        :aria-valuemin="0"
        :aria-valuemax="totalSteps"
      />
      <!-- Event markers -->
      <div
        v-for="(marker, i) in stepMarkers"
        :key="i"
        class="absolute top-0 h-full w-0.5 bg-foreground/30"
        :style="{ left: `${marker.position}%` }"
      />
    </div>
  </Transition>
</template>

<style scoped>
.progress-slide-enter-active,
.progress-slide-leave-active {
  transition: opacity 200ms ease, max-height 200ms ease;
  max-height: 4px;
  overflow: hidden;
}

.progress-slide-enter-from,
.progress-slide-leave-to {
  opacity: 0;
  max-height: 0;
}

@media (prefers-reduced-motion: reduce) {
  .progress-slide-enter-active,
  .progress-slide-leave-active {
    transition: none;
  }
}
</style>
