<script setup lang="ts">
import { Radio, EyeOff, ClipboardList } from 'lucide-vue-next'
import type { ProblemCard, ProblemIcon } from '@/types/problem'
import type { Component } from 'vue'

defineProps<{ card: ProblemCard }>()

const icons: Record<ProblemIcon, Component> = { Radio, EyeOff, ClipboardList }
</script>

<template>
  <div
    data-testid="problem-card"
    class="rounded-lg border border-border bg-card p-6"
  >
    <component
      :is="icons[card.icon]"
      class="mb-4 size-8 text-primary"
      :stroke-width="1.5"
      aria-hidden="true"
    />
    <h3 class="mb-2 text-lg font-semibold text-card-foreground">
      {{ card.heading }}
    </h3>
    <p class="text-sm leading-relaxed text-muted-foreground">
      {{ card.description }}
    </p>
  </div>
</template>
