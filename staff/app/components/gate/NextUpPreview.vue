<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'

defineProps<{
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
