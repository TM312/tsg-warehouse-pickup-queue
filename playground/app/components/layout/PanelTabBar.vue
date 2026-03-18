<script setup lang="ts">
import { Smartphone, ClipboardList, BarChart3 } from 'lucide-vue-next'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PANEL_ID, PANEL_DEFINITIONS } from '@/constants/panels'
import type { PanelId } from '@/constants/panels'

defineProps<{
  modelValue: PanelId
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PanelId]
}>()

const iconMap: Record<PanelId, typeof Smartphone> = {
  [PANEL_ID.CUSTOMER]: Smartphone,
  [PANEL_ID.STAFF]: ClipboardList,
  [PANEL_ID.ANALYTICS]: BarChart3,
}
</script>

<template>
  <Tabs
    :model-value="modelValue"
    data-testid="panel-tab-bar"
    @update:model-value="emit('update:modelValue', $event as PanelId)"
  >
    <TabsList class="w-full">
      <TabsTrigger
        v-for="panel in PANEL_DEFINITIONS"
        :key="panel.id"
        :value="panel.id"
        class="flex-1 gap-1.5"
        :data-testid="`panel-tab-${panel.id}`"
      >
        <component :is="iconMap[panel.id]" class="size-4" />
        <span class="hidden sm:inline">{{ panel.label }}</span>
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>
