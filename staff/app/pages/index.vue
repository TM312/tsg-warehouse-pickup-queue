<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import DataTable from '@/components/dashboard/DataTable.vue'
import { columns, type PickupRequest } from '@/components/dashboard/columns'

definePageMeta({
  middleware: 'auth'
})

const client = useSupabaseClient()

const { data: requests, refresh, status } = await useAsyncData<PickupRequest[]>(
  'pickup-requests-list',
  async () => {
    const { data, error } = await client
      .from('pickup_requests')
      .select('id, sales_order_number, company_name, customer_email, status, email_flagged, assigned_gate_id, queue_position, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as PickupRequest[]
  }
)

const pending = computed(() => status.value === 'pending')
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Pickup Queue</h1>
      <Button variant="outline" size="sm" :disabled="pending" @click="refresh()">
        <RefreshCw :class="['h-4 w-4 mr-2', { 'animate-spin': pending }]" />
        Refresh
      </Button>
    </div>

    <DataTable
      :columns="columns"
      :data="requests ?? []"
    />
  </div>
</template>
