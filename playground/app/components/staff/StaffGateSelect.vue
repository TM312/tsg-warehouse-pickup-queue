<script setup lang="ts">
import { computed } from 'vue'
import { PICKUP_STATUS, type PickupStatus } from '@/constants/status'
import { useGatesStore } from '@/stores/gates'
import { useSimulationActions } from '@/composables/useSimulationActions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps<{
  currentGateId: string | null
  requestId: string
  status: PickupStatus
}>()

const gates = useGatesStore()
const actions = useSimulationActions()

const isDisabled = computed(() =>
  props.status !== PICKUP_STATUS.APPROVED && props.status !== PICKUP_STATUS.IN_QUEUE,
)

function handleChange(gateId: string) {
  if (props.status === PICKUP_STATUS.APPROVED) {
    actions.assignToGate(props.requestId, gateId)
  } else if (props.status === PICKUP_STATUS.IN_QUEUE) {
    actions.moveToGate(props.requestId, gateId)
  }
}
</script>

<template>
  <Select
    :model-value="currentGateId ?? undefined"
    :disabled="isDisabled"
    data-testid="staff-gate-select"
    @update:model-value="handleChange"
  >
    <SelectTrigger class="h-8 w-[120px]" data-testid="staff-gate-select">
      <SelectValue placeholder="Assign gate" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="gate in gates.sortedActiveGates"
        :key="gate.id"
        :value="gate.id"
      >
        Gate {{ gate.gate_number }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
