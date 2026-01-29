<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const { isOpen, closedMessage, isLoading } = useBusinessHours()
</script>

<template>
  <!-- Loading State -->
  <Card v-if="isLoading">
    <CardHeader class="text-center space-y-2">
      <CardTitle class="text-xl md:text-2xl">Checking Hours...</CardTitle>
    </CardHeader>
    <CardContent class="text-center">
      <p class="text-muted-foreground py-4">
        Please wait while we check business hours.
      </p>
    </CardContent>
  </Card>

  <!-- Open: Show Form -->
  <PickupRequestForm v-else-if="isOpen" />

  <!-- Closed: Show Message -->
  <ClosedMessage v-else :message="closedMessage" />
</template>
