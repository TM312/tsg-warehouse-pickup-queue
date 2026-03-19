import { describe, it, expect, beforeEach } from 'vitest'
import { effectScope, nextTick, ref, computed } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useGateStatus, useGateStatuses } from '@/composables/useGateStatus'
import { useGatesStore } from '@/stores/gates'
import { useQueueStore } from '@/stores/queue'
import { GATE_OPERATIONAL_STATUS } from '@/constants/gate-status'
import { PICKUP_STATUS } from '@/constants/status'
import { DEFAULT_GATES } from '@/constants/defaults'
import { createPickupRequest } from '@/utils/factories'

function seedGates() {
  const gates = useGatesStore()
  gates.setGates(DEFAULT_GATES.map((g) => ({ ...g, queue_count: 0 })))
}

beforeEach(() => {
  setActivePinia(createPinia())
  seedGates()
})

describe('useGateStatus', () => {
  it('returns OFFLINE when gate is not found', () => {
    const scope = effectScope()
    let status: ReturnType<typeof useGateStatus>

    scope.run(() => {
      status = useGateStatus('nonexistent')
    })

    expect(status!.status.value).toBe(GATE_OPERATIONAL_STATUS.OFFLINE)
    scope.stop()
  })

  it('returns OFFLINE when gate is_active is false', () => {
    const gates = useGatesStore()
    gates.updateGate(DEFAULT_GATES[0].id, { is_active: false })

    const scope = effectScope()
    let status: ReturnType<typeof useGateStatus>

    scope.run(() => {
      status = useGateStatus(DEFAULT_GATES[0].id)
    })

    expect(status!.status.value).toBe(GATE_OPERATIONAL_STATUS.OFFLINE)
    scope.stop()
  })

  it('returns PROCESSING when gate has a processing request', () => {
    const queue = useQueueStore()
    queue.addRequest(
      createPickupRequest({
        id: 'r1',
        status: PICKUP_STATUS.PROCESSING,
        gate_id: DEFAULT_GATES[0].id,
        processing_started_at: new Date().toISOString(),
        processing_started_sim_ms: 0,
      }),
    )

    const scope = effectScope()
    let status: ReturnType<typeof useGateStatus>

    scope.run(() => {
      status = useGateStatus(DEFAULT_GATES[0].id)
    })

    expect(status!.status.value).toBe(GATE_OPERATIONAL_STATUS.PROCESSING)
    scope.stop()
  })

  it('returns IDLE when gate has only non-processing requests', () => {
    const queue = useQueueStore()
    queue.addRequest(
      createPickupRequest({
        id: 'r1',
        status: PICKUP_STATUS.IN_QUEUE,
        gate_id: DEFAULT_GATES[0].id,
      }),
    )
    queue.addRequest(
      createPickupRequest({
        id: 'r2',
        status: PICKUP_STATUS.COMPLETED,
        gate_id: DEFAULT_GATES[0].id,
      }),
    )

    const scope = effectScope()
    let status: ReturnType<typeof useGateStatus>

    scope.run(() => {
      status = useGateStatus(DEFAULT_GATES[0].id)
    })

    expect(status!.status.value).toBe(GATE_OPERATIONAL_STATUS.IDLE)
    scope.stop()
  })

  it('returns IDLE when gate is active with no processing request', () => {
    const scope = effectScope()
    let status: ReturnType<typeof useGateStatus>

    scope.run(() => {
      status = useGateStatus(DEFAULT_GATES[0].id)
    })

    expect(status!.status.value).toBe(GATE_OPERATIONAL_STATUS.IDLE)
    scope.stop()
  })

  it('reactively updates when a request is added', async () => {
    const queue = useQueueStore()
    const scope = effectScope()
    let status: ReturnType<typeof useGateStatus>

    scope.run(() => {
      status = useGateStatus(DEFAULT_GATES[0].id)
    })

    expect(status!.status.value).toBe(GATE_OPERATIONAL_STATUS.IDLE)

    queue.addRequest(
      createPickupRequest({
        id: 'r1',
        status: PICKUP_STATUS.PROCESSING,
        gate_id: DEFAULT_GATES[0].id,
        processing_started_at: new Date().toISOString(),
        processing_started_sim_ms: 0,
      }),
    )

    expect(status!.status.value).toBe(GATE_OPERATIONAL_STATUS.PROCESSING)
    scope.stop()
  })

  it('reactively updates when a request is removed', () => {
    const queue = useQueueStore()
    queue.addRequest(
      createPickupRequest({
        id: 'r1',
        status: PICKUP_STATUS.PROCESSING,
        gate_id: DEFAULT_GATES[0].id,
        processing_started_at: new Date().toISOString(),
        processing_started_sim_ms: 0,
      }),
    )

    const scope = effectScope()
    let status: ReturnType<typeof useGateStatus>

    scope.run(() => {
      status = useGateStatus(DEFAULT_GATES[0].id)
    })

    expect(status!.status.value).toBe(GATE_OPERATIONAL_STATUS.PROCESSING)

    queue.updateRequest('r1', { status: PICKUP_STATUS.COMPLETED })

    expect(status!.status.value).toBe(GATE_OPERATIONAL_STATUS.IDLE)
    scope.stop()
  })

  it('reactively updates when gate is deactivated', () => {
    const gates = useGatesStore()
    const scope = effectScope()
    let status: ReturnType<typeof useGateStatus>

    scope.run(() => {
      status = useGateStatus(DEFAULT_GATES[0].id)
    })

    expect(status!.status.value).toBe(GATE_OPERATIONAL_STATUS.IDLE)

    gates.updateGate(DEFAULT_GATES[0].id, { is_active: false })

    expect(status!.status.value).toBe(GATE_OPERATIONAL_STATUS.OFFLINE)
    scope.stop()
  })
})

describe('useGateStatuses (batch)', () => {
  it('statusOf returns same results as useGateStatus', () => {
    const queue = useQueueStore()
    const gates = useGatesStore()

    queue.addRequest(
      createPickupRequest({
        id: 'r1',
        status: PICKUP_STATUS.PROCESSING,
        gate_id: DEFAULT_GATES[0].id,
        processing_started_at: new Date().toISOString(),
        processing_started_sim_ms: 0,
      }),
    )
    gates.updateGate(DEFAULT_GATES[2].id, { is_active: false })

    const scope = effectScope()
    let batch: ReturnType<typeof useGateStatuses>

    scope.run(() => {
      batch = useGateStatuses()
    })

    expect(batch!.statusOf(DEFAULT_GATES[0].id)).toBe(GATE_OPERATIONAL_STATUS.PROCESSING)
    expect(batch!.statusOf(DEFAULT_GATES[1].id)).toBe(GATE_OPERATIONAL_STATUS.IDLE)
    expect(batch!.statusOf(DEFAULT_GATES[2].id)).toBe(GATE_OPERATIONAL_STATUS.OFFLINE)

    scope.stop()
  })
})
