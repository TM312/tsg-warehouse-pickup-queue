<script setup lang="ts">
import { ArrowUp } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

defineProps<{
  disabled?: boolean
}>()
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    :disabled="disabled"
    title="Mark as priority"
    class="shrink-0 h-8 w-8"
  >
    <ArrowUp class="h-4 w-4" />
  </Button>
</template>
