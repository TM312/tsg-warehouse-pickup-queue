import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useGatesStore } from '@/stores/gates'
import { useQueueStore } from '@/stores/queue'
import {
  GATE_OPERATIONAL_STATUS,
  type GateOperationalStatus,
} from '@/constants/gate-status'

function resolveGateStatus(
  gateId: string,
  gates: ReturnType<typeof useGatesStore>,
  queue: ReturnType<typeof useQueueStore>,
): GateOperationalStatus {
  const gate = gates.gateById(gateId)
  if (!gate || !gate.is_active) return GATE_OPERATIONAL_STATUS.OFFLINE
  if (queue.processingItems.some((r) => r.gate_id === gateId))
    return GATE_OPERATIONAL_STATUS.PROCESSING
  return GATE_OPERATIONAL_STATUS.IDLE
}

export function useGateStatus(gateId: MaybeRefOrGetter<string>) {
  const gates = useGatesStore()
  const queue = useQueueStore()

  const status = computed<GateOperationalStatus>(() =>
    resolveGateStatus(toValue(gateId), gates, queue),
  )

  return { status }
}

export function useGateStatuses() {
  const gates = useGatesStore()
  const queue = useQueueStore()

  function statusOf(gateId: string): GateOperationalStatus {
    return resolveGateStatus(gateId, gates, queue)
  }

  return { statusOf }
}
