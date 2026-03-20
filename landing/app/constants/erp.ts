import type { ErpBullet } from '@/types/erp'

export const ERP_SECTION_ID = 'erp-integration'
export const ERP_SECTION_HEADING = 'Connects to your ERP. Not bolted on.'
export const ERP_SECTION_NOTE = 'SAP Business One, Epicor, Acumatica, and NetSuite integrations on the roadmap.'
export const ERP_REVEAL_STAGGER_MS = 150

export const ERP_BULLETS: ErpBullet[] = [
  {
    icon: 'ShieldCheck',
    text: 'Validate orders against your ERP before check-in — no guessing, no mismatches.',
  },
  {
    icon: 'RefreshCw',
    text: 'Real-time fulfillment sync so warehouse and front-office stay on the same page.',
  },
  {
    icon: 'FileX2',
    text: 'Eliminate CSV uploads and double-entry that slow your team down.',
  },
  {
    icon: 'Blocks',
    text: 'Built for the ERP ecosystem — not a silo bolted onto your stack.',
  },
]
