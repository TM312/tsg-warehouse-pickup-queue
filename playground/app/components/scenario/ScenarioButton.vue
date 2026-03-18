<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Scenario } from '@/types/scenario'

defineProps<{
  scenario: Scenario
  disabled: boolean
  active: boolean
}>()

defineEmits<{
  run: []
}>()
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button
        size="sm"
        :variant="active ? 'default' : 'outline'"
        :disabled="disabled && !active"
        :data-testid="`scenario-${scenario.id}`"
        @click="$emit('run')"
      >
        <component :is="scenario.icon" class="size-4" />
        {{ scenario.label }}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{{ scenario.description }}</TooltipContent>
  </Tooltip>
</template>
