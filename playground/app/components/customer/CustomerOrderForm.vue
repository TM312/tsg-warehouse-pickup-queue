<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import { useSimulationActions } from '@/composables/useSimulationActions'
import { useSuccessFlash } from '@/composables/useSuccessFlash'

const simulation = useSimulationStore()
const { submitOrder } = useSimulationActions()

const salesOrderNumber = ref('')
const companyName = ref('')
const orderInputRef = ref<{ $el: HTMLElement } | null>(null)

let pendingRequestId: string | null = null

const { showFlash: showSuccessFlash, triggerFlash } = useSuccessFlash(() => {
  if (pendingRequestId) {
    simulation.selectCustomerRequest(pendingRequestId)
    pendingRequestId = null
  }
})

const canSubmit = computed(() => salesOrderNumber.value.trim().length > 0)

function handleSubmit() {
  if (!canSubmit.value) return
  const request = submitOrder(salesOrderNumber.value.trim(), companyName.value.trim() || undefined)
  salesOrderNumber.value = ''
  companyName.value = ''

  pendingRequestId = request.id
  triggerFlash()
}

onMounted(() => {
  nextTick(() => {
    orderInputRef.value?.$el?.focus()
  })
})
</script>

<template>
  <form
    :class="['flex flex-col gap-4 p-4 transition-shadow', { 'ring-2 ring-green-500/50': showSuccessFlash }]"
    data-testid="customer-order-form"
    data-walkthrough="customer-form"
    @submit.prevent="handleSubmit"
  >
    <div class="space-y-2">
      <UiLabel for="order-number">Sales Order Number</UiLabel>
      <UiInput
        id="order-number"
        ref="orderInputRef"
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
