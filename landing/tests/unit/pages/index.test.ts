import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IndexPage from '@/pages/index.vue'

describe('index page', () => {
  it('renders anchor sections for smooth-scroll targets', () => {
    const wrapper = mount(IndexPage)
    expect(wrapper.find('#features').exists()).toBe(true)
    expect(wrapper.find('#pricing').exists()).toBe(true)
    expect(wrapper.find('#demo').exists()).toBe(true)
  })

  it('renders section headings', () => {
    const wrapper = mount(IndexPage)
    const headings = wrapper.findAll('h2')
    expect(headings).toHaveLength(3)
    expect(headings[0].text()).toBe('Features')
    expect(headings[1].text()).toBe('Pricing')
    expect(headings[2].text()).toBe('Demo')
  })
})
