import type { Ref } from 'vue'
import type { GateWithCount } from '#shared/types/gate'
import { onKeyStroke } from '@vueuse/core'

// Global navigation direction state - persists across page navigation
// 'left' = going to prev gate, 'right' = going to next gate
const gateNavDirection = ref<'left' | 'right' | null>(null)

/**
 * Get the current gate navigation direction (for page transitions).
 * Returns null if no gate navigation in progress.
 */
export function useGateNavDirection() {
  return {
    direction: gateNavDirection,
    clear: () => { gateNavDirection.value = null }
  }
}

/**
 * Composable for gate navigation with keyboard shortcuts.
 * Provides prev/next gate logic and arrow key navigation.
 *
 * @param currentGateId - Reactive ref of the current gate ID
 */
export function useGateNavigation(currentGateId: Ref<string>) {
  const router = useRouter()
  const gatesStore = useGatesStore()

  // Get alphabetically sorted active gates (sorted by gate_number)
  const sortedGates = computed(() => gatesStore.sortedActiveGates)

  const currentIndex = computed(() =>
    sortedGates.value.findIndex(g => g.id === currentGateId.value)
  )

  // Wrap-around navigation: first->last, last->first
  const prevGate = computed<GateWithCount | null>(() => {
    if (sortedGates.value.length <= 1) return null
    const idx = currentIndex.value <= 0
      ? sortedGates.value.length - 1
      : currentIndex.value - 1
    return sortedGates.value[idx] ?? null
  })

  const nextGate = computed<GateWithCount | null>(() => {
    if (sortedGates.value.length <= 1) return null
    const idx = currentIndex.value >= sortedGates.value.length - 1
      ? 0
      : currentIndex.value + 1
    return sortedGates.value[idx] ?? null
  })

  function goToPrev() {
    if (prevGate.value) {
      gateNavDirection.value = 'left'
      router.push(`/gate/${prevGate.value.id}`)
    }
  }

  function goToNext() {
    if (nextGate.value) {
      gateNavDirection.value = 'right'
      router.push(`/gate/${nextGate.value.id}`)
    }
  }

  // Check if user is typing in an input field
  function isInputActive(): boolean {
    const el = document.activeElement
    return el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA'
  }

  // Keyboard shortcuts using VueUse onKeyStroke (auto-cleanup on unmount)
  onKeyStroke('ArrowLeft', (e) => {
    if (!isInputActive()) {
      e.preventDefault()
      goToPrev()
    }
  })

  onKeyStroke('ArrowRight', (e) => {
    if (!isInputActive()) {
      e.preventDefault()
      goToNext()
    }
  })

  return {
    prevGate,
    nextGate,
    goToPrev,
    goToNext,
  }
}
