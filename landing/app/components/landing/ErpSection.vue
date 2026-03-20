<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSectionReveal } from '@/composables/useSectionReveal'
import {
  ERP_SECTION_ID,
  ERP_SECTION_HEADING,
  ERP_SECTION_NOTE,
  ERP_BULLETS,
} from '@/constants/erp'
import { REVEAL_STAGGER_MS } from '@/constants/animation'

const sectionRef = ref<HTMLElement | null>(null)
const reveal = useSectionReveal()

onMounted(() => {
  if (sectionRef.value) reveal.init(sectionRef.value)
})
</script>

<template>
  <section :id="ERP_SECTION_ID" ref="sectionRef" data-testid="erp-section">
    <div class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
      <h2
        class="section-reveal text-3xl font-bold tracking-tight sm:text-4xl"
        :class="{ revealed: reveal.isRevealed.value }"
        data-testid="erp-heading"
      >
        {{ ERP_SECTION_HEADING }}
      </h2>

      <div class="mt-12 grid md:grid-cols-2 gap-12 items-center">
        <div class="space-y-6">
          <div
            v-for="(bullet, i) in ERP_BULLETS"
            :key="bullet.icon"
            class="section-reveal"
            :class="{ revealed: reveal.isRevealed.value }"
            :style="{ transitionDelay: `${i * REVEAL_STAGGER_MS}ms` }"
          >
            <LandingErpBulletItem :bullet="bullet" />
          </div>

          <p
            class="section-reveal text-sm italic text-muted-foreground"
            :class="{ revealed: reveal.isRevealed.value }"
            :style="{ transitionDelay: `${ERP_BULLETS.length * REVEAL_STAGGER_MS}ms` }"
            data-testid="erp-note"
          >
            {{ ERP_SECTION_NOTE }}
          </p>
        </div>

        <div
          class="section-reveal"
          :class="{ revealed: reveal.isRevealed.value }"
          :style="{ transitionDelay: `${ERP_BULLETS.length * REVEAL_STAGGER_MS}ms` }"
        >
          <LandingErpFlowDiagram />
        </div>
      </div>
    </div>
  </section>
</template>
