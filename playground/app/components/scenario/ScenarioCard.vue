<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import type { Scenario } from '@/types/scenario'
import { getScenarioDurationMs } from '@/utils/scenarioDuration'
import { formatDurationMs } from '@/utils/formatDuration'
import { ANIMATION, cssMs } from '@/constants/animations'

const INSTANT_LABEL = 'Instant'

const props = defineProps<{
  scenario: Scenario
  disabled: boolean
  active: boolean
}>()

defineEmits<{
  run: []
}>()

const durationMs = computed(() => getScenarioDurationMs(props.scenario.steps))
const durationLabel = computed(() =>
  durationMs.value === 0 ? INSTANT_LABEL : formatDurationMs(durationMs.value),
)

const hoverDuration = cssMs(ANIMATION.SCENARIO_CARD_HOVER_MS)
const pulseDuration = cssMs(ANIMATION.SCENARIO_CARD_ACTIVE_PULSE_MS)
</script>

<template>
  <button
    :data-testid="`scenario-${scenario.id}`"
    :disabled="disabled && !active"
    class="rounded-lg border bg-card px-3 py-2 text-left min-w-[180px] max-w-[220px] shrink-0 cursor-pointer snap-start"
    :class="[
      active
        ? 'border-primary ring-1 ring-primary/30 scenario-card-pulse'
        : disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:-translate-y-0.5 hover:shadow-md',
    ]"
    @click="$emit('run')"
  >
    <div class="flex items-center gap-2">
      <component :is="scenario.icon" class="size-4 shrink-0" />
      <span class="font-medium text-sm">{{ scenario.label }}</span>
      <Badge variant="secondary" class="ml-auto">
        {{ durationLabel }}
      </Badge>
    </div>
    <p class="text-xs text-muted-foreground line-clamp-1 mt-1">
      {{ scenario.description }}
    </p>
  </button>
</template>

<style scoped>
button {
  transition-property: all;
  transition-duration: v-bind(hoverDuration);
}

@keyframes scenario-card-pulse {
  0%, 100% { box-shadow: 0 0 0 2px oklch(from var(--primary) l c h / 0.2); }
  50% { box-shadow: 0 0 0 4px oklch(from var(--primary) l c h / 0.35); }
}

.scenario-card-pulse {
  animation: scenario-card-pulse v-bind(pulseDuration) ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .scenario-card-pulse {
    animation: none;
  }
}
</style>
