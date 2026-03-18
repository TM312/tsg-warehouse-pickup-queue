<script setup lang="ts">
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useGuidedWalkthrough } from '@/composables/useGuidedWalkthrough'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const { isActive, currentStep, currentStepIndex, totalSteps, highlightRect, next, previous, skip } =
  useGuidedWalkthrough()

const { width: viewportWidth, height: viewportHeight } = useWindowSize()

const margin = 16
const tooltipWidth = 340
const tooltipEstimatedHeight = 200

const position = computed(() => {
  const r = highlightRect.value
  const vw = viewportWidth.value
  const vh = viewportHeight.value

  const spaceBelow = vh - (r.y + r.height + 8)
  const placeAbove = spaceBelow < tooltipEstimatedHeight

  let top: number
  if (placeAbove) {
    top = r.y - 8 - tooltipEstimatedHeight
  } else {
    top = r.y + r.height + 8
  }

  let left = r.x
  if (left + tooltipWidth > vw - margin) {
    left = vw - margin - tooltipWidth
  }
  if (left < margin) {
    left = margin
  }

  top = Math.max(margin, Math.min(top, vh - margin - tooltipEstimatedHeight))

  return { top: `${top}px`, left: `${left}px`, width: `${tooltipWidth}px` }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isActive && currentStep"
      class="fixed z-[51]"
      :style="position"
      data-testid="walkthrough-tooltip"
    >
      <Card class="shadow-lg">
        <CardHeader class="pb-2">
          <p class="text-muted-foreground text-xs">
            Step {{ currentStepIndex + 1 }} of {{ totalSteps }}
          </p>
          <h3 class="text-sm font-semibold">{{ currentStep.title }}</h3>
        </CardHeader>
        <CardContent class="pb-3">
          <p class="text-muted-foreground text-sm">{{ currentStep.description }}</p>
        </CardContent>
        <CardFooter class="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            data-testid="walkthrough-skip"
            @click="skip"
          >
            Skip tour
          </Button>
          <div class="flex-1" />
          <Button
            v-if="currentStepIndex > 0"
            size="sm"
            variant="outline"
            data-testid="walkthrough-back"
            @click="previous"
          >
            Back
          </Button>
          <Button
            size="sm"
            data-testid="walkthrough-next"
            @click="next"
          >
            {{ currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next' }}
          </Button>
        </CardFooter>
      </Card>
    </div>
  </Teleport>
</template>
