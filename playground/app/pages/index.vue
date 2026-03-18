<template>
  <div class="flex h-full flex-col">
    <!-- Scenario bar placeholder -->
    <div
      class="shrink-0 border-b border-dashed p-3 text-center text-sm text-muted-foreground"
      data-testid="scenario-bar"
      data-walkthrough="scenario-bar"
    >
      Scenario bar — coming in WP-9
    </div>

    <!-- Panel grid -->
    <LayoutPanelGrid class="min-h-0 flex-1">
      <template #customer>
        <PanelsCustomerPanel />
      </template>
      <template #staff>
        <PanelsStaffPanel />
      </template>
      <template #analytics>
        <div class="p-4 text-sm text-muted-foreground">Analytics panel — coming in WP-8</div>
      </template>
    </LayoutPanelGrid>
  </div>
</template>
