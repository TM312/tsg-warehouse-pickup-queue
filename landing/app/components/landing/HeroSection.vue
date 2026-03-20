<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  HERO_HEADLINE,
  HERO_SUBHEADLINE,
  HERO_PRIMARY_CTA_LABEL,
  HERO_PRIMARY_CTA_HREF,
  HERO_SECONDARY_CTA_LABEL,
  HERO_SECONDARY_CTA_HREF,
  HERO_TRUST_BAR_ITEMS,
} from '@/constants/hero'
import { useHeroAnimation } from '@/composables/useHeroAnimation'

const sectionRef = ref<HTMLElement | null>(null)
const heroAnimation = useHeroAnimation()

const mockupAnimated = computed(
  () => heroAnimation.isVisible.value && !heroAnimation.prefersReducedMotion.value,
)

onMounted(() => {
  if (sectionRef.value) {
    heroAnimation.init(sectionRef.value)
  }
})
</script>

<template>
  <section
    id="hero"
    ref="sectionRef"
    data-testid="hero-section"
    class="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-32"
  >
    <!-- Text column -->
    <div class="flex flex-col gap-6">
      <h1
        data-testid="hero-headline"
        class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
      >
        {{ HERO_HEADLINE }}
      </h1>

      <p data-testid="hero-subheadline" class="text-lg text-muted-foreground">
        {{ HERO_SUBHEADLINE }}
      </p>

      <div class="flex flex-wrap items-center gap-3">
        <Button
          as="a"
          :href="HERO_PRIMARY_CTA_HREF"
          size="lg"
          data-testid="hero-primary-cta"
        >
          {{ HERO_PRIMARY_CTA_LABEL }}
        </Button>
        <Button
          as="a"
          :href="HERO_SECONDARY_CTA_HREF"
          size="lg"
          variant="outline"
          data-testid="hero-secondary-cta"
        >
          {{ HERO_SECONDARY_CTA_LABEL }}
        </Button>
      </div>

      <ul class="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
        <template v-for="(item, i) in HERO_TRUST_BAR_ITEMS" :key="item.text">
          <li v-if="i > 0" aria-hidden="true" class="text-border">·</li>
          <li data-testid="trust-bar-item">{{ item.text }}</li>
        </template>
      </ul>
    </div>

    <!-- Mockup column -->
    <div data-testid="hero-mockup" class="relative flex items-center justify-center lg:justify-end">
      <div class="relative w-full max-w-md lg:max-w-lg">
        <LandingHeroMockupDashboard :animated="mockupAnimated" class="w-full" />
        <LandingHeroMockupPhone
          :animated="mockupAnimated"
          class="absolute -bottom-8 -left-6 z-10 hidden sm:block"
        />
      </div>
    </div>
  </section>
</template>
