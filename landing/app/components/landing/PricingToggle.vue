<script setup lang="ts">
import { computed } from 'vue'
import type { BillingCycle } from '@/types/pricing'
import { PRICING_TOGGLE_LABELS, PRICING_ANNUAL_SAVE_LABEL } from '@/constants/pricing'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  modelValue: BillingCycle
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BillingCycle]
}>()

function labelClass(cycle: BillingCycle): string {
  return props.modelValue === cycle ? 'text-foreground' : 'text-muted-foreground'
}

function onToggle(checked: boolean) {
  emit('update:modelValue', checked ? 'annual' : 'monthly')
}
</script>

<template>
  <div data-testid="pricing-toggle" class="flex items-center justify-center gap-3">
    <span
      class="text-sm font-medium"
      :class="labelClass('monthly')"
    >
      {{ PRICING_TOGGLE_LABELS.monthly }}
    </span>
    <Switch
      :checked="props.modelValue === 'annual'"
      @update:checked="onToggle"
    />
    <span
      class="text-sm font-medium"
      :class="labelClass('annual')"
    >
      {{ PRICING_TOGGLE_LABELS.annual }}
    </span>
    <Badge variant="secondary" class="ml-1">
      {{ PRICING_ANNUAL_SAVE_LABEL }}
    </Badge>
  </div>
</template>
