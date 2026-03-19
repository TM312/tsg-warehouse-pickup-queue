import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { h, markRaw, nextTick, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import CustomerOrderForm from '@/components/customer/CustomerOrderForm.vue'
import { useQueueStore } from '@/stores/queue'
import { useSimulationStore } from '@/stores/simulation'
import { ANIMATION } from '@/constants/animations'

vi.mock('@vueuse/core', () => ({
  useMediaQuery: vi.fn(() => ref(false)),
}))

const stubs = {
  UiLabel: markRaw({ name: 'UiLabel', props: ['for'], render() { return h('label', { for: this.for }, this.$slots.default?.()) } }),
  UiInput: markRaw({
    name: 'UiInput',
    props: ['modelValue', 'id', 'placeholder'],
    emits: ['update:modelValue'],
    render() {
      return h('input', {
        value: this.modelValue,
        id: this.id,
        placeholder: this.placeholder,
        'data-testid': this.$attrs['data-testid'],
        onInput: (e: Event) => this.$emit('update:modelValue', (e.target as HTMLInputElement).value),
      })
    },
  }),
  UiButton: markRaw({
    name: 'UiButton',
    props: ['type', 'disabled'],
    render() {
      return h('button', {
        type: this.type,
        disabled: this.disabled,
        'data-testid': this.$attrs['data-testid'],
      }, this.$slots.default?.())
    },
  }),
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
  vi.mocked(useMediaQuery).mockReturnValue(ref(false))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('CustomerOrderForm', () => {
  it('renders order number and company name inputs', () => {
    const wrapper = mount(CustomerOrderForm, { global: { stubs } })
    expect(wrapper.find('[data-testid="order-number-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="company-name-input"]').exists()).toBe(true)
  })

  it('submit button is disabled when order number is empty', () => {
    const wrapper = mount(CustomerOrderForm, { global: { stubs } })
    const btn = wrapper.find('[data-testid="submit-order-button"]')
    expect((btn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('calls submitOrder and selectCustomerRequest after flash on submit', async () => {
    const wrapper = mount(CustomerOrderForm, { global: { stubs } })
    const queue = useQueueStore()
    const simulation = useSimulationStore()

    await wrapper.find('[data-testid="order-number-input"]').setValue('SO-999')
    await wrapper.find('form').trigger('submit')

    expect(queue.requests).toHaveLength(1)
    expect(queue.requests[0].sales_order_number).toBe('SO-999')

    // Selection should happen after flash timeout
    expect(simulation.selectedCustomerRequestId).toBeNull()
    vi.advanceTimersByTime(ANIMATION.SUCCESS_FLASH_MS)
    expect(simulation.selectedCustomerRequestId).toBe(queue.requests[0].id)
  })

  it('clears form after submission', async () => {
    const wrapper = mount(CustomerOrderForm, { global: { stubs } })

    await wrapper.find('[data-testid="order-number-input"]').setValue('SO-111')
    await wrapper.find('[data-testid="company-name-input"]').setValue('Acme')
    await wrapper.find('form').trigger('submit')

    expect((wrapper.find('[data-testid="order-number-input"]').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('[data-testid="company-name-input"]').element as HTMLInputElement).value).toBe('')
  })

  it('shows success flash indicator after submit that clears after timeout', async () => {
    const wrapper = mount(CustomerOrderForm, { global: { stubs } })

    await wrapper.find('[data-testid="order-number-input"]').setValue('SO-123')
    const formClassesBefore = wrapper.find('form').classes()
    await wrapper.find('form').trigger('submit')

    const formClassesAfter = wrapper.find('form').classes()
    expect(formClassesAfter.length).toBeGreaterThan(formClassesBefore.length)

    vi.advanceTimersByTime(ANIMATION.SUCCESS_FLASH_MS)
    await nextTick()

    expect(wrapper.find('form').classes().length).toBe(formClassesBefore.length)
  })

  it('order number input receives focus on mount', async () => {
    const wrapper = mount(CustomerOrderForm, {
      global: { stubs },
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()

    const input = wrapper.find('[data-testid="order-number-input"]')
    expect(input.element).toBe(document.activeElement)
    wrapper.unmount()
  })

  it('does not submit when order number is whitespace only', async () => {
    const wrapper = mount(CustomerOrderForm, { global: { stubs } })
    const queue = useQueueStore()

    await wrapper.find('[data-testid="order-number-input"]').setValue('   ')
    await wrapper.find('form').trigger('submit')

    expect(queue.requests).toHaveLength(0)
  })

  it('trims order number before submission', async () => {
    const wrapper = mount(CustomerOrderForm, { global: { stubs } })
    const queue = useQueueStore()

    await wrapper.find('[data-testid="order-number-input"]').setValue('  SO-123  ')
    await wrapper.find('form').trigger('submit')

    expect(queue.requests[0].sales_order_number).toBe('SO-123')
  })

  it('uses factory default company name when company input is empty', async () => {
    const wrapper = mount(CustomerOrderForm, { global: { stubs } })
    const queue = useQueueStore()

    await wrapper.find('[data-testid="order-number-input"]').setValue('SO-123')
    await wrapper.find('form').trigger('submit')

    // Empty company name falls through to factory default (not undefined)
    expect(queue.requests[0].company_name).toBeTruthy()
  })

  it('trims company name and passes it through on submit', async () => {
    const wrapper = mount(CustomerOrderForm, { global: { stubs } })
    const queue = useQueueStore()

    await wrapper.find('[data-testid="order-number-input"]').setValue('SO-123')
    await wrapper.find('[data-testid="company-name-input"]').setValue('  Acme Corp  ')
    await wrapper.find('form').trigger('submit')

    expect(queue.requests[0].company_name).toBe('Acme Corp')
  })

  it('skips flash and immediately selects request when reduced motion is active', async () => {
    vi.mocked(useMediaQuery).mockReturnValue(ref(true))
    const wrapper = mount(CustomerOrderForm, { global: { stubs } })
    const queue = useQueueStore()
    const simulation = useSimulationStore()

    await wrapper.find('[data-testid="order-number-input"]').setValue('SO-999')
    await wrapper.find('form').trigger('submit')

    // No flash ring
    expect(wrapper.find('form').classes()).not.toContain('ring-2')
    // Selected immediately without timer
    expect(simulation.selectedCustomerRequestId).toBe(queue.requests[0].id)
  })

  it('does not select request after unmount', async () => {
    const wrapper = mount(CustomerOrderForm, { global: { stubs } })
    const simulation = useSimulationStore()

    await wrapper.find('[data-testid="order-number-input"]').setValue('SO-123')
    await wrapper.find('form').trigger('submit')

    wrapper.unmount()
    vi.advanceTimersByTime(10_000)
    expect(simulation.selectedCustomerRequestId).toBeNull()
  })
})
