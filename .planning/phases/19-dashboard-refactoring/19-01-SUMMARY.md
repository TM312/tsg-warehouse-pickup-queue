---
phase: 19
plan: 01
subsystem: staff-dashboard
tags: [refactoring, vue, composables, code-quality]

# Dependency graph
dependency_graph:
  requires: [18-dashboard-visualization]
  provides: [useDashboardData-composable, organized-index-vue]
  affects: [20-gates-view, 21-dashboard-polish]

# Tech tracking
tech_stack:
  added: []
  patterns: [composable-extraction, section-comments]

# File tracking
key_files:
  created:
    - staff/app/composables/useDashboardData.ts
  modified:
    - staff/app/pages/index.vue

# Decisions made in this plan
decisions:
  - id: DEC-19-01-01
    decision: "Extract dashboard computed properties to dedicated composable"
    rationale: "DRY principle - computed properties were complex and cluttered index.vue"
  - id: DEC-19-01-02
    decision: "Use section comments (// === Name ===) for code organization"
    rationale: "Improves scanability and makes handler grouping explicit"
  - id: DEC-19-01-03
    decision: "Remove redundant gates alias, use activeGates directly"
    rationale: "Reduces indirection and code size"

# Metrics
metrics:
  duration: "~8 minutes"
  completed: "2026-02-03"
  line_reduction: "410 -> 285 lines (30%)"
---

# Phase 19 Plan 01: Dashboard Page Refactoring Summary

**One-liner:** Extracted 5 dashboard computed properties to useDashboardData composable, organized index.vue with 14 section comments, reduced from 410 to 285 lines.

## What Was Built

### useDashboardData Composable

New composable at `staff/app/composables/useDashboardData.ts` that extracts dashboard-specific computed properties:

| Property | Purpose |
|----------|---------|
| `currentlyWaiting` | Count of IN_QUEUE requests |
| `chartData` | Gate queue counts for bar chart visualization |
| `processingItems` | Items being processed with gate info (for NowProcessingSection) |
| `gatesWithQueues` | Per-gate data with queue items and active counts (for gate tabs) |
| `filteredRequests` | Respects showCompleted toggle |

Follows existing `useDashboardKpis.ts` pattern for consistency.

### Refactored index.vue

Reorganized with clear section structure:

```
// === Imports ===
// === Page Meta ===
// === Store & Composable Setup ===
// === Local UI State ===
// === Dashboard-Specific Derived Data ===
// === Column Configuration ===
// === Sheet State ===
// === Queue Action Handlers ===
// === Priority Handlers ===
// === Processing Section Handlers ===
// === Gate Management Handlers ===
// === Manual Order Creation ===
// === UI Interaction Handlers ===
// === Detail Panel Delegates ===
```

## Commits

| Hash | Type | Description |
|------|------|-------------|
| f0b1db3 | feat | Create useDashboardData composable |
| 46ebfe0 | refactor | Reorganize index.vue with composable |

## Key Changes

1. **Extracted computed properties** from index.vue to useDashboardData.ts
2. **Removed redundant alias** (`const gates = activeGates` eliminated)
3. **Added section comments** for logical code grouping (14 sections)
4. **Cleaned up imports** (removed unused TERMINAL_STATUSES, GateWithCount from index.vue)
5. **Reduced line count** from 410 to 285 lines (~30% reduction)

## Deviations from Plan

None - plan executed exactly as written.

## Requirements Satisfied

| ID | Requirement | Status |
|----|-------------|--------|
| ARCH-10 | DRY principle followed | Satisfied |
| ARCH-11 | Clear separation of concerns | Satisfied |

## Verification Results

- TypeScript check: Pass (no new errors, pre-existing errors in native-select and gate/[id].vue unchanged)
- Dev server: Compiles and starts correctly
- Line count: 285 lines (target was 300-350)

## Next Phase Readiness

Ready for Phase 20 (Gates View):
- Dashboard code is now well-organized and maintainable
- useDashboardData pattern can be referenced for similar extractions
- No blockers or concerns
