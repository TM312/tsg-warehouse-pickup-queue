<script setup lang="ts">
import type { MockupQueueEntry } from '@/types/hero'
import { HERO_MOCKUP_QUEUE_ENTRIES } from '@/constants/hero'

defineProps<{
  animated: boolean
}>()

const statusColor: Record<MockupQueueEntry['status'], string> = {
  loading: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400',
  called: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-400',
  waiting: 'bg-muted text-muted-foreground',
  complete: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400',
}

const VISIBLE_ROWS_MOBILE = 2
const ROW_ANIMATION_DELAY_S = 0.8
const GATE_ANIMATION_OFFSET_S = 2
</script>

<template>
  <div
    class="w-full overflow-hidden rounded-lg border bg-background shadow-xl"
    data-testid="hero-mockup-dashboard"
  >
    <LandingBrowserChrome />

    <!-- Dashboard content -->
    <div class="p-3">
      <div class="mb-2 text-xs font-semibold text-foreground">Live Queue</div>

      <table class="w-full text-left text-xs">
        <thead>
          <tr class="border-b text-muted-foreground">
            <th class="pb-1.5 font-medium">Customer</th>
            <th class="pb-1.5 font-medium">Status</th>
            <th class="pb-1.5 font-medium">Gate</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(entry, i) in HERO_MOCKUP_QUEUE_ENTRIES"
            :key="entry.order"
            class="border-b last:border-0"
            :class="[
              i >= VISIBLE_ROWS_MOBILE ? 'hidden lg:table-row' : '',
              animated ? 'hero-dash-row' : '',
            ]"
            :style="animated ? `animation-delay: ${i * ROW_ANIMATION_DELAY_S}s` : ''"
          >
            <td class="py-1.5 font-medium text-foreground">{{ entry.company }}</td>
            <td class="py-1.5">
              <span
                class="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                :class="statusColor[entry.status]"
              >
                {{ entry.status }}
              </span>
            </td>
            <td class="py-1.5">
              <span
                v-if="entry.gate"
                class="hero-dash-gate text-foreground"
                :class="animated ? 'hero-dash-animate' : ''"
                :style="animated ? `animation-delay: ${i * ROW_ANIMATION_DELAY_S + GATE_ANIMATION_OFFSET_S}s` : ''"
              >
                {{ entry.gate }}
              </span>
              <span v-else class="text-muted-foreground">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.hero-dash-row {
  animation: hero-dash-row-highlight var(--hero-cycle-duration) ease-in-out infinite;
}
@keyframes hero-dash-row-highlight {
  0%, 10% { background-color: transparent; }
  15%, 25% { background-color: oklch(0.97 0 0); }
  30%, 100% { background-color: transparent; }
}

.dark .hero-dash-row {
  animation: hero-dash-row-highlight-dark var(--hero-cycle-duration) ease-in-out infinite;
}
@keyframes hero-dash-row-highlight-dark {
  0%, 10% { background-color: transparent; }
  15%, 25% { background-color: oklch(0.269 0 0); }
  30%, 100% { background-color: transparent; }
}

.hero-dash-gate.hero-dash-animate {
  animation: hero-dash-gate-fade var(--hero-cycle-duration) ease-in-out infinite;
}
@keyframes hero-dash-gate-fade {
  0%, 20% { opacity: 0; }
  30%, 90% { opacity: 1; }
  95%, 100% { opacity: 0; }
}
</style>
