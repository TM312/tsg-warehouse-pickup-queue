<script setup lang="ts">
// === Imports ===
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
import { useDashboardKpis } from '@/composables/useDashboardKpis'
import { useDashboardData } from '@/composables/useDashboardData'
import { formatDuration } from '@/utils/formatDuration'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import QueueBarChart from '@/components/dashboard/QueueBarChart.vue'
import { PICKUP_STATUS } from '#shared/types/pickup-request'
import type { PickupRequest } from '#shared/types/pickup-request'

// === Page Meta ===
definePageMeta({
  middleware: 'auth'
})

// === Store & Composable Setup ===
const client = useSupabaseClient()
const queueStore = useQueueStore()
const gatesStore = useGatesStore()
const { requests, loading: requestsLoading } = storeToRefs(queueStore)
const { gates: allGates, activeGates } = storeToRefs(gatesStore)

const { pending, assignGate, cancelRequest, completeRequest, reorderQueue, setPriority, clearPriority, moveToGate, revertToQueue, refresh } = useQueueActions()
const { createGate, toggleGateActive } = useGateManagement()
const { status: realtimeStatus } = useRealtimeQueue()

const { loading: kpiLoading, completedCount, avgWaitTimeMinutes, avgProcessingTimeMinutes } = useDashboardKpis()

// === Local UI State ===
const showCompleted = ref(false)
const selectedRequest = ref<PickupRequest | null>(null)

// === Dashboard-Specific Derived Data ===
const { currentlyWaiting, chartData, processingItems, gatesWithQueues, filteredRequests } = useDashboardData(showCompleted)

// === Column Configuration ===
const columns = computed(() => createColumns({
  gates: activeGates.value,
  pendingIds: pending.value,
  onGateSelect: handleGateSelect,
  onComplete: handleComplete,
  onCancel: handleCancel,
}))

// === Sheet State ===
const sheetOpen = computed({
  get: () => selectedRequest.value !== null,
  set: (v) => { if (!v) selectedRequest.value = null }
})

const refreshing = computed(() => requestsLoading.value)

// === Queue Action Handlers ===
async function handleGateSelect(requestId: string, gateId: string) {
  const request = requests.value.find((r: PickupRequest) => r.id === requestId)
  if (request?.status === PICKUP_STATUS.IN_QUEUE) {
    await moveToGate(requestId, gateId)
  } else {
    await assignGate(requestId, gateId)
  }
  await refresh()
  if (selectedRequest.value?.id === requestId) {
    const updated = requests.value.find((r: PickupRequest) => r.id === requestId)
    if (updated) selectedRequest.value = updated
  }
}

async function handleComplete(requestId: string) {
  await completeRequest(requestId)
  await refresh()
  if (selectedRequest.value?.id === requestId) {
    selectedRequest.value = null
  }
}

async function handleCancel(requestId: string) {
  await cancelRequest(requestId)
  await refresh()
  if (selectedRequest.value?.id === requestId) {
    selectedRequest.value = null
  }
}

async function handleReorder(gateId: string, requestIds: string[]) {
  const success = await reorderQueue(gateId, requestIds)
  await refresh()
}

// === Priority Handlers ===
async function handleSetPriority(requestId: string) {
  await setPriority(requestId)
  await refresh()
}

async function handleClearPriority(requestId: string) {
  await clearPriority(requestId)
  await refresh()
}

// === Processing Section Handlers ===
async function handleProcessingComplete(requestId: string, gateId: string) {
  await completeRequest(requestId, gateId)
  await refresh()
}

async function handleProcessingRevert(requestId: string) {
  await revertToQueue(requestId)
  await refresh()
}

// === Gate Management Handlers ===
async function handleCreateGate(gateNumber: number) {
  await createGate(gateNumber)
}

async function handleToggleGateActive(gateId: string, isActive: boolean) {
  await toggleGateActive(gateId, isActive)
}

// === Manual Order Creation ===
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

// === UI Interaction Handlers ===
function handleRowClick(request: PickupRequest) {
  selectedRequest.value = request
}

function handleQueueRowClick(requestId: string) {
  const request = requests.value.find((r: PickupRequest) => r.id === requestId)
  if (request) {
    selectedRequest.value = request
  }
}

// === Detail Panel Delegates ===
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
</script>

<template>
  <div>
    <!-- KPI Cards Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KpiCard label="Completed Today" :value="completedCount" :loading="kpiLoading" />
      <KpiCard label="Avg Wait Time" :value="formatDuration(avgWaitTimeMinutes)" :loading="kpiLoading" />
      <KpiCard label="Avg Processing Time" :value="formatDuration(avgProcessingTimeMinutes)" :loading="kpiLoading" />
      <KpiCard label="Currently Waiting" :value="currentlyWaiting" :loading="requestsLoading" />
    </div>

    <!-- Queue Bar Chart -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold mb-4">Queue by Gate</h2>
      <QueueBarChart :data="chartData" :loading="requestsLoading" />
    </div>

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
        <TabsTrigger v-for="gate in gatesWithQueues" :key="gate.id" :value="`gate-${gate.id}`">
          Gate {{ gate.gate_number }}
          <span class="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">{{ gate.totalActive }}</span>
        </TabsTrigger>
        <TabsTrigger value="manage">Manage Gates</TabsTrigger>
      </TabsList>

      <TabsContent value="all" class="mt-4">
        <div class="flex justify-end mb-4">
          <ShowCompletedToggle v-model:showCompleted="showCompleted" />
        </div>
        <DataTable :columns="columns" :data="filteredRequests" @row-click="handleRowClick" />
      </TabsContent>

      <TabsContent v-for="gate in gatesWithQueues" :key="gate.id" :value="`gate-${gate.id}`" class="mt-4">
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
        <GateManagement :gates="allGates ?? []" @create="handleCreateGate" @toggle-active="handleToggleGateActive" />
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
            :gates="activeGates ?? []"
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
