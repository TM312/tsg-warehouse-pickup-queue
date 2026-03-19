<script setup lang="ts">
import { useGatesStore } from '@/stores/gates'
import { useGateStatuses } from '@/composables/useGateStatus'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import StaffAllRequestsTable from './StaffAllRequestsTable.vue'
import StaffGateQueue from './StaffGateQueue.vue'
import GateStatusDot from './GateStatusDot.vue'

const gates = useGatesStore()
const { statusOf } = useGateStatuses()
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
        <span class="inline-flex items-center gap-1.5">
          <GateStatusDot :status="statusOf(gate.id)" />
          Gate {{ gate.gate_number }}
          <span class="text-muted-foreground">({{ gate.queue_count }})</span>
        </span>
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
