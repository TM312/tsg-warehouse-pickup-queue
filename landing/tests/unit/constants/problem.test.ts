import { describe, it, expect } from 'vitest'
import { PROBLEM_SECTION_ID, PROBLEM_SECTION_HEADING, PROBLEM_CARDS } from '@/constants/problem'

describe('problem constants', () => {
  it('has a non-empty section ID', () => {
    expect(PROBLEM_SECTION_ID).toBeTruthy()
  })

  it('has a non-empty section heading', () => {
    expect(PROBLEM_SECTION_HEADING).toBeTruthy()
  })

  it('has exactly 3 cards', () => {
    expect(PROBLEM_CARDS).toHaveLength(3)
  })

  it('each card has non-empty key, icon, heading, and description', () => {
    for (const card of PROBLEM_CARDS) {
      expect(card.key).toBeTruthy()
      expect(card.icon).toBeTruthy()
      expect(card.heading).toBeTruthy()
      expect(card.description).toBeTruthy()
    }
  })

  it('card keys are unique', () => {
    const keys = PROBLEM_CARDS.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})
