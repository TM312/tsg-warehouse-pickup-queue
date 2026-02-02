<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

defineProps<{
  label: string
  value: string | number | null
  loading?: boolean
}>()
</script>

<template>
  <Card>
    <CardContent class="p-6">
      <div v-if="loading" class="space-y-2">
        <Skeleton class="h-8 w-20" />
        <Skeleton class="h-4 w-24" />
      </div>
      <template v-else>
        <div class="text-2xl font-bold">
          {{ value ?? '--' }}
        </div>
        <p class="text-sm text-muted-foreground">
          {{ label }}
        </p>
      </template>
    </CardContent>
  </Card>
</template>
