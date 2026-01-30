<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { AlertCircle, Users, Play, CheckCircle, RotateCcw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import CurrentPickup from '@/components/gate/CurrentPickup.vue'
import EmptyGateState from '@/components/gate/EmptyGateState.vue'
import NextUpPreview from '@/components/gate/NextUpPreview.vue'
import CompleteDialog from '@/components/gate/CompleteDialog.vue'
import { useRealtimeQueue } from '@/composables/useRealtimeQueue'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const client = useSupabaseClient()
const { pending, startProcessing, revertToQueue, completeRequest } = useQueueActions()
const { status: realtimeStatus, subscribe, unsubscribe } = useRealtimeQueue()

// Dialog state
const showCompleteDialog = ref(false)

// Extract gate ID from route params
const gateId = computed(() => route.params.id as string)

// Fetch gate info
const { data: gate, error: gateError, status: gateStatus } = await useAsyncData(
  `gate-${gateId.value}`,
  async () => {
    const { data, error } = await client
      .from('gates')
      .select('id, gate_number, is_active')
      .eq('id', gateId.value)
      .single()

    if (error) throw error
    return data as { id: string; gate_number: number; is_active: boolean }
  }
)

// Fetch gate queue data (pickups assigned to this gate)
const { data: queue, status: queueStatus } = await useAsyncData(
  `gate-queue-${gateId.value}`,
  async () => {
    if (!gate.value) return []

    const { data, error } = await client
      .from('pickup_requests')
      .select('id, sales_order_number, company_name, status, queue_position, processing_started_at, item_count, po_number')
      .eq('assigned_gate_id', gateId.value)
      .in('status', ['in_queue', 'processing'])
      .order('queue_position', { ascending: true })

    if (error) throw error
    return data as Array<{
      id: string
      sales_order_number: string
      company_name: string | null
      status: 'in_queue' | 'processing'
      queue_position: number | null
      processing_started_at: string | null
      item_count: number | null
      po_number: string | null
    }>
  },
  { watch: [gate] }
)

// Current pickup: processing takes precedence, otherwise position 1
const currentPickup = computed(() => {
  if (!queue.value || queue.value.length === 0) return null

  // Processing takes precedence
  const processing = queue.value.find(r => r.status === 'processing')
  if (processing) return processing

  // Otherwise, position 1
  return queue.value.find(r => r.queue_position === 1) ?? queue.value[0]
})

// Next up: position 2 in queue
const nextUp = computed(() => {
  return queue.value?.find(p => p.queue_position === 2 && p.status === 'in_queue') ?? null
})

// Queue count: number of in_queue items (excludes processing)
const queueCount = computed(() => {
  return queue.value?.filter(p => p.status === 'in_queue').length ?? 0
})

// Combined loading state
const loading = computed(() => gateStatus.value === 'pending' || queueStatus.value === 'pending')

// Error states
const gateNotFound = computed(() => gateError.value !== null)
const gateDisabled = computed(() => gate.value && !gate.value.is_active)

// Action pending state
const actionPending = computed(() => {
  return currentPickup.value ? pending.value[currentPickup.value.id] : false
})

// Action handlers
async function handleStartProcessing() {
  if (!currentPickup.value || !gate.value) return
  await startProcessing(currentPickup.value.id, gate.value.id)
  await refreshNuxtData(`gate-queue-${gateId.value}`)
}

async function handleRevert() {
  if (!currentPickup.value) return
  await revertToQueue(currentPickup.value.id)
  await refreshNuxtData(`gate-queue-${gateId.value}`)
}

async function handleComplete() {
  if (!currentPickup.value) return
  showCompleteDialog.value = false
  await completeRequest(currentPickup.value.id, gate.value?.id)
  await refreshNuxtData(`gate-queue-${gateId.value}`)
}

// Realtime subscription
onMounted(() => {
  subscribe(() => {
    // Refresh queue data when any pickup change occurs
    refreshNuxtData(`gate-queue-${gateId.value}`)
  })
})

onUnmounted(() => {
  unsubscribe()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Loading state -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="h-16 w-48 bg-muted rounded animate-pulse" />
    </div>

    <!-- Gate not found error -->
    <div v-else-if="gateNotFound" class="flex-1 flex flex-col items-center justify-center p-6">
      <AlertCircle class="h-16 w-16 text-muted-foreground mb-4" />
      <h1 class="text-xl font-semibold text-muted-foreground mb-2">Gate Not Found</h1>
      <p class="text-muted-foreground mb-6">The gate you're looking for doesn't exist.</p>
      <NuxtLink to="/" class="text-primary hover:underline">
        Back to Dashboard
      </NuxtLink>
    </div>

    <!-- Gate disabled error -->
    <div v-else-if="gateDisabled" class="flex-1 flex flex-col items-center justify-center p-6">
      <AlertCircle class="h-16 w-16 text-muted-foreground mb-4" />
      <h1 class="text-xl font-semibold text-muted-foreground mb-2">Gate Disabled</h1>
      <p class="text-muted-foreground mb-6">This gate is currently disabled.</p>
      <NuxtLink to="/" class="text-primary hover:underline">
        Back to Dashboard
      </NuxtLink>
    </div>

    <!-- Gate content -->
    <template v-else-if="gate">
      <!-- Gate header -->
      <header class="bg-primary text-primary-foreground p-4">
        <h1 class="text-2xl font-bold text-center">Gate {{ gate.gate_number }}</h1>
        <p v-if="realtimeStatus !== 'connected'" class="text-xs text-amber-200 text-center mt-1">
          {{ realtimeStatus === 'connecting' ? 'Connecting...' : 'Reconnecting...' }}
        </p>
      </header>

      <!-- Main content -->
      <main class="flex-1 p-4">
        <Transition name="pickup-advance" mode="out-in">
          <CurrentPickup
            v-if="currentPickup"
            :key="currentPickup.id"
            :sales-order-number="currentPickup.sales_order_number"
            :company-name="currentPickup.company_name"
            :status="currentPickup.status"
            :processing-started-at="currentPickup.processing_started_at"
            :item-count="currentPickup.item_count"
            :po-number="currentPickup.po_number"
          />
          <EmptyGateState v-else key="empty" />
        </Transition>

        <!-- Action buttons -->
        <Transition name="pickup-advance" mode="out-in">
          <div v-if="currentPickup" :key="currentPickup.id" class="space-y-3 mt-6">
            <!-- Start Processing (only when in_queue) -->
            <Button
              v-if="currentPickup.status === 'in_queue'"
              class="h-14 w-full text-lg"
              :disabled="actionPending"
              @click="handleStartProcessing"
            >
              <Play class="h-6 w-6 mr-2" />
              Start Processing
            </Button>

            <!-- Complete (only when processing) -->
            <Button
              v-if="currentPickup.status === 'processing'"
              class="h-14 w-full text-lg"
              :disabled="actionPending"
              @click="showCompleteDialog = true"
            >
              <CheckCircle class="h-6 w-6 mr-2" />
              Complete
            </Button>

            <!-- Revert to Queue (secondary, only when processing) -->
            <Button
              v-if="currentPickup.status === 'processing'"
              variant="outline"
              class="h-11 w-full"
              :disabled="actionPending"
              @click="handleRevert"
            >
              <RotateCcw class="h-5 w-5 mr-2" />
              Return to Queue
            </Button>
          </div>
        </Transition>

        <!-- Complete confirmation dialog -->
        <CompleteDialog
          v-model:open="showCompleteDialog"
          :sales-order-number="currentPickup?.sales_order_number ?? ''"
          :company-name="currentPickup?.company_name ?? null"
          @confirm="handleComplete"
        />

        <!-- Next up section -->
        <div v-if="nextUp" class="mt-6">
          <h3 class="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <Users class="h-4 w-4" />
            Next Up
          </h3>
          <NextUpPreview :sales-order-number="nextUp.sales_order_number" />
        </div>

        <!-- Queue count -->
        <p v-if="queueCount > 1" class="text-center text-sm text-muted-foreground mt-4">
          {{ queueCount - 1 }} more in queue
        </p>
      </main>
    </template>
  </div>
</template>

<style scoped>
.pickup-advance-enter-active,
.pickup-advance-leave-active {
  transition: all 0.2s ease;
}

.pickup-advance-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.pickup-advance-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
