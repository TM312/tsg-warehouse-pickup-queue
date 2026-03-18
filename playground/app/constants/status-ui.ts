import { PICKUP_STATUS, type PickupStatus } from './status'

export type StatusVariant = 'outline' | 'secondary' | 'default' | 'destructive'

export const STATUS_VARIANT: Record<PickupStatus, { variant: StatusVariant; class?: string }> = {
  [PICKUP_STATUS.PENDING]: { variant: 'outline' },
  [PICKUP_STATUS.APPROVED]: { variant: 'secondary' },
  [PICKUP_STATUS.IN_QUEUE]: { variant: 'default', class: 'bg-blue-500 hover:bg-blue-600' },
  [PICKUP_STATUS.PROCESSING]: { variant: 'default', class: 'bg-amber-500 hover:bg-amber-600' },
  [PICKUP_STATUS.COMPLETED]: { variant: 'default', class: 'bg-green-500 hover:bg-green-600' },
  [PICKUP_STATUS.CANCELLED]: { variant: 'destructive' },
}
