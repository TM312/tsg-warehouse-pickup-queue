# Playground UX Polish — Specification

## Vision

The Playground is our primary sales tool. When a prospect opens it, they should immediately *feel* the product — not read about it. Within 5 seconds of loading, they should see a living warehouse queue in motion and intuitively understand what the system does. Within 30 seconds, they should think "this is polished, these people know what they're doing."

Every improvement in this spec serves one principle: **reduce the gap between opening the page and understanding the value proposition.** We achieve this by making the simulation feel alive (animations, real-time feedback, visual cause-and-effect between panels), removing friction (auto-play, smart defaults, guided discovery), and raising perceived quality (micro-interactions, consistent design, responsive polish).

The Playground must never feel like a prototype or a dev tool. It should feel like a product demo from a company that ships quality software.

---

## Current State Summary

- **Framework:** Nuxt 4 + Vue 3, Tailwind 4, shadcn-nuxt, Pinia
- **Layout:** 3-panel responsive grid (Customer phone mockup | Staff dashboard | Analytics)
- **Simulation:** Tick-based loop with 1x/2x/5x speed, 4 scenarios, 6-step walkthrough
- **Components:** ~100 Vue files, solid architecture, clean state management
- **Current polish level:** Functional and well-structured, but mostly static. Minimal animations, no auto-play, no visual linking between panels, basic chart, generic empty states.

---

## Work Packages

### WP-1: Auto-Play & First Load Experience ✅

**Goal:** Eliminate the empty state. Visitors see a running simulation immediately.

**Status:** Implemented

**Scope:**
- On first page load, automatically start the "Morning Rush" scenario after a brief delay (~500ms)
- Add a subtle intro animation: panels fade/slide in sequentially (customer → staff → analytics, 150ms stagger)
- Show a dismissible banner or toast: *"Watch the simulation or take the guided tour →"*
- If the user has already visited (localStorage flag), skip auto-play and show the scenario bar in its default state
- Ensure the customer panel auto-selects the first submitted order so it's not showing the empty form

**Implementation details:**
- New: `app/constants/autoplay.ts` — named constants for delay (500ms), panel stagger (150ms), animation duration (400ms), toast duration (8s), and `STORAGE_KEY.HAS_VISITED` localStorage key
- New: `app/composables/useAutoPlay.ts` — orchestrates first-visit detection (localStorage), delayed Morning Rush auto-start via `useScenarioRunner`, auto-selection of first customer request, Sonner toast with "Start Tour" CTA linking to `useGuidedWalkthrough().start()`, and cleanup on unmount
- Modified: `app/pages/index.vue` — added `<script setup>` wiring `useAutoPlay` via `onMounted`/`onUnmounted`, passes `introAnimate` prop to PanelGrid
- Modified: `app/components/layout/PanelGrid.vue` — added `introAnimate` prop, CSS `@keyframes panel-intro` (fade+slide-up, 400ms ease-out) with staggered `animation-delay` per panel column, respects `prefers-reduced-motion`
- No changes needed to `useScenarioRunner.ts` or `simulation.ts` — existing public APIs were sufficient

**Test coverage:**
- `tests/unit/composables/useAutoPlay.test.ts` — 16 tests covering first-visit detection, return-visit skip, walkthrough-active guard, scenario trigger timing, customer request auto-selection, localStorage read/write error handling, toast emission, cleanup/idempotency
- `tests/unit/constants/autoplay.test.ts` — 5 constant value assertions

**Acceptance criteria:**
- [x] Fresh page load shows simulation running within 1 second
- [x] Panels animate in on first load
- [x] Customer panel shows a live order status (not the empty form)
- [x] Return visitors see default state (no auto-play)
- [x] User can still reset and explore manually

---

### WP-2: State Transition Animations ✅

**Goal:** Queue changes, status updates, and panel switches feel fluid, not abrupt.

**Status:** Implemented

**Scope:**
- **Queue list:** Use Vue `<TransitionGroup>` on staff gate queues. Items slide in (translateY + opacity), slide out on complete/cancel, reorder smoothly.
- **Status card (customer panel):** Crossfade between states (pending → approved → in_queue etc.) using `<Transition mode="out-in">` with a 200ms fade.
- **KPI numbers:** Animate value changes with a count-up/count-down tween (e.g., 0 → 7 over 400ms). Use a small composable (`useAnimatedNumber`) with `requestAnimationFrame`.
- **Processing table rows:** Subtle background pulse when a gate starts processing a new order.
- **Analytics activity feed:** New items slide in from top with opacity transition.

**Implementation details:**
- New: `app/constants/animations.ts` — named constants (`ANIMATION` object) for queue item enter (300ms), leave (200ms), status crossfade (200ms), KPI tween (400ms), processing pulse (1500ms), feed item enter (300ms)
- New: `app/composables/useAnimatedNumber.ts` — rAF-driven tween composable with ease-out cubic easing, `useMediaQuery` for `prefers-reduced-motion` detection, cleanup via `onScopeDispose`
- New: `app/composables/useProcessingPulse.ts` — tracks per-gate processing request changes, exposes `isPulsing(gateId)`, auto-clears after `PROCESSING_PULSE_MS`, skips when reduced-motion active
- Modified: `app/components/staff/StaffGateQueue.vue` — replaced plain `<div>` list container with `<TransitionGroup name="queue-item">`, Sortable.js accesses DOM via `$el` on the TransitionGroup ref, scoped CSS for enter/leave/reduced-motion
- Modified: `app/components/customer/CustomerStatusCard.vue` — wrapped status content in `<Transition mode="out-in" name="status-fade">` with `:key="request.status"`, scoped CSS for 200ms opacity crossfade with reduced-motion override
- Modified: `app/components/analytics/AnalyticsKpiCard.vue` — added optional `numericValue` prop, integrates `useAnimatedNumber` for count-based KPIs (completedCount, currentlyWaiting), duration-formatted KPIs display string value directly
- Modified: `app/components/analytics/AnalyticsKpiGrid.vue` — passes `numericValue` to KPI cards when `kpi.animate` flag is true
- Modified: `app/constants/analytics.ts` — added `animate: boolean` field to `KpiDefinition` interface, set `true` for completedCount and currentlyWaiting
- Modified: `app/components/staff/StaffProcessingTable.vue` — integrates `useProcessingPulse`, applies `processing-pulse` class on rows, scoped `@keyframes row-pulse` with amber OKLCH background color pulse
- Modified: `app/components/analytics/AnalyticsActivityFeed.vue` — replaced `<div>` wrapper with `<TransitionGroup name="feed-item">`, scoped CSS for slide-in-from-top (translateY -12px) with reduced-motion override

**Test coverage:**
- `tests/unit/composables/useAnimatedNumber.test.ts` — 7 tests covering tween behavior, reduced-motion instant jump, mid-tween target change cancellation, count-down, rounding, scope dispose cleanup
- `tests/unit/composables/useProcessingPulse.test.ts` — 6 tests covering new-request pulse detection, auto-clear after timeout, no pulse on same request, no pulse on idle transition, reduced-motion skip, timeout cleanup on dispose
- `tests/unit/constants/animations.test.ts` — 6 constant value assertions

**Acceptance criteria:**
- [x] Queue items animate in/out (no pop-in/pop-out)
- [x] Customer status changes crossfade smoothly
- [x] KPI numbers tween between values (not instant jump)
- [x] Processing table shows brief highlight when new item starts
- [x] Activity feed items slide in from top
- [x] All animations respect `prefers-reduced-motion`

---

### WP-3: Cross-Panel Visual Linking

**Goal:** When something happens in one panel, the effect is visually echoed in the other panels so viewers understand they're connected.

**Scope:**
- When a staff action occurs (approve, assign, start processing, complete), briefly highlight (border pulse or glow, ~600ms) the corresponding element in:
  - **Customer panel:** The status card or queue position
  - **Analytics panel:** The relevant KPI card and/or activity feed entry
- Use a lightweight event bus or shared composable (`useCrossPanelHighlight`) that emits highlight targets.
- Highlight style: a brief `ring-2 ring-primary/50` that fades out via CSS animation.
- On mobile/tablet where panels are hidden, show a subtle badge/dot on the tab indicating "something changed" (clear on panel switch).

**Components affected:**
- New: `app/composables/useCrossPanelHighlight.ts`
- `app/components/customer/CustomerStatusCard.vue` — highlight receiver
- `app/components/analytics/AnalyticsKpiCard.vue` — highlight receiver
- `app/components/analytics/AnalyticsActivityFeed.vue` — highlight receiver
- `app/components/layout/PanelTabBar.vue` — unseen-change badge (mobile)
- `app/composables/useSimulationActions.ts` — emit highlight events after actions

**Acceptance criteria:**
- [ ] Approving a request in staff panel visibly pulses the customer status card
- [ ] Completing a request pulses the "Completed Today" KPI card
- [ ] Highlights fade out naturally (not stuck on)
- [ ] Mobile tab bar shows dot indicator for panels with unseen changes
- [ ] No performance degradation from event bus

---

### WP-4: Live Timeline Chart

**Goal:** Replace the static bar chart with a time-series chart that tells a story as the simulation runs.

**Scope:**
- Replace `AnalyticsQueueChart.vue` (horizontal bars) with a stacked area chart showing queue depth over time, one series per gate.
- X-axis: simulation elapsed time (mm:ss). Y-axis: number of items in queue.
- Data points pushed every simulation tick (or every N ticks to avoid density).
- Use Unovis (already installed) `VisXYContainer` + `VisArea` + `VisAxis` for rendering.
- Keep it compact — same vertical space as the current bar chart (~120px height).
- Gate colors should match the rest of the UI (use Tailwind theme colors).
- On reset, clear the chart data.

**Components affected:**
- `app/components/analytics/AnalyticsQueueChart.vue` — full rewrite
- `app/stores/simulation.ts` or new: `app/composables/useQueueHistory.ts` — track time-series data
- `app/composables/useSimulation.ts` — push data point per tick

**Acceptance criteria:**
- [ ] Chart shows stacked area for each gate over time
- [ ] Updates in real-time as simulation runs
- [ ] X-axis shows elapsed time, Y-axis shows count
- [ ] Chart resets cleanly on simulation reset
- [ ] Compact height, no vertical scroll needed
- [ ] Looks polished (smooth curves, proper colors, minimal axis clutter)

---

### WP-5: Simulation Timeline & Scenario Progress

**Goal:** Give viewers a sense of narrative — where they are in time and in the scenario.

**Scope:**
- Add a thin progress bar below the scenario bar showing scenario completion (step X of Y).
- Show elapsed simulation time prominently in the scenario bar area (e.g., `02:15` in monospace).
- During a scenario, show small event markers on the progress bar at the relative positions where steps occur.
- When no scenario is running, hide the progress bar and show only elapsed time.

**Components affected:**
- New: `app/components/scenario/ScenarioProgressBar.vue`
- `app/components/scenario/ScenarioBar.vue` — add elapsed time display, mount progress bar
- `app/composables/useScenarioRunner.ts` — expose step progress (currentStep / totalSteps)

**Acceptance criteria:**
- [ ] Progress bar shows scenario completion percentage
- [ ] Elapsed simulation time is always visible when simulation is running
- [ ] Event markers visible on progress bar
- [ ] Progress bar hidden when no scenario active
- [ ] Clean visual integration with existing scenario bar

---

### WP-6: Processing Progress & Gate Status Indicators

**Goal:** Make gate activity scannable at a glance — what's busy, what's idle, how far along.

**Scope:**
- **Processing progress bar:** In `StaffProcessingTable` and `StaffGateQueue` "Now Processing" section, show a thin progress bar under the processing item indicating elapsed vs expected duration (120s default). Color: amber fill on muted background.
- **Gate status dots:** Add a colored dot next to each gate label throughout the UI:
  - Green: idle (no items processing)
  - Amber: processing (currently working an order)
  - Red: offline (gate deactivated)
- Apply gate dots in: processing table headers, queue tab labels, analytics queue chart labels, gate select dropdown items.
- **Queue tab badges:** Show item count in each gate's tab label: "Gate 1 (3)"

**Components affected:**
- `app/components/staff/StaffProcessingTable.vue` — progress bar per row
- `app/components/staff/StaffGateQueue.vue` — progress bar on "Now Processing"
- `app/components/staff/StaffQueueTabs.vue` — count badges + gate dots in tab labels
- `app/components/staff/StaffGateSelect.vue` — gate dots in dropdown items
- `app/components/analytics/AnalyticsQueueChart.vue` — gate dots in chart labels
- New: `app/components/ui/GateStatusDot.vue` — small reusable dot component

**Acceptance criteria:**
- [ ] Processing progress bar fills over 120s and is visible in both table and gate queue views
- [ ] Gate status dots are color-correct (green/amber/red)
- [ ] Gate dots appear consistently across all gate references in UI
- [ ] Queue tab labels show item count
- [ ] Progress bar resets when new item starts processing

---

### WP-7: Customer Panel Polish

**Goal:** The phone mockup is the visual hero — make it feel like a real app on a real phone.

**Scope:**
- **Phone status bar:** Add a fake iOS status bar inside the phone frame (time centered, signal + wifi + battery on right). Static content, just visual fidelity.
- **Home indicator:** Add a thin rounded bar at the bottom of the phone frame (iOS style).
- **Completion celebration:** When order reaches COMPLETED status, play a brief confetti burst animation (CSS-only, no library). Use `@keyframes` with pseudo-elements or a small set of colored dots.
- **"Submit another" button:** On completed state, show a button that clears selection and returns to the order form.
- **Processing state improvement:** Show elapsed time and a circular progress indicator instead of just a spinner.
- **Form UX:** Auto-focus the order number input when the form appears. Add a subtle success state (brief green border flash) after submission before switching to status view.

**Components affected:**
- `app/components/layout/PhoneFrame.vue` — status bar, home indicator
- `app/components/customer/CustomerCompletedState.vue` — confetti, "submit another" button
- `app/components/customer/CustomerStatusCard.vue` — processing elapsed time + progress
- `app/components/customer/CustomerOrderForm.vue` — auto-focus, success flash
- New: `app/components/customer/CustomerConfetti.vue` (or CSS in CompletedState)

**Acceptance criteria:**
- [ ] Phone frame has iOS-style status bar and home indicator
- [ ] Confetti plays on completion (brief, tasteful, CSS-only)
- [ ] "Submit another order" button works and returns to form
- [ ] Processing state shows elapsed time
- [ ] Order form auto-focuses on mount
- [ ] All additions fit within 280px phone width

---

### WP-8: Scenario Cards & Descriptions

**Goal:** Visitors exploring solo should understand what each scenario demonstrates before clicking it.

**Scope:**
- Replace the current row of small icon buttons with larger clickable cards in a horizontal scrollable strip (or compact grid).
- Each card shows: icon, title, 1-line description, estimated duration badge.
- Cards have hover state (subtle lift/shadow) and active state (border highlight while running).
- Add estimated durations to scenario constants (calculate from step delays).
- On mobile, cards stack vertically in a collapsible accordion or horizontal scroll.

**Components affected:**
- `app/components/scenario/ScenarioBar.vue` — layout restructure
- `app/components/scenario/ScenarioButton.vue` — redesign to card format
- `app/constants/scenarios.ts` — add duration estimates and richer descriptions
- Possibly new: `app/components/scenario/ScenarioCard.vue` if button is replaced entirely

**Acceptance criteria:**
- [ ] Each scenario shows title, description, and estimated duration
- [ ] Cards have hover and active visual states
- [ ] Running scenario card is visually distinct (highlighted border, subtle animation)
- [ ] Layout works on mobile (scrollable or collapsible)
- [ ] Descriptions are concise and informative (1 line max)

---

### WP-9: Toast Notifications on Key Events

**Goal:** Surface activity to viewers without requiring them to stare at one panel.

**Scope:**
- Use Sonner (already installed) to show brief toast notifications on key simulation events:
  - Order submitted: "Order SO-12345 submitted" (info)
  - Order approved: "Order SO-12345 approved" (success)
  - Processing started: "Gate 1 started processing SO-12345" (info)
  - Order completed: "SO-12345 pickup complete!" (success)
  - Gate offline: "Gate 3 taken offline" (warning)
- Toasts auto-dismiss after 3 seconds.
- Toasts should be subtle and positioned bottom-right (not blocking scenario bar or phone frame).
- Add a toggle in the scenario bar to mute/unmute toasts (icon button, default: on). Persist preference in localStorage.
- During walkthrough, suppress toasts to avoid distraction.

**Components affected:**
- `app/composables/useSimulationActions.ts` — emit toasts after actions
- `app/layouts/default.vue` — Toaster position configuration
- `app/components/scenario/ScenarioBar.vue` — mute toggle button
- `app/stores/simulation.ts` — toastsMuted preference

**Acceptance criteria:**
- [ ] Key events trigger toast notifications
- [ ] Toasts auto-dismiss in 3 seconds
- [ ] Mute toggle works and persists across sessions
- [ ] No toasts during walkthrough
- [ ] Toasts don't overlap phone frame or scenario bar

---

### WP-10: Empty State Illustrations

**Goal:** Blank panels should feel intentional and guide the viewer to action.

**Scope:**
- Design simple, icon-based empty states (no external illustrations — use Lucide icons composed together) for:
  - **Customer panel (no order selected):** Truck + arrow icon, "Run a scenario or submit an order to see the customer view"
  - **Staff processing table (nothing processing):** Package icon, "No orders processing — run a scenario to get started"
  - **Staff queue (empty gate):** Inbox icon, "This gate's queue is empty"
  - **Analytics (no data):** BarChart icon, "Analytics will appear as orders flow through the system"
- Each empty state: centered icon (size-12, muted-foreground), heading (text-sm font-medium), subtext (text-xs muted-foreground).
- Include a "Run Morning Rush →" button in the main empty states (customer, staff) that triggers the scenario.

**Components affected:**
- `app/components/customer/CustomerOrderForm.vue` — or a new wrapper empty state
- `app/components/staff/StaffProcessingTable.vue` — empty row state
- `app/components/staff/StaffGateQueue.vue` — existing empty state redesign
- `app/components/analytics/AnalyticsPanel.vue` — overall empty state
- `app/components/analytics/AnalyticsQueueChart.vue` — existing empty state redesign

**Acceptance criteria:**
- [ ] All panels show designed empty states (not blank space or plain text)
- [ ] Empty states include icon, heading, and action hint
- [ ] "Run Morning Rush" button in empty states triggers the scenario
- [ ] Empty states disappear immediately when data appears
- [ ] Consistent visual style across all empty states

---

### WP-11: Walkthrough Polish

**Goal:** The guided tour is a key onboarding path — it should feel as polished as the product itself.

**Scope:**
- **Progress bar:** Replace "Step 3 of 6" text with a visual step indicator (row of dots or thin segmented bar, filled segments for completed steps).
- **Tooltip entrance animation:** Add a subtle scale+fade entrance (transform: scale(0.95) → 1, opacity: 0 → 1, 200ms ease-out).
- **Pointer arrow:** Add a small CSS triangle/arrow on the tooltip pointing toward the highlighted element (above or below based on tooltip position).
- **Highlight border:** Add a subtle animated border (dashed, slowly rotating via `@keyframes`) around the spotlight cutout in the overlay SVG, or a soft glow (`box-shadow` on a positioned div matching the cutout rect).
- **Keyboard navigation:** Arrow right = next step, Arrow left = previous step, Escape = skip tour.

**Components affected:**
- `app/components/scenario/WalkthroughTooltip.vue` — progress dots, animation, arrow, keyboard
- `app/components/scenario/WalkthroughOverlay.vue` — highlight border/glow
- `app/composables/useGuidedWalkthrough.ts` — keyboard event listeners

**Acceptance criteria:**
- [ ] Step progress shown as visual dots/bar (not just text)
- [ ] Tooltip animates in (not instant pop)
- [ ] Arrow points from tooltip to highlighted element
- [ ] Highlighted element has visible border or glow
- [ ] Keyboard navigation works (←/→/Esc)
- [ ] All additions work across desktop/tablet/mobile layouts

---

### WP-12: Keyboard Shortcuts & Demo Mode

**Goal:** Sales reps presenting on screen need quick, fluid controls.

**Scope:**
- Add global keyboard shortcuts:
  - `Space` — play/pause simulation
  - `1` / `2` / `5` — set speed
  - `R` — reset (with confirmation)
  - `T` — start/restart tour
  - `?` — toggle shortcut help overlay
- Show a small shortcut hint overlay (semi-transparent card, bottom-left) triggered by `?`. Lists all shortcuts. Dismisses on any key or click.
- Shortcuts disabled when a text input is focused (order form).
- Shortcuts disabled during walkthrough (avoid conflicts with walkthrough keyboard nav from WP-11).

**Components affected:**
- New: `app/composables/useKeyboardShortcuts.ts`
- New: `app/components/layout/ShortcutHelpOverlay.vue`
- `app/pages/index.vue` — mount composable
- `app/components/scenario/ScenarioBar.vue` — add `?` hint icon near controls

**Acceptance criteria:**
- [ ] All listed shortcuts work correctly
- [ ] Shortcuts don't fire when typing in inputs
- [ ] `?` overlay shows all shortcuts clearly
- [ ] Overlay dismisses on key/click
- [ ] Shortcuts disabled during walkthrough

---

### WP-13: Responsive & Mobile Polish

**Goal:** The demo must look good when prospects open it on any device.

**Scope:**
- **Scenario bar mobile layout:** On screens < 768px, collapse scenario buttons behind a dropdown/popover. Keep play/pause and speed visible. Show elapsed time inline.
- **Phone frame scaling:** On tablet overlay, scale phone frame to fit available height (use CSS `transform: scale()` with aspect-ratio preservation rather than fixed 280px).
- **Analytics on mobile:** KPI grid goes to 1 column on very small screens (< 400px). Activity feed gets a max-height reduction.
- **Touch interactions:** Increase tap targets on mobile (min 44px). Ensure drag-and-drop in gate queue works with touch (SortableJS supports this, but verify).
- **Scroll behavior:** Ensure panels scroll independently and don't cause full-page scroll on mobile.

**Components affected:**
- `app/components/scenario/ScenarioBar.vue` — mobile collapse layout
- `app/components/layout/PhoneFrame.vue` — responsive scaling
- `app/components/layout/PanelGrid.vue` — mobile scroll containment
- `app/components/analytics/AnalyticsKpiGrid.vue` — 1-col breakpoint
- `app/components/staff/StaffGateQueue.vue` — touch drag verification

**Acceptance criteria:**
- [ ] Scenario bar is usable on 375px-wide screens
- [ ] Phone frame scales to fit tablet overlay without overflow
- [ ] KPI grid is single column on very small screens
- [ ] All tap targets are ≥44px on mobile
- [ ] No full-page scroll bleed on mobile
- [ ] Drag-and-drop works on touch devices

---

## Work Package Dependency Map

```
WP-1  (Auto-Play)           — standalone, start here
WP-2  (Animations)          — standalone, high visual impact
WP-3  (Cross-Panel Linking) — after WP-2 (builds on animation patterns)
WP-4  (Live Chart)          — standalone
WP-5  (Timeline/Progress)   — standalone
WP-6  (Gate Status)         — standalone
WP-7  (Customer Polish)     — standalone
WP-8  (Scenario Cards)      — standalone
WP-9  (Toasts)              — standalone
WP-10 (Empty States)        — before WP-1 (auto-play hides empty states, but they still need to exist for reset)
WP-11 (Walkthrough Polish)  — standalone
WP-12 (Keyboard Shortcuts)  — after WP-11 (keyboard nav coordination)
WP-13 (Responsive)          — after WP-8 (scenario bar redesign affects mobile layout)
```

## Recommended Implementation Order

1. **WP-2** — Animations (foundation for everything feeling alive)
2. **WP-7** — Customer Panel Polish (visual hero component)
3. **WP-6** — Gate Status Indicators (quick win, high scan-ability)
4. **WP-4** — Live Timeline Chart (analytics wow factor)
5. **WP-10** — Empty States (needed before auto-play)
6. **WP-1** — Auto-Play (transforms first impression, depends on WP-10)
7. **WP-5** — Simulation Timeline (complements auto-play)
8. **WP-3** — Cross-Panel Linking (builds on WP-2 animations)
9. **WP-9** — Toasts (quick integration)
10. **WP-8** — Scenario Cards (scenario bar redesign)
11. **WP-11** — Walkthrough Polish (independent polish)
12. **WP-13** — Responsive Polish (after scenario bar redesign in WP-8)
13. **WP-12** — Keyboard Shortcuts (final layer, after WP-11)
