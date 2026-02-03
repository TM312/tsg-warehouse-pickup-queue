import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { ArrowUpDown, Flag } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import StatusBadge from './StatusBadge.vue'
import GateSelect from './GateSelect.vue'
import RequestActionButtons from './RequestActionButtons.vue'
import type { PickupRequest } from '#shared/types/pickup-request'
import { ACTIVE_STATUSES } from '#shared/types/pickup-request'

// Re-export for backward compatibility - TODO: update imports elsewhere then remove
export type { PickupRequest, PickupStatus } from '#shared/types/pickup-request'
export { PICKUP_STATUS, ACTIVE_STATUSES } from '#shared/types/pickup-request'

export interface ColumnCallbacks {
  gates: Array<{ id: string; gate_number: number; queue_count: number }>
  pendingIds: Record<string, boolean>
  onGateSelect: (requestId: string, gateId: string) => void
  onComplete: (requestId: string) => void
  onCancel: (requestId: string) => void
  onRevert: (requestId: string) => void
}

export function createColumns(callbacks: ColumnCallbacks): ColumnDef<PickupRequest>[] {
  return [
    {
      accessorKey: 'sales_order_number',
      header: ({ column }) => {
        return h(Button, {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        }, () => ['Order #', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })])
      },
    },
    {
      accessorKey: 'company_name',
      header: 'Company',
      cell: ({ row }) => row.getValue('company_name') || 'N/A',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as PickupRequest['status']
        const processingStartedAt = row.original.processing_started_at
        return h(StatusBadge, { status, processingStartedAt })
      },
    },
    {
      accessorKey: 'email_flagged',
      header: 'Flag',
      cell: ({ row }) => {
        if (row.getValue('email_flagged')) {
          return h(Flag, { class: 'h-4 w-4 text-destructive' })
        }
        return null
      },
    },
    {
      id: 'gate',
      header: 'Gate',
      cell: ({ row }) => {
        const status = row.original.status
        const isActive = (ACTIVE_STATUSES as readonly string[]).includes(status)

        if (isActive) {
          return h(GateSelect, {
            gates: callbacks.gates,
            currentGateId: row.original.assigned_gate_id,
            loading: callbacks.pendingIds[row.original.id] ?? false,
            onSelect: (gateId: string) => callbacks.onGateSelect(row.original.id, gateId),
          })
        }

        // For completed/cancelled, show static gate info or dash
        if (row.original.gate) {
          return `Gate ${row.original.gate.gate_number}`
        }
        return '-'
      },
    },
    {
      id: 'position',
      header: 'Position',
      cell: ({ row }) => {
        const position = row.original.queue_position
        if (position !== null) {
          return `#${position}`
        }
        return '-'
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => {
        return h(Button, {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        }, () => ['Created', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })])
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('created_at'))
        return date.toLocaleString()
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        return h(RequestActionButtons, {
          status: row.original.status,
          loading: callbacks.pendingIds[row.original.id] ?? false,
          onComplete: () => callbacks.onComplete(row.original.id),
          onCancel: () => callbacks.onCancel(row.original.id),
          onRevert: () => callbacks.onRevert(row.original.id),
        })
      },
    },
  ]
}

// Deprecated: Use createColumns() instead for full functionality
// Kept for backward compatibility during transition
export const columns: ColumnDef<PickupRequest>[] = [
  {
    accessorKey: 'sales_order_number',
    header: ({ column }) => {
      return h(Button, {
        variant: 'ghost',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }, () => ['Order #', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })])
    },
  },
  {
    accessorKey: 'company_name',
    header: 'Company',
    cell: ({ row }) => row.getValue('company_name') || 'N/A',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as PickupRequest['status']
      const processingStartedAt = row.original.processing_started_at
      return h(StatusBadge, { status, processingStartedAt })
    },
  },
  {
    accessorKey: 'email_flagged',
    header: 'Flag',
    cell: ({ row }) => {
      if (row.getValue('email_flagged')) {
        return h(Flag, { class: 'h-4 w-4 text-destructive' })
      }
      return null
    },
  },
  {
    id: 'gate',
    header: 'Gate',
    cell: ({ row }) => {
      const position = row.original.queue_position
      if (position !== null) {
        return `#${position}`
      }
      return '-'
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      return h(Button, {
        variant: 'ghost',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }, () => ['Created', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })])
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return date.toLocaleString()
    },
  },
]
