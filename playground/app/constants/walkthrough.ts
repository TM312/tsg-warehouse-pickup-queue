import { PANEL_ID } from '@/constants/panels'
import { DEFAULT_GATES } from '@/constants/defaults'
import type { WalkthroughStep, WalkthroughContext, SimulationActions } from '@/types/scenario'

export const WALKTHROUGH_STEP_ID = {
  SUBMIT: 'submit',
  STAFF_SEES: 'staff-sees',
  ASSIGN_GATE: 'assign-gate',
  CUSTOMER_UPDATES: 'customer-updates',
  COMPLETE: 'complete',
  ANALYTICS: 'analytics',
} as const

export const WALKTHROUGH_SELECTOR = {
  CUSTOMER_FORM: '[data-walkthrough="customer-form"]',
  ALL_REQUESTS_TABLE: '[data-walkthrough="all-requests-table"]',
  GATE_SELECT: '[data-walkthrough="gate-select"]',
  CUSTOMER_STATUS: '[data-walkthrough="customer-status"]',
  COMPLETE_BUTTON: '[data-walkthrough="complete-button"]',
  KPI_GRID: '[data-walkthrough="kpi-grid"]',
} as const

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: WALKTHROUGH_STEP_ID.SUBMIT,
    panel: PANEL_ID.CUSTOMER,
    title: 'Submit an Order',
    description:
      'A customer submits a pickup request. The order enters the queue and gets approved automatically.',
    highlightSelector: WALKTHROUGH_SELECTOR.CUSTOMER_FORM,
    delayMs: 1200,
    action(actions: SimulationActions, ctx: WalkthroughContext) {
      const request = actions.submitOrder('WT-0001', 'Walkthrough Demo')
      actions.approveRequest(request.id)
      ctx.requestId = request.id
    },
  },
  {
    id: WALKTHROUGH_STEP_ID.STAFF_SEES,
    panel: PANEL_ID.STAFF,
    title: 'Staff Sees the Request',
    description:
      'The approved request appears in the staff dashboard. Staff can see all incoming orders and manage them.',
    highlightSelector: WALKTHROUGH_SELECTOR.ALL_REQUESTS_TABLE,
  },
  {
    id: WALKTHROUGH_STEP_ID.ASSIGN_GATE,
    panel: PANEL_ID.STAFF,
    title: 'Assign to a Gate',
    description:
      'Staff assigns the request to a pickup gate. The order moves to "In Queue" status at the selected gate.',
    highlightSelector: WALKTHROUGH_SELECTOR.GATE_SELECT,
    delayMs: 800,
    action(actions: SimulationActions, ctx: WalkthroughContext) {
      if (ctx.requestId) {
        actions.assignToGate(ctx.requestId, DEFAULT_GATES[0].id)
      }
    },
  },
  {
    id: WALKTHROUGH_STEP_ID.CUSTOMER_UPDATES,
    panel: PANEL_ID.CUSTOMER,
    title: 'Customer Gets Updates',
    description:
      'The customer view updates in real-time, showing the assigned gate and queue position.',
    highlightSelector: WALKTHROUGH_SELECTOR.CUSTOMER_STATUS,
  },
  {
    id: WALKTHROUGH_STEP_ID.COMPLETE,
    panel: PANEL_ID.STAFF,
    title: 'Process the Pickup',
    description:
      'Staff starts processing the order. The "Complete" button becomes available once processing begins.',
    highlightSelector: WALKTHROUGH_SELECTOR.COMPLETE_BUTTON,
    delayMs: 800,
    action(actions: SimulationActions, ctx: WalkthroughContext) {
      if (ctx.requestId) {
        actions.startProcessing(ctx.requestId)
      }
    },
  },
  {
    id: WALKTHROUGH_STEP_ID.ANALYTICS,
    panel: PANEL_ID.ANALYTICS,
    title: 'Analytics Update',
    description:
      'After completing the pickup, the analytics dashboard reflects the new data — completed count, wait times, and processing metrics.',
    highlightSelector: WALKTHROUGH_SELECTOR.KPI_GRID,
    delayMs: 800,
    action(actions: SimulationActions, ctx: WalkthroughContext) {
      if (ctx.requestId) {
        actions.completeRequest(ctx.requestId)
      }
    },
  },
]
