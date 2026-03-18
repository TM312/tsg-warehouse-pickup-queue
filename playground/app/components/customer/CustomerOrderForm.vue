<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import { useSimulationActions } from '@/composables/useSimulationActions'

const simulation = useSimulationStore()
const { submitOrder } = useSimulationActions()

const salesOrderNumber = ref('')
const companyName = ref('')

const canSubmit = computed(() => salesOrderNumber.value.trim().length > 0)

function handleSubmit() {
  if (!canSubmit.value) return
  const request = submitOrder(salesOrderNumber.value.trim(), companyName.value.trim() || undefined)
  simulation.selectCustomerRequest(request.id)
  salesOrderNumber.value = ''
  companyName.value = ''
}
</script>

<template>
  <form
    class="flex flex-col gap-4 p-4"
    data-testid="customer-order-form"
    data-walkthrough="customer-form"
    @submit.prevent="handleSubmit"
  >
    <div class="space-y-2">
      <UiLabel for="order-number">Sales Order Number</UiLabel>
      <UiInput
        id="order-number"
        v-model="salesOrderNumber"
        placeholder="e.g. SO-12345"
        data-testid="order-number-input"
      />
    </div>

    <div class="space-y-2">
      <UiLabel for="company-name">Company Name (optional)</UiLabel>
      <UiInput
        id="company-name"
        v-model="companyName"
        placeholder="e.g. Acme Corp"
        data-testid="company-name-input"
      />
    </div>

    <UiButton
      type="submit"
      :disabled="!canSubmit"
      class="w-full"
      data-testid="submit-order-button"
    >
      Submit Pickup Request
    </UiButton>
  </form>
</template>
