<script setup lang="ts">
import { CircleCheckBig } from 'lucide-vue-next'
import type { PickupRequest } from '@/types/pickup-request'

defineProps<{
  request: PickupRequest
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-6 text-center" data-testid="customer-completed-state">
    <CircleCheckBig class="size-16 text-green-500" />
    <div>
      <h3 class="text-lg font-semibold text-green-700">Pickup complete!</h3>
      <p class="mt-1 text-sm text-muted-foreground">
        Order {{ request.sales_order_number }}
      </p>
    </div>
  </div>
</template>
