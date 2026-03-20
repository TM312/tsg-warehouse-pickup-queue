import type { ProductFeature } from '@/types/product'
import type { MockupQueueEntry } from '@/types/hero'
import { DEFAULT_REVEAL_STAGGER_MS } from '@/constants/animation'

export const PRODUCT_SECTION_ID = 'features'

export const PRODUCT_SECTION_HEADING = 'One system. Three interfaces. Zero confusion.'

export const PRODUCT_REVEAL_STAGGER_MS = DEFAULT_REVEAL_STAGGER_MS

export const PRODUCT_FEATURES: ProductFeature[] = [
  {
    key: 'customer-mobile',
    mockup: 'phone',
    heading: 'Customer Mobile View',
    description:
      'Customers scan a QR code on arrival and see their live queue position, estimated wait time, and gate assignment — all on their own phone.',
  },
  {
    key: 'staff-dashboard',
    mockup: 'browser',
    heading: 'Staff Dashboard',
    description:
      'Manage the full queue from any browser. Call customers, assign gates, flag issues, and see real-time status across every active pickup.',
  },
  {
    key: 'gate-console',
    mockup: 'tablet',
    heading: 'Gate Operator Console',
    description:
      'A dedicated fullscreen view for gate staff. See who\'s next, confirm arrivals, and mark pickups complete with a single tap.',
  },
]

export const PRODUCT_MOCKUP_BROWSER_ENTRIES: MockupQueueEntry[] = [
  { company: 'Acme Corp', order: 'SO-5001', status: 'loading', gate: 'Gate 1' },
  { company: 'BuildRight', order: 'SO-5002', status: 'called', gate: 'Gate 2' },
  { company: 'FastHaul', order: 'SO-5003', status: 'waiting', gate: null },
]
