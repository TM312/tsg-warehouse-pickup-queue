<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useSmoothScroll } from '@/composables/useSmoothScroll'
import { useScrolledNav } from '@/composables/useScrolledNav'

const { init: initScroll, destroy: destroyScroll } = useSmoothScroll()
const { isScrolled, init: initNav, destroy: destroyNav } = useScrolledNav()

onMounted(() => {
  initScroll()
  initNav()
})

onUnmounted(() => {
  destroyScroll()
  destroyNav()
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <LandingNav :is-scrolled="isScrolled" />
    <main class="pt-16">
      <slot />
    </main>
    <LandingFooter />
  </div>
</template>
