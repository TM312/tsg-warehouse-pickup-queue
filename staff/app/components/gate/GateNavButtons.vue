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
</script>

<template>
  <div class="flex items-center gap-2">
    <Button
      variant="ghost"
      size="sm"
      :disabled="!prevGate"
      class="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
      @click="goToPrev"
    >
      <ChevronLeft class="h-4 w-4" />
      <span class="hidden sm:inline text-sm">Gate {{ prevGate?.gate_number }}</span>
    </Button>

    <div class="min-w-[100px] text-center">
      <span class="block font-bold text-2xl sm:text-3xl">
        Gate {{ currentGate.gate_number }}
      </span>
    </div>

    <Button
      variant="ghost"
      size="sm"
      :disabled="!nextGate"
      class="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
      @click="goToNext"
    >
      <span class="hidden sm:inline text-sm">Gate {{ nextGate?.gate_number }}</span>
      <ChevronRight class="h-4 w-4" />
    </Button>
  </div>
</template>
