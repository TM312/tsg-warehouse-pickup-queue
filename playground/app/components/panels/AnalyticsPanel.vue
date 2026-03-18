<script setup lang="ts">
import { BarChart3 } from 'lucide-vue-next'
import { PANEL_DEFINITIONS, PANEL_ID } from '@/constants/panels'

const analyticsDef = PANEL_DEFINITIONS.find(p => p.id === PANEL_ID.ANALYTICS)!
</script>

<template>
  <div data-testid="analytics-panel" data-walkthrough="analytics-panel" class="flex h-full flex-col overflow-hidden">
    <LayoutPanelHeader :icon="BarChart3" :title="analyticsDef.label" :description="analyticsDef.description" />
    <div class="flex-1 space-y-4 overflow-y-auto p-4">
      <AnalyticsKpiGrid />
      <AnalyticsQueueChart />
      <AnalyticsActivityFeed />
    </div>
  </div>
</template>
