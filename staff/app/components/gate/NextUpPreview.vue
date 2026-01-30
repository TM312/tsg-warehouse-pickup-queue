<script setup lang="ts">
/**
 * NextUpPreview component
 *
 * Displays a preview of the next pickup in queue (position 2).
 * Shows only the sales order number in a compact card format.
 * Used on the gate operator view to help operators anticipate the next customer.
 */
import { Card, CardContent } from '@/components/ui/card'

defineProps<{
  /** The sales order number of the next pickup */
  salesOrderNumber: string
}>()
</script>

<template>
  <Card>
    <CardContent class="p-4">
      <p class="font-mono font-medium text-lg">{{ salesOrderNumber }}</p>
    </CardContent>
  </Card>
</template>
