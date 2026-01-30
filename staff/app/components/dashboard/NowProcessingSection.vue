<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import StatusBadge from './StatusBadge.vue'
import { CheckCircle, RotateCcw } from 'lucide-vue-next'

interface ProcessingItem {
  id: string
  sales_order_number: string
  company_name: string | null
  gate_number: number
  gate_id: string
  processing_started_at: string
}

const props = defineProps<{
  items: ProcessingItem[]
  loading: Record<string, boolean>
}>()

const emit = defineEmits<{
  complete: [requestId: string]
  revert: [requestId: string]
  rowClick: [requestId: string]
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <h2 class="text-lg font-semibold">Now Processing</h2>
      <Badge variant="secondary" class="text-xs">{{ items.length }}</Badge>
    </div>

    <div v-if="items.length === 0" class="text-muted-foreground text-sm py-4">
      No active processing
    </div>

    <div v-else class="grid gap-4">
      <Card
        v-for="item in items"
        :key="item.id"
        class="cursor-pointer hover:bg-accent/50 transition-colors"
        @click="emit('rowClick', item.id)"
      >
        <CardContent class="p-4">
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <!-- Gate Number -->
            <div class="flex-shrink-0 w-24 text-center sm:text-left">
              <p class="text-2xl font-bold text-primary">Gate {{ item.gate_number }}</p>
            </div>

            <!-- Order Info -->
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ item.sales_order_number }}</p>
              <p class="text-sm text-muted-foreground truncate">{{ item.company_name || 'N/A' }}</p>
            </div>

            <!-- Status Badge -->
            <div class="flex-shrink-0">
              <StatusBadge
                status="processing"
                :processing-started-at="item.processing_started_at"
              />
            </div>

            <!-- Actions -->
            <div class="flex gap-2 flex-shrink-0" @click.stop>
              <Button
                variant="outline"
                size="sm"
                :disabled="loading[item.id]"
                @click="emit('revert', item.id)"
              >
                <RotateCcw class="h-4 w-4 mr-1" />
                Return to Queue
              </Button>
              <Button
                size="sm"
                :disabled="loading[item.id]"
                @click="emit('complete', item.id)"
              >
                <CheckCircle class="h-4 w-4 mr-1" />
                Complete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
