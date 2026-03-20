<script setup lang="ts">
import { ShieldCheck, RefreshCw, FileX2, Blocks } from 'lucide-vue-next'
import type { ErpBullet, ErpBulletIcon } from '@/types/erp'
import type { Component } from 'vue'

defineProps<{ bullet: ErpBullet }>()

const icons: Record<ErpBulletIcon, Component> = { ShieldCheck, RefreshCw, FileX2, Blocks }
</script>

<template>
  <div class="flex items-start gap-3" data-testid="erp-bullet-item">
    <component
      :is="icons[bullet.icon]"
      class="size-6 shrink-0 text-primary"
      :stroke-width="1.5"
      aria-hidden="true"
    />
    <p class="text-muted-foreground">{{ bullet.text }}</p>
  </div>
</template>
