import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { h, markRaw } from 'vue'
import StaffGateSelect from '@/components/staff/StaffGateSelect.vue'
import { useGatesStore } from '@/stores/gates'
import { useQueueStore } from '@/stores/queue'
import { useSimulationActions } from '@/composables/useSimulationActions'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'
import { DEFAULT_GATES } from '@/constants/defaults'

const stubSelect = markRaw({
  name: 'Select',
  props: ['modelValue', 'disabled'],
  emits: ['update:modelValue'],
  setup(props: Record<string, unknown>, { slots, emit }: { slots: Record<string, () => unknown>; emit: (e: string, v: unknown) => void }) {
    return () => h('div', {
      'data-testid': 'select-root',
      'data-disabled': props.disabled,
    }, [
      slots.default?.(),
      h('button', {
        'data-testid': 'select-trigger',
        onClick: () => emit('update:modelValue', 'gate-2'),
      }, 'trigger'),
    ])
  },
})

const stubPassthrough = (name: string) =>
  markRaw({ name, setup(_: unknown, { slots }: { slots: Record<string, () => unknown> }) { return () => h('div', slots.default?.()) } })

const stubs = {
  Select: stubSelect,
  SelectContent: stubPassthrough('SelectContent'),
  SelectItem: stubPassthrough('SelectItem'),
  SelectTrigger: stubPassthrough('SelectTrigger'),
  SelectValue: stubPassthrough('SelectValue'),
}

function seedGates() {
  const gates = useGatesStore()
  gates.setGates(DEFAULT_GATES.map(g => ({ ...g, queue_count: 0 })))
}

beforeEach(() => {
  setActivePinia(createPinia())
  seedGates()
})

describe('StaffGateSelect', () => {
  it('is disabled for PENDING status', () => {
    const wrapper = mount(StaffGateSelect, {
      props: { currentGateId: null, requestId: 'r1', status: PICKUP_STATUS.PENDING },
      global: { stubs },
    })
    expect(wrapper.find('[data-disabled="true"]').exists()).toBe(true)
  })

  it('is disabled for PROCESSING status', () => {
    const wrapper = mount(StaffGateSelect, {
      props: { currentGateId: 'gate-1', requestId: 'r1', status: PICKUP_STATUS.PROCESSING },
      global: { stubs },
    })
    expect(wrapper.find('[data-disabled="true"]').exists()).toBe(true)
  })

  it('is disabled for COMPLETED status', () => {
    const wrapper = mount(StaffGateSelect, {
      props: { currentGateId: null, requestId: 'r1', status: PICKUP_STATUS.COMPLETED },
      global: { stubs },
    })
    expect(wrapper.find('[data-disabled="true"]').exists()).toBe(true)
  })

  it('is disabled for CANCELLED status', () => {
    const wrapper = mount(StaffGateSelect, {
      props: { currentGateId: null, requestId: 'r1', status: PICKUP_STATUS.CANCELLED },
      global: { stubs },
    })
    expect(wrapper.find('[data-disabled="true"]').exists()).toBe(true)
  })

  it('is enabled for APPROVED status', () => {
    const wrapper = mount(StaffGateSelect, {
      props: { currentGateId: null, requestId: 'r1', status: PICKUP_STATUS.APPROVED },
      global: { stubs },
    })
    expect(wrapper.find('[data-disabled="false"]').exists()).toBe(true)
  })

  it('is enabled for IN_QUEUE status', () => {
    const wrapper = mount(StaffGateSelect, {
      props: { currentGateId: 'gate-1', requestId: 'r1', status: PICKUP_STATUS.IN_QUEUE },
      global: { stubs },
    })
    expect(wrapper.find('[data-disabled="false"]').exists()).toBe(true)
  })

  it('calls assignToGate for APPROVED requests on gate change', () => {
    const queue = useQueueStore()
    const request = createPickupRequest({ id: 'r1', status: PICKUP_STATUS.APPROVED })
    queue.addRequest(request)

    const wrapper = mount(StaffGateSelect, {
      props: { currentGateId: null, requestId: 'r1', status: PICKUP_STATUS.APPROVED },
      global: { stubs },
    })

    // Simulate gate selection via the stubbed select emit
    wrapper.findComponent(stubSelect).vm.$emit('update:modelValue', 'gate-2')

    const updated = queue.requestById('r1')
    expect(updated?.status).toBe(PICKUP_STATUS.IN_QUEUE)
    expect(updated?.gate_id).toBe('gate-2')
  })

  it('calls moveToGate for IN_QUEUE requests on gate change', () => {
    const queue = useQueueStore()
    const request = createPickupRequest({
      id: 'r1',
      status: PICKUP_STATUS.IN_QUEUE,
      gate_id: 'gate-1',
      queue_position: 1,
    })
    queue.addRequest(request)

    const wrapper = mount(StaffGateSelect, {
      props: { currentGateId: 'gate-1', requestId: 'r1', status: PICKUP_STATUS.IN_QUEUE },
      global: { stubs },
    })

    wrapper.findComponent(stubSelect).vm.$emit('update:modelValue', 'gate-2')

    const updated = queue.requestById('r1')
    expect(updated?.gate_id).toBe('gate-2')
    expect(updated?.status).toBe(PICKUP_STATUS.IN_QUEUE)
  })
})
