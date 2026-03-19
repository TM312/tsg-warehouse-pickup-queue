<script setup lang="ts">
import { computed } from 'vue'
import { useGuidedWalkthrough } from '@/composables/useGuidedWalkthrough'
import { ANIMATION, cssMs } from '@/constants/animations'

const { isActive, highlightRect } = useGuidedWalkthrough()

const cutoutTransitionDuration = cssMs(ANIMATION.WALKTHROUGH_CUTOUT_TRANSITION_MS)

const padding = 8
const radius = 8

const cutout = computed(() => {
  const r = highlightRect.value
  return {
    x: r.x - padding,
    y: r.y - padding,
    width: r.width + padding * 2,
    height: r.height + padding * 2,
  }
})

const hasCutout = computed(() => {
  const r = highlightRect.value
  return r.width > 0 && r.height > 0
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isActive"
      class="fixed inset-0 z-50"
      data-testid="walkthrough-overlay"
    >
      <svg class="h-full w-full" style="pointer-events: all">
        <defs>
          <mask id="walkthrough-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              v-if="hasCutout"
              :x="cutout.x"
              :y="cutout.y"
              :width="cutout.width"
              :height="cutout.height"
              :rx="radius"
              :ry="radius"
              fill="black"
            >
              <animate
                attributeName="x"
                :to="cutout.x"
                :dur="cutoutTransitionDuration"
                fill="freeze"
              />
              <animate
                attributeName="y"
                :to="cutout.y"
                :dur="cutoutTransitionDuration"
                fill="freeze"
              />
            </rect>
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.5)"
          mask="url(#walkthrough-mask)"
        />
      </svg>
      <div
        v-if="hasCutout"
        class="animate-walkthrough-glow rounded-lg pointer-events-none absolute"
        :style="{
          left: `${cutout.x}px`,
          top: `${cutout.y}px`,
          width: `${cutout.width}px`,
          height: `${cutout.height}px`,
          transitionDuration: cutoutTransitionDuration,
          animationDuration: cssMs(ANIMATION.WALKTHROUGH_GLOW_MS),
        }"
        data-testid="walkthrough-highlight-glow"
      />
    </div>
  </Teleport>
</template>
