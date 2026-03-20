export interface NavLink {
  label: string
  href: string
}

export interface FooterSection {
  title: string
  links: NavLink[]
}

export type SocialIcon = 'linkedin' | 'twitter' | 'github'

export interface SocialLink {
  label: string
  href: string
  icon: SocialIcon
}
