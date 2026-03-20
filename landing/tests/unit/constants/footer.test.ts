import { describe, it, expect } from 'vitest'
import {
  FOOTER_SECTIONS,
  CONTACT_EMAIL,
  SUPPORT_HOURS,
  SOCIAL_LINKS,
  COPYRIGHT_HOLDER,
} from '@/constants/footer'

describe('footer constants', () => {
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
