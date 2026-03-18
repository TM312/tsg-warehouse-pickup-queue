<template>
  <div class="flex h-full flex-col">
    <ScenarioScenarioBar />

    <!-- Panel grid -->
    <LayoutPanelGrid class="min-h-0 flex-1">
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
  </div>
</template>
