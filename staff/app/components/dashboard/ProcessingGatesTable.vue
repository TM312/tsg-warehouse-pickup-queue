<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import StatusBadge from './StatusBadge.vue'
import RequestActionButtons from './RequestActionButtons.vue'
import { PICKUP_STATUS } from '#shared/types/pickup-request'

interface ProcessingGateRow {
  id: string
  gate_number: number
  order: {
    id: string
    sales_order_number: string
    company_name: string | null
    processing_started_at: string
    gate_id: string
  } | null
}

const props = defineProps<{
  gates: ProcessingGateRow[]
  loading: Record<string, boolean>
}>()

const emit = defineEmits<{
  complete: [requestId: string, gateId: string]
  revert: [requestId: string]
  cancel: [requestId: string]
  rowClick: [requestId: string]
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <h2 class="text-lg font-semibold">Now Processing</h2>
      <Badge variant="secondary" class="text-xs">{{ gates.filter(g => g.order).length }}</Badge>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Gate</TableHead>
          <TableHead>Order</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="gate in gates"
          :key="gate.id"
          :class="[
            gate.order ? 'cursor-pointer hover:bg-accent/50' : 'opacity-60',
          ]"
          @click="gate.order && emit('rowClick', gate.order.id)"
        >
          <TableCell class="font-medium">Gate {{ gate.gate_number }}</TableCell>

          <template v-if="gate.order">
            <TableCell>{{ gate.order.sales_order_number }}</TableCell>
            <TableCell>{{ gate.order.company_name || 'N/A' }}</TableCell>
            <TableCell>
              <StatusBadge
                :status="PICKUP_STATUS.PROCESSING"
                :processing-started-at="gate.order.processing_started_at"
              />
            </TableCell>
            <TableCell @click.stop>
              <RequestActionButtons
                :status="PICKUP_STATUS.PROCESSING"
                :loading="loading[gate.order.id]"
                @complete="emit('complete', gate.order.id, gate.order.gate_id)"
                @revert="emit('revert', gate.order.id)"
                @cancel="emit('cancel', gate.order.id)"
              />
            </TableCell>
          </template>

          <template v-else>
            <TableCell colspan="3" class="text-center text-muted-foreground italic">
              Idle
            </TableCell>
            <TableCell></TableCell>
          </template>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
