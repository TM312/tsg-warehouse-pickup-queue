import { describe, it, expect } from 'vitest'
import {
  SITE_URL,
  SEO_TITLE,
  SEO_DESCRIPTION,
  SEO_OG_IMAGE_PATH,
  SEO_META,
  SEO_TARGET_KEYWORDS,
} from '@/constants/seo'

describe('seo constants', () => {
  it('has a SITE_URL starting with https://', () => {
    expect(SITE_URL).toBeTruthy()
    expect(SITE_URL).toMatch(/^https:\/\//)
  })

  it('has a non-empty SEO_TITLE', () => {
    expect(SEO_TITLE).toBeTruthy()
  })

  it('has a non-empty SEO_DESCRIPTION within 160 characters', () => {
    expect(SEO_DESCRIPTION).toBeTruthy()
    expect(SEO_DESCRIPTION.length).toBeLessThanOrEqual(160)
  })

  it('has SEO_OG_IMAGE_PATH starting with /', () => {
    expect(SEO_OG_IMAGE_PATH).toMatch(/^\//)
  })

  it('has all SEO_META fields populated', () => {
    expect(SEO_META.title).toBeTruthy()
    expect(SEO_META.description).toBeTruthy()
    expect(SEO_META.ogTitle).toBeTruthy()
    expect(SEO_META.ogDescription).toBeTruthy()
    expect(SEO_META.ogImage).toBeTruthy()
    expect(SEO_META.ogType).toBe('website')
    expect(SEO_META.ogUrl).toBeTruthy()
    expect(SEO_META.twitterCard).toBe('summary_large_image')
    expect(SEO_META.twitterTitle).toBeTruthy()
    expect(SEO_META.twitterDescription).toBeTruthy()
    expect(SEO_META.twitterImage).toBeTruthy()
  })

  it('has ogImage and twitterImage as absolute URLs', () => {
    expect(SEO_META.ogImage).toMatch(/^https:\/\//)
    expect(SEO_META.twitterImage).toMatch(/^https:\/\//)
  })

  it('has non-empty target keywords with terms', () => {
    expect(SEO_TARGET_KEYWORDS.length).toBeGreaterThan(0)
    for (const keyword of SEO_TARGET_KEYWORDS) {
      expect(keyword.term).toBeTruthy()
    }
  })
})
