<script setup lang="ts">
import { computed } from 'vue'
import { Power, PowerOff } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CreateGateDialog from './CreateGateDialog.vue'
import EditGateDialog from './EditGateDialog.vue'
import DeleteGateDialog from './DeleteGateDialog.vue'

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
  rename: [gateId: string, newNumber: number]
  delete: [gateId: string]
  'toggle-active': [gateId: string, isActive: boolean]
}>()

const sortedGates = computed(() => {
  return [...props.gates].sort((a, b) => a.gate_number - b.gate_number)
})

function handleToggleActive(gate: GateWithCount) {
  // Toggle to opposite state
  emit('toggle-active', gate.id, !gate.is_active)
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
            <Badge
              v-if="!gate.is_active"
              variant="outline"
              class="text-muted-foreground"
            >
              Disabled
            </Badge>
          </div>
          <div class="flex items-center gap-1">
            <EditGateDialog
              :gate="gate"
              @rename="(id, n) => emit('rename', id, n)"
            />
            <Button
              variant="ghost"
              size="icon"
              :disabled="hasCustomers(gate) && gate.is_active"
              :title="gate.is_active ? 'Disable gate' : 'Enable gate'"
              @click="handleToggleActive(gate)"
            >
              <Power v-if="gate.is_active" class="h-4 w-4" />
              <PowerOff v-else class="h-4 w-4" />
              <span class="sr-only">
                {{ gate.is_active ? 'Disable' : 'Enable' }} gate {{ gate.gate_number }}
              </span>
            </Button>
            <DeleteGateDialog
              :gate="gate"
              :has-customers="hasCustomers(gate)"
              @delete="(id) => emit('delete', id)"
            />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
