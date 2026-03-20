<script setup lang="ts">
import { MOCKUP_APP_URL } from '@/constants/mockup'

withDefaults(defineProps<{
  size?: 'sm' | 'md'
}>(), {
  size: 'md',
})
</script>

<template>
  <div
    class="flex items-center border-b bg-muted/50"
    :class="size === 'sm' ? 'gap-1.5 px-2.5 py-1.5' : 'gap-2 px-3 py-2'"
    aria-hidden="true"
  >
    <span class="rounded-full bg-red-400" :class="size === 'sm' ? 'size-2' : 'size-2.5'" />
    <span class="rounded-full bg-yellow-400" :class="size === 'sm' ? 'size-2' : 'size-2.5'" />
    <span class="rounded-full bg-green-400" :class="size === 'sm' ? 'size-2' : 'size-2.5'" />
    <div
      class="flex-1 rounded bg-background text-muted-foreground"
      :class="size === 'sm' ? 'ml-1.5 px-2 py-0.5 text-[8px]' : 'ml-2 px-3 py-0.5 text-[10px]'"
    >
      {{ MOCKUP_APP_URL }}
    </div>
  </div>
</template>
