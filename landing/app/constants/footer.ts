import type { FooterSection, SocialLink } from '@/types/navigation'
import { NAV_LINKS } from '@/constants/navigation'

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Product',
    links: [
      ...NAV_LINKS,
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
