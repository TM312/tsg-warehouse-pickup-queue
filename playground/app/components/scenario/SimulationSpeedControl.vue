<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SIMULATION_SPEEDS } from '@/constants/defaults'
import { useSimulationStore } from '@/stores/simulation'
import type { SimulationSpeed } from '@/types/simulation'

const simulation = useSimulationStore()
</script>

<template>
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
</template>
