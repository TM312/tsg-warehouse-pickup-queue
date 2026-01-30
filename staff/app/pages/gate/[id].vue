<script setup lang="ts">
import { computed } from 'vue'
import { AlertCircle } from 'lucide-vue-next'
import CurrentPickup from '@/components/gate/CurrentPickup.vue'
import EmptyGateState from '@/components/gate/EmptyGateState.vue'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const client = useSupabaseClient()

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

// Combined loading state
const loading = computed(() => gateStatus.value === 'pending' || queueStatus.value === 'pending')

// Error states
const gateNotFound = computed(() => gateError.value !== null)
const gateDisabled = computed(() => gate.value && !gate.value.is_active)
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
      </header>

      <!-- Main content -->
      <main class="flex-1 p-4">
        <CurrentPickup
          v-if="currentPickup"
          :sales-order-number="currentPickup.sales_order_number"
          :company-name="currentPickup.company_name"
          :status="currentPickup.status"
          :processing-started-at="currentPickup.processing_started_at"
          :item-count="currentPickup.item_count"
          :po-number="currentPickup.po_number"
        />
        <EmptyGateState v-else />
      </main>
    </template>
  </div>
</template>
