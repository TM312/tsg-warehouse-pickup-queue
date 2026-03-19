<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useAutoPlay } from '@/composables/useAutoPlay'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const { isFirstVisit, panelsReady, initialize, cleanup } = useAutoPlay()
const { init: initShortcuts, destroy: destroyShortcuts } = useKeyboardShortcuts()

onMounted(() => {
  initialize()
  initShortcuts()
})

onUnmounted(() => {
  destroyShortcuts()
  cleanup()
})
</script>

<template>
  <div class="flex h-full flex-col">
    <ScenarioScenarioBar />

    <!-- Panel grid -->
    <LayoutPanelGrid :intro-animate="isFirstVisit && panelsReady" class="min-h-0 flex-1">
      <template #customer>
        <PanelsCustomerPanel />
      </template>
      <template #staff>
        <PanelsStaffPanel />
      </template>
      <template #analytics>
        <PanelsAnalyticsPanel />
      </template>
    </LayoutPanelGrid>

    <ScenarioWalkthroughOverlay />
    <ScenarioWalkthroughTooltip />
    <ScenarioKeyboardShortcutOverlay />
  </div>
</template>
