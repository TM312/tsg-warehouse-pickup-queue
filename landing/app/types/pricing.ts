export type PricingTierKey = 'starter' | 'professional' | 'enterprise'

export type BillingCycle = 'monthly' | 'annual'

export interface PricingCta {
  label: string
  href: string
  variant: 'default' | 'outline'
}

export interface PricingTier {
  key: PricingTierKey
  name: string
  monthlyPrice: number | null
  badge: string | null
  highlighted: boolean
  cta: PricingCta
}

export interface PricingFeature {
  label: string
  values: Record<PricingTierKey, string>
}
