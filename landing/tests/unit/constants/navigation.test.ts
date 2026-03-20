import { describe, it, expect } from 'vitest'
import {
  PRODUCT_NAME,
  NAV_LINKS,
  CTA_LABEL,
  CTA_HREF,
  TRIAL_HREF,
  CONTACT_HREF,
} from '@/constants/navigation'

describe('navigation constants', () => {
  it('has a non-empty product name', () => {
    expect(PRODUCT_NAME).toBeTruthy()
  })

  it('has non-empty nav links with valid hrefs', () => {
    expect(NAV_LINKS.length).toBeGreaterThan(0)
    for (const link of NAV_LINKS) {
      expect(link.label).toBeTruthy()
      expect(link.href).toMatch(/^[#/]/)
    }
  })

  it('has CTA label and href', () => {
    expect(CTA_LABEL).toBeTruthy()
    expect(CTA_HREF).toMatch(/^\//)
  })

  it('TRIAL_HREF points to a valid path', () => {
    expect(TRIAL_HREF).toMatch(/^\//)
  })

  it('CONTACT_HREF points to a valid path', () => {
    expect(CONTACT_HREF).toMatch(/^\//)
  })
})
