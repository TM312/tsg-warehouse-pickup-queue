<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRealtimeStatus, type PickupRequestPayload } from '~/composables/useRealtimeStatus'
import { useWaitTimeEstimate } from '~/composables/useWaitTimeEstimate'
import WaitTimeEstimate from '~/components/WaitTimeEstimate.vue'
import TurnTakeover from '~/components/TurnTakeover.vue'
import StatusSkeleton from '~/components/StatusSkeleton.vue'
import LiveIndicator from '~/components/LiveIndicator.vue'
import CompletedStatus from '~/components/CompletedStatus.vue'
import { XCircle } from 'lucide-vue-next'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface PickupRequest {
  id: string
  status: string
  queue_position: number | null
  assigned_gate_id: string | null
  sales_order_number: string
  company_name: string | null
}

interface Gate {
  id: string
  gate_number: number
}

const route = useRoute()
const client = useSupabaseClient()
const requestId = computed(() => route.params.id as string)

// Fetch initial request data with gate info
const { data: request, pending, error: fetchError, refresh } = await useAsyncData(
  `request-${requestId.value}`,
  async () => {
    const { data, error } = await client
      .from('pickup_requests')
      .select(`
        id,
        status,
        queue_position,
        assigned_gate_id,
        sales_order_number,
        company_name,
        gates:assigned_gate_id (
          id,
          gate_number
        )
      `)
      .eq('id', requestId.value)
      .single()

    if (error) throw error
    return data as PickupRequest & { gates: Gate | null }
  }
)

// Wait time estimate
const { calculateEstimate } = useWaitTimeEstimate()
const waitEstimate = ref<{ min: number; max: number } | null>(null)

// Turn takeover state
const showTakeover = ref(false)
const takeoverGateNumber = ref<number | null>(null)
const takeoverDismissed = ref(false) // Track if user dismissed the takeover

// Track previous gate ID for toast notifications
const previousGateId = ref<string | null>(null)

// Setup realtime subscription
const { status: realtimeStatus, subscribe, unsubscribe } = useRealtimeStatus(requestId.value)

onMounted(async () => {
  // Initialize previous gate ID
  if (request.value) {
    previousGateId.value = request.value.assigned_gate_id

    // Calculate initial wait estimate if in queue
    if (request.value.status === 'in_queue' && request.value.queue_position) {
      waitEstimate.value = await calculateEstimate(request.value.queue_position)
    }
  }

  subscribe((payload: RealtimePostgresChangesPayload<PickupRequestPayload>) => {
    if (payload.eventType === 'UPDATE' && payload.new) {
      const newData = payload.new

      // Check for gate assignment change and show toast
      if (newData.assigned_gate_id && newData.assigned_gate_id !== previousGateId.value) {
        // Fetch gate number for toast
        fetchGateNumber(newData.assigned_gate_id).then((fetchedGateNumber) => {
          if (fetchedGateNumber) {
            toast.info(`You've been assigned to Gate ${fetchedGateNumber}`, {
              duration: 5000,
            })
          }
        })
      }
      previousGateId.value = newData.assigned_gate_id ?? null

      // Refresh data to get updated request with gate join
      refresh()
    } else if (payload.eventType === 'DELETE') {
      // Request was deleted - likely cancelled
      refresh()
    }
  })
})

// Watch for position changes to update wait estimate and trigger takeover
watch(
  () => request.value,
  async (newRequest, oldRequest) => {
    if (!newRequest) return

    // Recalculate wait estimate when position changes
    if (newRequest.status === 'in_queue' && newRequest.queue_position) {
      waitEstimate.value = await calculateEstimate(newRequest.queue_position)

      // Show takeover when position is 1 with gate assigned (and not dismissed)
      if (
        newRequest.queue_position === 1 &&
        newRequest.assigned_gate_id &&
        !takeoverDismissed.value
      ) {
        takeoverGateNumber.value = newRequest.gates?.gate_number ?? null
        if (takeoverGateNumber.value) {
          showTakeover.value = true
        }
      }
    } else {
      waitEstimate.value = null
      // Dismiss takeover if status changes away from in_queue
      if (oldRequest?.status === 'in_queue' && newRequest.status !== 'in_queue') {
        showTakeover.value = false
        takeoverDismissed.value = false // Reset for next time
      }
    }
  },
  { immediate: true }
)

// Handle takeover dismiss
function handleTakeoverDismiss() {
  showTakeover.value = false
  takeoverDismissed.value = true
}

onUnmounted(() => {
  unsubscribe()
})

// Helper to fetch gate number for toast
async function fetchGateNumber(gateId: string): Promise<number | null> {
  const { data } = await client
    .from('gates')
    .select('gate_number')
    .eq('id', gateId)
    .single()
  return data?.gate_number ?? null
}

// Computed display values
const statusDisplay = computed(() => {
  if (!request.value) return null

  switch (request.value.status) {
    case 'pending':
      return {
        title: 'Request Received',
        message: 'Your request is being reviewed by our staff.',
        showPosition: false,
      }
    case 'approved':
      return {
        title: 'Approved',
        message: 'Your request has been approved. You\'ll be added to the queue shortly.',
        showPosition: false,
      }
    case 'in_queue':
      return {
        title: 'In Queue',
        message: null,
        showPosition: true,
      }
    case 'completed':
      return {
        title: 'Pickup Complete',
        message: 'Thank you for your pickup!',
        showPosition: false,
      }
    case 'cancelled':
      return {
        title: 'Request Cancelled',
        message: 'This request has been cancelled.',
        showPosition: false,
      }
    default:
      return {
        title: 'Status Unknown',
        message: 'Please contact staff for assistance.',
        showPosition: false,
      }
  }
})

const gateNumber = computed(() => {
  return request.value?.gates?.gate_number ?? null
})
</script>

<template>
  <!-- Loading State -->
  <StatusSkeleton v-if="pending" />

  <!-- Error State (Not Found) -->
  <Card v-else-if="fetchError || !request">
    <CardHeader class="text-center">
      <CardTitle class="text-xl md:text-2xl">Request Not Found</CardTitle>
    </CardHeader>
    <CardContent class="text-center space-y-4">
      <p class="text-muted-foreground">
        We couldn't find a pickup request with this ID.
      </p>
      <NuxtLink to="/">
        <Button variant="outline">Submit a New Request</Button>
      </NuxtLink>
    </CardContent>
  </Card>

  <!-- Status Display -->
  <Card v-else>
    <CardHeader class="text-center space-y-2">
      <div class="flex items-center justify-center gap-2">
        <CardTitle class="text-xl md:text-2xl">{{ statusDisplay?.title }}</CardTitle>
        <LiveIndicator :show="realtimeStatus === 'connected'" />
      </div>
      <p class="text-sm text-muted-foreground">
        Order: {{ request.sales_order_number }}
      </p>
    </CardHeader>
    <CardContent class="text-center space-y-6">
      <!-- Completed Status -->
      <CompletedStatus
        v-if="request.status === 'completed'"
        :order-number="request.sales_order_number"
        :gate-number="gateNumber"
      />

      <!-- Cancelled Status -->
      <div v-else-if="request.status === 'cancelled'" class="space-y-4 py-4">
        <XCircle class="w-12 h-12 mx-auto text-muted-foreground" />
        <p class="text-lg font-medium">Request Cancelled</p>
        <p class="text-muted-foreground text-sm">This pickup request has been cancelled.</p>
        <NuxtLink to="/" class="text-primary hover:underline text-sm">Submit a new request</NuxtLink>
      </div>

      <!-- Queue Position Display -->
      <div v-else-if="statusDisplay?.showPosition && request.queue_position" class="py-4">
        <PositionDisplay :position="request.queue_position" />
        <!-- Wait Time Estimate -->
        <div class="mt-4">
          <WaitTimeEstimate :estimate="waitEstimate" />
        </div>
      </div>

      <!-- Message for pending/approved/unknown statuses -->
      <p v-else-if="statusDisplay?.message" class="text-muted-foreground py-4">
        {{ statusDisplay.message }}
      </p>

      <!-- Gate Assignment -->
      <div
        v-if="gateNumber && request.status === 'in_queue'"
        class="bg-primary/10 rounded-lg p-4 mt-4"
      >
        <p class="text-sm text-muted-foreground">Assigned Gate</p>
        <p class="text-3xl font-bold text-primary">Gate {{ gateNumber }}</p>
      </div>
    </CardContent>
  </Card>

  <!-- Connection Status -->
  <ConnectionStatus :status="realtimeStatus" />

  <!-- Turn Takeover -->
  <TurnTakeover
    v-if="takeoverGateNumber"
    :show="showTakeover"
    :gate-number="takeoverGateNumber"
    @dismiss="handleTakeoverDismiss"
  />
</template>
