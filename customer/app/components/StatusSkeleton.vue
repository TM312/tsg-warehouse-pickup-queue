<script setup lang="ts">
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <Card>
    <CardHeader class="text-center">
      <!-- Title skeleton -->
      <Skeleton class="h-7 w-40 mx-auto" />
      <!-- Order number skeleton -->
      <Skeleton class="h-4 w-32 mx-auto mt-2" />
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Position area -->
      <div class="text-center space-y-2">
        <!-- "You are" text -->
        <Skeleton class="h-5 w-16 mx-auto" />
        <!-- Large position number -->
        <Skeleton class="h-16 w-20 mx-auto" />
        <!-- "in queue" text -->
        <Skeleton class="h-5 w-16 mx-auto" />
      </div>
      <!-- Wait time area -->
      <div class="text-center">
        <Skeleton class="h-5 w-36 mx-auto" />
      </div>
    </CardContent>
  </Card>
</template>
