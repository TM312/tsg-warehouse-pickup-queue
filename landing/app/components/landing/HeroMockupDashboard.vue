<script setup lang="ts">
import { HERO_MOCKUP_QUEUE_ENTRIES, HERO_STATUS_COLORS, heroRowDelay, heroGateDelay } from '@/constants/hero'

defineProps<{
  animated: boolean
}>()
</script>

<template>
  <div
    class="w-full overflow-hidden rounded-lg border bg-background shadow-xl"
    data-testid="hero-mockup-dashboard"
  >
    <!-- Browser chrome -->
    <div class="flex items-center gap-2 border-b bg-muted/50 px-3 py-2">
      <span class="size-2.5 rounded-full bg-red-400" />
      <span class="size-2.5 rounded-full bg-yellow-400" />
      <span class="size-2.5 rounded-full bg-green-400" />
      <div class="ml-2 flex-1 rounded bg-background px-3 py-0.5 text-[10px] text-muted-foreground">
        app.pickupqueue.com/dashboard
      </div>
    </div>

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
              i >= 2 ? 'hidden lg:table-row' : '',
              animated ? 'hero-dash-row' : '',
            ]"
            :style="animated ? `animation-delay: ${heroRowDelay(i)}` : ''"
          >
            <td class="py-1.5 font-medium text-foreground">{{ entry.company }}</td>
            <td class="py-1.5">
              <span
                class="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                :class="HERO_STATUS_COLORS[entry.status]"
              >
                {{ entry.status }}
              </span>
            </td>
            <td class="py-1.5">
              <span
                v-if="entry.gate"
                class="hero-dash-gate text-foreground"
                :class="animated ? 'hero-dash-animate' : ''"
                :style="animated ? `animation-delay: ${heroGateDelay(i)}` : ''"
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
