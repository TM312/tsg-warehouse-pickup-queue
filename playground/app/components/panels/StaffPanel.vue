<script setup lang="ts">
import { ClipboardList } from 'lucide-vue-next'
import { PANEL_DEFINITIONS, PANEL_ID } from '@/constants/panels'

const staffDef = PANEL_DEFINITIONS.find(p => p.id === PANEL_ID.STAFF)!
</script>

<template>
  <div data-testid="staff-panel" data-walkthrough="staff-panel" class="flex h-full flex-col overflow-hidden">
    <LayoutPanelHeader
      :icon="ClipboardList"
      :title="staffDef.label"
      :description="staffDef.description"
    />

    <div class="flex-1 space-y-4 overflow-y-auto p-4">
      <StaffProcessingTable />
      <StaffQueueTabs />
    </div>
  </div>
</template>
