import { describe, it, expect } from 'vitest'
import {
  HERO_HEADLINE,
  HERO_SUBHEADLINE,
  HERO_PRIMARY_CTA_LABEL,
  HERO_PRIMARY_CTA_HREF,
  HERO_SECONDARY_CTA_LABEL,
  HERO_SECONDARY_CTA_HREF,
  HERO_TRUST_BAR_ITEMS,
  HERO_MOCKUP_QUEUE_ENTRIES,
} from '@/constants/hero'

describe('hero constants', () => {
  it('has a non-empty headline', () => {
    expect(HERO_HEADLINE).toBeTruthy()
  })

  it('has a non-empty subheadline', () => {
    expect(HERO_SUBHEADLINE).toBeTruthy()
  })

  it('has primary CTA label and href starting with /', () => {
    expect(HERO_PRIMARY_CTA_LABEL).toBeTruthy()
    expect(HERO_PRIMARY_CTA_HREF).toMatch(/^\//)
  })

  it('has secondary CTA label and href starting with / or #', () => {
    expect(HERO_SECONDARY_CTA_LABEL).toBeTruthy()
    expect(HERO_SECONDARY_CTA_HREF).toMatch(/^[#/]/)
  })

  it('has non-empty trust bar items with text', () => {
    expect(HERO_TRUST_BAR_ITEMS.length).toBeGreaterThan(0)
    for (const item of HERO_TRUST_BAR_ITEMS) {
      expect(item.text).toBeTruthy()
    }
  })

  it('has non-empty mockup queue entries with required fields', () => {
    expect(HERO_MOCKUP_QUEUE_ENTRIES.length).toBeGreaterThan(0)
    for (const entry of HERO_MOCKUP_QUEUE_ENTRIES) {
      expect(entry.company).toBeTruthy()
      expect(entry.order).toBeTruthy()
      expect(['waiting', 'called', 'loading', 'complete']).toContain(entry.status)
    }
  })
})
