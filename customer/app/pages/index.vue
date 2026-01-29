<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
</script>

<template>
  <Card>
    <CardHeader class="text-center space-y-2">
      <CardTitle class="text-xl md:text-2xl">Request Pickup</CardTitle>
      <CardDescription>
        Enter your sales order information to join the pickup queue.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <!-- Form will be added in Plan 03 -->
      <p class="text-center text-muted-foreground py-8">
        Pickup request form coming soon.
      </p>
    </CardContent>
  </Card>
</template>
