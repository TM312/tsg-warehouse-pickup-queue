import type { FooterSection, NavLink, SocialLink } from '@/types/navigation'

export const PRODUCT_NAME = 'PickupQueue'

export const NAV_LINKS: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Demo', href: '#demo' },
]

export const CTA_LABEL = 'Start Free Trial'
export const CTA_HREF = '/signup'

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Demo', href: '#demo' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

export const CONTACT_EMAIL = 'hello@pickupqueue.com'
export const SUPPORT_HOURS = 'We know warehouses start early — support available 5am–9pm PT'

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'LinkedIn', href: 'https://linkedin.com/company/pickupqueue', icon: 'linkedin' },
]

export const COPYRIGHT_HOLDER = 'PickupQueue'
