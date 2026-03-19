<script setup lang="ts">
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useGuidedWalkthrough } from '@/composables/useGuidedWalkthrough'
import { ANIMATION, cssMs } from '@/constants/animations'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const { isActive, currentStep, currentStepIndex, totalSteps, highlightRect, next, previous, skip } =
  useGuidedWalkthrough()

const { width: viewportWidth, height: viewportHeight } = useWindowSize()

const margin = 16
const tooltipWidth = 340
const tooltipEstimatedHeight = 200

const placeAbove = computed(() => {
  const r = highlightRect.value
  const vh = viewportHeight.value
  const spaceBelow = vh - (r.y + r.height + 8)
  return spaceBelow < tooltipEstimatedHeight
})

const position = computed(() => {
  const r = highlightRect.value
  const vw = viewportWidth.value
  const vh = viewportHeight.value

  let top: number
  if (placeAbove.value) {
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

const arrowLeft = computed(() => {
  const r = highlightRect.value
  const tooltipLeft = parseFloat(position.value.left)
  const centerOfHighlight = r.x + r.width / 2
  const relative = centerOfHighlight - tooltipLeft
  return Math.max(16, Math.min(relative, tooltipWidth - 16))
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isActive && currentStep"
      :key="currentStepIndex"
      class="animate-walkthrough-tooltip-enter fixed z-[51]"
      :style="{ ...position, animationDuration: cssMs(ANIMATION.WALKTHROUGH_TOOLTIP_ENTER_MS) }"
      data-testid="walkthrough-tooltip"
    >
      <!-- Arrow pointing toward highlighted element -->
      <div
        class="absolute border-x-8 border-x-transparent"
        :class="placeAbove
          ? 'top-full border-t-8 border-t-card'
          : 'bottom-full border-b-8 border-b-card'"
        :style="{ left: `${arrowLeft}px`, transform: 'translateX(-50%)' }"
        data-testid="walkthrough-arrow"
      />
      <Card class="shadow-lg">
        <CardHeader class="pb-2">
          <div class="flex items-center gap-1" data-testid="walkthrough-progress">
            <span
              v-for="i in totalSteps"
              :key="i"
              class="h-1.5 w-1.5 rounded-full transition-colors"
              :class="i - 1 <= currentStepIndex ? 'bg-primary' : 'bg-muted'"
              :style="{ transitionDuration: cssMs(ANIMATION.WALKTHROUGH_STEP_DOT_TRANSITION_MS) }"
            />
          </div>
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
