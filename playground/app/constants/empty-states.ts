import { Truck, Package, Inbox, BarChart3, Activity } from 'lucide-vue-next'

export const EMPTY_STATE = {
  CUSTOMER_PANEL: {
    icon: Truck,
    heading: 'No pickup requests yet',
    subtext: 'Run a scenario or submit an order to get started',
  },
  STAFF_PROCESSING: {
    icon: Package,
    heading: 'All gates idle',
    subtext: 'Run a scenario to see orders flow through processing',
  },
  STAFF_GATE_QUEUE: {
    icon: Inbox,
    heading: 'No items in this gate\u2019s queue',
    subtext: 'Orders assigned to this gate will appear here',
  },
  ANALYTICS_QUEUE_CHART: {
    icon: BarChart3,
    heading: 'No queue data yet',
    subtext: 'Queue depth will be charted as orders flow through gates',
  },
  ANALYTICS_ACTIVITY_FEED: {
    icon: Activity,
    heading: 'No activity yet',
    subtext: 'Events will appear here as the simulation runs',
  },
} as const

export const RUN_SCENARIO_LABEL = 'Run Morning Rush'
