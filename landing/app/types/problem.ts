export type ProblemIcon = 'Radio' | 'EyeOff' | 'ClipboardList'

export interface ProblemCard {
  key: string
  icon: ProblemIcon
  heading: string
  description: string
}
