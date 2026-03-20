import { describe, it, expect } from 'vitest'
import {
  ROI_SECTION_HEADING,
  WORKING_DAYS_PER_MONTH,
  MONTHLY_COST,
  ROI_PICKUPS_CONFIG,
  ROI_MINUTES_SAVED_CONFIG,
  ROI_HOURLY_COST_CONFIG,
  ROI_OUTPUT_CONFIGS,
} from '@/constants/roi'

describe('roi constants', () => {
  it('has a non-empty section heading', () => {
    expect(ROI_SECTION_HEADING).toBeTruthy()
  })

  it('WORKING_DAYS_PER_MONTH is 22', () => {
    expect(WORKING_DAYS_PER_MONTH).toBe(22)
  })

  it('MONTHLY_COST is positive', () => {
    expect(MONTHLY_COST).toBeGreaterThan(0)
  })

  it.each([
    ['pickups', ROI_PICKUPS_CONFIG],
    ['minutesSaved', ROI_MINUTES_SAVED_CONFIG],
  ])('%s slider config has min < max and valid default', (_name, config) => {
    expect(config.min).toBeLessThan(config.max)
    expect(config.default).toBeGreaterThanOrEqual(config.min)
    expect(config.default).toBeLessThanOrEqual(config.max)
  })

  it('hourly cost config has min < max and valid default', () => {
    expect(ROI_HOURLY_COST_CONFIG.min).toBeLessThan(ROI_HOURLY_COST_CONFIG.max)
    expect(ROI_HOURLY_COST_CONFIG.default).toBeGreaterThanOrEqual(ROI_HOURLY_COST_CONFIG.min)
    expect(ROI_HOURLY_COST_CONFIG.default).toBeLessThanOrEqual(ROI_HOURLY_COST_CONFIG.max)
  })

  it('has 5 output configs with non-empty labels and testIds', () => {
    expect(ROI_OUTPUT_CONFIGS).toHaveLength(5)
    for (const config of ROI_OUTPUT_CONFIGS) {
      expect(config.label).toBeTruthy()
      expect(config.testId).toBeTruthy()
    }
  })
})
