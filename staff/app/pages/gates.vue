<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

// Stores
const gatesStore = useGatesStore()
const queueStore = useQueueStore()
const { gates } = storeToRefs(gatesStore)
const { processingItems } = storeToRefs(queueStore)

// Gate management
const { createGate, toggleGateActive } = useGateManagement()

// Handler for create - CreateGateDialog emits gate number
async function handleCreate(gateNumber: number) {
  await createGate(gateNumber)
}

// Handler for toggle - GatesTable emits gateId and desired state
async function handleToggleActive(gateId: string, isActive: boolean) {
  await toggleGateActive(gateId, isActive)
}
</script>

<template>
  <div>
    <!-- Header matching dashboard pattern -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Gates</h1>
      <CreateGateDialog @create="handleCreate" />
    </div>

    <!-- Table -->
    <GatesTable
      :gates="gates"
      :processing-orders="processingItems"
      @toggle-active="handleToggleActive"
    />
  </div>
</template>
