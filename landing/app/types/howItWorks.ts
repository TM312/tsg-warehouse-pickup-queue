export type HowItWorksIcon = 'UserPlus' | 'Settings' | 'QrCode' | 'Rocket'

export interface HowItWorksStep {
  step: number
  icon: HowItWorksIcon
  heading: string
  description: string
}
