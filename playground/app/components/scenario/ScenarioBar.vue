<script setup lang="ts">
import { Play, Pause, Bell, BellOff, Keyboard, ChevronDown, Check } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { computed } from 'vue'
import { SCENARIOS } from '@/constants/scenarios'
import { useScenarioRunner } from '@/composables/useScenarioRunner'
import { useSimulation } from '@/composables/useSimulation'
import { useSimulationStore } from '@/stores/simulation'
import { useActivePanel } from '@/composables/useActivePanel'
import { RESPONSIVE } from '@/constants/responsive'
import { formatElapsedTime, formatDurationMs } from '@/utils/formatDuration'
import { getScenarioDurationMs } from '@/utils/scenarioDuration'
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
const { breakpoint } = useActivePanel()
const tapTarget = `${RESPONSIVE.TAP_TARGET_MIN_PX}px`

const elapsedDisplay = computed(() => formatElapsedTime(simulation.elapsedMs))
const isMobile = computed(() => breakpoint.value === 'mobile')

const activeScenarioLabel = computed(() => {
  if (!activeScenarioId.value) return 'Scenarios'
  const s = SCENARIOS.find(s => s.id === activeScenarioId.value)
  return s?.label ?? 'Scenarios'
})

function scenarioDurationLabel(scenario: Scenario): string {
  const ms = getScenarioDurationMs(scenario.steps)
  return ms === 0 ? 'Instant' : formatDurationMs(ms)
}

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
    <!-- Row 1: Mobile dropdown or scrollable card strip -->
    <div v-if="isMobile" class="flex items-center gap-2 px-4 py-2 border-b" data-testid="scenario-dropdown">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="gap-2" data-testid="scenario-dropdown-trigger">
            <component :is="activeScenario?.icon" v-if="activeScenario" class="size-4" />
            <span>{{ activeScenarioLabel }}</span>
            <ChevronDown class="size-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-64">
          <DropdownMenuItem
            v-for="scenario in SCENARIOS"
            :key="scenario.id"
            :disabled="isRunning && activeScenarioId !== scenario.id"
            :data-testid="`scenario-dropdown-${scenario.id}`"
            class="flex items-center gap-2"
            @click="handleScenarioClick(scenario)"
          >
            <component :is="scenario.icon" class="size-4 shrink-0" />
            <span class="flex-1 truncate">{{ scenario.label }}</span>
            <Badge variant="secondary" class="ml-auto text-xs">{{ scenarioDurationLabel(scenario) }}</Badge>
            <Check v-if="activeScenarioId === scenario.id" class="size-4 shrink-0 text-primary" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div v-else class="flex gap-2 overflow-x-auto px-4 py-2 border-b snap-x snap-mandatory" data-testid="scenario-card-strip">
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

@media (pointer: coarse) {
  [data-testid="sim-play-pause"],
  [data-testid="toast-mute-toggle"],
  [data-testid="keyboard-shortcut-hint"],
  [data-testid="sim-reset"] {
    min-height: v-bind(tapTarget);
    min-width: v-bind(tapTarget);
  }
}
</style>
