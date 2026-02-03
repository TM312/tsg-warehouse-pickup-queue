---
phase: 21
plan: 02
subsystem: staff-dashboard
tags: [vue, dropdown-menu, action-buttons, datatable]

dependency-graph:
  requires: [21-01]
  provides: [processing-dropdown-actions]
  affects: []

tech-stack:
  added: []
  patterns:
    - conditional-template-rendering
    - ref-controlled-dialog

key-files:
  created: []
  modified:
    - staff/app/components/dashboard/ActionButtons.vue
    - staff/app/components/dashboard/columns.ts
    - staff/app/pages/index.vue

decisions:
  - id: DEC-21-02-01
    decision: Use ref-controlled AlertDialog for Cancel action in dropdown
    rationale: AlertDialog within dropdown conflicts with dropdown close behavior; separate controlled dialog works correctly

metrics:
  duration: ~2 minutes
  completed: 2026-02-03
---

# Phase 21 Plan 02: DataTable Action Buttons Summary

**One-liner:** Processing orders show Complete as primary button with Return to Queue and Cancel in dropdown menu

## What Was Built

### ActionButtons Conditional Rendering

Updated ActionButtons.vue to conditionally render based on order status:

**Processing State:**
- Primary "Complete" button (default variant, not outline)
- Dropdown menu with MoreVertical trigger containing:
  - "Return to Queue" option (emits revert)
  - "Cancel" option (destructive variant, opens ref-controlled AlertDialog)

**Non-Processing State:**
- Keeps existing inline button pattern
- Complete button (outline variant) when applicable
- Cancel button (ghost variant) when applicable

### Column Callbacks Update

Extended ColumnCallbacks interface with `onRevert` callback and wired it through to ActionButtons in the actions column.

### Dashboard Integration

Connected handleProcessingRevert handler (existing) to the columns configuration, enabling Return to Queue functionality from the DataTable.

## Key Changes

| File | Changes |
|------|---------|
| ActionButtons.vue | Added dropdown imports, revert emit, isProcessing computed, conditional template with dropdown for processing state |
| columns.ts | Added onRevert to ColumnCallbacks interface, passed onRevert prop to ActionButtons |
| index.vue | Added onRevert: handleProcessingRevert to createColumns call |

## Technical Decisions

### DEC-21-02-01: Ref-Controlled AlertDialog for Dropdown Cancel

**Context:** AlertDialog within DropdownMenu causes issues because dropdown closes when clicking the dialog trigger.

**Decision:** Use a ref (`showCancelDialog`) to control AlertDialog open state. DropdownMenuItem sets the ref to true, and AlertDialog is rendered outside the dropdown but controlled by the ref.

**Outcome:** Cancel confirmation works correctly from dropdown menu.

## Commits

| Hash | Description |
|------|-------------|
| 486ec1d | feat(21-02): add dropdown menu for processing order actions |
| 060854e | feat(21-02): add onRevert callback to column definitions |
| 9f68453 | feat(21-02): wire up revert handler for DataTable actions |

## Verification Results

- Type checking: Only pre-existing errors (native-select, pinia)
- Dev server: Starts without errors
- All must_haves from plan satisfied:
  - Processing orders show Complete as primary visible button
  - Processing orders have Return to Queue and Cancel in dropdown
  - Non-processing orders show existing inline button pattern
  - Cancel action uses ghost variant throughout

## Deviations from Plan

None - plan executed exactly as written.

## What's Next

This completes the DataTable action button improvements for Phase 21. The ActionButtons component now provides a cleaner UI for processing orders with the primary action visible and secondary actions in a dropdown.
