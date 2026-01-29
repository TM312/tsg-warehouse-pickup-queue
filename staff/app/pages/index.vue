<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import DataTable from '@/components/dashboard/DataTable.vue'
import { createColumns, type PickupRequest } from '@/components/dashboard/columns'
import RequestDetail from '@/components/dashboard/RequestDetail.vue'
import GateQueueList from '@/components/dashboard/GateQueueList.vue'
import GateManagement from '@/components/gates/GateManagement.vue'
import { useQueueActions } from '@/composables/useQueueActions'
import { useGateManagement } from '@/composables/useGateManagement'

definePageMeta({
  middleware: 'auth'
})

const client = useSupabaseClient()

// Fetch pickup requests with gate relation
const { data: requests, refresh: refreshRequests, status } = await useAsyncData<PickupRequest[]>(
  'pickup-requests-list',
  async () => {
    const { data, error } = await client
      .from('pickup_requests')
      .select('id, sales_order_number, company_name, customer_email, status, email_flagged, assigned_gate_id, queue_position, is_priority, created_at, gate:gates(id, gate_number)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as PickupRequest[]
  }
)

// Type for gate data
interface GateWithCount {
  id: string
  gate_number: number
  is_active: boolean
  queue_count: number
}

// Fetch ALL gates for management tab (not just active)
const { data: allGates, refresh: refreshGates } = await useAsyncData<GateWithCount[]>('all-gates', async () => {
  const { data, error } = await client
    .from('gates')
    .select('id, gate_number, is_active')
    .order('gate_number')

  if (error) throw error

  // Get queue counts per gate
  const { data: counts } = await client
    .from('pickup_requests')
    .select('assigned_gate_id')
    .eq('status', 'in_queue')

  const countMap: Record<string, number> = {}
  for (const row of counts ?? []) {
    const gateId = (row as { assigned_gate_id: string | null }).assigned_gate_id
    if (gateId) {
      countMap[gateId] = (countMap[gateId] || 0) + 1
    }
  }

  return (data as { id: string; gate_number: number; is_active: boolean }[]).map(g => ({
    ...g,
    queue_count: countMap[g.id] || 0
  }))
})

// Active gates for tabs (filter from allGates)
const gates = computed(() => (allGates.value ?? []).filter(g => g.is_active))

// Queue actions composable
const { pending, assignGate, cancelRequest, completeRequest, reorderQueue, setPriority, clearPriority, moveToGate } = useQueueActions()

// Gate management composable
const { createGate, toggleGateActive } = useGateManagement()

// Refresh all data
async function refresh() {
  await Promise.all([refreshRequests(), refreshGates()])
}

// Action handlers
async function handleGateSelect(requestId: string, gateId: string) {
  const request = requests.value?.find(r => r.id === requestId)
  if (request?.status === 'in_queue') {
    // Already in queue - this is a move operation
    await moveToGate(requestId, gateId)
  } else {
    // Not in queue - assign to queue
    await assignGate(requestId, gateId)
  }
  await refresh()
  // Update selected request if it's the one being modified
  if (selectedRequest.value?.id === requestId) {
    const updated = requests.value?.find(r => r.id === requestId)
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
  const request = requests.value?.find(r => r.id === requestId)
  if (request) {
    selectedRequest.value = request
  }
}

// Gate management handlers
async function handleCreateGate(gateNumber: number) {
  await createGate(gateNumber)
  await refreshGates()
}

async function handleToggleGateActive(gateId: string, isActive: boolean) {
  await toggleGateActive(gateId, isActive)
  await refreshGates()
}

// Computed for per-gate queue items
const gatesWithQueues = computed(() => {
  return (gates.value ?? []).map(gate => ({
    ...gate,
    queue: (requests.value ?? [])
      .filter(r => r.assigned_gate_id === gate.id && r.status === 'in_queue')
      .sort((a, b) => (a.queue_position ?? 0) - (b.queue_position ?? 0))
      .map(r => ({
        id: r.id,
        sales_order_number: r.sales_order_number,
        company_name: r.company_name,
        queue_position: r.queue_position ?? 0,
        is_priority: r.is_priority ?? false
      }))
  }))
})

// Create columns with callbacks
const columns = computed(() => createColumns({
  gates: gates.value ?? [],
  pendingIds: pending.value,
  onGateSelect: handleGateSelect,
  onComplete: handleComplete,
  onCancel: handleCancel,
}))

// Filter requests for tabs
const activeRequests = computed(() =>
  (requests.value ?? []).filter(r => !['completed', 'cancelled'].includes(r.status))
)

const historyRequests = computed(() =>
  (requests.value ?? []).filter(r => ['completed', 'cancelled'].includes(r.status))
)

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

const refreshing = computed(() => status.value === 'pending')
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Pickup Queue</h1>
      <Button variant="outline" size="sm" :disabled="refreshing" @click="refresh()">
        <RefreshCw :class="['h-4 w-4 mr-2', { 'animate-spin': refreshing }]" />
        Refresh
      </Button>
    </div>

    <Tabs default-value="all" class="w-full">
      <TabsList class="flex-wrap">
        <TabsTrigger value="all">
          All Requests
          <span class="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">{{ activeRequests.length }}</span>
        </TabsTrigger>
        <TabsTrigger value="history">
          History
          <span class="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">{{ historyRequests.length }}</span>
        </TabsTrigger>
        <TabsTrigger
          v-for="gate in gatesWithQueues"
          :key="gate.id"
          :value="`gate-${gate.id}`"
        >
          Gate {{ gate.gate_number }}
          <span class="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">{{ gate.queue.length }}</span>
        </TabsTrigger>
        <TabsTrigger value="manage">
          Manage Gates
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" class="mt-4">
        <DataTable :columns="columns" :data="activeRequests" @row-click="handleRowClick" />
      </TabsContent>

      <TabsContent value="history" class="mt-4">
        <DataTable :columns="columns" :data="historyRequests" @row-click="handleRowClick" />
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
