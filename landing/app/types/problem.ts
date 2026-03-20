export type ProblemIcon = 'Radio' | 'EyeOff' | 'ClipboardList'

export interface ProblemCard {
  icon: ProblemIcon
  heading: string
  description: string
}
