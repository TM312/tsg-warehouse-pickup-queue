import { reactive, watch, toValue, onScopeDispose, type MaybeRefOrGetter } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { ANIMATION } from '@/constants/animations'

interface ProcessingRow {
  gateId: string
  request: { id: string } | null
}

export function useProcessingPulse(rows: MaybeRefOrGetter<ProcessingRow[]>) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const previousRequestIds = new Map<string, string>()
  const pulsingGates = reactive(new Set<string>())
  const timeouts = new Map<string, ReturnType<typeof setTimeout>>()

  // Seed map with initial values so existing requests don't trigger a pulse
  for (const row of toValue(rows)) {
    if (row.request?.id) {
      previousRequestIds.set(row.gateId, row.request.id)
    }
  }

  function cleanup() {
    for (const timeout of timeouts.values()) {
      clearTimeout(timeout)
    }
    timeouts.clear()
  }

  watch(
    () => toValue(rows),
    (currentRows) => {
      for (const row of currentRows) {
        const currentRequestId = row.request?.id ?? null
        const previousRequestId = previousRequestIds.get(row.gateId) ?? null

        if (
          currentRequestId &&
          currentRequestId !== previousRequestId &&
          !prefersReducedMotion.value
        ) {
          pulsingGates.add(row.gateId)

          if (timeouts.has(row.gateId)) {
            clearTimeout(timeouts.get(row.gateId))
          }

          timeouts.set(
            row.gateId,
            setTimeout(() => {
              pulsingGates.delete(row.gateId)
              timeouts.delete(row.gateId)
            }, ANIMATION.PROCESSING_PULSE_MS),
          )
        }

        if (currentRequestId) {
          previousRequestIds.set(row.gateId, currentRequestId)
        } else {
          previousRequestIds.delete(row.gateId)
        }
      }
    },
    { deep: true },
  )

  onScopeDispose(cleanup)

  return {
    isPulsing: (gateId: string) => pulsingGates.has(gateId),
  }
}
