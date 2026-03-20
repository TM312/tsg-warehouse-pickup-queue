import type { MockupQueueEntry, TrustBarItem } from '@/types/hero'

export const HERO_HEADLINE = 'Your warehouse pickup line is costing you $1,500/month'

export const HERO_SUBHEADLINE =
  'Real-time queue management purpose-built for wholesale distributors. Drivers check in from their phone, your team sees live status — no more yard chaos.'

export const HERO_PRIMARY_CTA_LABEL = 'Try the Interactive Demo'
export const HERO_PRIMARY_CTA_HREF = '/playground'

export const HERO_SECONDARY_CTA_LABEL = 'Start Free Trial'
export const HERO_SECONDARY_CTA_HREF = '#trial'

export const HERO_TRUST_BAR_ITEMS: TrustBarItem[] = [
  { text: 'Purpose-built for wholesale distributors' },
  { text: 'ERP integration ready' },
  { text: 'Go live in under a day' },
]

export const HERO_MOCKUP_QUEUE_ENTRIES: MockupQueueEntry[] = [
  { company: 'Martinez Supply', order: 'SO-4471', status: 'loading', gate: 'Gate 2' },
  { company: 'Daniels Electric', order: 'SO-4472', status: 'called', gate: 'Gate 5' },
  { company: 'Pacific Plumbing', order: 'SO-4473', status: 'waiting', gate: null },
  { company: 'Summit Materials', order: 'SO-4474', status: 'waiting', gate: null },
]
