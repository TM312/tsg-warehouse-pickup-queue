<script setup lang="ts">
import { ANIMATION, cssMs } from '@/constants/animations'

const duration = cssMs(ANIMATION.CONFETTI_DURATION_MS)

const particles = [
  { angle: -70, delay: 0, color: 'bg-green-400' },
  { angle: -50, delay: 50, color: 'bg-amber-400' },
  { angle: -30, delay: 100, color: 'bg-sky-400' },
  { angle: -15, delay: 30, color: 'bg-rose-400' },
  { angle: 0, delay: 80, color: 'bg-emerald-500' },
  { angle: 15, delay: 120, color: 'bg-green-400' },
  { angle: 30, delay: 60, color: 'bg-amber-400' },
  { angle: 50, delay: 90, color: 'bg-sky-400' },
  { angle: 70, delay: 40, color: 'bg-rose-400' },
  { angle: -60, delay: 110, color: 'bg-emerald-500' },
  { angle: -40, delay: 70, color: 'bg-green-400' },
  { angle: 40, delay: 20, color: 'bg-amber-400' },
] as const
</script>

<template>
  <div class="relative h-20 w-full overflow-hidden" data-testid="confetti-burst">
    <span
      v-for="(p, i) in particles"
      :key="i"
      :class="['confetti-particle absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full', p.color]"
      :style="{
        '--angle': `${p.angle}deg`,
        animationDelay: `${p.delay}ms`,
      }"
      data-testid="confetti-particle"
    />
  </div>
</template>

<style scoped>
.confetti-particle {
  animation: confetti-burst v-bind(duration) ease-out forwards;
  opacity: 0;
}

@keyframes confetti-burst {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-60px) scale(0);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .confetti-particle {
    display: none;
  }
}
</style>
