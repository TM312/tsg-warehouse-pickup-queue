<template>
  <div class="flex h-full flex-col">
    <!-- Scenario bar placeholder -->
    <div
      class="shrink-0 border-b border-dashed p-3 text-center text-sm text-muted-foreground"
      data-testid="scenario-bar"
      data-walkthrough="scenario-bar"
    >
      Scenario bar — coming in WP-6
    </div>

    <!-- Panel grid -->
    <LayoutPanelGrid class="min-h-0 flex-1">
      <template #customer>
        <div class="p-4 text-sm text-muted-foreground">Customer panel — coming in WP-6</div>
      </template>
      <template #staff>
        <div class="p-4 text-sm text-muted-foreground">Staff dashboard — coming in WP-7</div>
      </template>
      <template #analytics>
        <div class="p-4 text-sm text-muted-foreground">Analytics panel — coming in WP-8</div>
      </template>
    </LayoutPanelGrid>
  </div>
</template>
