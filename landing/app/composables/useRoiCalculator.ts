import { computed, ref } from 'vue'
import type { RoiOutputs } from '@/types/roi'
import {
  MONTHLY_COST,
  PAYBACK_PERIOD_TEXT,
  ROI_HOURLY_COST_CONFIG,
  ROI_MINUTES_SAVED_CONFIG,
  ROI_PICKUPS_CONFIG,
  WORKING_DAYS_PER_MONTH,
} from '@/constants/roi'
import { clampValue } from '@/lib/utils'

export function useRoiCalculator() {
  const pickups = ref(ROI_PICKUPS_CONFIG.default)
  const minutesSaved = ref(ROI_MINUTES_SAVED_CONFIG.default)
  const hourlyCost = ref(ROI_HOURLY_COST_CONFIG.default)

  const outputs = computed<RoiOutputs>(() => {
    const dailyTimeSavedMinutes = pickups.value * minutesSaved.value
    const monthlyLaborSavings = Math.round(
      (dailyTimeSavedMinutes / 60) * hourlyCost.value * WORKING_DAYS_PER_MONTH,
    )
    const monthlyRoiMultiplier = Math.round((monthlyLaborSavings / MONTHLY_COST) * 10) / 10

    return {
      dailyTimeSavedMinutes,
      monthlyLaborSavings,
      monthlyCost: MONTHLY_COST,
      monthlyRoiMultiplier,
      paybackPeriod: PAYBACK_PERIOD_TEXT,
    }
  })

  function setHourlyCost(value: number) {
    hourlyCost.value = clampValue(value, ROI_HOURLY_COST_CONFIG.min, ROI_HOURLY_COST_CONFIG.max)
  }

  return {
    pickups,
    minutesSaved,
    hourlyCost,
    outputs,
    setHourlyCost,
  }
}
