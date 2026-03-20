import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/app.vue'

describe('app.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          NuxtLayout: { template: '<div><slot /></div>' },
          NuxtPage: { template: '<div data-testid="page" />' },
        },
      },
    })
    expect(wrapper.find('[data-testid="page"]').exists()).toBe(true)
  })
})
