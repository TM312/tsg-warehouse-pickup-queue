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
      @click="goToPrev"
    >
      <ChevronLeft class="h-4 w-4" />
      <span class="hidden sm:inline">Gate {{ prevGate?.gate_number }}</span>
    </Button>

    <span class="font-bold text-lg">Gate {{ currentGate.gate_number }}</span>

    <Button
      variant="ghost"
      size="sm"
      :disabled="!nextGate"
      @click="goToNext"
    >
      <span class="hidden sm:inline">Gate {{ nextGate?.gate_number }}</span>
      <ChevronRight class="h-4 w-4" />
    </Button>
  </div>
</template>
