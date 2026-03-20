<script setup lang="ts">
import { computed } from 'vue'
import type { PricingTier, PricingTierKey, BillingCycle } from '@/types/pricing'
import { PRICING_FEATURES, PRICING_PRICE_SUFFIX, PRICING_ANNUAL_NOTE } from '@/constants/pricing'
import { ANIMATION_DURATION_MS } from '@/constants/animation'
import { useAnimatedNumber } from '@/composables/useAnimatedNumber'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  tier: PricingTier
  displayPrice: number | null
  billingCycle: BillingCycle
}>()

const priceSource = computed(() => props.displayPrice ?? 0)
const { displayed: animatedPrice } = useAnimatedNumber(priceSource, ANIMATION_DURATION_MS)

function featureValue(tierKey: PricingTierKey, featureIndex: number): string {
  return PRICING_FEATURES[featureIndex]?.values[tierKey] ?? ''
}
</script>

<template>
  <Card
    data-testid="pricing-card"
    :class="[
      tier.highlighted ? 'ring-2 ring-primary lg:scale-105 relative z-10' : '',
    ]"
  >
    <CardHeader>
      <div class="flex items-center gap-2">
        <span class="text-lg font-semibold">{{ tier.name }}</span>
        <Badge v-if="tier.badge" variant="default">
          {{ tier.badge }}
        </Badge>
      </div>
      <div class="mt-4">
        <template v-if="displayPrice !== null">
          <span data-testid="pricing-amount" class="text-4xl font-bold tracking-tight">${{ animatedPrice }}</span>
          <span class="text-sm text-muted-foreground">{{ PRICING_PRICE_SUFFIX }}</span>
          <p v-if="billingCycle === 'annual'" class="mt-1 text-xs text-muted-foreground">
            {{ PRICING_ANNUAL_NOTE }}
          </p>
        </template>
        <span v-else data-testid="pricing-amount" class="text-4xl font-bold tracking-tight">Custom</span>
      </div>
    </CardHeader>

    <CardContent>
      <div class="divide-y divide-border">
        <LandingPricingFeatureRow
          v-for="(feature, i) in PRICING_FEATURES"
          :key="feature.label"
          :label="feature.label"
          :value="featureValue(tier.key, i)"
        />
      </div>
    </CardContent>

    <CardFooter>
      <Button
        :variant="tier.cta.variant"
        :as="'a'"
        :href="tier.cta.href"
        class="w-full"
      >
        {{ tier.cta.label }}
      </Button>
    </CardFooter>
  </Card>
</template>
