<template>
  <div class="text-center">
    <Transition name="position" mode="out-in">
      <div :key="position" class="space-y-2">
        <p class="text-lg text-muted-foreground">You are</p>
        <p class="text-6xl font-bold text-primary">#{{ Math.round(displayPosition) }}</p>
        <p class="text-lg text-muted-foreground">in queue</p>
        <Transition name="fade">
          <p
            v-if="position === 1 || showTurnMessage"
            class="text-primary font-medium mt-4"
          >
            Your turn any moment
          </p>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useTransition, TransitionPresets } from '@vueuse/core'

const props = defineProps<{
  position: number
  showTurnMessage?: boolean
}>()

const positionRef = computed(() => props.position)
const displayPosition = useTransition(positionRef, {
  duration: 400,
  transition: TransitionPresets.easeOutCubic,
})
</script>

<style scoped>
.position-enter-active,
.position-leave-active {
  transition: all 0.3s ease;
}
.position-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.position-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
