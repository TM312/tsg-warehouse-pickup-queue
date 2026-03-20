import { describe, it, expect } from 'vitest'
import { useRoiCalculator } from '@/composables/useRoiCalculator'
import { MONTHLY_COST } from '@/constants/roi'

describe('useRoiCalculator', () => {
  it('computes correct default outputs', () => {
    const { outputs } = useRoiCalculator()
    // 75 pickups * 2 min = 150 min daily
    expect(outputs.value.dailyTimeSavedMinutes).toBe(150)
    // (150/60) * 30 * 22 = 1650
    expect(outputs.value.monthlyLaborSavings).toBe(1650)
    // round((1650/349)*10)/10 = 4.7
    expect(outputs.value.monthlyRoiMultiplier).toBe(4.7)
  })

  it('monthlyCost always equals MONTHLY_COST', () => {
    const { outputs } = useRoiCalculator()
    expect(outputs.value.monthlyCost).toBe(MONTHLY_COST)
  })

  it('updates outputs when pickups changes', () => {
    const { pickups, outputs } = useRoiCalculator()
    pickups.value = 150
    // 150 * 2 = 300 min daily
    expect(outputs.value.dailyTimeSavedMinutes).toBe(300)
  })

  it('updates outputs when minutesSaved changes', () => {
    const { minutesSaved, outputs } = useRoiCalculator()
    minutesSaved.value = 5
    // 75 * 5 = 375 min daily
    expect(outputs.value.dailyTimeSavedMinutes).toBe(375)
  })

  it('setHourlyCost clamps below min to min', () => {
    const { hourlyCost, setHourlyCost } = useRoiCalculator()
    setHourlyCost(5)
    expect(hourlyCost.value).toBe(15)
  })

  it('setHourlyCost clamps above max to max', () => {
    const { hourlyCost, setHourlyCost } = useRoiCalculator()
    setHourlyCost(100)
    expect(hourlyCost.value).toBe(60)
  })

  it('setHourlyCost keeps value within range', () => {
    const { hourlyCost, setHourlyCost } = useRoiCalculator()
    setHourlyCost(45)
    expect(hourlyCost.value).toBe(45)
  })

  it('setHourlyCost(0) clamps to min, never allows 0', () => {
    const { hourlyCost, setHourlyCost } = useRoiCalculator()
    setHourlyCost(0)
    expect(hourlyCost.value).toBe(15)
  })
})
