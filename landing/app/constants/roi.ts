import type { RoiInputConfig, RoiOutputDisplayConfig, RoiSliderConfig } from '@/types/roi'

export const ROI_SECTION_ID = 'roi'

export const ROI_SECTION_HEADING = 'Do the math in 10 seconds'

export const WORKING_DAYS_PER_MONTH = 22

export const MONTHLY_COST = 349

export const PAYBACK_PERIOD_TEXT = 'Under 1 week'

export const ROI_PICKUPS_CONFIG: RoiSliderConfig = {
  min: 10,
  max: 300,
  step: 5,
  default: 75,
}

export const ROI_MINUTES_SAVED_CONFIG: RoiSliderConfig = {
  min: 1,
  max: 5,
  step: 1,
  default: 2,
}

export const ROI_HOURLY_COST_CONFIG: RoiInputConfig = {
  min: 15,
  max: 60,
  default: 30,
  prefix: '$',
}

export const ROI_PICKUPS_LABEL = 'Pickups per day'

export const ROI_MINUTES_SAVED_LABEL = 'Minutes saved per pickup'

export const ROI_HOURLY_COST_LABEL = 'Average hourly labor cost'

export const ROI_OUTPUT_CONFIGS: RoiOutputDisplayConfig[] = [
  {
    label: 'Daily time saved',
    testId: 'roi-daily-time',
    format: 'minutes',
    key: 'dailyTimeSavedMinutes',
  },
  {
    label: 'Monthly labor savings',
    testId: 'roi-monthly-savings',
    format: 'currency',
    key: 'monthlyLaborSavings',
  },
  {
    label: 'Platform cost',
    testId: 'roi-monthly-cost',
    format: 'currency',
    key: 'monthlyCost',
  },
  {
    label: 'ROI multiplier',
    testId: 'roi-multiplier',
    format: 'multiplier',
    key: 'monthlyRoiMultiplier',
    highlighted: true,
  },
  {
    label: 'Payback period',
    testId: 'roi-payback',
    format: 'text',
    key: 'paybackPeriod',
  },
]

export const ROI_ANIMATION_DURATION_MS = 400

export const ROI_REVEAL_STAGGER_MS = 100
