<script setup lang="ts">
import { ExternalLink } from 'lucide-vue-next'
import { computed } from 'vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import type { GateWithCount } from '#shared/types/gate'
import type { PickupRequest } from '#shared/types/pickup-request'

const props = defineProps<{
  gates: GateWithCount[]
  processingOrders: PickupRequest[]
}>()

const emit = defineEmits<{
  'toggle-active': [gateId: string, isActive: boolean]
}>()

// Sort gates by gate_number ascending
const sortedGates = computed(() =>
  [...props.gates].sort((a, b) => a.gate_number - b.gate_number)
)

// Create Map for O(1) processing order lookup by gate ID
const processingByGate = computed(() => {
  const map = new Map<string, PickupRequest>()
  for (const order of props.processingOrders) {
    if (order.assigned_gate_id) {
      map.set(order.assigned_gate_id, order)
    }
  }
  return map
})

function getProcessingOrder(gateId: string): PickupRequest | undefined {
  return processingByGate.value.get(gateId)
}

function handleToggle(gateId: string, checked: boolean) {
  emit('toggle-active', gateId, checked)
}
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Gate</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Queue</TableHead>
        <TableHead>Processing</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <template v-if="sortedGates.length > 0">
        <TableRow v-for="gate in sortedGates" :key="gate.id">
          <TableCell class="font-medium">Gate {{ gate.gate_number }}</TableCell>
          <TableCell>
            <Badge
              :class="gate.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'"
            >
              {{ gate.is_active ? 'Active' : 'Inactive' }}
            </Badge>
          </TableCell>
          <TableCell>{{ gate.queue_count }}</TableCell>
          <TableCell>
            {{ getProcessingOrder(gate.id)?.sales_order_number ?? '—' }}
          </TableCell>
          <TableCell>
            <div class="flex items-center gap-3">
              <Switch
                :checked="gate.is_active"
                @update:checked="(checked: boolean) => handleToggle(gate.id, checked)"
              />
              <Button variant="outline" size="sm" as-child>
                <NuxtLink :to="`/gate/${gate.id}`" target="_blank">
                  Open
                  <ExternalLink class="h-4 w-4" />
                </NuxtLink>
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </template>
      <template v-else>
        <TableRow>
          <TableCell colspan="5" class="text-center text-muted-foreground py-8">
            No gates configured
          </TableCell>
        </TableRow>
      </template>
    </TableBody>
  </Table>
</template>
