<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { PROBLEM_SECTION_HEADING, PROBLEM_CARDS, REVEAL_STAGGER_MS } from '@/constants/problem'
import { useSectionReveal } from '@/composables/useSectionReveal'

const sectionRef = ref<HTMLElement | null>(null)
const reveal = useSectionReveal()

onMounted(() => {
  if (sectionRef.value) {
    reveal.init(sectionRef.value)
  }
})

onUnmounted(() => {
  reveal.destroy()
})
</script>

<template>
  <section
    id="problem"
    ref="sectionRef"
    data-testid="problem-section"
    class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32"
  >
    <h2
      data-testid="problem-heading"
      class="mb-12 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
    >
      {{ PROBLEM_SECTION_HEADING }}
    </h2>

    <div class="grid gap-8 md:grid-cols-3">
      <LandingProblemCard
        v-for="(card, i) in PROBLEM_CARDS"
        :key="card.heading"
        :card="card"
        class="section-reveal"
        :class="{ revealed: reveal.isRevealed.value }"
        :style="{ transitionDelay: `${i * REVEAL_STAGGER_MS}ms` }"
      />
    </div>
  </section>
</template>