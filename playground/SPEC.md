# Playground App — Full Specification

> A standalone Nuxt 4 app that lets potential customers experience the warehouse pickup queue system from three synchronized perspectives on a single screen — without any backend dependency.

---

## Table of Contents

1. [Goals & Non-Goals](#1-goals--non-goals)
2. [Architecture Overview](#2-architecture-overview)
3. [Data Model & Simulation Engine](#3-data-model--simulation-engine)
4. [Layout & Responsive Behavior](#4-layout--responsive-behavior)
5. [Panel Specifications](#5-panel-specifications)
6. [Scenario System](#6-scenario-system)
7. [Guided Walkthrough](#7-guided-walkthrough)
8. [Clean Code Conventions](#8-clean-code-conventions)
9. [Test Strategy](#9-test-strategy)
10. [Implementation Status](#10-implementation-status)
11. [Work Packages](#11-work-packages)

---

## 1. Goals & Non-Goals

### Goals

- **Demonstrate value in < 60 seconds**: a visitor clicks "Add Order", sees it appear in the staff panel, assigns a gate, and watches the customer panel update in real-time.
- **Zero backend dependency**: all state lives in Pinia stores with an in-memory simulation engine. No Supabase, no Lambda, no network calls.
- **Faithful representation**: use the same component patterns, type definitions, and visual language as the production apps so the playground is an honest preview.
- **Clean, testable codebase**: every work package ships with unit tests for critical behavior. Constants, not magic strings. Composables, not monolithic components.

### Non-Goals

- Production authentication or authorization flows.
- Actual NetSuite validation or Supabase integration.
- Editable gate configuration or business-hours management (static defaults suffice).
- Mobile-native experience (responsive stacking is enough).
- SEO optimization or SSR (playground is a client-only SPA).

---

## 2. Architecture Overview

```
playground/
├── app/
│   ├── assets/css/           # Tailwind CSS (shared design tokens)
│   ├── components/
│   │   ├── ui/               # shadcn-vue primitives (copied from staff)
│   │   ├── panels/           # Top-level panel containers
│   │   │   ├── CustomerPanel.vue
│   │   │   ├── StaffPanel.vue
│   │   │   └── AnalyticsPanel.vue
│   │   ├── customer/         # Customer-view subcomponents
│   │   ├── staff/            # Staff-view subcomponents
│   │   ├── analytics/        # Analytics-view subcomponents
│   │   ├── scenario/         # Scenario controls & walkthrough
│   │   └── layout/           # Shell, panel grid, phone frame
│   ├── composables/
│   │   ├── useSimulation.ts          # Simulation clock & lifecycle
│   │   ├── useSimulationActions.ts   # User-triggered queue actions
│   │   ├── useWaitTimeEstimate.ts    # Wait-time calculation (ported)
│   │   ├── useDashboardData.ts       # Derived analytics (ported)
│   │   └── useGuidedWalkthrough.ts   # Walkthrough stepper state
│   ├── stores/
│   │   ├── simulation.ts    # Core simulation state & clock
│   │   ├── queue.ts         # PickupRequest[] (same shape as prod)
│   │   └── gates.ts         # Gate[] (same shape as prod)
│   ├── constants/
│   │   ├── status.ts        # PICKUP_STATUS, ACTIVE_STATUSES, etc.
│   │   ├── defaults.ts      # Default gates, simulation speeds, seed data
│   │   ├── scenarios.ts     # Predefined scenario definitions
│   │   └── walkthrough.ts   # Walkthrough step definitions
│   ├── types/
│   │   ├── pickup-request.ts  # PickupRequest, PickupStatus (from shared)
│   │   ├── gate.ts            # Gate, GateWithCount (from shared)
│   │   ├── simulation.ts      # SimulationConfig, SimulationEvent, etc.
│   │   └── scenario.ts        # Scenario, ScenarioStep
│   ├── utils/
│   │   ├── id.ts             # Deterministic UUID generation
│   │   ├── formatDuration.ts # Duration formatting (ported)
│   │   ├── random.ts         # Seeded random for reproducible demos
│   │   └── factories.ts      # Factory functions for test/seed data
│   ├── pages/
│   │   └── index.vue         # Single-page playground
│   ├── layouts/
│   │   └── default.vue       # App shell with header
│   └── app.vue
├── nuxt.config.ts
├── package.json
├── tsconfig.json
├── components.json           # shadcn-vue config
├── vitest.config.ts
├── SPEC.md                   # This file
└── tests/
    ├── unit/
    │   ├── stores/
    │   ├── composables/
    │   ├── utils/
    │   └── constants/
    └── components/
```

### Dependency on production code

The playground **does not import from** `../staff` or `../customer`. Instead, shared types and constants are **copied once** into `playground/app/types/` and `playground/app/constants/`. This keeps the playground fully self-contained and deployable independently.

If shared types diverge in the future, a lint step or manual sync is acceptable — a shared workspace package is out of scope for now.

---

## 3. Data Model & Simulation Engine

### 3.1 Types (mirrored from production)

```typescript
// types/pickup-request.ts
type PickupStatus = 'pending' | 'approved' | 'in_queue' | 'processing' | 'completed' | 'cancelled'

interface PickupRequest {
  id: string
  sales_order_number: string
  company_name: string | null
  customer_email: string
  status: PickupStatus
  email_flagged: boolean
  assigned_gate_id: string | null
  queue_position: number | null
  is_priority: boolean
  processing_started_at: string | null
  completed_at: string | null
  created_at: string
}

// types/gate.ts
interface Gate {
  id: string
  gate_number: number
  is_active: boolean
}

interface GateWithCount extends Gate {
  queue_count: number
}
```

### 3.2 Simulation store (`stores/simulation.ts`)

Central orchestrator for the playground clock and auto-processing.

```typescript
interface SimulationState {
  speed: SimulationSpeed          // 1 | 2 | 5
  isRunning: boolean
  elapsedMs: number               // Virtual time elapsed
  selectedCustomerRequestId: string | null  // Which request the customer panel tracks
  autoProcessEnabled: boolean     // Auto-advance processing→completed
}
```

**Clock behavior:**
- A `setInterval` ticks every `1000 / speed` ms.
- Each tick advances `elapsedMs` by 1000 (one virtual second).
- When `autoProcessEnabled` is true, the clock checks for `processing` items whose elapsed processing time exceeds a configurable threshold (`PROCESSING_DURATION_MS` from constants) and auto-completes them.

### 3.3 Simulation actions (`composables/useSimulationActions.ts`)

Mirrors the real `useQueueActions` composable but operates entirely on Pinia stores:

| Action | Behavior |
|--------|----------|
| `submitOrder(orderNumber, email)` | Creates a `pending` request, adds to queue store |
| `approveRequest(id)` | Transitions `pending` → `approved` |
| `assignToGate(id, gateId)` | Transitions to `in_queue`, sets `assigned_gate_id`, computes `queue_position` |
| `reorderQueue(gateId, orderedIds)` | Reassigns `queue_position` values for the given gate |
| `setPriority(id, isPriority)` | Toggles `is_priority`, moves to front of gate queue |
| `startProcessing(id)` | Transitions `in_queue` → `processing`, sets `processing_started_at` |
| `completeRequest(id)` | Transitions `processing` → `completed`, sets `completed_at` |
| `cancelRequest(id)` | Transitions to `cancelled` |
| `moveToGate(id, newGateId)` | Moves request between gates, recalculates positions in both |

All actions validate the current status before transitioning (e.g., only `in_queue` can start processing). Invalid transitions are silently ignored with a console warning in dev.

### 3.4 Queue position calculation

```typescript
function computeNextPosition(requests: PickupRequest[], gateId: string): number {
  const gateQueue = requests
    .filter(r => r.assigned_gate_id === gateId && r.status === PICKUP_STATUS.IN_QUEUE)
  return gateQueue.length + 1
}
```

### 3.5 Factory functions (`utils/factories.ts`)

```typescript
function createPickupRequest(overrides?: Partial<PickupRequest>): PickupRequest
function createGate(overrides?: Partial<Gate>): Gate
```

Used by tests, seed data, and scenario injection. All IDs are generated via `utils/id.ts` (crypto.randomUUID with optional deterministic seed for tests).

---

## 4. Layout & Responsive Behavior

### 4.1 Desktop (≥ 1280px)

```
┌─────────────────────────────────────────────────────────────┐
│  Header: "Pickup Queue Playground"          [Speed] [Reset] │
├─────────────────────────────────────────────────────────────┤
│  Scenario Bar: [+ New Order] [Morning Rush] [Gate Offline]  │
├────────────┬──────────────────────┬─────────────────────────┤
│            │                      │                         │
│  📱 Customer│  🏭 Staff Dashboard   │  📊 Analytics           │
│  (phone    │  (main panel,        │  (side panel,           │
│   frame)   │   flexible width)    │   fixed 320px)          │
│            │                      │                         │
│  280px     │  1fr                 │  320px                  │
│            │                      │                         │
└────────────┴──────────────────────┴─────────────────────────┘
```

- Grid: `grid-cols-[280px_1fr_320px]`
- All three panels visible simultaneously.
- Panels have a label header with icon + title + description.

### 4.2 Tablet (768px – 1279px)

- Two columns: Staff + Analytics side by side.
- Customer panel moves to a floating phone-frame overlay (toggle button in header).

### 4.3 Mobile (< 768px)

- Single column with tab bar at top: `Customer | Staff | Analytics`.
- Only one panel visible at a time.
- No phone frame on customer view (it IS the phone).

### 4.4 Panel label headers

Each panel has a consistent header:

```vue
<PanelHeader
  :icon="SmartphoneIcon"
  title="Customer View"
  description="What your customers see on their phone"
/>
```

This addresses the requirement of labeling what each view represents.

---

## 5. Panel Specifications

### 5.1 Customer Panel

Rendered inside a `PhoneFrame` component (CSS-only phone bezel with rounded corners, notch, and status bar).

**States displayed:**

| Customer state | What's shown |
|----------------|-------------|
| No order yet | Order submission form (order number + email) |
| `pending` | "Waiting for approval…" with spinner |
| `approved` | "Approved! Waiting for gate assignment…" |
| `in_queue` | Gate number (large), queue position, estimated wait time, pulsing live dot |
| `processing` | "Your order is being loaded!" with animation |
| `completed` | "Pickup complete!" with checkmark animation |
| `cancelled` | "Request cancelled" with message |

**Key components:**
- `CustomerOrderForm.vue` — order number + email input, submit button
- `CustomerStatusCard.vue` — displays current status with transitions
- `CustomerQueuePosition.vue` — large gate number, position badge, wait estimate
- `CustomerCompletedState.vue` — success animation

**Behavior:**
- When user submits an order via the customer panel, the simulation store sets `selectedCustomerRequestId` to track it.
- All subsequent status changes to that request are reflected instantly.
- If no request is selected, shows the form.

### 5.2 Staff Panel

The main interactive panel where visitors act as warehouse staff.

**Sections (top to bottom):**

1. **Now Processing** — compact table showing one row per active gate with the current order being processed and elapsed time. Mirrors `ProcessingGatesTable.vue` from production.

2. **Queue Tabs** — tabbed interface:
   - **All Requests** tab: sortable TanStack table with columns: Order #, Company, Status (badge), Gate (dropdown), Position, Created, Actions.
   - **Per-gate tabs** (Gate 1, Gate 2, Gate 3): drag-and-drop queue with priority toggle and complete button.

**Key components:**
- `StaffProcessingTable.vue` — now-processing section
- `StaffQueueTabs.vue` — tab container
- `StaffAllRequestsTable.vue` — TanStack-based sortable table
- `StaffGateQueue.vue` — drag-and-drop gate queue
- `StaffStatusBadge.vue` — status badge (ported from production)
- `StaffGateSelect.vue` — gate assignment dropdown

**Interactions:**
- Assigning a gate in the All Requests table triggers `assignToGate` → customer panel updates.
- Dragging rows in gate tabs triggers `reorderQueue` → customer position updates.
- Clicking "Complete" triggers the processing → completed flow.

### 5.3 Analytics Panel

Read-only panel showing live KPIs and charts derived from the queue store.

**Sections:**

1. **KPI Cards** (2×2 grid):
   - Completed Today (`completedCount`)
   - Avg Wait Time (`avgWaitTime`)
   - Avg Processing Time (`avgProcessingTime`)
   - Currently Waiting (`currentlyWaiting`)

2. **Queue Depth Chart** — horizontal bar chart showing items per gate (using `@unovis/vue`).

3. **Activity Feed** — scrollable list of recent events: "Order SO-1234 assigned to Gate 2", "Order SO-5678 completed". Capped at 20 entries.

**Key components:**
- `AnalyticsKpiGrid.vue` — 2×2 card grid
- `AnalyticsKpiCard.vue` — single KPI card with label, value, icon
- `AnalyticsQueueChart.vue` — Unovis bar chart
- `AnalyticsActivityFeed.vue` — event log list

**Data source:** `composables/useDashboardData.ts` derives all values from the queue and gates stores (same logic as production).

---

## 6. Scenario System

### 6.1 Scenario definition

```typescript
// types/scenario.ts
interface Scenario {
  id: string
  label: string
  description: string
  icon: Component          // Lucide icon
  steps: ScenarioStep[]
}

interface ScenarioStep {
  delayMs: number                           // Virtual time delay before executing
  action: (actions: SimulationActions) => void  // Mutation to perform
  feedLabel?: string                        // Optional label for activity feed
}
```

### 6.2 Built-in scenarios

Defined in `constants/scenarios.ts`:

| Scenario | What it does |
|----------|-------------|
| **Single Order** | Creates 1 pending request. Good for manual walkthrough. |
| **Morning Rush** | Creates 8–12 orders over 30s virtual time across all gates, with 1 priority order. |
| **Priority Override** | Creates 4 in-queue orders, then injects a priority order that jumps to front. |
| **Gate Offline** | Fills Gate 3, then deactivates it — orders redistribute to Gates 1 & 2. |

### 6.3 Scenario bar component

```vue
<ScenarioBar>
  <ScenarioButton
    v-for="scenario in SCENARIOS"
    :key="scenario.id"
    :scenario="scenario"
    @run="runScenario(scenario)"
  />
  <SimulationSpeedControl v-model="speed" />
  <ResetButton @click="resetSimulation" />
</ScenarioBar>
```

### 6.4 Reset behavior

`resetSimulation()`:
- Clears all requests from queue store.
- Resets gates to default state (3 active gates).
- Resets simulation clock to 0.
- Clears activity feed.
- Clears `selectedCustomerRequestId`.

---

## 7. Guided Walkthrough

An optional overlay for first-time visitors that highlights the cross-panel cause-and-effect.

### 7.1 Steps

```typescript
// constants/walkthrough.ts
const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'submit',
    panel: 'customer',
    title: 'A customer submits a pickup request',
    description: 'They enter their sales order number and email.',
    action: 'auto-submit',       // Auto-fills and submits the customer form
    highlightSelector: '[data-walkthrough="customer-form"]',
  },
  {
    id: 'staff-sees',
    panel: 'staff',
    title: 'Staff sees the new request',
    description: 'It appears in the queue as "Pending".',
    highlightSelector: '[data-walkthrough="all-requests-table"]',
  },
  {
    id: 'assign-gate',
    panel: 'staff',
    title: 'Staff assigns a gate',
    description: 'Select a gate from the dropdown. Watch the customer view update.',
    action: 'auto-assign-gate',
    highlightSelector: '[data-walkthrough="gate-select"]',
  },
  {
    id: 'customer-updates',
    panel: 'customer',
    title: 'Customer sees their position',
    description: 'Real-time gate assignment, queue position, and estimated wait time.',
    highlightSelector: '[data-walkthrough="customer-status"]',
  },
  {
    id: 'complete',
    panel: 'staff',
    title: 'Staff completes the pickup',
    description: 'Click "Complete" and watch the analytics update.',
    action: 'auto-complete',
    highlightSelector: '[data-walkthrough="complete-button"]',
  },
  {
    id: 'analytics',
    panel: 'analytics',
    title: 'Analytics reflect every action',
    description: 'KPIs, queue depth, and the activity feed update in real-time.',
    highlightSelector: '[data-walkthrough="kpi-grid"]',
  },
]
```

### 7.2 Walkthrough composable

```typescript
// composables/useGuidedWalkthrough.ts
interface WalkthroughState {
  isActive: boolean
  currentStepIndex: number
  currentStep: WalkthroughStep | null
}

function useGuidedWalkthrough() {
  // Returns: { state, start, next, previous, skip, isComplete }
}
```

### 7.3 UI

- A `WalkthroughOverlay.vue` dims the screen except for the highlighted element.
- A `WalkthroughTooltip.vue` appears next to the highlight with step title, description, and Next/Skip buttons.
- The overlay scrolls/pans to ensure the highlighted panel is visible on smaller screens.
- A "Take the tour" button in the header launches the walkthrough.

---

## 8. Clean Code Conventions

These conventions apply to all code in the playground app.

### 8.1 No magic strings

All status values, store keys, event names, and selector attributes come from named constants:

```typescript
// ✅ Correct
import { PICKUP_STATUS } from '~/constants/status'
if (request.status === PICKUP_STATUS.PENDING) { ... }

// ❌ Forbidden
if (request.status === 'pending') { ... }
```

### 8.2 DRY principle

- Shared UI patterns (panel headers, KPI cards) are extracted into reusable components.
- Queue position calculation lives in one utility function, used by both `useSimulationActions` and `useDashboardData`.
- Factory functions (`createPickupRequest`, `createGate`) are the single way to create entities in both production code and tests.

### 8.3 Separation of concerns

| Layer | Responsibility | May depend on |
|-------|---------------|---------------|
| **Pages** | Layout composition only | Components, composables |
| **Components** | Rendering + user interaction | Props, emits, composables |
| **Composables** | Business logic + derived state | Stores, utils, constants |
| **Stores** | Raw state + simple mutations | Types, constants |
| **Constants** | Static values | Types only |
| **Utils** | Pure functions | Types, constants |
| **Types** | Type definitions | Nothing |

Components must not directly mutate store state — they call composable actions.

### 8.4 Naming conventions

| Kind | Convention | Example |
|------|-----------|---------|
| Components | PascalCase, prefixed by panel | `StaffQueueTabs.vue` |
| Composables | `use` + PascalCase | `useSimulationActions.ts` |
| Stores | camelCase noun | `simulation.ts` |
| Constants | UPPER_SNAKE_CASE objects | `PICKUP_STATUS` |
| Types/Interfaces | PascalCase | `PickupRequest` |
| Utils | camelCase verb | `computeNextPosition` |
| Test files | `*.test.ts` matching source | `simulation.test.ts` |
| data-* attributes | kebab-case with `data-walkthrough` or `data-testid` prefix | `data-testid="kpi-completed"` |

### 8.5 Component size limit

No single `.vue` file should exceed ~200 lines of `<script setup>`. If it does, extract logic into a composable or split into subcomponents.

---

## 9. Test Strategy

### 9.1 Tooling

- **Runner:** Vitest (aligned with Nuxt ecosystem)
- **Component testing:** @vue/test-utils + @nuxt/test-utils (if needed)
- **Assertions:** Vitest built-in (`expect`, `vi.fn()`, `vi.useFakeTimers()`)

### 9.2 What to test

| Layer | What to cover | Priority |
|-------|--------------|----------|
| **Stores** | State mutations, computed getters, edge cases (empty state, duplicates) | Critical |
| **Composables** | Action logic: status transitions, queue position math, priority reordering, invalid transition handling | Critical |
| **Utils** | `computeNextPosition`, `formatDuration`, factory functions, seeded random | Critical |
| **Constants** | Status groupings are consistent (ACTIVE + TERMINAL = all statuses) | High |
| **Scenario execution** | Each built-in scenario produces expected end-state | High |
| **Components** | Panel rendering given store state, interaction triggers correct actions | Medium |

### 9.3 Test conventions

```typescript
// ✅ Test structure
describe('useSimulationActions', () => {
  describe('assignToGate', () => {
    it('transitions approved request to in_queue with correct position', () => { ... })
    it('ignores assignment if request is already completed', () => { ... })
    it('recalculates positions for existing gate queue', () => { ... })
  })
})

// ✅ Use factories, not inline objects
const request = createPickupRequest({ status: PICKUP_STATUS.APPROVED })

// ✅ Use constants, not strings
expect(request.status).toBe(PICKUP_STATUS.IN_QUEUE)
```

### 9.4 Coverage targets

- Stores: ≥ 95% line coverage
- Composables (actions, simulation): ≥ 90% line coverage
- Utils: 100% line coverage
- Components: ≥ 70% line coverage (focus on interaction, not layout)

---

## 10. Implementation Status

> Last updated: 2026-03-18

| WP | Name | Status | Notes |
|----|------|--------|-------|
| 1 | Project Scaffold & Design Tokens | **Done** | All config, dependencies, shadcn-vue primitives, and design tokens in place |
| 2 | Types, Constants & Utility Functions | **Done** | 12 source files, 6 test files (44 tests passing) |
| 3 | Pinia Stores | Not started | Next up — no blockers |
| 4 | Simulation Engine & Actions | Not started | Blocked by WP-3 |
| 5 | Layout Shell & Panel Grid | Not started | No blockers (depends only on WP-1) |
| 6 | Customer Panel | Not started | Blocked by WP-4, WP-5 |
| 7 | Staff Panel | Not started | Blocked by WP-4, WP-5 |
| 8 | Analytics Panel | Not started | Blocked by WP-4, WP-5 |
| 9 | Scenario System | Not started | Blocked by WP-4 |
| 10 | Guided Walkthrough | Not started | Blocked by WP-6–9 |

### What exists today

```
playground/
├── app/
│   ├── app.vue                    # Root shell (NuxtLayout + Sonner toaster)
│   ├── assets/css/tailwind.css    # Full design token system (oklch color space)
│   ├── components/ui/             # 14 shadcn-vue suites (73 .vue files)
│   ├── constants/
│   │   ├── status.ts              # PICKUP_STATUS, groupings, STATUS_LABELS, STATUS_VARIANT
│   │   └── defaults.ts            # DEFAULT_GATES, processing duration, seed data
│   ├── layouts/default.vue        # Header + slot
│   ├── lib/utils.ts               # cn() + valueUpdater()
│   ├── pages/index.vue            # Placeholder heading
│   ├── types/
│   │   ├── pickup-request.ts      # PickupRequest, PickupStatus (re-export)
│   │   ├── gate.ts                # Gate, GateWithCount
│   │   ├── simulation.ts          # SimulationSpeed, SimulationState, SimulationEvent
│   │   └── scenario.ts            # Scenario, ScenarioStep, WalkthroughStep, SimulationActions
│   └── utils/
│       ├── id.ts                  # generateId() (crypto.randomUUID)
│       ├── random.ts              # seededRandom(), pickRandom(), randomBetween()
│       ├── formatDuration.ts      # formatDurationMs(), formatDurationMinutes()
│       ├── factories.ts           # createPickupRequest(), createGate(), createScenarioOrder()
│       └── queue.ts               # computeNextPosition(), recalculatePositions()
├── nuxt.config.ts                 # SSR off, modules: shadcn-nuxt + @pinia/nuxt
├── vitest.config.ts               # happy-dom, path aliases
├── components.json                # shadcn-vue new-york style, neutral base
├── tsconfig.json
├── package.json                   # Nuxt 4.3, Vue 3.5, Pinia, TanStack, Unovis, etc.
└── tests/unit/
    ├── utils.test.ts              # cn() + valueUpdater() tests (WP-1)
    ├── constants/
    │   └── status.test.ts         # Status grouping consistency, label/variant completeness
    └── utils/
        ├── factories.test.ts      # Factory defaults, overrides, scenario orders
        ├── formatDuration.test.ts # Ms + minutes formatting, null/edge cases
        ├── queue.test.ts          # Position calc: empty/occupied gates, priority, immutability
        └── random.test.ts         # Seeded determinism, pickRandom, randomBetween bounds
```

**Not yet created:** `app/stores/`, `app/composables/`, `app/components/{panels,layout,customer,staff,analytics,scenario}/`.

---

## 11. Work Packages

Each work package (WP) is a self-contained unit of work that can be developed and reviewed independently. Dependencies are noted where sequential ordering is required.

### WP-1: Project Scaffold & Design Tokens ✓

**Status: Complete**

**Scope:** Initialize the Nuxt 4 app with all dependencies, Tailwind config, shadcn-vue setup, and the shared design tokens from the staff app.

**Deliverables:**
- `package.json` with all dependencies (Nuxt, Pinia, TanStack Table, shadcn-vue, Unovis, Vitest, etc.)
- `nuxt.config.ts` (SSR disabled, modules: shadcn-nuxt, @pinia/nuxt)
- `tsconfig.json`
- `components.json` (shadcn-vue config matching staff app)
- `vitest.config.ts` with path aliases
- `app/assets/css/tailwind.css` (design tokens ported from staff)
- `app/app.vue` (root with Suspense + NuxtLayout)
- `app/lib/utils.ts` (cn utility)
- Copied shadcn-vue UI primitives in `app/components/ui/` (Badge, Button, Card, Dialog, DropdownMenu, Input, Label, Select, Separator, Sheet, Sonner, Table, Tabs, Tooltip)
- Empty `app/pages/index.vue` with "Playground" heading

**Tests:** Vitest runs with zero errors on an empty test suite.

**Dependencies:** None (start here).

---

### WP-2: Types, Constants & Utility Functions ✓

**Status: Complete**

**Scope:** Establish the type system, all constants, and pure utility functions.

**Deliverables:**
- `app/types/pickup-request.ts` — `PickupRequest`, `PickupStatus`
- `app/types/gate.ts` — `Gate`, `GateWithCount`
- `app/types/simulation.ts` — `SimulationSpeed`, `SimulationState`, `SimulationEvent`
- `app/types/scenario.ts` — `Scenario`, `ScenarioStep`, `WalkthroughStep`, `SimulationActions`
- `app/constants/status.ts` — `PICKUP_STATUS`, `ACTIVE_STATUSES`, `TERMINAL_STATUSES`, `GATE_STATUSES`, `STATUS_LABELS`, `STATUS_VARIANT`, `isActiveStatus()`
- `app/constants/defaults.ts` — `DEFAULT_GATES`, `DEFAULT_GATE_COUNT`, `DEFAULT_PROCESSING_DURATION_MS`, `DEFAULT_SIMULATION_SPEED`, `SEED_COMPANIES`, `SEED_ORDER_PREFIXES`
- `app/utils/id.ts` — `generateId()`
- `app/utils/random.ts` — `seededRandom()`, `pickRandom()`, `randomBetween()`
- `app/utils/formatDuration.ts` — `formatDurationMs()`, `formatDurationMinutes()` (ported from staff app)
- `app/utils/factories.ts` — `createPickupRequest()`, `createGate()`, `createScenarioOrder()`
- `app/utils/queue.ts` — `computeNextPosition()`, `recalculatePositions()`

**Tests:** 6 test files, 44 tests passing.
- `tests/unit/constants/status.test.ts` — ACTIVE + TERMINAL covers all statuses, no overlap, label/variant completeness.
- `tests/unit/utils/factories.test.ts` — factories produce valid objects with correct defaults, overrides applied.
- `tests/unit/utils/queue.test.ts` — position calculation for empty gate, occupied gate, priority sorting, immutability.
- `tests/unit/utils/formatDuration.test.ts` — ms + minutes formatting, null/undefined/zero edge cases.
- `tests/unit/utils/random.test.ts` — seeded random determinism, pickRandom, randomBetween bounds.

**Dependencies:** WP-1.

---

### WP-3: Pinia Stores

**Scope:** Implement the three Pinia stores: queue, gates, simulation.

**Deliverables:**
- `app/stores/queue.ts` — `useQueueStore`
  - State: `requests: PickupRequest[]`
  - Getters: `pendingItems`, `approvedItems`, `inQueueItems`, `processingItems`, `completedItems`, `cancelledItems`, `activeItems`, `requestById(id)`
  - Actions: `addRequest`, `updateRequest`, `removeRequest`, `setRequests`, `clear`
- `app/stores/gates.ts` — `useGatesStore`
  - State: `gates: GateWithCount[]`
  - Getters: `activeGates`, `sortedActiveGates`, `gateById(id)`
  - Actions: `setGates`, `updateGate`, `recountQueues(requests)`
- `app/stores/simulation.ts` — `useSimulationStore`
  - State: `speed`, `isRunning`, `elapsedMs`, `selectedCustomerRequestId`, `autoProcessEnabled`, `activityFeed: SimulationEvent[]`
  - Actions: `setSpeed`, `toggleRunning`, `tick`, `selectCustomerRequest`, `addEvent`, `reset`

**Tests:**
- `tests/unit/stores/queue.test.ts` — add/update/remove, getter filtering by status, clear.
- `tests/unit/stores/gates.test.ts` — sorted getters, recountQueues accuracy.
- `tests/unit/stores/simulation.test.ts` — tick advances elapsed, speed changes, reset clears all state, event feed capping at 20.

**Dependencies:** WP-2.

---

### WP-4: Simulation Engine & Actions Composable

**Scope:** The core business logic — simulation clock, all queue actions, and auto-processing.

**Deliverables:**
- `composables/useSimulation.ts`
  - Starts/stops the simulation clock interval.
  - On each tick: advances `elapsedMs`, checks for auto-completable processing items.
  - Respects `speed` (1x/2x/5x).
  - Uses `vi.useFakeTimers()` in tests.
- `composables/useSimulationActions.ts`
  - Every action from section 3.3: `submitOrder`, `approveRequest`, `assignToGate`, `reorderQueue`, `setPriority`, `startProcessing`, `completeRequest`, `cancelRequest`, `moveToGate`.
  - Each action validates current status before transitioning.
  - Each action logs to `simulation.addEvent()`.
  - Each action updates gate queue counts via `gates.recountQueues()`.
- `composables/useWaitTimeEstimate.ts`
  - Ported from customer app. Takes `queuePosition` and completed requests, returns `{ min, max }` in ms.
- `composables/useDashboardData.ts`
  - Ported from staff app. Returns `completedCount`, `avgWaitTime`, `avgProcessingTime`, `currentlyWaiting`, `chartData`, `processingGateRows`.

**Tests:**
- `tests/unit/composables/useSimulationActions.test.ts`
  - **Status transitions:** every valid transition produces correct next state.
  - **Invalid transitions:** attempting to complete a pending request is a no-op.
  - **Queue positions:** assigning to a gate with 2 existing items gets position 3.
  - **Priority:** setting priority moves item to position 1, shifts others.
  - **Gate transfer:** moveToGate recalculates positions in both source and target gate.
  - **Activity feed:** each action adds an event.
- `tests/unit/composables/useSimulation.test.ts`
  - Clock ticks advance elapsed time correctly at each speed.
  - Auto-complete fires after processing duration threshold.
  - Pause/resume works.
- `tests/unit/composables/useWaitTimeEstimate.test.ts`
  - Returns null with < 3 completed requests.
  - Returns correct range with sufficient data.
- `tests/unit/composables/useDashboardData.test.ts`
  - Correctly computes KPIs from mixed-status request set.
  - Chart data groups by gate.

**Dependencies:** WP-3.

---

### WP-5: Layout Shell & Panel Grid

**Scope:** The responsive 3-panel layout, panel headers, and phone frame.

**Deliverables:**
- `app/pages/index.vue` — composes `PlaygroundHeader`, `ScenarioBar`, and `PanelGrid`
- `app/components/layout/PlaygroundHeader.vue` — title, "Take the Tour" button, speed control, reset
- `app/components/layout/PanelGrid.vue` — responsive CSS Grid (3-col → 2-col → tabs)
- `app/components/layout/PanelHeader.vue` — icon + title + description, reused by all panels
- `app/components/layout/PhoneFrame.vue` — CSS-only phone bezel wrapper
- `app/components/layout/PanelTabBar.vue` — mobile tab bar for switching panels

**Tests:**
- `tests/components/PanelGrid.test.ts` — renders three slot areas.
- `tests/components/PhoneFrame.test.ts` — renders slot content inside frame.

**Dependencies:** WP-1.

---

### WP-6: Customer Panel

**Scope:** The customer-facing view rendered inside the phone frame.

**Deliverables:**
- `app/components/panels/CustomerPanel.vue` — orchestrates subcomponents based on selected request status
- `app/components/customer/CustomerOrderForm.vue` — order number + email inputs, submit triggers `submitOrder`
- `app/components/customer/CustomerStatusCard.vue` — status-dependent display with transitions
- `app/components/customer/CustomerQueuePosition.vue` — large gate number, position, wait estimate
- `app/components/customer/CustomerCompletedState.vue` — checkmark animation + "Pickup complete" message

**Behavior:**
- If `selectedCustomerRequestId` is null, show `CustomerOrderForm`.
- Otherwise, show `CustomerStatusCard` which switches sub-content based on `request.status`.
- Wait estimate uses `useWaitTimeEstimate`.

**Tests:**
- `tests/components/CustomerPanel.test.ts` — renders form when no request selected, renders status when request exists.
- `tests/components/CustomerOrderForm.test.ts` — emits submit with order number and email, validates required fields.

**Dependencies:** WP-4, WP-5.

---

### WP-7: Staff Panel

**Scope:** The staff dashboard with queue table, gate tabs, and processing view.

**Deliverables:**
- `app/components/panels/StaffPanel.vue` — orchestrates processing table + queue tabs
- `app/components/staff/StaffProcessingTable.vue` — now-processing rows per gate with elapsed timer
- `app/components/staff/StaffQueueTabs.vue` — Tabs container: All Requests + per-gate tabs
- `app/components/staff/StaffAllRequestsTable.vue` — TanStack table with gate dropdown, status badge, actions
- `app/components/staff/StaffGateQueue.vue` — drag-and-drop list with priority toggle + complete button
- `app/components/staff/StaffStatusBadge.vue` — ported from production `StatusBadge.vue`
- `app/components/staff/StaffGateSelect.vue` — gate assignment dropdown
- `app/components/staff/StaffRequestActions.vue` — action buttons (approve, complete, cancel)
- `app/components/staff/columns.ts` — TanStack column definitions (ported pattern from production)

**Behavior:**
- Gate dropdown triggers `assignToGate` → customer panel + analytics update.
- Drag-and-drop in gate tabs triggers `reorderQueue`.
- Complete button triggers `startProcessing` or `completeRequest` depending on current status.
- Priority star toggles `setPriority`.

**Tests:**
- `tests/components/StaffPanel.test.ts` — renders processing section and tabs.
- `tests/components/StaffAllRequestsTable.test.ts` — renders rows for each request, gate dropdown triggers action.
- `tests/components/StaffGateQueue.test.ts` — renders items in position order, priority items first.

**Dependencies:** WP-4, WP-5.

---

### WP-8: Analytics Panel

**Scope:** Live KPIs, queue depth chart, and activity feed.

**Deliverables:**
- `app/components/panels/AnalyticsPanel.vue` — orchestrates KPIs + chart + feed
- `app/components/analytics/AnalyticsKpiGrid.vue` — 2×2 grid of KPI cards
- `app/components/analytics/AnalyticsKpiCard.vue` — icon + label + value with `data-testid`
- `app/components/analytics/AnalyticsQueueChart.vue` — Unovis horizontal bar chart (queue per gate)
- `app/components/analytics/AnalyticsActivityFeed.vue` — scrollable event list from simulation store

**Tests:**
- `tests/components/AnalyticsKpiGrid.test.ts` — renders 4 KPI cards with correct values from store.
- `tests/components/AnalyticsActivityFeed.test.ts` — renders events in reverse chronological order, caps at 20.

**Dependencies:** WP-4, WP-5.

---

### WP-9: Scenario System

**Scope:** Predefined scenarios and the scenario bar UI.

**Deliverables:**
- `app/constants/scenarios.ts` — `SCENARIOS` array with all 4 scenario definitions (Single Order, Morning Rush, Priority Override, Gate Offline)
- `app/composables/useScenarioRunner.ts` — executes scenario steps with virtual time delays, manages running state
- `app/components/scenario/ScenarioBar.vue` — horizontal bar with scenario buttons + speed + reset
- `app/components/scenario/ScenarioButton.vue` — button with icon, label, tooltip description
- `app/components/scenario/SimulationSpeedControl.vue` — segmented control for 1x/2x/5x
- `app/components/scenario/ResetButton.vue` — reset with confirmation

**Tests:**
- `tests/unit/composables/useScenarioRunner.test.ts` — each scenario produces expected number of requests in expected statuses.
- `tests/unit/constants/scenarios.test.ts` — all scenarios have valid structure, non-empty steps, unique IDs.

**Dependencies:** WP-4.

---

### WP-10: Guided Walkthrough

**Scope:** The optional step-by-step overlay that demonstrates the cause-and-effect flow.

**Deliverables:**
- `app/constants/walkthrough.ts` — `WALKTHROUGH_STEPS` array
- `app/composables/useGuidedWalkthrough.ts` — stepper state, auto-actions per step
- `app/components/scenario/WalkthroughOverlay.vue` — dimmed backdrop with highlight cutout
- `app/components/scenario/WalkthroughTooltip.vue` — positioned tooltip with step content + navigation

**Tests:**
- `tests/unit/composables/useGuidedWalkthrough.test.ts` — step navigation (next, previous, skip), auto-action execution, completion state.
- `tests/unit/constants/walkthrough.test.ts` — all steps have required fields, valid panel references.

**Dependencies:** WP-6, WP-7, WP-8, WP-9.

---

### Dependency Graph

```
WP-1  Project Scaffold
 │
 ├─► WP-2  Types, Constants, Utils
 │    │
 │    └─► WP-3  Pinia Stores
 │         │
 │         └─► WP-4  Simulation Engine & Actions
 │              │
 │              ├─► WP-6  Customer Panel ──────┐
 │              ├─► WP-7  Staff Panel ─────────┤
 │              ├─► WP-8  Analytics Panel ─────┤
 │              └─► WP-9  Scenario System ─────┤
 │                                             │
 └─► WP-5  Layout Shell & Panel Grid ─────────┤
                                               │
                                    WP-10  Guided Walkthrough
```

**Critical path:** WP-1 → WP-2 → WP-3 → WP-4 → WP-7 (staff panel is the most complex)

**Parallelizable after WP-4 + WP-5:**
- WP-6, WP-7, WP-8, WP-9 can all be built in parallel.
- WP-10 requires all panels to be complete.

---

### Estimated Complexity per WP

| WP | Name | Files | Test files | Complexity |
|----|------|-------|-----------|------------|
| 1 | Scaffold | ~20 (mostly config + UI copies) | 0 | Low |
| 2 | Types & Utils | ~12 | 5 | Low |
| 3 | Stores | 3 | 3 | Medium |
| 4 | Simulation Engine | 4 | 4 | High |
| 5 | Layout Shell | 5 | 2 | Medium |
| 6 | Customer Panel | 5 | 2 | Medium |
| 7 | Staff Panel | 9 | 3 | High |
| 8 | Analytics Panel | 5 | 2 | Medium |
| 9 | Scenario System | 6 | 2 | Medium |
| 10 | Walkthrough | 4 | 2 | Medium |
