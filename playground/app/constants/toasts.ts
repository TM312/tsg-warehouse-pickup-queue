export const TOAST_DURATION_MS = 3_000

export const TOAST_STORAGE_KEY = {
  MUTED: 'playground:toasts-muted',
} as const

export const TOAST_MESSAGES = {
  submit: (orderNumber: string) => `Order ${orderNumber} submitted`,
  approve: (orderNumber: string) => `Order ${orderNumber} approved`,
  start_processing: (gateNumber: number, orderNumber: string) =>
    `Gate ${gateNumber} started processing ${orderNumber}`,
  complete: (orderNumber: string) => `${orderNumber} pickup complete!`,
  gate_offline: (gateNumber: number) => `Gate ${gateNumber} taken offline`,
} as const

export const TOAST_TYPES = {
  submit: 'info',
  approve: 'success',
  start_processing: 'info',
  complete: 'success',
  gate_offline: 'warning',
} as const

export type ToastEventKey = keyof typeof TOAST_MESSAGES
