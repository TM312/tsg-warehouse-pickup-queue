export const PANEL_ID = { CUSTOMER: 'customer', STAFF: 'staff', ANALYTICS: 'analytics' } as const
export type PanelId = (typeof PANEL_ID)[keyof typeof PANEL_ID]

export interface PanelDefinition {
  id: PanelId
  label: string
  description: string
}

export const PANEL_DEFINITIONS: PanelDefinition[] = [
  { id: PANEL_ID.CUSTOMER, label: 'Customer View', description: 'What your customers see on their phone' },
  { id: PANEL_ID.STAFF, label: 'Staff Dashboard', description: 'Queue management and gate assignments' },
  { id: PANEL_ID.ANALYTICS, label: 'Analytics', description: 'Real-time queue metrics and activity' },
]

export const BREAKPOINTS = { MOBILE: 768, DESKTOP: 1280 } as const
export const SIMULATION_SPEEDS = [1, 2, 5] as const
