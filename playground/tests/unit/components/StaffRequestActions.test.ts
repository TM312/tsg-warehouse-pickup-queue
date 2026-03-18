import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { h, markRaw } from 'vue'
import StaffRequestActions from '@/components/staff/StaffRequestActions.vue'
import { useQueueStore } from '@/stores/queue'
import { createPickupRequest } from '@/utils/factories'
import { PICKUP_STATUS } from '@/constants/status'
import type { PickupStatus } from '@/constants/status'

const stubButton = markRaw({
  name: 'Button',
  props: ['size', 'variant'],
  setup(_: unknown, { slots, attrs }: { slots: Record<string, () => unknown>; attrs: Record<string, unknown> }) {
    return () => h('button', attrs, slots.default?.())
  },
})

const stubs = { Button: stubButton }

function mountActions(status: PickupStatus) {
  const request = createPickupRequest({ status })
  return mount(StaffRequestActions, {
    props: { request },
    global: { stubs },
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('StaffRequestActions', () => {
  it('shows Approve and Cancel for PENDING requests', () => {
    const wrapper = mountActions(PICKUP_STATUS.PENDING)
    const buttons = wrapper.findAll('button')
    const labels = buttons.map(b => b.text())
    expect(labels).toContain('Approve')
    expect(labels).toContain('Cancel')
    expect(labels).not.toContain('Start Processing')
    expect(labels).not.toContain('Complete')
  })

  it('shows Cancel only for APPROVED requests (no gate assigned)', () => {
    const wrapper = mountActions(PICKUP_STATUS.APPROVED)
    const labels = wrapper.findAll('button').map(b => b.text())
    expect(labels).toContain('Cancel')
    expect(labels).not.toContain('Approve')
    expect(labels).not.toContain('Complete')
  })

  it('shows Start Processing and Cancel for IN_QUEUE requests', () => {
    const wrapper = mountActions(PICKUP_STATUS.IN_QUEUE)
    const labels = wrapper.findAll('button').map(b => b.text())
    expect(labels).toContain('Start Processing')
    expect(labels).toContain('Cancel')
    expect(labels).not.toContain('Approve')
    expect(labels).not.toContain('Complete')
  })

  it('shows Complete and Cancel for PROCESSING requests', () => {
    const wrapper = mountActions(PICKUP_STATUS.PROCESSING)
    const labels = wrapper.findAll('button').map(b => b.text())
    expect(labels).toContain('Complete')
    expect(labels).toContain('Cancel')
    expect(labels).not.toContain('Approve')
    expect(labels).not.toContain('Start Processing')
  })

  it('shows no buttons for COMPLETED requests', () => {
    const wrapper = mountActions(PICKUP_STATUS.COMPLETED)
    expect(wrapper.findAll('button')).toHaveLength(0)
  })

  it('shows no buttons for CANCELLED requests', () => {
    const wrapper = mountActions(PICKUP_STATUS.CANCELLED)
    expect(wrapper.findAll('button')).toHaveLength(0)
  })

  it('calls approveRequest when Approve is clicked', async () => {
    const queue = useQueueStore()
    const request = createPickupRequest({ id: 'r1', status: PICKUP_STATUS.PENDING })
    queue.addRequest(request)

    const wrapper = mount(StaffRequestActions, {
      props: { request },
      global: { stubs },
    })

    const approveBtn = wrapper.findAll('button').find(b => b.text() === 'Approve')!
    await approveBtn.trigger('click')
    expect(queue.requestById('r1')?.status).toBe(PICKUP_STATUS.APPROVED)
  })

  it('calls cancelRequest when Cancel is clicked', async () => {
    const queue = useQueueStore()
    const request = createPickupRequest({ id: 'r2', status: PICKUP_STATUS.PENDING })
    queue.addRequest(request)

    const wrapper = mount(StaffRequestActions, {
      props: { request },
      global: { stubs },
    })

    const cancelBtn = wrapper.findAll('button').find(b => b.text() === 'Cancel')!
    await cancelBtn.trigger('click')
    expect(queue.requestById('r2')?.status).toBe(PICKUP_STATUS.CANCELLED)
  })

  it('has data-testid="staff-request-actions"', () => {
    const wrapper = mountActions(PICKUP_STATUS.PENDING)
    expect(wrapper.find('[data-testid="staff-request-actions"]').exists()).toBe(true)
  })
})
