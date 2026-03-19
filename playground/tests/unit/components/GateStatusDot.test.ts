import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GateStatusDot from '@/components/staff/GateStatusDot.vue'
import { GATE_OPERATIONAL_STATUS, GATE_STATUS_COLORS, GATE_STATUS_LABELS } from '@/constants/gate-status'

describe('GateStatusDot', () => {
  it.each([
    ['idle', GATE_OPERATIONAL_STATUS.IDLE, GATE_STATUS_COLORS.idle],
    ['processing', GATE_OPERATIONAL_STATUS.PROCESSING, GATE_STATUS_COLORS.processing],
    ['offline', GATE_OPERATIONAL_STATUS.OFFLINE, GATE_STATUS_COLORS.offline],
  ] as const)('applies correct color class for %s status', (_label, status, expectedClass) => {
    const wrapper = mount(GateStatusDot, { props: { status } })
    expect(wrapper.classes()).toContain(expectedClass)
  })

  it.each([
    [GATE_OPERATIONAL_STATUS.IDLE, GATE_STATUS_LABELS.idle],
    [GATE_OPERATIONAL_STATUS.PROCESSING, GATE_STATUS_LABELS.processing],
    [GATE_OPERATIONAL_STATUS.OFFLINE, GATE_STATUS_LABELS.offline],
  ] as const)('sets correct aria-label for %s', (status, expectedLabel) => {
    const wrapper = mount(GateStatusDot, { props: { status } })
    expect(wrapper.attributes('aria-label')).toBe(expectedLabel)
  })

  it('has role="status"', () => {
    const wrapper = mount(GateStatusDot, {
      props: { status: GATE_OPERATIONAL_STATUS.IDLE },
    })
    expect(wrapper.attributes('role')).toBe('status')
  })

  it('applies smaller size classes for sm', () => {
    const wrapper = mount(GateStatusDot, {
      props: { status: GATE_OPERATIONAL_STATUS.IDLE, size: 'sm' },
    })
    expect(wrapper.classes()).toContain('h-1.5')
    expect(wrapper.classes()).toContain('w-1.5')
  })

  it('applies md size classes by default', () => {
    const wrapper = mount(GateStatusDot, {
      props: { status: GATE_OPERATIONAL_STATUS.IDLE },
    })
    expect(wrapper.classes()).toContain('h-2')
    expect(wrapper.classes()).toContain('w-2')
  })
})
