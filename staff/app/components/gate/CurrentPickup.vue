<script setup lang="ts">
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import StatusBadge from '@/components/dashboard/StatusBadge.vue'
import type { PickupStatus } from '#shared/types/pickup-request'
import { PICKUP_STATUS } from '#shared/types/pickup-request'

// Gate view only shows in_queue or processing statuses
type GateStatus = typeof PICKUP_STATUS.IN_QUEUE | typeof PICKUP_STATUS.PROCESSING

interface Props {
  salesOrderNumber: string
  companyName: string | null
  status: GateStatus
  processingStartedAt: string | null
  itemCount: number | null
  poNumber: string | null
}

defineProps<Props>()

// Build order details string
function formatDetails(itemCount: number | null, poNumber: string | null): string | null {
  const parts: string[] = []
  if (itemCount !== null && itemCount > 0) {
    parts.push(`${itemCount} item${itemCount !== 1 ? 's' : ''}`)
  }
  if (poNumber) {
    parts.push(`PO: ${poNumber}`)
  }
  return parts.length > 0 ? parts.join(' | ') : null
}
</script>

<template>
  <Card class="border-2 border-primary">
    <CardHeader class="pb-2">
      <p class="text-sm text-muted-foreground text-center">Now Serving</p>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Sales Order Number - Large and prominent for scanning -->
      <p class="text-4xl font-bold font-mono text-center tracking-wider">
        {{ salesOrderNumber }}
      </p>

      <!-- Company Name -->
      <p v-if="companyName" class="text-xl text-center text-muted-foreground">
        {{ companyName }}
      </p>

      <!-- Order Details -->
      <p
        v-if="formatDetails(itemCount, poNumber)"
        class="text-sm text-center text-muted-foreground"
      >
        {{ formatDetails(itemCount, poNumber) }}
      </p>

      <!-- Status Badge -->
      <div class="flex justify-center pt-2">
        <StatusBadge
          :status="status"
          :processing-started-at="processingStartedAt"
        />
      </div>
    </CardContent>
  </Card>
</template>
