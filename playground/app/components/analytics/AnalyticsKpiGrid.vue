<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useDashboardData } from '@/composables/useDashboardData'
import { KPI_DEFINITIONS } from '@/constants/analytics'
import { KPI_HIGHLIGHT_MAP } from '@/constants/highlights'
import { RESPONSIVE } from '@/constants/responsive'

const dashboard = useDashboardData()
const isCompact = useMediaQuery(`(max-width: ${RESPONSIVE.COMPACT_BREAKPOINT_PX - 1}px)`)
const gridClass = computed(() => isCompact.value ? 'grid-cols-1' : 'grid-cols-2')
</script>

<template>
  <div data-testid="analytics-kpi-grid" data-walkthrough="kpi-grid" :class="['grid gap-3', gridClass]">
    <AnalyticsKpiCard
      v-for="kpi in KPI_DEFINITIONS"
      :key="kpi.id"
      :icon="kpi.icon"
      :label="kpi.label"
      :value="kpi.format(dashboard[kpi.key].value)"
      :numeric-value="kpi.animate ? (dashboard[kpi.key].value ?? 0) : undefined"
      :test-id="`kpi-${kpi.id}`"
      :highlight-target="KPI_HIGHLIGHT_MAP[kpi.id]"
    />
  </div>
</template>
