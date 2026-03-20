<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  ROI_SECTION_ID,
  ROI_SECTION_HEADING,
  ROI_PICKUPS_CONFIG,
  ROI_PICKUPS_LABEL,
  ROI_MINUTES_SAVED_CONFIG,
  ROI_MINUTES_SAVED_LABEL,
  ROI_HOURLY_COST_CONFIG,
  ROI_HOURLY_COST_LABEL,
  ROI_OUTPUT_CONFIGS,
  ROI_REVEAL_STAGGER_MS,
} from '@/constants/roi'
import { useRoiCalculator } from '@/composables/useRoiCalculator'
import { useSectionReveal } from '@/composables/useSectionReveal'

const sectionRef = ref<HTMLElement | null>(null)
const reveal = useSectionReveal()
const { pickups, minutesSaved, hourlyCost, outputs, setHourlyCost } = useRoiCalculator()

onMounted(() => {
  if (sectionRef.value) {
    reveal.init(sectionRef.value)
  }
})
</script>

<template>
  <section
    :id="ROI_SECTION_ID"
    ref="sectionRef"
    data-testid="roi-section"
    class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32"
  >
    <h2
      data-testid="roi-heading"
      class="mb-12 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
    >
      {{ ROI_SECTION_HEADING }}
    </h2>

    <div class="grid gap-10 md:grid-cols-2">
      <div class="space-y-6">
        <LandingRoiSliderInput
          v-model="pickups"
          :config="ROI_PICKUPS_CONFIG"
          :label="ROI_PICKUPS_LABEL"
          test-id="roi-pickups-slider"
          data-testid="roi-slider-input"
          class="section-reveal"
          :class="{ revealed: reveal.isRevealed.value }"
        />
        <LandingRoiSliderInput
          v-model="minutesSaved"
          :config="ROI_MINUTES_SAVED_CONFIG"
          :label="ROI_MINUTES_SAVED_LABEL"
          test-id="roi-minutes-slider"
          data-testid="roi-slider-input"
          class="section-reveal"
          :class="{ revealed: reveal.isRevealed.value }"
          :style="{ transitionDelay: `${ROI_REVEAL_STAGGER_MS}ms` }"
        />
        <LandingRoiCurrencyInput
          :model-value="hourlyCost"
          :config="ROI_HOURLY_COST_CONFIG"
          :label="ROI_HOURLY_COST_LABEL"
          test-id="roi-hourly-cost-input"
          data-testid="roi-currency-input"
          class="section-reveal"
          :class="{ revealed: reveal.isRevealed.value }"
          :style="{ transitionDelay: `${ROI_REVEAL_STAGGER_MS * 2}ms` }"
          @update:model-value="setHourlyCost"
        />
      </div>

      <div
        class="space-y-3 rounded-xl border border-border bg-card p-6 section-reveal"
        :class="{ revealed: reveal.isRevealed.value }"
        :style="{ transitionDelay: `${ROI_REVEAL_STAGGER_MS * 3}ms` }"
      >
        <LandingRoiOutputCard
          v-for="config in ROI_OUTPUT_CONFIGS"
          :key="config.key"
          :label="config.label"
          :value="outputs[config.key]"
          :format="config.format"
          :test-id="config.testId"
          :highlighted="config.highlighted"
          data-testid="roi-output-card"
        />
      </div>
    </div>
  </section>
</template>
