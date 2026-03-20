import type { SeoMeta, SeoKeyword } from '@/types/seo'

export const SITE_URL = 'https://warehousepickupqueue.com'
export const SEO_OG_IMAGE_PATH = '/og-image.png'

export const SEO_TITLE = 'Warehouse Pickup Queue — Real-Time Queue Management for Warehouse Operations'

export const SEO_DESCRIPTION =
  'Stop wasting staff time coordinating warehouse pickups. Real-time queue management with customer mobile view, staff dashboard, and ERP integration.'

export const SEO_META: SeoMeta = {
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  ogTitle: SEO_TITLE,
  ogDescription: SEO_DESCRIPTION,
  ogImage: `${SITE_URL}${SEO_OG_IMAGE_PATH}`,
  ogType: 'website',
  ogUrl: SITE_URL,
  twitterCard: 'summary_large_image',
  twitterTitle: SEO_TITLE,
  twitterDescription: SEO_DESCRIPTION,
  twitterImage: `${SITE_URL}${SEO_OG_IMAGE_PATH}`,
}

export const SEO_TARGET_KEYWORDS: SeoKeyword[] = [
  { term: 'warehouse pickup queue software' },
  { term: 'will call queue management' },
  { term: 'warehouse queue system' },
  { term: 'pickup scheduling software' },
  { term: 'warehouse customer pickup' },
  { term: 'NetSuite warehouse queue' },
]
