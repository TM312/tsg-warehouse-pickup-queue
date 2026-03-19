<script setup lang="ts">
import { useDashboardData } from '@/composables/useDashboardData'
import { KPI_DEFINITIONS } from '@/constants/analytics'
import { KPI_HIGHLIGHT_MAP } from '@/constants/highlights'

const dashboard = useDashboardData()
</script>

<template>
  <div data-testid="analytics-kpi-grid" data-walkthrough="kpi-grid" class="grid grid-cols-2 gap-3">
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
