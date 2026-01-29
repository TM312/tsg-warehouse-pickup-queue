<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AcceptableValue } from 'reka-ui'
import { Loader2 } from 'lucide-vue-next'

interface Gate {
  id: string
  gate_number: number
  queue_count: number
}

const props = defineProps<{
  gates: Gate[]
  currentGateId: string | null
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [gateId: string]
}>()

function handleSelect(value: AcceptableValue) {
  if (typeof value === 'string') {
    emit('select', value)
  }
}
</script>

<template>
  <Select
    :model-value="currentGateId ?? undefined"
    :disabled="disabled || loading"
    @update:model-value="handleSelect"
  >
    <SelectTrigger class="w-[160px]" @click.stop>
      <Loader2 v-if="loading" class="h-4 w-4 animate-spin mr-2" />
      <SelectValue placeholder="Assign gate" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="gate in gates" :key="gate.id" :value="gate.id">
        Gate {{ gate.gate_number }} ({{ gate.queue_count }})
      </SelectItem>
    </SelectContent>
  </Select>
</template>
