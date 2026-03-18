<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <div
    :class="cn('relative w-[280px] shrink-0 rounded-[2rem] border-2 border-neutral-800 bg-black shadow-xl', props.class)"
    data-testid="phone-frame"
  >
    <!-- Notch -->
    <div class="absolute left-1/2 top-0 z-10 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-neutral-800" />
    <!-- Screen -->
    <div class="mt-6 overflow-y-auto rounded-b-[1.75rem] bg-background p-3" style="max-height: calc(100% - 1.5rem)">
      <slot />
    </div>
  </div>
</template>
