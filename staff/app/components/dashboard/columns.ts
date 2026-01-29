import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { ArrowUpDown, Flag } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import StatusBadge from './StatusBadge.vue'

export interface PickupRequest {
  id: string
  sales_order_number: string
  company_name: string | null
  customer_email: string
  status: 'pending' | 'approved' | 'in_queue' | 'completed' | 'cancelled'
  email_flagged: boolean
  assigned_gate_id: string | null
  queue_position: number | null
  created_at: string
}

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
      return h(StatusBadge, { status })
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
      // Gate info will be joined in query; for now show position if in queue
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
