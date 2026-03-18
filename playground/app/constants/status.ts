export const PICKUP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_QUEUE: 'in_queue',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type PickupStatus = (typeof PICKUP_STATUS)[keyof typeof PICKUP_STATUS]

export const ACTIVE_STATUSES = [
  PICKUP_STATUS.PENDING,
  PICKUP_STATUS.APPROVED,
  PICKUP_STATUS.IN_QUEUE,
  PICKUP_STATUS.PROCESSING,
] as const satisfies readonly PickupStatus[]

export const TERMINAL_STATUSES = [
  PICKUP_STATUS.COMPLETED,
  PICKUP_STATUS.CANCELLED,
] as const satisfies readonly PickupStatus[]

export const GATE_STATUSES = [
  PICKUP_STATUS.IN_QUEUE,
  PICKUP_STATUS.PROCESSING,
] as const satisfies readonly PickupStatus[]

export type GateStatus = (typeof GATE_STATUSES)[number]

export function isActiveStatus(status: PickupStatus): status is (typeof ACTIVE_STATUSES)[number] {
  return (ACTIVE_STATUSES as readonly PickupStatus[]).includes(status)
}

export const STATUS_LABELS: Record<PickupStatus, string> = {
  [PICKUP_STATUS.PENDING]: 'Pending',
  [PICKUP_STATUS.APPROVED]: 'Approved',
  [PICKUP_STATUS.IN_QUEUE]: 'In Queue',
  [PICKUP_STATUS.PROCESSING]: 'Processing',
  [PICKUP_STATUS.COMPLETED]: 'Completed',
  [PICKUP_STATUS.CANCELLED]: 'Cancelled',
}

export type StatusVariant = 'outline' | 'secondary' | 'default' | 'destructive'

export const STATUS_VARIANT: Record<PickupStatus, { variant: StatusVariant; class?: string }> = {
  [PICKUP_STATUS.PENDING]: { variant: 'outline' },
  [PICKUP_STATUS.APPROVED]: { variant: 'secondary' },
  [PICKUP_STATUS.IN_QUEUE]: { variant: 'default', class: 'bg-blue-500 hover:bg-blue-600' },
  [PICKUP_STATUS.PROCESSING]: { variant: 'default', class: 'bg-amber-500 hover:bg-amber-600' },
  [PICKUP_STATUS.COMPLETED]: { variant: 'default', class: 'bg-green-500 hover:bg-green-600' },
  [PICKUP_STATUS.CANCELLED]: { variant: 'destructive' },
}
