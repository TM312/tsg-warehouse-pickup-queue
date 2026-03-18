import { ref, computed, nextTick, watch } from 'vue'
import { WALKTHROUGH_STEPS } from '@/constants/walkthrough'
import { useActivePanel } from '@/composables/useActivePanel'
import { useSimulationActions } from '@/composables/useSimulationActions'
import { useSimulationStore } from '@/stores/simulation'
import type { PanelId } from '@/constants/panels'
import type { WalkthroughContext, WalkthroughStep } from '@/types/scenario'

const isActive = ref(false)
const currentStepIndex = ref(0)
const context: WalkthroughContext = { requestId: null }
const highlightRect = ref({ x: 0, y: 0, width: 0, height: 0 })

let resizeObserver: ResizeObserver | null = null
let scrollHandler: (() => void) | null = null
let pendingActionTimer: ReturnType<typeof setTimeout> | null = null

function cleanupObservers() {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler, true)
    scrollHandler = null
  }
}

function cancelPendingAction() {
  if (pendingActionTimer !== null) {
    clearTimeout(pendingActionTimer)
    pendingActionTimer = null
  }
}

function readElementRect(el: Element) {
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y, width: r.width, height: r.height }
}

const EMPTY_RECT = { x: 0, y: 0, width: 0, height: 0 }

export function useGuidedWalkthrough() {
  const { setActivePanel, breakpoint, customerOverlayOpen } = useActivePanel()
  const actions = useSimulationActions()

  const currentStep = computed<WalkthroughStep | null>(() => {
    if (!isActive.value) return null
    return WALKTHROUGH_STEPS[currentStepIndex.value] ?? null
  })

  const totalSteps = WALKTHROUGH_STEPS.length

  function updateHighlightRect() {
    const step = WALKTHROUGH_STEPS[currentStepIndex.value]
    if (!step?.highlightSelector) {
      highlightRect.value = EMPTY_RECT
      cleanupObservers()
      return
    }

    const el = document.querySelector(step.highlightSelector)
    if (!el) {
      highlightRect.value = EMPTY_RECT
      cleanupObservers()
      return
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    highlightRect.value = readElementRect(el)

    cleanupObservers()

    resizeObserver = new ResizeObserver(() => {
      highlightRect.value = readElementRect(el)
    })
    resizeObserver.observe(el)

    scrollHandler = () => {
      highlightRect.value = readElementRect(el)
    }
    window.addEventListener('scroll', scrollHandler, true)
  }

  function switchToPanel(panel: PanelId) {
    if (breakpoint.value === 'mobile' || breakpoint.value === 'tablet') {
      setActivePanel(panel)
    }
    if (breakpoint.value === 'tablet') {
      customerOverlayOpen.value = panel === 'customer'
    }
  }

  function executeStepAction(step: WalkthroughStep) {
    cancelPendingAction()

    if (!step.action) {
      nextTick(() => updateHighlightRect())
      return
    }

    if (step.delayMs) {
      nextTick(() => updateHighlightRect())
      pendingActionTimer = setTimeout(() => {
        pendingActionTimer = null
        step.action!(actions, context)
        nextTick(() => updateHighlightRect())
      }, step.delayMs)
    } else {
      step.action(actions, context)
      nextTick(() => updateHighlightRect())
    }
  }

  function start() {
    cancelPendingAction()
    actions.resetAll()
    context.requestId = null
    currentStepIndex.value = 0
    isActive.value = true

    const simulation = useSimulationStore()
    simulation.isRunning = true

    const step = WALKTHROUGH_STEPS[0]
    switchToPanel(step.panel)
    executeStepAction(step)
  }

  function next() {
    if (currentStepIndex.value >= WALKTHROUGH_STEPS.length - 1) {
      skip()
      return
    }

    currentStepIndex.value++
    const step = WALKTHROUGH_STEPS[currentStepIndex.value]
    switchToPanel(step.panel)
    executeStepAction(step)
  }

  function previous() {
    if (currentStepIndex.value <= 0) return
    cancelPendingAction()
    currentStepIndex.value--
    const step = WALKTHROUGH_STEPS[currentStepIndex.value]
    switchToPanel(step.panel)
  }

  function skip() {
    cancelPendingAction()
    isActive.value = false
    currentStepIndex.value = 0
    cleanupObservers()
  }

  watch(currentStepIndex, () => {
    nextTick(() => updateHighlightRect())
  })

  return {
    isActive,
    currentStepIndex,
    currentStep,
    totalSteps,
    highlightRect,
    start,
    next,
    previous,
    skip,
  }
}
