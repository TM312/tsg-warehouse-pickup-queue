<script setup lang="ts">
defineProps<{
  animated: boolean
}>()
</script>

<template>
  <div
    class="relative mx-auto w-48 overflow-hidden rounded-[2.5rem] border bg-background shadow-xl"
    style="aspect-ratio: 9 / 19"
    data-testid="hero-mockup-phone"
  >
    <!-- Notch -->
    <div class="mx-auto mt-3 h-5 w-20 rounded-full bg-muted" />

    <!-- Screen content -->
    <div class="flex flex-col items-center px-4 pt-4">
      <!-- Header bar -->
      <div class="mb-4 w-full rounded-lg bg-muted px-3 py-2 text-center text-xs font-semibold text-foreground">
        Queue Status
      </div>

      <!-- Position display -->
      <div class="hero-phone-positions relative h-20 w-full text-center">
        <span
          class="hero-phone-pos-3 absolute inset-0 flex items-center justify-center text-5xl font-bold text-foreground"
          :class="animated ? 'hero-phone-animate' : 'opacity-0'"
        >
          #3
        </span>
        <span
          class="hero-phone-pos-2 absolute inset-0 flex items-center justify-center text-5xl font-bold text-foreground"
          :class="animated ? 'hero-phone-animate' : 'opacity-0'"
        >
          #2
        </span>
        <span
          class="hero-phone-pos-1 absolute inset-0 flex items-center justify-center text-5xl font-bold text-foreground"
          :class="animated ? 'hero-phone-animate' : 'opacity-0'"
        >
          #1
        </span>
        <span
          class="hero-phone-pos-done absolute inset-0 flex items-center justify-center text-3xl font-bold text-green-600"
          :class="animated ? 'hero-phone-animate' : 'opacity-100'"
        >
          Your turn!
        </span>
      </div>

      <!-- Wait time -->
      <div class="hero-phone-waits relative mt-2 h-5 w-full text-center">
        <span
          class="hero-phone-wait-3 absolute inset-0 text-xs text-muted-foreground"
          :class="animated ? 'hero-phone-animate' : 'opacity-0'"
        >
          Estimated wait: ~8 min
        </span>
        <span
          class="hero-phone-wait-2 absolute inset-0 text-xs text-muted-foreground"
          :class="animated ? 'hero-phone-animate' : 'opacity-0'"
        >
          Estimated wait: ~4 min
        </span>
        <span
          class="hero-phone-wait-1 absolute inset-0 text-xs text-muted-foreground"
          :class="animated ? 'hero-phone-animate' : 'opacity-0'"
        >
          Proceed to gate
        </span>
      </div>

      <!-- Gate card -->
      <div
        class="hero-phone-gate mt-4 w-full rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-center dark:border-green-800 dark:bg-green-950"
        :class="animated ? 'hero-phone-animate' : 'opacity-100'"
      >
        <div class="text-[10px] font-medium text-green-700 dark:text-green-400">Assigned Gate</div>
        <div class="text-lg font-bold text-green-700 dark:text-green-400">Gate 2</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Position #3: visible 0–30% */
.hero-phone-pos-3.hero-phone-animate {
  animation: hero-phone-pos3 var(--hero-cycle-duration) ease-in-out infinite;
}
@keyframes hero-phone-pos3 {
  0%, 5% { opacity: 1; transform: translateY(0); }
  25%, 100% { opacity: 0; transform: translateY(-8px); }
}

/* Position #2: visible 25–55% */
.hero-phone-pos-2.hero-phone-animate {
  animation: hero-phone-pos2 var(--hero-cycle-duration) ease-in-out infinite;
}
@keyframes hero-phone-pos2 {
  0%, 20% { opacity: 0; transform: translateY(8px); }
  30%, 50% { opacity: 1; transform: translateY(0); }
  55%, 100% { opacity: 0; transform: translateY(-8px); }
}

/* Position #1: visible 50–75% */
.hero-phone-pos-1.hero-phone-animate {
  animation: hero-phone-pos1 var(--hero-cycle-duration) ease-in-out infinite;
}
@keyframes hero-phone-pos1 {
  0%, 45% { opacity: 0; transform: translateY(8px); }
  55%, 70% { opacity: 1; transform: translateY(0); }
  75%, 100% { opacity: 0; transform: translateY(-8px); }
}

/* "Your turn!": visible 70–100% */
.hero-phone-pos-done.hero-phone-animate {
  animation: hero-phone-done var(--hero-cycle-duration) ease-in-out infinite;
}
@keyframes hero-phone-done {
  0%, 65% { opacity: 0; transform: translateY(8px); }
  75%, 95% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-8px); }
}

/* Wait ~8 min: visible 0–30% */
.hero-phone-wait-3.hero-phone-animate {
  animation: hero-phone-pos3 var(--hero-cycle-duration) ease-in-out infinite;
}

/* Wait ~4 min: visible 25–55% */
.hero-phone-wait-2.hero-phone-animate {
  animation: hero-phone-pos2 var(--hero-cycle-duration) ease-in-out infinite;
}

/* Proceed to gate: visible 50–75% */
.hero-phone-wait-1.hero-phone-animate {
  animation: hero-phone-pos1 var(--hero-cycle-duration) ease-in-out infinite;
}

/* Gate card: slides in at 70% */
.hero-phone-gate.hero-phone-animate {
  animation: hero-phone-gate-reveal var(--hero-cycle-duration) ease-in-out infinite;
}
@keyframes hero-phone-gate-reveal {
  0%, 65% { opacity: 0; transform: translateY(16px); }
  75%, 95% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(16px); }
}
</style>
