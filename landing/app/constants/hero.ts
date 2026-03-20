import type { MockupQueueEntry, TrustBarItem } from '@/types/hero'
import { HERO_ANIMATION_DELAY_S, HERO_GATE_DELAY_OFFSET_S } from '@/constants/animation'

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

export const HERO_STATUS_COLORS: Record<MockupQueueEntry['status'], string> = {
  loading: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400',
  called: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-400',
  waiting: 'bg-muted text-muted-foreground',
  complete: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400',
}

/** Row animation delay computed from index. */
export function heroRowDelay(index: number): string {
  return `${index * HERO_ANIMATION_DELAY_S}s`
}

/** Gate fade-in delay computed from row index. */
export function heroGateDelay(index: number): string {
  return `${index * HERO_ANIMATION_DELAY_S + HERO_GATE_DELAY_OFFSET_S}s`
}
