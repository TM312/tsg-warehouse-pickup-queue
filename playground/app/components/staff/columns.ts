import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ArrowUpDown, Star } from 'lucide-vue-next'
import type { PickupRequest } from '@/types/pickup-request'
import { STATUS_LABELS } from '@/constants/status'
import StaffStatusBadge from './StaffStatusBadge.vue'
import StaffGateSelect from './StaffGateSelect.vue'
import StaffRequestActions from './StaffRequestActions.vue'
import { Button } from '@/components/ui/button'

interface ColumnCallbacks {
  onTogglePriority: (id: string, isPriority: boolean) => void
}

export function createStaffColumns(callbacks: ColumnCallbacks): ColumnDef<PickupRequest>[] {
  return [
    {
      id: 'priority',
      header: '',
      cell: ({ row }) => {
        const request = row.original
        return h(Button, {
          variant: 'ghost',
          size: 'icon-sm',
          class: request.is_priority ? 'text-amber-500' : 'text-muted-foreground',
          onClick: () => callbacks.onTogglePriority(request.id, !request.is_priority),
        }, () => h(Star, { class: `size-4 ${request.is_priority ? 'fill-current' : ''}` }))
      },
      size: 40,
    },
    {
      accessorKey: 'sales_order_number',
      header: ({ column }) =>
        h(Button, {
          variant: 'ghost',
          size: 'sm',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        }, () => [
          'Order #',
          h(ArrowUpDown, { class: 'ml-1 size-3' }),
        ]),
      cell: ({ row }) => h('span', { class: 'font-medium' }, row.getValue('sales_order_number') as string),
    },
    {
      accessorKey: 'company_name',
      header: 'Company',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) =>
        h(StaffStatusBadge, { status: row.original.status }),
    },
    {
      id: 'gate',
      header: 'Gate',
      cell: ({ row }) =>
        h(StaffGateSelect, {
          currentGateId: row.original.gate_id,
          requestId: row.original.id,
          status: row.original.status,
        }),
    },
    {
      accessorKey: 'queue_position',
      header: 'Position',
      cell: ({ row }) => {
        const pos = row.original.queue_position
        return pos != null ? `#${pos}` : '--'
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) =>
        h(Button, {
          variant: 'ghost',
          size: 'sm',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        }, () => [
          'Created',
          h(ArrowUpDown, { class: 'ml-1 size-3' }),
        ]),
      cell: ({ row }) => {
        const date = new Date(row.getValue('created_at') as string)
        return date.toLocaleTimeString()
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        h(StaffRequestActions, { request: row.original }),
    },
  ]
}
