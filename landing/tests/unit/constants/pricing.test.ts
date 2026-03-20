import { describe, it, expect } from 'vitest'
import {
  PRICING_SECTION_HEADING,
  PRICING_FINE_PRINT,
  PRICING_TIERS,
  PRICING_FEATURES,
  PRICING_ANNUAL_DISCOUNT,
  PRICING_ANNUAL_SAVE_LABEL,
  FEATURE_SUPPORTED,
  FEATURE_UNAVAILABLE,
} from '@/constants/pricing'

describe('pricing constants', () => {
  it('has a non-empty section heading', () => {
    expect(PRICING_SECTION_HEADING).toBeTruthy()
  })

  it('has a non-empty fine print', () => {
    expect(PRICING_FINE_PRINT).toBeTruthy()
  })

  it('has exactly 3 tiers', () => {
    expect(PRICING_TIERS).toHaveLength(3)
  })

  it('each tier has non-empty name and valid cta', () => {
    for (const tier of PRICING_TIERS) {
      expect(tier.name).toBeTruthy()
      expect(tier.cta.label).toBeTruthy()
      expect(tier.cta.href).toBeTruthy()
      expect(['default', 'outline']).toContain(tier.cta.variant)
    }
  })

  it('each tier with a numeric price has a positive value', () => {
    for (const tier of PRICING_TIERS) {
      if (tier.monthlyPrice !== null) {
        expect(tier.monthlyPrice).toBeGreaterThan(0)
      }
    }
  })

  it('exactly one tier is highlighted', () => {
    const highlighted = PRICING_TIERS.filter((t) => t.highlighted)
    expect(highlighted).toHaveLength(1)
  })

  it('has exactly 8 feature rows', () => {
    expect(PRICING_FEATURES).toHaveLength(8)
  })

  it('each feature has a non-empty label and values for all tier keys', () => {
    for (const feature of PRICING_FEATURES) {
      expect(feature.label).toBeTruthy()
      expect(feature.values.starter).toBeDefined()
      expect(feature.values.professional).toBeDefined()
      expect(feature.values.enterprise).toBeDefined()
    }
  })

  it('feature labels are unique', () => {
    const labels = PRICING_FEATURES.map((f) => f.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('annual discount is between 0 and 1 exclusive', () => {
    expect(PRICING_ANNUAL_DISCOUNT).toBeGreaterThan(0)
    expect(PRICING_ANNUAL_DISCOUNT).toBeLessThan(1)
  })

  it('save label is derived from the discount value', () => {
    const expectedLabel = `Save ${PRICING_ANNUAL_DISCOUNT * 100}%`
    expect(PRICING_ANNUAL_SAVE_LABEL).toBe(expectedLabel)
  })

  it('annual Professional price equals 279', () => {
    const pro = PRICING_TIERS.find((t) => t.key === 'professional')!
    expect(Math.round(pro.monthlyPrice! * (1 - PRICING_ANNUAL_DISCOUNT))).toBe(279)
  })

  it('feature markers are single characters', () => {
    expect(FEATURE_SUPPORTED).toBe('✓')
    expect(FEATURE_UNAVAILABLE).toBe('\u2014')
  })
})
