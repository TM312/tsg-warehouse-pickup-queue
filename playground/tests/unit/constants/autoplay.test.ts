import { describe, it, expect } from 'vitest'
import {
  AUTOPLAY_DELAY_MS,
  AUTOPLAY_PANEL_STAGGER_MS,
  AUTOPLAY_TOAST_DURATION_MS,
  STORAGE_KEY,
} from '@/constants/autoplay'

describe('autoplay constants', () => {
  it('AUTOPLAY_DELAY_MS is a positive number', () => {
    expect(AUTOPLAY_DELAY_MS).toBeGreaterThan(0)
  })

  it('AUTOPLAY_PANEL_STAGGER_MS is a positive number', () => {
    expect(AUTOPLAY_PANEL_STAGGER_MS).toBeGreaterThan(0)
  })

  it('AUTOPLAY_TOAST_DURATION_MS is a positive number', () => {
    expect(AUTOPLAY_TOAST_DURATION_MS).toBeGreaterThan(0)
  })

  it('STORAGE_KEY.HAS_VISITED is a non-empty string', () => {
    expect(STORAGE_KEY.HAS_VISITED).toBeTruthy()
    expect(typeof STORAGE_KEY.HAS_VISITED).toBe('string')
  })
})
