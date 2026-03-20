import type { ProblemCard } from '@/types/problem'
import { REVEAL_THRESHOLD, DEFAULT_REVEAL_STAGGER_MS } from '@/constants/animation'

export const PROBLEM_SECTION_HEADING = 'Sound familiar?'

export const PROBLEM_SECTION_ID = 'problem'

export { REVEAL_THRESHOLD }

export const REVEAL_STAGGER_MS = DEFAULT_REVEAL_STAGGER_MS

export const PROBLEM_CARDS: ProblemCard[] = [
  {
    key: 'radio-chaos',
    icon: 'Radio',
    heading: 'Radio chaos',
    description:
      '"Gate 3, is that loaded yet? Anybody seen the driver for order 4471?" Staff burn hours on coordination that software should handle.',
  },
  {
    key: 'blind-customers',
    icon: 'EyeOff',
    heading: 'Blind customers',
    description:
      "Drivers idle in the lot with no idea when they'll be called or where to go. They call the front desk. Or just walk in.",
  },
  {
    key: 'whiteboard-ops',
    icon: 'ClipboardList',
    heading: 'Whiteboard ops',
    description:
      "Your pickup queue is a whiteboard, a clipboard, or someone's memory. One sick day and the system breaks.",
  },
]
