<script setup lang="ts">
import { UserPlus, Settings, QrCode, Rocket } from 'lucide-vue-next'
import type { HowItWorksStep, HowItWorksIcon } from '@/types/howItWorks'
import type { Component } from 'vue'

defineProps<{ step: HowItWorksStep }>()

const icons: Record<HowItWorksIcon, Component> = { UserPlus, Settings, QrCode, Rocket }
</script>

<template>
  <div class="relative flex md:flex-col md:items-center gap-4 md:flex-1" data-testid="how-it-works-step">
    <div class="z-10 size-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center shrink-0">
      {{ step.step }}
    </div>

    <component
      :is="icons[step.icon]"
      class="hidden md:block size-6 text-primary mt-2"
      :stroke-width="1.5"
      aria-hidden="true"
    />

    <div class="md:text-center">
      <h3 class="font-semibold">{{ step.heading }}</h3>
      <p class="text-sm text-muted-foreground">{{ step.description }}</p>
    </div>
  </div>
</template>
