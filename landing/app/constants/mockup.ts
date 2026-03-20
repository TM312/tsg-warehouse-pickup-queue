import type { MockupQueueEntry } from '@/types/hero'

export const MOCKUP_APP_URL = 'app.pickupqueue.com/dashboard'

export const PRODUCT_MOCKUP_QUEUE_ENTRIES: MockupQueueEntry[] = [
  { company: 'Acme Corp', order: 'SO-5001', status: 'loading', gate: 'Gate 1' },
  { company: 'BuildRight', order: 'SO-5002', status: 'called', gate: 'Gate 2' },
  { company: 'FastHaul', order: 'SO-5003', status: 'waiting', gate: null },
]

export const PRODUCT_PHONE_POSITION = '#2'
export const PRODUCT_PHONE_WAIT = '~4 min'
export const PRODUCT_PHONE_GATE = 'Gate 2'

export const PRODUCT_TABLET_GATE_LABEL = 'Gate 1 — Operator View'
export const PRODUCT_TABLET_NOW_LOADING = 'Acme Corp'
export const PRODUCT_TABLET_ORDER_DETAIL = 'Order #4471 · 12 pallets'
export const PRODUCT_TABLET_NEXT_UP = 'BuildRight LLC'
