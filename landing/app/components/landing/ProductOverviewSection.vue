<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { PRODUCT_SECTION_HEADING, PRODUCT_FEATURES, PRODUCT_REVEAL_STAGGER_MS } from '@/constants/product'
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
    id="features"
    ref="sectionRef"
    data-testid="product-section"
    class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32"
  >
    <h2
      data-testid="product-heading"
      class="mb-12 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
    >
      {{ PRODUCT_SECTION_HEADING }}
    </h2>

    <div class="grid gap-8 md:grid-cols-3">
      <LandingProductFeatureCard
        v-for="(feature, i) in PRODUCT_FEATURES"
        :key="feature.heading"
        :feature="feature"
        class="section-reveal"
        :class="{ revealed: reveal.isRevealed.value }"
        :style="{ transitionDelay: `${i * PRODUCT_REVEAL_STAGGER_MS}ms` }"
      />
    </div>
  </section>
</template>