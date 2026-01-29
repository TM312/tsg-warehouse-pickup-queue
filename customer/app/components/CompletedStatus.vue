<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'

defineProps<{
  orderNumber: string
  gateNumber?: number | null
}>()
</script>

<template>
  <div class="flex flex-col items-center space-y-6 py-4">
    <!-- Success icon -->
    <div class="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
      <CheckCircle2 class="h-10 w-10 text-green-600" />
    </div>

    <!-- Title and subtitle -->
    <div class="text-center space-y-1">
      <h2 class="text-2xl font-bold text-green-700">Pickup Complete</h2>
      <p class="text-muted-foreground">Thank you for your pickup!</p>
    </div>

    <!-- Summary box -->
    <div class="bg-muted/50 rounded-lg p-4 text-sm text-center">
      <p class="text-muted-foreground">Order #{{ orderNumber }}</p>
      <p v-if="gateNumber" class="text-muted-foreground mt-1">
        Completed at Gate {{ gateNumber }}
      </p>
    </div>
  </div>
</template>
