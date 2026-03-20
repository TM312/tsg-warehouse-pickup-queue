<script setup lang="ts">
import type { ProductFeature, ProductMockupType } from '@/types/product'
import type { Component } from 'vue'
import ProductMockupPhone from './ProductMockupPhone.vue'
import ProductMockupBrowser from './ProductMockupBrowser.vue'
import ProductMockupTablet from './ProductMockupTablet.vue'

defineProps<{ feature: ProductFeature }>()

const mockups: Record<ProductMockupType, Component> = {
  phone: ProductMockupPhone,
  browser: ProductMockupBrowser,
  tablet: ProductMockupTablet,
}
</script>

<template>
  <div data-testid="product-feature-card" class="rounded-lg border border-border bg-card p-6">
    <div class="mb-6 flex justify-center">
      <component :is="mockups[feature.mockup]" />
    </div>
    <h3 class="mb-2 text-lg font-semibold text-card-foreground">{{ feature.heading }}</h3>
    <p class="text-sm leading-relaxed text-muted-foreground">{{ feature.description }}</p>
  </div>
</template>
