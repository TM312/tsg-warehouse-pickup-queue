<script setup lang="ts">
import type { PickupRequest } from '#shared/types/pickup-request'
import { ACTIVE_STATUSES } from '#shared/types/pickup-request'
import StatusBadge from './StatusBadge.vue'
import GateSelect from './GateSelect.vue'
import ActionButtons from './ActionButtons.vue'
import { Flag } from 'lucide-vue-next'
import { computed } from 'vue'
import { Separator } from '@/components/ui/separator'

const props = defineProps<{
  request: PickupRequest
  gates: Array<{ id: string; gate_number: number; queue_count: number }>
  loading?: boolean
}>()

const emit = defineEmits<{
  'gate-select': [gateId: string]
  complete: []
  cancel: []
}>()

const showActions = computed(() => {
  return (ACTIVE_STATUSES as readonly string[]).includes(props.request.status)
})

const formattedDate = computed(() => {
  return new Date(props.request.created_at).toLocaleString()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Order Number (prominent) -->
    <div>
      <p class="text-sm font-medium text-muted-foreground">Order Number</p>
      <p class="text-2xl font-bold">{{ request.sales_order_number }}</p>
    </div>

    <Separator />

    <!-- Details Grid -->
    <dl class="grid grid-cols-2 gap-4">
      <div>
        <dt class="text-sm font-medium text-muted-foreground">Company</dt>
        <dd class="text-sm">{{ request.company_name || 'N/A' }}</dd>
      </div>

      <div>
        <dt class="text-sm font-medium text-muted-foreground">Customer Email</dt>
        <dd class="text-sm">{{ request.customer_email }}</dd>
      </div>

      <div>
        <dt class="text-sm font-medium text-muted-foreground">Status</dt>
        <dd class="mt-1">
          <StatusBadge :status="request.status" />
        </dd>
      </div>

      <div>
        <dt class="text-sm font-medium text-muted-foreground">Flag</dt>
        <dd class="mt-1 flex items-center gap-2">
          <template v-if="request.email_flagged">
            <Flag class="h-4 w-4 text-destructive" />
            <span class="text-sm text-destructive">Email domain mismatch</span>
          </template>
          <span v-else class="text-sm text-muted-foreground">None</span>
        </dd>
      </div>

      <div>
        <dt class="text-sm font-medium text-muted-foreground">Current Gate</dt>
        <dd class="text-sm">
          <template v-if="request.gate">
            Gate {{ request.gate.gate_number }}
          </template>
          <template v-else>
            Not assigned
          </template>
        </dd>
      </div>

      <div>
        <dt class="text-sm font-medium text-muted-foreground">Queue Position</dt>
        <dd class="text-sm">
          <template v-if="request.queue_position !== null">
            #{{ request.queue_position }}
          </template>
          <template v-else>
            -
          </template>
        </dd>
      </div>

      <div class="col-span-2">
        <dt class="text-sm font-medium text-muted-foreground">Created</dt>
        <dd class="text-sm">{{ formattedDate }}</dd>
      </div>
    </dl>

    <!-- Actions Section -->
    <template v-if="showActions">
      <Separator />

      <div class="space-y-4">
        <h4 class="text-sm font-medium text-muted-foreground">Actions</h4>

        <div class="flex flex-col gap-4">
          <div>
            <label class="text-sm font-medium mb-2 block">Assign Gate</label>
            <GateSelect
              :gates="gates"
              :current-gate-id="request.assigned_gate_id"
              :loading="loading"
              @select="emit('gate-select', $event)"
            />
          </div>

          <div>
            <ActionButtons
              :status="request.status"
              :loading="loading"
              @complete="emit('complete')"
              @cancel="emit('cancel')"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
