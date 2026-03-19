<script setup lang="ts">
import { computed } from 'vue'
import { Smartphone, ArrowRight } from 'lucide-vue-next'
import { useQueueStore } from '@/stores/queue'
import { useSimulationStore } from '@/stores/simulation'
import { useMorningRush } from '@/composables/useMorningRush'
import { PANEL_DEFINITIONS, PANEL_ID } from '@/constants/panels'
import { EMPTY_STATE, RUN_SCENARIO_LABEL } from '@/constants/empty-states'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'

const queue = useQueueStore()
const simulation = useSimulationStore()
const { handleRunMorningRush, isRunning } = useMorningRush()

const customerDef = PANEL_DEFINITIONS.find(p => p.id === PANEL_ID.CUSTOMER)!

const selectedRequest = computed(() => {
  const id = simulation.selectedCustomerRequestId
  return id ? queue.requestById(id) : undefined
})

const hasNoRequests = computed(() => queue.requests.length === 0)
</script>

<template>
  <div data-testid="customer-panel" data-walkthrough="customer-panel">
    <LayoutPanelHeader
      :icon="Smartphone"
      :title="customerDef.label"
      :description="customerDef.description"
    />

    <CustomerStatusCard v-if="selectedRequest" :request="selectedRequest" />
    <template v-else>
      <EmptyState
        v-if="hasNoRequests"
        :icon="EMPTY_STATE.CUSTOMER_PANEL.icon"
        :heading="EMPTY_STATE.CUSTOMER_PANEL.heading"
        :subtext="EMPTY_STATE.CUSTOMER_PANEL.subtext"
      >
        <Button variant="outline" size="sm" :disabled="isRunning" @click="handleRunMorningRush">
          {{ RUN_SCENARIO_LABEL }}
          <ArrowRight class="ml-1 size-4" />
        </Button>
      </EmptyState>
      <CustomerOrderForm />
    </template>
  </div>
</template>
