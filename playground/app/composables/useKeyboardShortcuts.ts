import { ref } from 'vue'
import { SHORTCUT_KEY } from '@/constants/keyboard-shortcuts'
import { useGuidedWalkthrough } from '@/composables/useGuidedWalkthrough'
import { useSimulationStore } from '@/stores/simulation'
import { useSimulationActions } from '@/composables/useSimulationActions'
import { useScenarioRunner } from '@/composables/useScenarioRunner'
import type { SimulationSpeed } from '@/types/simulation'

const RESET_CONFIRM_MESSAGE = 'Reset the simulation? All current orders will be cleared.'

const isHelpVisible = ref(false)
let keydownHandler: ((e: KeyboardEvent) => void) | null = null
let simulationToggle: (() => void) | null = null

function onKeydown(e: KeyboardEvent) {
  if (isHelpVisible.value) {
    isHelpVisible.value = false
    return
  }

  if (
    document.activeElement instanceof HTMLElement &&
    (document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA' ||
      document.activeElement.isContentEditable)
  ) {
    return
  }

  if (e.ctrlKey || e.metaKey || e.altKey) return

  const { isActive } = useGuidedWalkthrough()
  if (isActive.value) return

  const key = e.key

  switch (key) {
    case SHORTCUT_KEY.PLAY_PAUSE:
      e.preventDefault()
      simulationToggle?.()
      break
    case SHORTCUT_KEY.SPEED_1:
    case SHORTCUT_KEY.SPEED_2:
    case SHORTCUT_KEY.SPEED_5:
      useSimulationStore().setSpeed(Number(key) as SimulationSpeed)
      break
    case SHORTCUT_KEY.RESET: {
      if (!window.confirm(RESET_CONFIRM_MESSAGE)) return
      const { stopScenario } = useScenarioRunner()
      const { resetAll } = useSimulationActions()
      stopScenario()
      resetAll()
      break
    }
    case SHORTCUT_KEY.TOUR:
      useGuidedWalkthrough().start()
      break
    case SHORTCUT_KEY.HELP:
      isHelpVisible.value = !isHelpVisible.value
      break
  }
}

function init() {
  destroy()
  keydownHandler = onKeydown
  window.addEventListener('keydown', keydownHandler)
}

function destroy() {
  if (keydownHandler) {
    window.removeEventListener('keydown', keydownHandler)
    keydownHandler = null
  }
  isHelpVisible.value = false
}

function showHelp() {
  isHelpVisible.value = true
}

function hideHelp() {
  isHelpVisible.value = false
}

function registerSimulationToggle(fn: () => void) {
  simulationToggle = fn
}

export function useKeyboardShortcuts() {
  return { isHelpVisible, init, destroy, showHelp, hideHelp, registerSimulationToggle }
}
