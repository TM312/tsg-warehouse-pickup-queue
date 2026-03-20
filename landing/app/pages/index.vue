<script setup lang="ts">
import { SEO_TITLE, SEO_META } from '@/constants/seo'

useHead({
  title: SEO_TITLE,
  htmlAttrs: { lang: 'en' },
})

useSeoMeta(SEO_META)
</script>

<template>
  <div>
    <LandingHeroSection />
    <LandingProblemSection />
    <LandingProductOverviewSection />
    <LandingRoiSection />
    <LandingErpSection />
    <LandingHowItWorksSection />
    <LandingPricingSection />
    <section id="demo" class="min-h-screen px-4 py-24">
      <h2 class="text-3xl font-bold">Demo</h2>
    </section>
  </div>
</template>
