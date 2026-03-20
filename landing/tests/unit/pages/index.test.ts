import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IndexPage from '@/pages/index.vue'

describe('index page', () => {
  it('renders the placeholder heading', () => {
    const wrapper = mount(IndexPage)
    expect(wrapper.find('h1').text()).toBe('Landing Page')
  })

  it('uses semantic main element', () => {
    const wrapper = mount(IndexPage)
    expect(wrapper.find('main').exists()).toBe(true)
  })
})
