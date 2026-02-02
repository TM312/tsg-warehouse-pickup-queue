<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisGroupedBar, VisAxis, VisTooltip } from '@unovis/vue'
import { GroupedBar } from '@unovis/ts'
import { Skeleton } from '@/components/ui/skeleton'

interface GateQueueData {
  gate: string
  count: number
  gateId: string
}

const props = defineProps<{
  data: GateQueueData[]
  loading?: boolean
}>()

// Accessor functions for Unovis
const x = (d: GateQueueData) => d.gate
const y = (d: GateQueueData) => d.count

// Tooltip template
const tooltipTemplate = (d: GateQueueData) => {
  return `<div class="bg-popover text-popover-foreground rounded-md border px-3 py-1.5 text-sm shadow-md">
    <div class="font-medium">${d.gate}</div>
    <div class="text-muted-foreground">${d.count} waiting</div>
  </div>`
}

// Chart color using CSS variable
const barColor = 'hsl(var(--chart-1))'

// Check if there's any data
const hasData = computed(() => props.data.length > 0)
</script>

<template>
  <div class="w-full h-[300px]">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-end justify-around h-full p-4 gap-4">
      <Skeleton v-for="i in 4" :key="i" class="flex-1" :style="{ height: `${30 + Math.random() * 50}%` }" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasData" class="flex items-center justify-center h-full text-muted-foreground">
      No gates configured
    </div>

    <!-- Chart -->
    <VisXYContainer v-else :data="data" class="h-full">
      <VisGroupedBar
        :x="x"
        :y="y"
        :color="barColor"
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
  </div>
</template>

<style scoped>
/* Ensure Unovis container takes full height */
:deep(.unovis-xy-container) {
  height: 100%;
}
</style>
