<script setup lang="ts">
import { PANEL_ID } from '@/constants/panels'
import { useActivePanel } from '@/composables/useActivePanel'

const { activePanel, setActivePanel, customerOverlayOpen, breakpoint } = useActivePanel()
</script>

<template>
  <div class="relative h-full" data-testid="panel-grid">
    <!-- Desktop: 3-column grid -->
    <div
      v-if="breakpoint === 'desktop'"
      class="grid h-full grid-cols-[280px_1fr_320px] gap-4 p-4"
    >
      <div data-testid="panel-col-customer" class="flex items-start justify-center">
        <LayoutPhoneFrame>
          <slot name="customer" />
        </LayoutPhoneFrame>
      </div>
      <div data-testid="panel-col-staff" class="min-h-0 overflow-y-auto rounded-lg border bg-card">
        <slot name="staff" />
      </div>
      <div data-testid="panel-col-analytics" class="min-h-0 overflow-y-auto rounded-lg border bg-card">
        <slot name="analytics" />
      </div>
    </div>

    <!-- Tablet: 2-column grid + floating customer overlay -->
    <div
      v-else-if="breakpoint === 'tablet'"
      class="grid h-full grid-cols-[1fr_320px] gap-4 p-4"
    >
      <div data-testid="panel-col-staff" class="min-h-0 overflow-y-auto rounded-lg border bg-card">
        <slot name="staff" />
      </div>
      <div data-testid="panel-col-analytics" class="min-h-0 overflow-y-auto rounded-lg border bg-card">
        <slot name="analytics" />
      </div>

      <!-- Floating customer overlay -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-show="customerOverlayOpen"
          data-testid="panel-col-customer"
          class="absolute inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
        >
          <LayoutPhoneFrame class="h-[80%]">
            <slot name="customer" />
          </LayoutPhoneFrame>
        </div>
      </Transition>
    </div>

    <!-- Mobile: single column with tab bar -->
    <div v-else class="flex h-full flex-col">
      <div class="shrink-0 border-b px-3 py-2">
        <LayoutPanelTabBar :model-value="activePanel" @update:model-value="setActivePanel" />
      </div>
      <div class="min-h-0 flex-1 overflow-y-auto p-3">
        <div v-if="activePanel === PANEL_ID.CUSTOMER" data-testid="panel-col-customer">
          <slot name="customer" />
        </div>
        <div v-if="activePanel === PANEL_ID.STAFF" data-testid="panel-col-staff">
          <slot name="staff" />
        </div>
        <div v-if="activePanel === PANEL_ID.ANALYTICS" data-testid="panel-col-analytics">
          <slot name="analytics" />
        </div>
      </div>
    </div>
  </div>
</template>
