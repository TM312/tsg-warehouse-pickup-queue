<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardData } from '@/composables/useDashboardData'

const { chartData } = useDashboardData()

const maxCount = computed(() => Math.max(1, ...chartData.value.map(d => d.count)))
const hasData = computed(() => chartData.value.some(d => d.count > 0))
</script>

<template>
  <div data-testid="analytics-queue-chart">
    <h3 class="mb-2 text-sm font-semibold">Queue Depth by Gate</h3>

    <div v-if="hasData" class="space-y-2">
      <div v-for="item in chartData" :key="item.gate" class="flex items-center gap-2 text-sm">
        <span class="w-14 shrink-0 text-xs text-muted-foreground">{{ item.gate }}</span>
        <div class="h-5 flex-1 rounded-sm bg-muted">
          <div
            class="h-full rounded-sm bg-primary transition-all duration-300"
            :style="{ width: `${(item.count / maxCount) * 100}%` }"
          />
        </div>
        <span class="w-6 text-right text-xs font-medium">{{ item.count }}</span>
      </div>
    </div>

    <p v-else class="text-sm text-muted-foreground">No gates active</p>
  </div>
</template>
