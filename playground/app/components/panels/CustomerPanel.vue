<script setup lang="ts">
import { computed } from 'vue'
import { Smartphone } from 'lucide-vue-next'
import { useQueueStore } from '@/stores/queue'
import { useSimulationStore } from '@/stores/simulation'
import { PANEL_DEFINITIONS, PANEL_ID } from '@/constants/panels'

const queue = useQueueStore()
const simulation = useSimulationStore()

const customerDef = PANEL_DEFINITIONS.find(p => p.id === PANEL_ID.CUSTOMER)!

const selectedRequest = computed(() => {
  const id = simulation.selectedCustomerRequestId
  return id ? queue.requestById(id) : undefined
})
</script>

<template>
  <div data-testid="customer-panel" data-walkthrough="customer-panel">
    <LayoutPanelHeader
      :icon="Smartphone"
      :title="customerDef.label"
      :description="customerDef.description"
    />

    <CustomerStatusCard v-if="selectedRequest" :request="selectedRequest" />
    <CustomerOrderForm v-else />
  </div>
</template>
