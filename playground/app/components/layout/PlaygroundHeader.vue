<script setup lang="ts">
import { Play, Pause, RotateCcw, Smartphone, HelpCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { SIMULATION_SPEEDS } from '@/constants/panels'
import { DEFAULT_GATES } from '@/constants/defaults'
import { useSimulationStore } from '@/stores/simulation'
import { useQueueStore } from '@/stores/queue'
import { useGatesStore } from '@/stores/gates'
import { useSimulation } from '@/composables/useSimulation'
import { useActivePanel } from '@/composables/useActivePanel'
import type { SimulationSpeed } from '@/types/simulation'

const simulation = useSimulationStore()
const queue = useQueueStore()
const gates = useGatesStore()
const { toggle } = useSimulation()
const { breakpoint, customerOverlayOpen, toggleCustomerOverlay } = useActivePanel()

function handleReset() {
  simulation.reset()
  queue.clear()
  gates.setGates(DEFAULT_GATES.map((g) => ({ ...g, queue_count: 0 })))
}
</script>

<template>
  <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
    <span class="mr-2 font-semibold">Pickup Queue Playground</span>

    <!-- Speed controls -->
    <TooltipProvider :delay-duration="300">
      <div class="flex items-center gap-1">
        <Tooltip v-for="speed in SIMULATION_SPEEDS" :key="speed">
          <TooltipTrigger as-child>
            <Button
              size="sm"
              :variant="simulation.speed === speed ? 'default' : 'outline'"
              :data-testid="`speed-control-${speed}`"
              @click="simulation.setSpeed(speed as SimulationSpeed)"
            >
              {{ speed }}x
            </Button>
          </TooltipTrigger>
          <TooltipContent>Set speed to {{ speed }}x</TooltipContent>
        </Tooltip>
      </div>

      <!-- Play/Pause -->
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="icon-sm"
            variant="outline"
            data-testid="sim-play-pause"
            @click="toggle()"
          >
            <Pause v-if="simulation.isRunning" class="size-4" />
            <Play v-else class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{{ simulation.isRunning ? 'Pause' : 'Play' }}</TooltipContent>
      </Tooltip>

      <!-- Reset -->
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="icon-sm"
            variant="outline"
            data-testid="sim-reset"
            @click="handleReset"
          >
            <RotateCcw class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reset simulation</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <!-- Take the Tour -->
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="sm"
            variant="ghost"
            data-testid="tour-trigger"
            data-walkthrough="tour-trigger"
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
