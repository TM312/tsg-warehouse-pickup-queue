<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  message?: string
}

defineProps<Props>()
</script>

<template>
  <Card>
    <CardHeader class="text-center space-y-2">
      <CardTitle class="text-xl md:text-2xl">Warehouse Closed</CardTitle>
    </CardHeader>
    <CardContent class="text-center">
      <p class="text-muted-foreground">
        {{ message || 'The warehouse is currently closed.' }}
      </p>
      <p class="text-sm text-muted-foreground mt-4">
        Please check back during business hours to submit a pickup request.
      </p>
    </CardContent>
  </Card>
</template>
