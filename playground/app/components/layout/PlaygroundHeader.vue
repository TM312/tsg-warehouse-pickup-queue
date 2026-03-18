<script setup lang="ts">
import { Smartphone, HelpCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useActivePanel } from '@/composables/useActivePanel'
import { useGuidedWalkthrough } from '@/composables/useGuidedWalkthrough'

const { breakpoint, customerOverlayOpen, toggleCustomerOverlay } = useActivePanel()
const { start, isActive } = useGuidedWalkthrough()
</script>

<template>
  <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
    <span class="mr-2 font-semibold">Pickup Queue Playground</span>

    <div class="flex-1" />

    <TooltipProvider :delay-duration="300">
      <!-- Take the Tour -->
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="sm"
            variant="ghost"
            data-testid="tour-trigger"
            data-walkthrough="tour-trigger"
            :disabled="isActive"
            @click="start"
          >
            <HelpCircle class="size-4" />
            Take the Tour
          </Button>
        </TooltipTrigger>
        <TooltipContent>Walk through the playground features</TooltipContent>
      </Tooltip>

      <!-- Customer toggle (tablet only) -->
      <Tooltip v-if="breakpoint === 'tablet'">
        <TooltipTrigger as-child>
          <Button
            size="icon-sm"
            :variant="customerOverlayOpen ? 'default' : 'outline'"
            data-testid="customer-toggle"
            @click="toggleCustomerOverlay()"
          >
            <Smartphone class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{{ customerOverlayOpen ? 'Hide' : 'Show' }} customer view</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </header>
</template>
