<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSectionReveal } from '@/composables/useSectionReveal'
import {
  HOW_IT_WORKS_SECTION_ID,
  HOW_IT_WORKS_SECTION_HEADING,
  HOW_IT_WORKS_STEPS,
  HOW_IT_WORKS_REVEAL_STAGGER_MS,
} from '@/constants/howItWorks'

const sectionRef = ref<HTMLElement | null>(null)
const reveal = useSectionReveal()

onMounted(() => {
  if (sectionRef.value) reveal.init(sectionRef.value)
})

onUnmounted(() => {
  reveal.destroy()
})
</script>

<template>
  <section :id="HOW_IT_WORKS_SECTION_ID" ref="sectionRef" data-testid="how-it-works-section">
    <div class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
      <h2
        class="section-reveal text-3xl font-bold tracking-tight sm:text-4xl"
        :class="{ revealed: reveal.isRevealed.value }"
        data-testid="how-it-works-heading"
      >
        {{ HOW_IT_WORKS_SECTION_HEADING }}
      </h2>

      <div class="relative mt-16">
        <!-- Desktop connector line -->
        <div class="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-0.5 bg-border" data-testid="connector-line" />

        <!-- Mobile connector line -->
        <div class="md:hidden absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        <div class="flex flex-col md:flex-row md:justify-between gap-8 md:gap-0">
          <div
            v-for="(step, i) in HOW_IT_WORKS_STEPS"
            :key="step.step"
            class="section-reveal"
            :class="{ revealed: reveal.isRevealed.value }"
            :style="{ transitionDelay: `${i * HOW_IT_WORKS_REVEAL_STAGGER_MS}ms` }"
          >
            <LandingHowItWorksStep :step="step" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
