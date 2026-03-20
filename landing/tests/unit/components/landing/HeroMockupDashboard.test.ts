import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroMockupDashboard from '@/components/landing/HeroMockupDashboard.vue'
import { HERO_MOCKUP_QUEUE_ENTRIES } from '@/constants/hero'

describe('HeroMockupDashboard', () => {
  function factory(animated = false) {
    return mount(HeroMockupDashboard, { props: { animated } })
  }

  it('renders all queue entry rows', () => {
    const wrapper = factory()
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(HERO_MOCKUP_QUEUE_ENTRIES.length)
  })

  it('displays company name for each entry', () => {
    const wrapper = factory()
    const rows = wrapper.findAll('tbody tr')
    for (let i = 0; i < HERO_MOCKUP_QUEUE_ENTRIES.length; i++) {
      expect(rows[i].text()).toContain(HERO_MOCKUP_QUEUE_ENTRIES[i].company)
    }
  })

  it('displays status badge for each entry', () => {
    const wrapper = factory()
    const badges = wrapper.findAll('tbody span.rounded-full')
    expect(badges).toHaveLength(HERO_MOCKUP_QUEUE_ENTRIES.length)
    for (let i = 0; i < HERO_MOCKUP_QUEUE_ENTRIES.length; i++) {
      expect(badges[i].text()).toBe(HERO_MOCKUP_QUEUE_ENTRIES[i].status)
    }
  })

  it('applies green classes for loading status', () => {
    const wrapper = factory()
    const loadingEntry = HERO_MOCKUP_QUEUE_ENTRIES.findIndex(e => e.status === 'loading')
    const badges = wrapper.findAll('tbody span.rounded-full')
    expect(badges[loadingEntry].classes()).toContain('bg-green-100')
    expect(badges[loadingEntry].classes()).toContain('text-green-700')
  })

  it('applies amber classes for called status', () => {
    const wrapper = factory()
    const calledEntry = HERO_MOCKUP_QUEUE_ENTRIES.findIndex(e => e.status === 'called')
    const badges = wrapper.findAll('tbody span.rounded-full')
    expect(badges[calledEntry].classes()).toContain('bg-amber-100')
    expect(badges[calledEntry].classes()).toContain('text-amber-700')
  })

  it('applies muted classes for waiting status', () => {
    const wrapper = factory()
    const waitingEntry = HERO_MOCKUP_QUEUE_ENTRIES.findIndex(e => e.status === 'waiting')
    const badges = wrapper.findAll('tbody span.rounded-full')
    expect(badges[waitingEntry].classes()).toContain('bg-muted')
    expect(badges[waitingEntry].classes()).toContain('text-muted-foreground')
  })

  it('shows gate value when entry has a gate', () => {
    const wrapper = factory()
    const withGate = HERO_MOCKUP_QUEUE_ENTRIES.filter(e => e.gate !== null)
    for (const entry of withGate) {
      expect(wrapper.text()).toContain(entry.gate)
    }
  })

  it('shows em-dash when entry has no gate', () => {
    const wrapper = factory()
    const rows = wrapper.findAll('tbody tr')
    const nullGateIndex = HERO_MOCKUP_QUEUE_ENTRIES.findIndex(e => e.gate === null)
    const gateCells = rows[nullGateIndex].findAll('td')
    expect(gateCells[2].text()).toBe('—')
  })

  it('hides rows beyond index 1 on small screens via CSS class', () => {
    const wrapper = factory()
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0].classes()).not.toContain('hidden')
    expect(rows[1].classes()).not.toContain('hidden')
    expect(rows[2].classes()).toContain('hidden')
    expect(rows[3].classes()).toContain('hidden')
  })

  it('applies animation class when animated is true', () => {
    const wrapper = factory(true)
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0].classes()).toContain('hero-dash-row')
  })

  it('does not apply animation class when animated is false', () => {
    const wrapper = factory(false)
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0].classes()).not.toContain('hero-dash-row')
  })
})
