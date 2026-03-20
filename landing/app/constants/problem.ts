import type { ProblemCard } from '@/types/problem'

export const PROBLEM_SECTION_HEADING = 'Sound familiar?'

export const REVEAL_THRESHOLD = 0.15

export const REVEAL_STAGGER_MS = 150

export const PROBLEM_CARDS: ProblemCard[] = [
  {
    icon: 'Radio',
    heading: 'Radio chaos',
    description:
      '"Gate 3, is that loaded yet? Anybody seen the driver for order 4471?" Staff burn hours on coordination that software should handle.',
  },
  {
    icon: 'EyeOff',
    heading: 'Blind customers',
    description:
      "Drivers idle in the lot with no idea when they'll be called or where to go. They call the front desk. Or just walk in.",
  },
  {
    icon: 'ClipboardList',
    heading: 'Whiteboard ops',
    description:
      "Your pickup queue is a whiteboard, a clipboard, or someone's memory. One sick day and the system breaks.",
  },
]
