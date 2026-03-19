<script setup lang="ts">
import { Play, Pause, Bell, BellOff, Keyboard } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { computed } from 'vue'
import { SCENARIOS } from '@/constants/scenarios'
import { useScenarioRunner } from '@/composables/useScenarioRunner'
import { useSimulation } from '@/composables/useSimulation'
import { useSimulationStore } from '@/stores/simulation'
import { formatElapsedTime } from '@/utils/formatDuration'
import ScenarioCard from './ScenarioCard.vue'
import ScenarioProgressBar from './ScenarioProgressBar.vue'
import SimulationSpeedControl from './SimulationSpeedControl.vue'
import ResetButton from './ResetButton.vue'
import { useSimulationToasts } from '@/composables/useSimulationToasts'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import type { Scenario } from '@/types/scenario'

const simulation = useSimulationStore()
const { toggle } = useSimulation()
const { showHelp, registerSimulationToggle } = useKeyboardShortcuts()
registerSimulationToggle(toggle)
const { runScenario, stopScenario, isRunning, activeScenarioId, currentStepIndex, totalSteps, activeScenario } = useScenarioRunner()
const { isMuted, toggleMute } = useSimulationToasts()

const elapsedDisplay = computed(() => formatElapsedTime(simulation.elapsedMs))

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
    data-testid="scenario-bar"
    data-walkthrough="scenario-bar"
  >
    <!-- Row 1: Scrollable card strip -->
    <div class="flex gap-2 overflow-x-auto px-4 py-2 border-b snap-x snap-mandatory" data-testid="scenario-card-strip">
      <ScenarioCard
        v-for="scenario in SCENARIOS"
        :key="scenario.id"
        :scenario="scenario"
        :disabled="isRunning"
        :active="activeScenarioId === scenario.id"
        @run="handleScenarioClick(scenario)"
      />
    </div>

    <!-- Row 2: Simulation controls -->
    <div class="flex shrink-0 items-center gap-2 border-b px-4 py-1.5">
      <TooltipProvider :delay-duration="300">
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

        <!-- Toast mute toggle -->
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              size="icon-sm"
              variant="outline"
              data-testid="toast-mute-toggle"
              @click="toggleMute()"
            >
              <BellOff v-if="isMuted" class="size-4" />
              <Bell v-else class="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{{ isMuted ? 'Unmute notifications' : 'Mute notifications' }}</TooltipContent>
        </Tooltip>

        <!-- Keyboard shortcuts hint -->
        <Tooltip>
          <TooltipTrigger as-child>
            <Button size="icon-sm" variant="outline" data-testid="keyboard-shortcut-hint" @click="showHelp()">
              <Keyboard class="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Keyboard shortcuts (?)</TooltipContent>
        </Tooltip>

        <span
          class="ml-auto font-mono text-sm tabular-nums text-muted-foreground"
          data-testid="sim-elapsed-time"
        >
          {{ elapsedDisplay }}
        </span>
      </TooltipProvider>
    </div>

    <ScenarioProgressBar
      :current-step="currentStepIndex"
      :total-steps="totalSteps"
      :steps="activeScenario?.steps ?? []"
      :visible="isRunning"
    />
  </div>
</template>

<style scoped>
.snap-x {
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.snap-x::-webkit-scrollbar {
  display: none;
}
</style>
