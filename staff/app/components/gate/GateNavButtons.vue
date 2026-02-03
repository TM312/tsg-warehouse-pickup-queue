<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

interface Props {
  currentGate: {
    id: string
    gate_number: number
  }
}

const props = defineProps<Props>()

const currentGateId = computed(() => props.currentGate.id)
const { prevGate, nextGate, goToPrev, goToNext } = useGateNavigation(currentGateId)

// Track navigation direction for slide transition
const slideDirection = ref<'left' | 'right'>('right')

function handleGoToPrev() {
  slideDirection.value = 'left'
  goToPrev()
}

function handleGoToNext() {
  slideDirection.value = 'right'
  goToNext()
}
</script>

<template>
  <div class="flex items-center gap-2">
    <Button
      variant="ghost"
      size="sm"
      :disabled="!prevGate"
      class="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
      @click="handleGoToPrev"
    >
      <ChevronLeft class="h-4 w-4" />
      <span class="hidden sm:inline text-sm">Gate {{ prevGate?.gate_number }}</span>
    </Button>

    <div class="min-w-[100px] text-center overflow-hidden">
      <Transition :name="slideDirection === 'right' ? 'slide-right' : 'slide-left'" mode="out-in">
        <span :key="currentGate.gate_number" class="block font-bold text-2xl sm:text-3xl">
          Gate {{ currentGate.gate_number }}
        </span>
      </Transition>
    </div>

    <Button
      variant="ghost"
      size="sm"
      :disabled="!nextGate"
      class="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
      @click="handleGoToNext"
    >
      <span class="hidden sm:inline text-sm">Gate {{ nextGate?.gate_number }}</span>
      <ChevronRight class="h-4 w-4" />
    </Button>
  </div>
</template>

<style scoped>
/* Slide right transition (when navigating to next gate) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease-out;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Slide left transition (when navigating to previous gate) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.2s ease-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
