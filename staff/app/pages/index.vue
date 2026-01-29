<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import DataTable from '@/components/dashboard/DataTable.vue'
import { createColumns, type PickupRequest } from '@/components/dashboard/columns'
import RequestDetail from '@/components/dashboard/RequestDetail.vue'
import { useQueueActions } from '@/composables/useQueueActions'

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
      .select('id, sales_order_number, company_name, customer_email, status, email_flagged, assigned_gate_id, queue_position, created_at, gate:gates(id, gate_number)')
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

// Fetch gates with queue counts
const { data: gates, refresh: refreshGates } = await useAsyncData<GateWithCount[]>('gates-with-counts', async () => {
  const { data, error } = await client
    .from('gates')
    .select('id, gate_number, is_active')
    .eq('is_active', true)
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

// Queue actions composable
const { pending, assignGate, cancelRequest, completeRequest } = useQueueActions()

// Refresh all data
async function refresh() {
  await Promise.all([refreshRequests(), refreshGates()])
}

// Action handlers
async function handleGateSelect(requestId: string, gateId: string) {
  await assignGate(requestId, gateId)
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

    <Tabs default-value="active" class="w-full">
      <TabsList>
        <TabsTrigger value="active">
          Active Queue
          <span class="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">
            {{ activeRequests.length }}
          </span>
        </TabsTrigger>
        <TabsTrigger value="history">
          History
          <span class="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">
            {{ historyRequests.length }}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active" class="mt-4">
        <DataTable
          :columns="columns"
          :data="activeRequests"
          @row-click="handleRowClick"
        />
      </TabsContent>

      <TabsContent value="history" class="mt-4">
        <DataTable
          :columns="columns"
          :data="historyRequests"
          @row-click="handleRowClick"
        />
      </TabsContent>
    </Tabs>

    <!-- Request Detail Sheet -->
    <Sheet v-model:open="sheetOpen">
      <SheetContent class="overflow-y-auto">
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
