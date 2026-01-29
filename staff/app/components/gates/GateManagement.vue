<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import CreateGateDialog from './CreateGateDialog.vue'

interface GateWithCount {
  id: string
  gate_number: number
  is_active: boolean
  queue_count: number
}

const props = defineProps<{
  gates: GateWithCount[]
}>()

const emit = defineEmits<{
  create: [gateNumber: number]
  'toggle-active': [gateId: string, isActive: boolean]
}>()

const sortedGates = computed(() => {
  return [...props.gates].sort((a, b) => a.gate_number - b.gate_number)
})

function handleToggleActive(gate: GateWithCount, checked: boolean) {
  emit('toggle-active', gate.id, checked)
}

function hasCustomers(gate: GateWithCount): boolean {
  return gate.queue_count > 0
}
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4">
      <CardTitle>Manage Gates</CardTitle>
      <CreateGateDialog @create="(n) => emit('create', n)" />
    </CardHeader>
    <CardContent>
      <div v-if="sortedGates.length === 0" class="text-center py-8 text-muted-foreground">
        No gates configured. Click "Add Gate" to create one.
      </div>
      <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="gate in sortedGates"
          :key="gate.id"
          class="flex items-center justify-between p-4 border rounded-lg transition-opacity"
          :class="{ 'opacity-50 bg-muted': !gate.is_active }"
        >
          <div class="flex items-center gap-3">
            <div class="font-semibold text-lg">
              Gate {{ gate.gate_number }}
            </div>
            <Badge
              v-if="gate.queue_count > 0"
              variant="secondary"
            >
              {{ gate.queue_count }} in queue
            </Badge>
          </div>
          <div class="flex items-center gap-2">
            <Label :for="`gate-${gate.id}`" class="text-sm text-muted-foreground">
              {{ gate.is_active ? 'Active' : 'Disabled' }}
            </Label>
            <Switch
              :id="`gate-${gate.id}`"
              :checked="gate.is_active"
              :disabled="hasCustomers(gate) && gate.is_active"
              @update:checked="(checked: boolean) => handleToggleActive(gate, checked)"
            />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
