<script setup lang="ts">
import { useDashboardData } from '@/composables/useDashboardData'
import { useSimulationStore } from '@/stores/simulation'
import { formatDurationMs } from '@/utils/formatDuration'
import type { PickupRequest } from '@/types/pickup-request'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const { processingGateRows } = useDashboardData()
const simulation = useSimulationStore()

function elapsedForRequest(request: PickupRequest | null): string {
  if (!request?.processing_started_sim_ms) return '--'
  const elapsed = simulation.elapsedMs - request.processing_started_sim_ms
  return formatDurationMs(Math.max(0, elapsed))
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
        <TableRow v-for="row in processingGateRows" :key="row.gateId">
          <TableCell class="font-medium">{{ row.gate }}</TableCell>
          <TableCell>
            {{ row.request ? row.request.sales_order_number : 'Idle' }}
          </TableCell>
          <TableCell>{{ elapsedForRequest(row.request) }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
