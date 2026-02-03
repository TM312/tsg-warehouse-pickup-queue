---
phase: 22-quick-wins
plan: 01
subsystem: ui-polish
tags: [vue, ui, badges, icons, cleanup]

dependency-graph:
  requires: []
  provides: [external-link-button, badge-tabs, removed-refresh]
  affects: []

tech-stack:
  added: []
  patterns: [lucide-icons, shadcn-badges]

key-files:
  created: []
  modified:
    - staff/app/components/gates/GatesTable.vue
    - staff/app/pages/index.vue

decisions: []

metrics:
  duration: ~5min
  completed: 2026-02-03
---

# Phase 22 Plan 01: Quick Visual Improvements Summary

**One-liner:** External link icon on Gates Open button, Badge component for tab counts, refresh button removed

## What Was Built

Three quick visual improvements to the staff dashboard:

1. **Gates Table External Link** - The Open button now shows an ExternalLink icon and opens gate views in a new tab, so operators can keep the Gates overview open while managing individual gates.

2. **Tab Count Badges** - Queue count badges in tabs now use the Badge component with `variant="secondary"` for subtle visual distinction from tab background. Added `tabular-nums` class to prevent layout shift when counts change.

3. **Refresh Button Removed** - The manual Refresh button was redundant with realtime subscriptions. Removed from UI while keeping the `refresh()` function for action handler reconciliation.

## Key Changes

| File | Change |
|------|--------|
| `GatesTable.vue` | Added ExternalLink import, added `target="_blank"` and icon to Open button |
| `index.vue` | Added Badge import, replaced span with Badge for tab counts, removed RefreshCw and refresh button |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| d9f4618 | feat | Add external link icon to Gates table Open button |
| 329187e | feat | Update tab count badges for visual distinction |
| 7a0551e | chore | Remove refresh button from queue view |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- ExternalLink import and usage verified in GatesTable.vue
- target="_blank" attribute verified on NuxtLink
- Badge variant="secondary" verified in both tab triggers
- tabular-nums class verified on badges
- RefreshCw import removed (no matches)
- refreshing computed removed (no matches)
- Refresh button removed (no Refresh text matches)
- Type check passes with no new errors (pre-existing errors unchanged)

## Requirements Addressed

| ID | Requirement | Status |
|----|-------------|--------|
| UI-01 | Gates page Open button as link with external icon | Done |
| UI-04 | Badge visibility on tabs | Done |
| CLN-01 | Remove refresh button | Done |

## Next Phase Readiness

Plan 22-01 complete. Ready for Phase 23 (Component Polish) or remaining Phase 22 plans if any.
