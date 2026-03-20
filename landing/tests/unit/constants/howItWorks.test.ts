import { describe, it, expect } from 'vitest'
import {
  HOW_IT_WORKS_SECTION_HEADING,
  HOW_IT_WORKS_SECTION_ID,
  HOW_IT_WORKS_STEPS,
} from '@/constants/howItWorks'

describe('howItWorks constants', () => {
  it('has a non-empty section heading', () => {
    expect(HOW_IT_WORKS_SECTION_HEADING).toBeTruthy()
  })

  it('has a non-empty section ID', () => {
    expect(HOW_IT_WORKS_SECTION_ID).toBeTruthy()
  })

  it('has exactly 4 steps', () => {
    expect(HOW_IT_WORKS_STEPS).toHaveLength(4)
  })

  it('each step has non-empty icon, heading, and description', () => {
    for (const step of HOW_IT_WORKS_STEPS) {
      expect(step.icon).toBeTruthy()
      expect(step.heading).toBeTruthy()
      expect(step.description).toBeTruthy()
    }
  })

  it('steps are numbered sequentially 1–4', () => {
    HOW_IT_WORKS_STEPS.forEach((step, i) => {
      expect(step.step).toBe(i + 1)
    })
  })
})
