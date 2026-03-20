import type { HowItWorksStep } from '@/types/howItWorks'

export const HOW_IT_WORKS_SECTION_ID = 'how-it-works'
export const HOW_IT_WORKS_SECTION_HEADING = 'Live in under a day'
export const HOW_IT_WORKS_REVEAL_STAGGER_MS = 150

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: 1,
    icon: 'UserPlus',
    heading: 'Sign up',
    description: 'Create your account and invite your warehouse team in minutes.',
  },
  {
    step: 2,
    icon: 'Settings',
    heading: 'Configure',
    description: 'Set up pickup windows, dock assignments, and notification rules.',
  },
  {
    step: 3,
    icon: 'QrCode',
    heading: 'Print the QR code',
    description: 'Post it at your entrance — drivers scan to join the queue on arrival.',
  },
  {
    step: 4,
    icon: 'Rocket',
    heading: 'Go live',
    description: 'Start processing pickups with real-time visibility from day one.',
  },
]
