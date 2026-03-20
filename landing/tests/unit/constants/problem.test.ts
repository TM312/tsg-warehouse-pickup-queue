import { describe, it, expect } from 'vitest'
import { PROBLEM_SECTION_HEADING, PROBLEM_CARDS, REVEAL_STAGGER_MS, REVEAL_THRESHOLD } from '@/constants/problem'

describe('problem constants', () => {
  it('has a non-empty section heading', () => {
    expect(PROBLEM_SECTION_HEADING).toBeTruthy()
  })

  it('has exactly 3 cards', () => {
    expect(PROBLEM_CARDS).toHaveLength(3)
  })

  it('each card has non-empty icon, heading, and description', () => {
    for (const card of PROBLEM_CARDS) {
      expect(card.icon).toBeTruthy()
      expect(card.heading).toBeTruthy()
      expect(card.description).toBeTruthy()
    }
  })

  it('REVEAL_STAGGER_MS is a positive number', () => {
    expect(REVEAL_STAGGER_MS).toBeGreaterThan(0)
  })

  it('REVEAL_THRESHOLD is between 0 and 1', () => {
    expect(REVEAL_THRESHOLD).toBeGreaterThan(0)
    expect(REVEAL_THRESHOLD).toBeLessThanOrEqual(1)
  })
})
