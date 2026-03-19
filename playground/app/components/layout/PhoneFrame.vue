<script setup lang="ts">
import { cn } from '@/lib/utils'
import { PHONE_STATUS_BAR_TIME } from '@/constants/phone'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <div
    :class="cn('relative w-[280px] shrink-0 rounded-[2rem] border-2 border-neutral-800 bg-black shadow-xl', props.class)"
    data-testid="phone-frame"
  >
    <!-- Status bar -->
    <div class="absolute inset-x-4 top-1.5 z-0 flex items-center justify-between">
      <span class="text-[10px] font-medium text-white/80">{{ PHONE_STATUS_BAR_TIME }}</span>
      <div class="flex items-center gap-1">
        <!-- Signal bars -->
        <svg class="h-[10px] w-[12px] text-white/80" viewBox="0 0 12 10" fill="currentColor">
          <rect x="0" y="7" width="2" height="3" rx="0.5" />
          <rect x="3" y="5" width="2" height="5" rx="0.5" />
          <rect x="6" y="3" width="2" height="7" rx="0.5" />
          <rect x="9" y="0" width="2" height="10" rx="0.5" />
        </svg>
        <!-- Wifi -->
        <svg class="h-[10px] w-[12px] text-white/80" viewBox="0 0 12 10" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <path d="M1 4a8 8 0 0 1 10 0" />
          <path d="M3 6.5a5 5 0 0 1 6 0" />
          <circle cx="6" cy="9" r="0.8" fill="currentColor" stroke="none" />
        </svg>
        <!-- Battery -->
        <svg class="h-[10px] w-[16px] text-white/80" viewBox="0 0 16 10" fill="currentColor">
          <rect x="0" y="1" width="13" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1" />
          <rect x="2" y="3" width="9" height="4" rx="0.5" />
          <rect x="13.5" y="3.5" width="1.5" height="3" rx="0.5" />
        </svg>
      </div>
    </div>
    <!-- Notch -->
    <div class="absolute left-1/2 top-0 z-10 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-neutral-800" />
    <!-- Screen -->
    <div class="mt-6 overflow-y-auto rounded-b-[1.75rem] bg-background p-3" style="max-height: calc(100% - 1.5rem - 1.25rem)">
      <slot />
    </div>
    <!-- Home indicator -->
    <div class="mx-auto mb-1.5 mt-1 h-[5px] w-[100px] rounded-full bg-white/30" data-testid="home-indicator" />
  </div>
</template>
