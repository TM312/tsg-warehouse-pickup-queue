<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisGroupedBar, VisAxis, VisTooltip } from '@unovis/vue'
import { GroupedBar } from '@unovis/ts'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'

interface GateQueueData {
  gate: string
  count: number
  gateId: string
}

const props = defineProps<{
  data: GateQueueData[]
  loading?: boolean
}>()

// Chart config for color theming
// Using a solid color that works with SVG (Unovis doesn't resolve CSS variables in SVG)
// This blue matches the design system
const chartConfig = {
  count: {
    label: 'Waiting',
    color: '#3b82f6' // blue-500
  }
} satisfies ChartConfig

// Accessor functions for Unovis
const x = (d: GateQueueData) => d.gate
const y = (d: GateQueueData) => d.count

// Y-axis domain: minimum 0-5, extends if data exceeds 5
const yDomain = computed(() => {
  const maxCount = Math.max(...props.data.map(d => d.count), 0)
  return [0, Math.max(5, maxCount)]
})

// Tooltip template
const tooltipTemplate = (d: GateQueueData) => {
  return `<div class="bg-popover text-popover-foreground rounded-md border px-3 py-1.5 text-sm shadow-md">
    <div class="font-medium">${d.gate}</div>
    <div class="text-muted-foreground">${d.count} waiting</div>
  </div>`
}

// Check if there's any data
const hasData = computed(() => props.data.length > 0)

// Stable skeleton heights (avoid Math.random causing re-renders)
const skeletonHeights = ['40%', '65%', '50%', '75%']
</script>

<template>
  <ChartContainer :config="chartConfig" class="h-[300px] w-full">
    <!-- Loading state - only show on initial load (no data yet) -->
    <div v-if="loading && !hasData" class="flex items-end justify-around h-full p-4 gap-4">
      <Skeleton v-for="(height, i) in skeletonHeights" :key="i" class="flex-1" :style="{ height }" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasData" class="flex items-center justify-center h-full text-muted-foreground">
      No gates configured
    </div>

    <!-- Chart -->
    <VisXYContainer v-else :data="data" :yDomain="yDomain">
      <VisGroupedBar
        :x="x"
        :y="[y]"
        :color="[chartConfig.count.color]"
        :rounded-corners="4"
        :bar-padding="0.2"
      />
      <VisAxis
        type="x"
        :grid-line="false"
        :domain-line="false"
        :tick-line="false"
      />
      <VisAxis
        type="y"
        :grid-line="true"
        :domain-line="false"
        :tick-line="false"
        :tick-format="(v: number) => String(Math.round(v))"
      />
      <VisTooltip :triggers="{ [GroupedBar.selectors.bar]: tooltipTemplate }" />
    </VisXYContainer>
  </ChartContainer>
</template>
