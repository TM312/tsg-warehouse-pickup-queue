import { describe, it, expect } from 'vitest'
import {
  ERP_SECTION_HEADING,
  ERP_SECTION_ID,
  ERP_SECTION_NOTE,
  ERP_BULLETS,
  ERP_REVEAL_STAGGER_MS,
  ERP_FLOW_TITLE,
  ERP_FLOW_LABEL_LEFT,
  ERP_FLOW_LABEL_RIGHT,
  ERP_FLOW_ARROW_TOP,
  ERP_FLOW_ARROW_BOTTOM,
} from '@/constants/erp'

describe('erp constants', () => {
  it('has a non-empty section heading', () => {
    expect(ERP_SECTION_HEADING).toBeTruthy()
  })

  it('has a non-empty section ID', () => {
    expect(ERP_SECTION_ID).toBeTruthy()
  })

  it('has a non-empty section note', () => {
    expect(ERP_SECTION_NOTE).toBeTruthy()
  })

  it('has exactly 4 bullets', () => {
    expect(ERP_BULLETS).toHaveLength(4)
  })

  it('each bullet has non-empty icon and text', () => {
    for (const bullet of ERP_BULLETS) {
      expect(bullet.icon).toBeTruthy()
      expect(bullet.text).toBeTruthy()
    }
  })

  it('ERP_REVEAL_STAGGER_MS is a positive number', () => {
    expect(ERP_REVEAL_STAGGER_MS).toBeGreaterThan(0)
  })

  it('has non-empty ERP flow diagram labels', () => {
    expect(ERP_FLOW_TITLE).toBeTruthy()
    expect(ERP_FLOW_LABEL_LEFT).toBeTruthy()
    expect(ERP_FLOW_LABEL_RIGHT).toBeTruthy()
    expect(ERP_FLOW_ARROW_TOP).toBeTruthy()
    expect(ERP_FLOW_ARROW_BOTTOM).toBeTruthy()
  })
})
