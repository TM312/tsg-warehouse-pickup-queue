<script setup lang="ts">
import { RotateCcw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSimulationActions } from '@/composables/useSimulationActions'

const props = defineProps<{
  onBeforeReset?: () => void
}>()

const { resetAll } = useSimulationActions()

function handleReset() {
  if (!window.confirm('Reset the simulation? All current orders will be cleared.')) return
  props.onBeforeReset?.()
  resetAll()
}
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button
        size="icon-sm"
        variant="outline"
        data-testid="sim-reset"
        @click="handleReset"
      >
        <RotateCcw class="size-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Reset simulation</TooltipContent>
  </Tooltip>
</template>
