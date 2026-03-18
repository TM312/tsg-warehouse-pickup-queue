import { describe, expect, it } from 'vitest'
import { createPickupRequest, createGate, createScenarioOrder } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'
import { seededRandom } from '@/utils/random'

describe('createPickupRequest', () => {
  it('returns a complete object with all required fields', () => {
    const request = createPickupRequest()
    expect(request.id).toBeDefined()
    expect(request.sales_order_number).toBeDefined()
    expect(request.company_name).toBeDefined()
    expect(request.status).toBeDefined()
    expect(typeof request.is_priority).toBe('boolean')
    expect(request.created_at).toBeDefined()
  })

  it('defaults to PENDING status, is_priority false, gate fields null', () => {
    const request = createPickupRequest()
    expect(request.status).toBe(PICKUP_STATUS.PENDING)
    expect(request.is_priority).toBe(false)
    expect(request.gate_id).toBeNull()
    expect(request.queue_position).toBeNull()
    expect(request.processing_started_at).toBeNull()
    expect(request.completed_at).toBeNull()
  })

  it('applies overrides correctly', () => {
    const request = createPickupRequest({
      status: PICKUP_STATUS.APPROVED,
      is_priority: true,
      company_name: 'Test Corp',
    })
    expect(request.status).toBe(PICKUP_STATUS.APPROVED)
    expect(request.is_priority).toBe(true)
    expect(request.company_name).toBe('Test Corp')
  })

  it('produces deterministic output with seeded rng', () => {
    const r1 = createPickupRequest({}, seededRandom(42))
    const r2 = createPickupRequest({}, seededRandom(42))
    expect(r1.sales_order_number).toBe(r2.sales_order_number)
    expect(r1.company_name).toBe(r2.company_name)
  })
})

describe('createGate', () => {
  it('returns a valid Gate', () => {
    const gate = createGate()
    expect(gate.id).toBeDefined()
    expect(gate.gate_number).toBe(1)
    expect(gate.is_active).toBe(true)
  })

  it('applies overrides correctly', () => {
    const gate = createGate({ gate_number: 5, is_active: false })
    expect(gate.gate_number).toBe(5)
    expect(gate.is_active).toBe(false)
  })
})

describe('createScenarioOrder', () => {
  it('sets the order number', () => {
    const order = createScenarioOrder('SO-TEST')
    expect(order.sales_order_number).toBe('SO-TEST')
  })

  it('applies additional overrides', () => {
    const order = createScenarioOrder('PO-123', { is_priority: true })
    expect(order.sales_order_number).toBe('PO-123')
    expect(order.is_priority).toBe(true)
  })
})
