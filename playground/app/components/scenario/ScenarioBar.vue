<script setup lang="ts">
import { Play, Pause } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { SCENARIOS } from '@/constants/scenarios'
import { useScenarioRunner } from '@/composables/useScenarioRunner'
import { useSimulation } from '@/composables/useSimulation'
import { useSimulationStore } from '@/stores/simulation'
import ScenarioButton from './ScenarioButton.vue'
import SimulationSpeedControl from './SimulationSpeedControl.vue'
import ResetButton from './ResetButton.vue'
import type { Scenario } from '@/types/scenario'

const simulation = useSimulationStore()
const { toggle } = useSimulation()
const { runScenario, stopScenario, isRunning, activeScenarioId } = useScenarioRunner()

function handleScenarioClick(scenario: Scenario) {
  if (activeScenarioId.value === scenario.id) {
    stopScenario()
  } else {
    runScenario(scenario)
  }
}
</script>

<template>
  <div
    class="flex shrink-0 items-center gap-2 border-b px-4 py-2"
    data-testid="scenario-bar"
    data-walkthrough="scenario-bar"
  >
    <TooltipProvider :delay-duration="300">
      <ScenarioButton
        v-for="scenario in SCENARIOS"
        :key="scenario.id"
        :scenario="scenario"
        :disabled="isRunning"
        :active="activeScenarioId === scenario.id"
        @run="handleScenarioClick(scenario)"
      />

      <Separator orientation="vertical" class="mx-1 h-6" />

      <SimulationSpeedControl />

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

      <ResetButton :on-before-reset="stopScenario" />
    </TooltipProvider>
  </div>
</template>
