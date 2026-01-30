<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

/**
 * EmptyGateState - Displays a friendly message when no pickups are assigned to the gate.
 * Used on the gate operator page when the queue is empty.
 */
</script>

<template>
  <div class="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
    <Inbox class="h-24 w-24 text-muted-foreground mb-4" />
    <h2 class="text-xl font-semibold text-muted-foreground mb-2">
      No Pickups Assigned
    </h2>
    <p class="text-muted-foreground max-w-sm">
      Pickups will appear here when assigned to this gate.
    </p>
  </div>
</template>
