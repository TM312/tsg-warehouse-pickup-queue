<template>
  <Transition name="takeover">
    <div
      v-if="show"
      class="fixed inset-0 z-50 bg-primary flex flex-col items-center justify-center text-primary-foreground"
      role="alert"
      aria-live="assertive"
    >
      <div class="text-center space-y-6 p-8">
        <CheckCircle2 class="w-24 h-24 mx-auto animate-bounce" />
        <h1 class="text-4xl font-bold">It's Your Turn!</h1>
        <p class="text-2xl">Proceed to</p>
        <p class="text-6xl font-black">Gate {{ gateNumber }}</p>
        <Button
          variant="secondary"
          size="lg"
          class="mt-8"
          @click="$emit('dismiss')"
        >
          Got it
        </Button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

defineProps<{
  show: boolean
  gateNumber: number
}>()

defineEmits<{
  dismiss: []
}>()
</script>

<style>
.takeover-enter-active,
.takeover-leave-active {
  transition: opacity 0.3s ease;
}
.takeover-enter-from,
.takeover-leave-to {
  opacity: 0;
}
</style>
