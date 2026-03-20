import { describe, it, expect } from 'vitest'
import { PRODUCT_SECTION_ID, PRODUCT_SECTION_HEADING, PRODUCT_FEATURES, PRODUCT_REVEAL_STAGGER_MS, PRODUCT_MOCKUP_BROWSER_ENTRIES } from '@/constants/product'
import type { ProductMockupType } from '@/types/product'

describe('product constants', () => {
  it('has a non-empty section ID', () => {
    expect(PRODUCT_SECTION_ID).toBeTruthy()
  })

  it('has a non-empty section heading', () => {
    expect(PRODUCT_SECTION_HEADING).toBeTruthy()
  })

  it('has exactly 3 features', () => {
    expect(PRODUCT_FEATURES).toHaveLength(3)
  })

  it('each feature has non-empty key, mockup, heading, and description', () => {
    const validMockups: ProductMockupType[] = ['phone', 'browser', 'tablet']
    for (const feature of PRODUCT_FEATURES) {
      expect(feature.key).toBeTruthy()
      expect(validMockups).toContain(feature.mockup)
      expect(feature.heading).toBeTruthy()
      expect(feature.description).toBeTruthy()
    }
  })

  it('feature keys are unique', () => {
    const keys = PRODUCT_FEATURES.map((f) => f.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('PRODUCT_MOCKUP_BROWSER_ENTRIES has at least one entry with required fields', () => {
    expect(PRODUCT_MOCKUP_BROWSER_ENTRIES.length).toBeGreaterThan(0)
    for (const entry of PRODUCT_MOCKUP_BROWSER_ENTRIES) {
      expect(entry.company).toBeTruthy()
      expect(entry.order).toBeTruthy()
      expect(['waiting', 'called', 'loading', 'complete']).toContain(entry.status)
    }
  })
})
