import { reactive, nextTick } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { ANIMATION } from '@/constants/animations'
import { ACTION_HIGHLIGHT_TARGETS, TARGET_PANEL } from '@/constants/highlights'
import type { HighlightTarget } from '@/constants/highlights'
import type { PanelId } from '@/constants/panels'
import type { SimulationEventType } from '@/types/simulation'
import { useActivePanel } from '@/composables/useActivePanel'

const highlightedTargets = reactive(new Set<HighlightTarget>())
const unseenPanels = reactive(new Set<PanelId>())
const timeouts = new Map<HighlightTarget, ReturnType<typeof setTimeout>>()

export function useCrossPanelHighlight() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const { activePanel, breakpoint } = useActivePanel()

  function scheduleExpiry(target: HighlightTarget) {
    timeouts.set(
      target,
      setTimeout(() => {
        highlightedTargets.delete(target)
        timeouts.delete(target)
      }, ANIMATION.CROSS_PANEL_HIGHLIGHT_MS),
    )
  }

  function highlight(eventType: SimulationEventType) {
    if (prefersReducedMotion.value) return

    const targets = ACTION_HIGHLIGHT_TARGETS[eventType]
    if (!targets) return

    for (const target of targets) {
      if (timeouts.has(target)) {
        clearTimeout(timeouts.get(target))
        timeouts.delete(target)
      }

      if (highlightedTargets.has(target)) {
        // Remove and re-add after DOM update to restart the CSS animation
        highlightedTargets.delete(target)
        void nextTick(() => {
          highlightedTargets.add(target)
          scheduleExpiry(target)
        })
      } else {
        highlightedTargets.add(target)
        scheduleExpiry(target)
      }

      const targetPanel = TARGET_PANEL[target]
      if (breakpoint.value === 'mobile' && targetPanel !== activePanel.value) {
        unseenPanels.add(targetPanel)
      }
    }
  }

  function isHighlighted(target: HighlightTarget): boolean {
    return highlightedTargets.has(target)
  }

  function hasUnseen(panelId: PanelId): boolean {
    return unseenPanels.has(panelId)
  }

  function clearUnseen(panelId: PanelId) {
    unseenPanels.delete(panelId)
  }

  function resetAll() {
    for (const timeout of timeouts.values()) {
      clearTimeout(timeout)
    }
    timeouts.clear()
    highlightedTargets.clear()
    unseenPanels.clear()
  }

  return {
    highlight,
    isHighlighted,
    hasUnseen,
    clearUnseen,
    resetAll,
  }
}
