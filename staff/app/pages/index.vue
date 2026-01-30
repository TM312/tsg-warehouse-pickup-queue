<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { RefreshCw } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import DataTable from '@/components/dashboard/DataTable.vue'
import { createColumns } from '@/components/dashboard/columns'
import RequestDetail from '@/components/dashboard/RequestDetail.vue'
import GateQueueList from '@/components/dashboard/GateQueueList.vue'
import NowProcessingSection from '@/components/dashboard/NowProcessingSection.vue'
import GateManagement from '@/components/gates/GateManagement.vue'
import AddOrderDialog from '@/components/dashboard/AddOrderDialog.vue'
import ShowCompletedToggle from '@/components/dashboard/ShowCompletedToggle.vue'
import ConnectionStatus from '@/components/ConnectionStatus.vue'
import { useQueueActions } from '@/composables/useQueueActions'
import { useGateManagement } from '@/composables/useGateManagement'
import { useRealtimeQueue } from '@/composables/useRealtimeQueue'
import { PICKUP_STATUS, TERMINAL_STATUSES } from '#shared/types/pickup-request'
import type { PickupRequest } from '#shared/types/pickup-request'
import type { GateWithCount } from '#shared/types/gate'

definePageMeta({
  middleware: 'auth'
})

const client = useSupabaseClient()

// Use stores via storeToRefs for reactive state
const queueStore = useQueueStore()
const gatesStore = useGatesStore()
const { requests, loading: requestsLoading } = storeToRefs(queueStore)
const { gates: allGates, activeGates } = storeToRefs(gatesStore)

// Composables for actions
const { pending, assignGate, cancelRequest, completeRequest, reorderQueue, setPriority, clearPriority, moveToGate, startProcessing, revertToQueue, refresh } = useQueueActions()
const { createGate, toggleGateActive } = useGateManagement()
const { status: realtimeStatus } = useRealtimeQueue()

// NOTE: Realtime subscription is handled at app level (app.vue)
// No need for local subscribe/unsubscribe

// Show completed/cancelled toggle
const showCompleted = ref(false)

// Computed for active gates (from store getter)
const gates = activeGates

// Action handlers
async function handleGateSelect(requestId: string, gateId: string) {
  const request = requests.value.find((r: PickupRequest) => r.id === requestId)
  if (request?.status === PICKUP_STATUS.IN_QUEUE) {
    // Already in queue - this is a move operation
    await moveToGate(requestId, gateId)
  } else {
    // Not in queue - assign to queue
    await assignGate(requestId, gateId)
  }
  await refresh()
  // Update selected request if it's the one being modified
  if (selectedRequest.value?.id === requestId) {
    const updated = requests.value.find((r: PickupRequest) => r.id === requestId)
    if (updated) selectedRequest.value = updated
  }
}

async function handleComplete(requestId: string) {
  await completeRequest(requestId)
  await refresh()
  // Close sheet after completing
  if (selectedRequest.value?.id === requestId) {
    selectedRequest.value = null
  }
}

async function handleCancel(requestId: string) {
  await cancelRequest(requestId)
  await refresh()
  // Close sheet after canceling
  if (selectedRequest.value?.id === requestId) {
    selectedRequest.value = null
  }
}

// Reorder handler with optimistic rollback
async function handleReorder(gateId: string, requestIds: string[]) {
  const success = await reorderQueue(gateId, requestIds)
  if (!success) {
    // Refresh to restore correct order on failure
    await refresh()
  } else {
    await refresh() // Sync with server state
  }
}

// Priority handlers
async function handleSetPriority(requestId: string) {
  await setPriority(requestId)
  await refresh()
}

async function handleClearPriority(requestId: string) {
  await clearPriority(requestId)
  await refresh()
}

// Gate queue list row click - open detail view
function handleQueueRowClick(requestId: string) {
  const request = requests.value.find((r: PickupRequest) => r.id === requestId)
  if (request) {
    selectedRequest.value = request
  }
}

// Processing section handlers
async function handleProcessingComplete(requestId: string, gateId: string) {
  await completeRequest(requestId, gateId)
  await refresh()
}

async function handleProcessingRevert(requestId: string) {
  await revertToQueue(requestId)
  await refresh()
}

// Gate management handlers
async function handleCreateGate(gateNumber: number) {
  await createGate(gateNumber)
}

async function handleToggleGateActive(gateId: string, isActive: boolean) {
  await toggleGateActive(gateId, isActive)
}

// Manual order creation
async function handleCreateOrder(data: { salesOrderNumber: string; email: string; phone: string }) {
  try {
    const { error } = await (client as any)
      .from('pickup_requests')
      .insert({
        sales_order_number: data.salesOrderNumber,
        customer_email: data.email,
        customer_phone: data.phone || null,
        status: PICKUP_STATUS.PENDING,
      })

    if (error) throw error
    toast.success('Pickup request created')
    await refresh()
  } catch (e) {
    toast.error('Failed to create pickup request')
  }
}

// Computed for processing items (for NowProcessingSection)
const processingItems = computed(() => {
  return requests.value
    .filter((r: PickupRequest) => r.status === PICKUP_STATUS.PROCESSING && r.gate)
    .map((r: PickupRequest) => ({
      id: r.id,
      sales_order_number: r.sales_order_number,
      company_name: r.company_name,
      gate_number: r.gate!.gate_number,
      gate_id: r.assigned_gate_id!,
      processing_started_at: r.processing_started_at!
    }))
    .sort((a: { gate_number: number }, b: { gate_number: number }) => a.gate_number - b.gate_number)
})

// Computed for per-gate queue items (includes both in_queue and processing for count)
const gatesWithQueues = computed(() => {
  return gates.value.map((gate: GateWithCount) => {
    const queueItems = requests.value
      .filter((r: PickupRequest) => r.assigned_gate_id === gate.id && r.status === PICKUP_STATUS.IN_QUEUE)
      .sort((a: PickupRequest, b: PickupRequest) => (a.queue_position ?? 0) - (b.queue_position ?? 0))
      .map((r: PickupRequest) => ({
        id: r.id,
        sales_order_number: r.sales_order_number,
        company_name: r.company_name,
        queue_position: r.queue_position ?? 0,
        is_priority: r.is_priority ?? false
      }))

    // Count includes both in_queue and processing for the tab badge
    const processingCount = requests.value
      .filter((r: PickupRequest) => r.assigned_gate_id === gate.id && r.status === PICKUP_STATUS.PROCESSING)
      .length

    return {
      ...gate,
      queue: queueItems,
      totalActive: queueItems.length + processingCount
    }
  })
})

// Create columns with callbacks
const columns = computed(() => createColumns({
  gates: gates.value,
  pendingIds: pending.value,
  onGateSelect: handleGateSelect,
  onComplete: handleComplete,
  onCancel: handleCancel,
}))

// Filter requests based on showCompleted toggle
const filteredRequests = computed(() => {
  const all = requests.value
  if (showCompleted.value) {
    return all
  }
  return all.filter((r: PickupRequest) => !(TERMINAL_STATUSES as readonly string[]).includes(r.status))
})

// Sheet state
const selectedRequest = ref<PickupRequest | null>(null)
const sheetOpen = computed({
  get: () => selectedRequest.value !== null,
  set: (v) => { if (!v) selectedRequest.value = null }
})

// Row click handler
function handleRowClick(request: PickupRequest) {
  selectedRequest.value = request
}

// Detail panel handlers (delegate to main handlers)
async function handleDetailGateSelect(gateId: string) {
  if (selectedRequest.value) {
    await handleGateSelect(selectedRequest.value.id, gateId)
  }
}

async function handleDetailComplete() {
  if (selectedRequest.value) {
    await handleComplete(selectedRequest.value.id)
  }
}

async function handleDetailCancel() {
  if (selectedRequest.value) {
    await handleCancel(selectedRequest.value.id)
  }
}

const refreshing = computed(() => requestsLoading.value)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Pickup Queue</h1>
      <div class="flex items-center gap-2">
        <ConnectionStatus :status="realtimeStatus" />
        <AddOrderDialog @create="handleCreateOrder" />
        <Button variant="outline" size="sm" :disabled="refreshing" @click="refresh()">
          <RefreshCw :class="['h-4 w-4 mr-2', { 'animate-spin': refreshing }]" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Now Processing Section -->
    <NowProcessingSection
      v-if="processingItems.length > 0"
      :items="processingItems"
      :loading="pending"
      class="mb-6"
      @complete="handleProcessingComplete"
      @revert="handleProcessingRevert"
      @row-click="handleQueueRowClick"
    />

    <Tabs default-value="all" class="w-full">
      <TabsList class="flex-wrap">
        <TabsTrigger value="all">
          All Requests
          <span class="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">{{ filteredRequests.length }}</span>
        </TabsTrigger>
        <TabsTrigger
          v-for="gate in gatesWithQueues"
          :key="gate.id"
          :value="`gate-${gate.id}`"
        >
          Gate {{ gate.gate_number }}
          <span class="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">{{ gate.totalActive }}</span>
        </TabsTrigger>
        <TabsTrigger value="manage">
          Manage Gates
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" class="mt-4">
        <div class="flex justify-end mb-4">
          <ShowCompletedToggle v-model:showCompleted="showCompleted" />
        </div>
        <DataTable :columns="columns" :data="filteredRequests" @row-click="handleRowClick" />
      </TabsContent>

      <TabsContent
        v-for="gate in gatesWithQueues"
        :key="gate.id"
        :value="`gate-${gate.id}`"
        class="mt-4"
      >
        <GateQueueList
          :key="gate.id"
          :gate-id="gate.id"
          :items="gate.queue"
          @reorder="(ids) => handleReorder(gate.id, ids)"
          @set-priority="handleSetPriority"
          @clear-priority="handleClearPriority"
          @complete="handleComplete"
          @row-click="handleQueueRowClick"
        />
      </TabsContent>

      <TabsContent value="manage" class="mt-4">
        <GateManagement
          :gates="allGates ?? []"
          @create="handleCreateGate"
          @toggle-active="handleToggleGateActive"
        />
      </TabsContent>
    </Tabs>

    <!-- Request Detail Sheet -->
    <Sheet v-model:open="sheetOpen">
      <SheetContent class="overflow-y-auto sm:max-w-lg p-6">
        <SheetHeader>
          <SheetTitle>Request Details</SheetTitle>
        </SheetHeader>
        <div class="mt-6">
          <RequestDetail
            v-if="selectedRequest"
            :request="selectedRequest"
            :gates="gates ?? []"
            :loading="pending[selectedRequest.id] ?? false"
            @gate-select="handleDetailGateSelect"
            @complete="handleDetailComplete"
            @cancel="handleDetailCancel"
          />
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
