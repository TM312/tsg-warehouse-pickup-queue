import { Package, Zap, AlertTriangle, ShieldOff } from 'lucide-vue-next'
import type { Scenario, SimulationActions } from '@/types/scenario'
import { DEFAULT_GATES } from '@/constants/defaults'

export const SCENARIO_ID = {
  SINGLE_ORDER: 'single-order',
  MORNING_RUSH: 'morning-rush',
  PRIORITY_OVERRIDE: 'priority-override',
  GATE_OFFLINE: 'gate-offline',
} as const

export const SCENARIOS: Scenario[] = [
  {
    id: SCENARIO_ID.SINGLE_ORDER,
    label: 'Single Order',
    description: 'Submit one order and watch it flow through the queue',
    icon: Package,
    steps: [
      {
        delayMs: 0,
        feedLabel: 'Scenario: submitting order SO-1001',
        action: (actions: SimulationActions) => {
          const request = actions.submitOrder('SO-1001', 'Acme Corp')
          actions.approveRequest(request.id)
          actions.assignToGate(request.id, DEFAULT_GATES[0].id)
        },
      },
    ],
  },
  {
    id: SCENARIO_ID.MORNING_RUSH,
    label: 'Morning Rush',
    description: 'A burst of 10 orders across all gates, including a priority pickup',
    icon: Zap,
    steps: [
      {
        delayMs: 0,
        feedLabel: 'Scenario: morning rush begins',
        action: (actions: SimulationActions) => {
          const r1 = actions.submitOrder('SO-2001', 'Wayne Enterprises')
          actions.approveRequest(r1.id)
          actions.assignToGate(r1.id, DEFAULT_GATES[0].id)

          const r2 = actions.submitOrder('SO-2002', 'Stark Industries')
          actions.approveRequest(r2.id)
          actions.assignToGate(r2.id, DEFAULT_GATES[1].id)
        },
      },
      {
        delayMs: 3000,
        feedLabel: 'Scenario: more orders arriving',
        action: (actions: SimulationActions) => {
          const r3 = actions.submitOrder('SO-2003', 'Umbrella Corp')
          actions.approveRequest(r3.id)
          actions.assignToGate(r3.id, DEFAULT_GATES[2].id)

          const r4 = actions.submitOrder('SO-2004', 'Cyberdyne Systems')
          actions.approveRequest(r4.id)
          actions.assignToGate(r4.id, DEFAULT_GATES[0].id)
        },
      },
      {
        delayMs: 5000,
        action: (actions: SimulationActions) => {
          const r5 = actions.submitOrder('SO-2005', 'Initech')
          actions.approveRequest(r5.id)
          actions.assignToGate(r5.id, DEFAULT_GATES[1].id)

          const r6 = actions.submitOrder('SO-2006', 'Globex Corporation')
          actions.approveRequest(r6.id)
          actions.assignToGate(r6.id, DEFAULT_GATES[2].id)
        },
      },
      {
        delayMs: 8000,
        feedLabel: 'Scenario: priority order incoming',
        action: (actions: SimulationActions) => {
          const r7 = actions.submitOrder('SO-2007', 'Soylent Corp')
          actions.approveRequest(r7.id)
          actions.assignToGate(r7.id, DEFAULT_GATES[0].id)
          actions.setPriority(r7.id, true)
        },
      },
      {
        delayMs: 10000,
        action: (actions: SimulationActions) => {
          const r8 = actions.submitOrder('SO-2008', 'Massive Dynamic')
          actions.approveRequest(r8.id)
          actions.assignToGate(r8.id, DEFAULT_GATES[1].id)
        },
      },
      {
        delayMs: 15000,
        action: (actions: SimulationActions) => {
          const r9 = actions.submitOrder('SO-2009', 'Aperture Science')
          actions.approveRequest(r9.id)
          actions.assignToGate(r9.id, DEFAULT_GATES[2].id)

          const r10 = actions.submitOrder('SO-2010', 'Acme Corp')
          actions.approveRequest(r10.id)
          actions.assignToGate(r10.id, DEFAULT_GATES[0].id)
        },
      },
    ],
  },
  {
    id: SCENARIO_ID.PRIORITY_OVERRIDE,
    label: 'Priority Override',
    description: 'Four orders queue up, then a priority order jumps to the front',
    icon: AlertTriangle,
    steps: [
      {
        delayMs: 0,
        feedLabel: 'Scenario: queuing initial orders',
        action: (actions: SimulationActions) => {
          const r1 = actions.submitOrder('SO-3001', 'Wayne Enterprises')
          actions.approveRequest(r1.id)
          actions.assignToGate(r1.id, DEFAULT_GATES[0].id)

          const r2 = actions.submitOrder('SO-3002', 'Stark Industries')
          actions.approveRequest(r2.id)
          actions.assignToGate(r2.id, DEFAULT_GATES[0].id)
        },
      },
      {
        delayMs: 3000,
        action: (actions: SimulationActions) => {
          const r3 = actions.submitOrder('SO-3003', 'Umbrella Corp')
          actions.approveRequest(r3.id)
          actions.assignToGate(r3.id, DEFAULT_GATES[0].id)

          const r4 = actions.submitOrder('SO-3004', 'Cyberdyne Systems')
          actions.approveRequest(r4.id)
          actions.assignToGate(r4.id, DEFAULT_GATES[0].id)
        },
      },
      {
        delayMs: 8000,
        feedLabel: 'Scenario: priority order arrives!',
        action: (actions: SimulationActions) => {
          const priority = actions.submitOrder('SO-3005', 'Initech')
          actions.approveRequest(priority.id)
          actions.assignToGate(priority.id, DEFAULT_GATES[0].id)
          actions.setPriority(priority.id, true)
        },
      },
    ],
  },
  {
    id: SCENARIO_ID.GATE_OFFLINE,
    label: 'Gate Offline',
    description: 'Fill Gate 3 with orders, then take it offline',
    icon: ShieldOff,
    steps: [
      {
        delayMs: 0,
        feedLabel: 'Scenario: filling Gate 3',
        action: (actions: SimulationActions) => {
          const r1 = actions.submitOrder('SO-4001', 'Acme Corp')
          actions.approveRequest(r1.id)
          actions.assignToGate(r1.id, DEFAULT_GATES[2].id)

          const r2 = actions.submitOrder('SO-4002', 'Wayne Enterprises')
          actions.approveRequest(r2.id)
          actions.assignToGate(r2.id, DEFAULT_GATES[2].id)
        },
      },
      {
        delayMs: 3000,
        action: (actions: SimulationActions) => {
          const r3 = actions.submitOrder('SO-4003', 'Stark Industries')
          actions.approveRequest(r3.id)
          actions.assignToGate(r3.id, DEFAULT_GATES[2].id)
        },
      },
      {
        delayMs: 8000,
        feedLabel: 'Scenario: Gate 3 going offline!',
        action: (actions: SimulationActions) => {
          actions.deactivateGate(DEFAULT_GATES[2].id)
        },
      },
    ],
  },
]
