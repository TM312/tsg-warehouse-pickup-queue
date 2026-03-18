import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { h, markRaw } from 'vue'
import CustomerOrderForm from '@/components/customer/CustomerOrderForm.vue'
import { useQueueStore } from '@/stores/queue'
import { useSimulationStore } from '@/stores/simulation'

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

  it('calls submitOrder and selectCustomerRequest on submit', async () => {
    const wrapper = mount(CustomerOrderForm, { global: { stubs } })
    const queue = useQueueStore()
    const simulation = useSimulationStore()

    await wrapper.find('[data-testid="order-number-input"]').setValue('SO-999')
    await wrapper.find('form').trigger('submit')

    expect(queue.requests).toHaveLength(1)
    expect(queue.requests[0].sales_order_number).toBe('SO-999')
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
})
