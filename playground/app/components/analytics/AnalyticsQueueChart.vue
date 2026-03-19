<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer } from '@unovis/vue'
import { VisArea } from '@unovis/vue'
import { VisAxis } from '@unovis/vue'
import { CurveType } from '@unovis/ts'
import { useQueueHistory } from '@/composables/useQueueHistory'
import { useGateStatuses } from '@/composables/useGateStatus'
import { resolveGateColors, formatTimeMs } from '@/utils/chart'
import { CHART_HEIGHT_PX } from '@/constants/chart'
import { EmptyState } from '@/components/ui/empty-state'
import { EMPTY_STATE } from '@/constants/empty-states'
import GateStatusDot from '@/components/staff/GateStatusDot.vue'

const { history, gateIds, gateLabels } = useQueueHistory()
const { statusOf } = useGateStatuses()

const hasEnoughData = computed(() => history.value.length >= 2)

type ChartDatum = Record<string, number>

const chartData = computed<ChartDatum[]>(() =>
  history.value.map((point) => {
    const datum: ChartDatum = { x: point.timeMs }
    for (const id of gateIds.value) {
      datum[id] = point.counts[id] ?? 0
    }
    return datum
  }),
)

const yAccessors = computed(() =>
  gateIds.value.map((id) => (d: ChartDatum) => d[id] ?? 0),
)

const colors = computed(() => resolveGateColors())

const colorAccessor = computed(() => {
  const c = colors.value
  return (_d: ChartDatum, i: number) => c[i % c.length]
})

const xAccessor = (d: ChartDatum) => d.x

const legendItems = computed(() =>
  gateIds.value.map((id, i) => {
    const c = colors.value
    return { id, label: gateLabels.value[id] ?? id, color: c[i % c.length] }
  }),
)
</script>

<template>
  <div data-testid="analytics-queue-chart">
    <h3 class="mb-2 text-sm font-semibold">Queue Depth Over Time</h3>

    <template v-if="hasEnoughData">
      <div class="flex gap-3 mb-1">
        <div v-for="item in legendItems" :key="item.label" class="flex items-center gap-1 text-xs text-muted-foreground">
          <GateStatusDot :status="statusOf(item.id)" size="sm" />
          <span class="inline-block h-2 w-2 rounded-full" :style="{ backgroundColor: item.color }" />
          {{ item.label }}
        </div>
      </div>

      <VisXYContainer
        :data="chartData"
        :height="CHART_HEIGHT_PX"
        :style="{ width: '100%' }"
      >
        <VisArea
          :x="xAccessor"
          :y="yAccessors"
          :color="colorAccessor"
          :curve-type="CurveType.Basis"
          :opacity="0.7"
        />
        <VisAxis
          type="x"
          :tick-format="formatTimeMs"
          :num-ticks="4"
          :grid-line="false"
          :domain-line="false"
          :tick-line="false"
        />
        <VisAxis
          type="y"
          :num-ticks="3"
          :grid-line="true"
          :domain-line="false"
          :tick-line="false"
          :tick-format="(d: number) => String(Math.round(d))"
        />
      </VisXYContainer>
    </template>

    <EmptyState
      v-else
      :icon="EMPTY_STATE.ANALYTICS_QUEUE_CHART.icon"
      :heading="EMPTY_STATE.ANALYTICS_QUEUE_CHART.heading"
      :subtext="EMPTY_STATE.ANALYTICS_QUEUE_CHART.subtext"
    />
  </div>
</template>
