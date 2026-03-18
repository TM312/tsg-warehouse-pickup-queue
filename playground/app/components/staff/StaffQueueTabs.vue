<script setup lang="ts">
import { useGatesStore } from '@/stores/gates'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import StaffAllRequestsTable from './StaffAllRequestsTable.vue'
import StaffGateQueue from './StaffGateQueue.vue'

const gates = useGatesStore()
</script>

<template>
  <Tabs default-value="all" data-testid="staff-queue-tabs" data-walkthrough="queue-tabs">
    <TabsList>
      <TabsTrigger value="all">All Requests</TabsTrigger>
      <TabsTrigger
        v-for="gate in gates.sortedActiveGates"
        :key="gate.id"
        :value="gate.id"
      >
        Gate {{ gate.gate_number }}
      </TabsTrigger>
    </TabsList>

    <TabsContent value="all">
      <StaffAllRequestsTable />
    </TabsContent>
    <TabsContent
      v-for="gate in gates.sortedActiveGates"
      :key="gate.id"
      :value="gate.id"
    >
      <StaffGateQueue :gate-id="gate.id" />
    </TabsContent>
  </Tabs>
</template>
