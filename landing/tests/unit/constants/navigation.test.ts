import { describe, it, expect } from 'vitest'
import {
  PRODUCT_NAME,
  NAV_LINKS,
  CTA_LABEL,
  CTA_HREF,
  FOOTER_SECTIONS,
  CONTACT_EMAIL,
  SUPPORT_HOURS,
  SOCIAL_LINKS,
  COPYRIGHT_HOLDER,
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

  it('has non-empty footer sections with valid links', () => {
    expect(FOOTER_SECTIONS.length).toBeGreaterThan(0)
    for (const section of FOOTER_SECTIONS) {
      expect(section.title).toBeTruthy()
      expect(section.links.length).toBeGreaterThan(0)
      for (const link of section.links) {
        expect(link.label).toBeTruthy()
        expect(link.href).toBeTruthy()
      }
    }
  })

  it('has a valid contact email', () => {
    expect(CONTACT_EMAIL).toMatch(/@/)
  })

  it('has non-empty support hours', () => {
    expect(SUPPORT_HOURS).toBeTruthy()
  })

  it('has non-empty social links with valid hrefs', () => {
    expect(SOCIAL_LINKS.length).toBeGreaterThan(0)
    for (const link of SOCIAL_LINKS) {
      expect(link.label).toBeTruthy()
      expect(link.href).toMatch(/^https?:\/\//)
      expect(link.icon).toBeTruthy()
    }
  })

  it('has a non-empty copyright holder', () => {
    expect(COPYRIGHT_HOLDER).toBeTruthy()
  })
})
