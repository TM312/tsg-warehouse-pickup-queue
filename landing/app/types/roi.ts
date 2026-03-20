export interface RoiSliderConfig {
  min: number
  max: number
  step: number
  default: number
}

export interface RoiInputConfig {
  min: number
  max: number
  default: number
  prefix: string
}

export interface RoiOutputs {
  dailyTimeSavedMinutes: number
  monthlyLaborSavings: number
  monthlyCost: number
  monthlyRoiMultiplier: number
  paybackPeriod: string
}

export type RoiOutputFormat = 'minutes' | 'currency' | 'multiplier' | 'text'

export interface RoiOutputDisplayConfig {
  label: string
  testId: string
  format: RoiOutputFormat
  key: keyof RoiOutputs
  highlighted?: boolean
}
