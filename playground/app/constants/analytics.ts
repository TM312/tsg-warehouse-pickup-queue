import type { Component } from 'vue'
import {
  CheckCircle2,
  Clock,
  Timer,
  Users,
  Plus,
  ArrowRight,
  Loader2,
  CircleCheckBig,
  XCircle,
  ArrowUpDown,
} from 'lucide-vue-next'
import type { SimulationEventType } from '@/types/simulation'
import { formatDurationMs } from '@/utils/formatDuration'

export interface DashboardData {
  completedCount: number
  currentlyWaiting: number
  avgProcessingTime: number | null
  avgWaitTime: number | null
  chartData: { gate: string; count: number }[]
  processingGateRows: { gate: string; gateId: string; request: unknown }[]
}

export interface KpiDefinition {
  id: string
  key: keyof Pick<DashboardData, 'completedCount' | 'currentlyWaiting' | 'avgProcessingTime' | 'avgWaitTime'>
  label: string
  icon: Component
  format: (value: number | null) => string
}

const numOrZero = (v: number | null): string => String(v ?? 0)

export const KPI_DEFINITIONS: KpiDefinition[] = [
  { id: 'completed-count', key: 'completedCount', label: 'Completed Today', icon: CheckCircle2, format: numOrZero },
  { id: 'avg-wait-time', key: 'avgWaitTime', label: 'Avg Wait Time', icon: Clock, format: formatDurationMs },
  { id: 'avg-processing-time', key: 'avgProcessingTime', label: 'Avg Processing Time', icon: Timer, format: formatDurationMs },
  { id: 'currently-waiting', key: 'currentlyWaiting', label: 'Currently Waiting', icon: Users, format: numOrZero },
]

export const EVENT_TYPE_CONFIG: Record<SimulationEventType, { icon: Component; colorClass: string }> = {
  submit: { icon: Plus, colorClass: 'text-blue-500' },
  approve: { icon: CheckCircle2, colorClass: 'text-green-500' },
  assign: { icon: ArrowRight, colorClass: 'text-indigo-500' },
  start_processing: { icon: Loader2, colorClass: 'text-amber-500' },
  complete: { icon: CircleCheckBig, colorClass: 'text-green-600' },
  cancel: { icon: XCircle, colorClass: 'text-red-500' },
  reorder: { icon: ArrowUpDown, colorClass: 'text-purple-500' },
}
