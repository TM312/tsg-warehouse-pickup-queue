<script setup lang="ts">
import { useDashboardData } from '@/composables/useDashboardData'
import { useProcessingPulse } from '@/composables/useProcessingPulse'
import { useGateStatuses } from '@/composables/useGateStatus'
import { useSimulationStore } from '@/stores/simulation'
import { ANIMATION } from '@/constants/animations'
import { formatDurationMs } from '@/utils/formatDuration'
import { calcProcessingProgress } from '@/utils/processing'
import type { PickupRequest } from '@/types/pickup-request'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import GateStatusDot from './GateStatusDot.vue'
import ProcessingProgressBar from './ProcessingProgressBar.vue'

const { processingGateRows } = useDashboardData()
const simulation = useSimulationStore()
const pulse = useProcessingPulse(processingGateRows)
const { statusOf } = useGateStatuses()
const pulseMs = `${ANIMATION.PROCESSING_PULSE_MS}ms`

function elapsedForRequest(request: PickupRequest | null): string {
  if (!request?.processing_started_sim_ms) return '--'
  const elapsed = simulation.elapsedMs - request.processing_started_sim_ms
  return formatDurationMs(Math.max(0, elapsed))
}

function progressForRequest(request: PickupRequest | null): number {
  return calcProcessingProgress(request?.processing_started_sim_ms, simulation.elapsedMs)
}
</script>

<template>
  <div data-testid="staff-processing-table" data-walkthrough="processing-table">
    <Table>
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
