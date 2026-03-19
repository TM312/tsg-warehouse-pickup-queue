<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { useDashboardData } from '@/composables/useDashboardData'
import { useProcessingPulse } from '@/composables/useProcessingPulse'
import { useGateStatuses } from '@/composables/useGateStatus'
import { useSimulationStore } from '@/stores/simulation'
import { useMorningRush } from '@/composables/useMorningRush'
import { ANIMATION, cssMs } from '@/constants/animations'
import { EMPTY_STATE, RUN_SCENARIO_LABEL } from '@/constants/empty-states'
import { calcProcessingProgress, formatProcessingElapsed } from '@/utils/processing'
import type { PickupRequest } from '@/types/pickup-request'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import GateStatusDot from './GateStatusDot.vue'
import ProcessingProgressBar from './ProcessingProgressBar.vue'

const { processingGateRows } = useDashboardData()
const simulation = useSimulationStore()
const pulse = useProcessingPulse(processingGateRows)
const { statusOf } = useGateStatuses()
const { handleRunMorningRush, isRunning } = useMorningRush()
const pulseMs = cssMs(ANIMATION.PROCESSING_PULSE_MS)

const hasAnyProcessing = computed(() => processingGateRows.value.some(row => row.request !== null))

function elapsedForRequest(request: PickupRequest | null): string {
  return formatProcessingElapsed(request?.processing_started_sim_ms, simulation.elapsedMs)
}

function progressForRequest(request: PickupRequest | null): number {
  return calcProcessingProgress(request?.processing_started_sim_ms, simulation.elapsedMs)
}

</script>

<template>
  <div data-testid="staff-processing-table" data-walkthrough="processing-table">
    <Table v-if="hasAnyProcessing">
      <TableHeader>
        <TableRow>
          <TableHead>Gate</TableHead>
          <TableHead>Order</TableHead>
          <TableHead>Elapsed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-for="row in processingGateRows" :key="row.gateId">
          <TableRow
            :class="{ 'processing-pulse': pulse.isPulsing(row.gateId) }"
          >
            <TableCell class="font-medium">
              <span class="inline-flex items-center gap-1.5">
                <GateStatusDot :status="statusOf(row.gateId)" />
                {{ row.gate }}
              </span>
            </TableCell>
            <TableCell>
              {{ row.request ? row.request.sales_order_number : 'Idle' }}
            </TableCell>
            <TableCell>{{ elapsedForRequest(row.request) }}</TableCell>
          </TableRow>
          <TableRow v-if="row.request" class="border-0">
            <TableCell colspan="3" class="p-0">
              <ProcessingProgressBar :progress="progressForRequest(row.request)" />
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>

    <EmptyState
      v-else
      :icon="EMPTY_STATE.STAFF_PROCESSING.icon"
      :heading="EMPTY_STATE.STAFF_PROCESSING.heading"
      :subtext="EMPTY_STATE.STAFF_PROCESSING.subtext"
    >
      <Button variant="outline" size="sm" :disabled="isRunning" @click="handleRunMorningRush">
        {{ RUN_SCENARIO_LABEL }}
        <ArrowRight class="ml-1 size-4" />
      </Button>
    </EmptyState>
  </div>
</template>

<style scoped>
@keyframes row-pulse {
  0%,
  100% {
    background-color: transparent;
  }
  50% {
    background-color: oklch(0.9 0.05 85);
  }
}
.processing-pulse {
  animation: row-pulse v-bind(pulseMs) ease-in-out;
}
@media (prefers-reduced-motion: reduce) {
  .processing-pulse {
    animation: none;
  }
}
</style>
