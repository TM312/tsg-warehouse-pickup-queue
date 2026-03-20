<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  PRICING_SECTION_ID,
  PRICING_SECTION_HEADING,
  PRICING_FINE_PRINT,
  PRICING_TIERS,
} from '@/constants/pricing'
import { REVEAL_STAGGER_MS } from '@/constants/animation'
import { useSectionReveal } from '@/composables/useSectionReveal'
import { useBillingToggle } from '@/composables/useBillingToggle'

const sectionRef = ref<HTMLElement | null>(null)
const reveal = useSectionReveal()
const { billingCycle, getDisplayPrice } = useBillingToggle()

onMounted(() => {
  if (sectionRef.value) {
    reveal.init(sectionRef.value)
  }
})
</script>

<template>
  <section
    :id="PRICING_SECTION_ID"
    ref="sectionRef"
    data-testid="pricing-section"
    class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32"
  >
    <h2
      data-testid="pricing-heading"
      class="mb-4 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
    >
      {{ PRICING_SECTION_HEADING }}
    </h2>

    <div class="mb-12 flex justify-center">
      <LandingPricingToggle v-model="billingCycle" />
    </div>

    <div class="grid gap-8 grid-cols-1 lg:grid-cols-3 items-start">
      <LandingPricingCard
        v-for="(tier, i) in PRICING_TIERS"
        :key="tier.key"
        :tier="tier"
        :display-price="getDisplayPrice(tier.monthlyPrice)"
        :billing-cycle="billingCycle"
        class="section-reveal"
        :class="{ revealed: reveal.isRevealed.value }"
        :style="{ transitionDelay: `${i * REVEAL_STAGGER_MS}ms` }"
      />
    </div>

    <p data-testid="pricing-fine-print" class="mt-12 text-center text-sm text-muted-foreground">
      {{ PRICING_FINE_PRINT }}
    </p>
  </section>
</template>
