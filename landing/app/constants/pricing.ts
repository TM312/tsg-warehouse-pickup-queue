import type { PricingTier, PricingFeature } from '@/types/pricing'

export const PRICING_SECTION_ID = 'pricing'

export const PRICING_SECTION_HEADING = 'Less than 1 hour of warehouse labor per day'

export const PRICING_FINE_PRINT =
  'All plans include a 14-day free trial of Professional features. No credit card required.'

export const PRICING_ANNUAL_DISCOUNT = 0.2

export const PRICING_TOGGLE_LABELS = { monthly: 'Monthly', annual: 'Annual' } as const

export const PRICING_ANNUAL_SAVE_LABEL = `Save ${PRICING_ANNUAL_DISCOUNT * 100}%`

export const PRICING_PRICE_SUFFIX = '/mo'

export const PRICING_ANNUAL_NOTE = 'billed annually'

export const PRICING_REVEAL_STAGGER_MS = 150

export const PRICING_PRICE_ANIMATION_MS = 400

export const FEATURE_SUPPORTED = '✓'

export const FEATURE_UNAVAILABLE = '\u2014'

export const FEATURE_BETA = 'Beta'

export const PRICING_TIERS: PricingTier[] = [
  {
    key: 'starter',
    name: 'Starter',
    monthlyPrice: 149,
    badge: null,
    highlighted: false,
    cta: { label: 'Start Free Trial', href: '#trial', variant: 'outline' },
  },
  {
    key: 'professional',
    name: 'Professional',
    monthlyPrice: 349,
    badge: 'Most Popular',
    highlighted: true,
    cta: { label: 'Start Free Trial', href: '#trial', variant: 'default' },
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null,
    badge: null,
    highlighted: false,
    cta: { label: 'Contact Sales', href: '#contact', variant: 'outline' },
  },
]

export const PRICING_FEATURES: PricingFeature[] = [
  {
    label: 'Pickup slots per day',
    values: { starter: '25', professional: 'Unlimited', enterprise: 'Unlimited' },
  },
  {
    label: 'Driver SMS notifications',
    values: { starter: FEATURE_SUPPORTED, professional: FEATURE_SUPPORTED, enterprise: FEATURE_SUPPORTED },
  },
  {
    label: 'Real-time queue board',
    values: { starter: FEATURE_SUPPORTED, professional: FEATURE_SUPPORTED, enterprise: FEATURE_SUPPORTED },
  },
  {
    label: 'Dock assignments',
    values: { starter: FEATURE_UNAVAILABLE, professional: FEATURE_SUPPORTED, enterprise: FEATURE_SUPPORTED },
  },
  {
    label: 'Priority scheduling',
    values: { starter: FEATURE_UNAVAILABLE, professional: FEATURE_SUPPORTED, enterprise: FEATURE_SUPPORTED },
  },
  {
    label: 'Analytics & reporting',
    values: { starter: 'Basic', professional: 'Advanced', enterprise: 'Custom' },
  },
  {
    label: 'ERP integration',
    values: { starter: FEATURE_UNAVAILABLE, professional: FEATURE_BETA, enterprise: FEATURE_BETA },
  },
  {
    label: 'Dedicated support',
    values: { starter: FEATURE_UNAVAILABLE, professional: FEATURE_UNAVAILABLE, enterprise: FEATURE_SUPPORTED },
  },
]
