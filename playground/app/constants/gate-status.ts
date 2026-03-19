export const GATE_OPERATIONAL_STATUS = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  OFFLINE: 'offline',
} as const

export type GateOperationalStatus =
  (typeof GATE_OPERATIONAL_STATUS)[keyof typeof GATE_OPERATIONAL_STATUS]

export const GATE_STATUS_COLORS: Record<GateOperationalStatus, string> = {
  [GATE_OPERATIONAL_STATUS.IDLE]: 'bg-green-500',
  [GATE_OPERATIONAL_STATUS.PROCESSING]: 'bg-amber-500',
  [GATE_OPERATIONAL_STATUS.OFFLINE]: 'bg-red-500',
}

export const GATE_STATUS_LABELS: Record<GateOperationalStatus, string> = {
  [GATE_OPERATIONAL_STATUS.IDLE]: 'Idle',
  [GATE_OPERATIONAL_STATUS.PROCESSING]: 'Processing',
  [GATE_OPERATIONAL_STATUS.OFFLINE]: 'Offline',
}
