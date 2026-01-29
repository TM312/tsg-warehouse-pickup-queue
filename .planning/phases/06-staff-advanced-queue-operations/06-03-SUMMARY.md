---
phase: 06-staff-advanced-queue-operations
plan: 03
subsystem: staff-ui
tags: [drag-and-drop, sortablejs, vue-composables, queue-management]

dependency-graph:
  requires:
    - 06-01 (PostgreSQL queue functions)
  provides:
    - Drag-and-drop queue reordering within gates
    - Priority marking capability for requests
    - Move-to-gate functionality
  affects:
    - 06 phase completion (final plan)
    - Future dashboard integration work

tech-stack:
  added:
    - sortablejs@1.15.6
    - "@vueuse/integrations@14.1.0"
    - "@types/sortablejs@1.15.9"
  patterns:
    - useSortable composable for drag-and-drop
    - shallowRef for optimistic updates
    - SortableEvent type for TypeScript safety

file-tracking:
  key-files:
    created:
      - staff/app/components/dashboard/GateQueueList.vue
      - staff/app/components/dashboard/PriorityButton.vue
    modified:
      - staff/package.json
      - staff/pnpm-lock.yaml
      - staff/app/composables/useQueueActions.ts

decisions:
  - decision: "Add @types/sortablejs for TypeScript support"
    rationale: "sortablejs doesn't ship TypeScript definitions, SortableEvent type needed for onUpdate callback"
    phase: "06-03"
  - decision: "ArrowUp icon for priority button"
    rationale: "Clear visual metaphor for 'move up in queue', matches priority insertion to position 2"
    phase: "06-03"

metrics:
  duration: 3m
  completed: 2026-01-29
---

# Phase 6 Plan 3: Drag-Drop Reorder and Priority Summary

**One-liner:** Sortable queue list with useSortable, priority button, and RPC-backed queue actions for reorder/priority/move.

## What Was Built

### 1. Dependencies Installed
- **sortablejs** (1.15.6): Core drag-and-drop library
- **@vueuse/integrations** (14.1.0): Provides useSortable Vue composable
- **@types/sortablejs** (1.15.9): TypeScript definitions for SortableEvent

### 2. useQueueActions Extension
Extended the existing composable with three new RPC-calling functions:

| Function | RPC Call | Purpose |
|----------|----------|---------|
| `reorderQueue(gateId, requestIds)` | `reorder_queue` | Sync new queue order to database |
| `setPriority(requestId)` | `set_priority` | Mark request as priority (position 2) |
| `moveToGate(requestId, newGateId)` | `move_to_gate` | Transfer request between gates |

All functions include toast feedback (success/error) and proper error handling.

### 3. GateQueueList Component (87 lines)
Per-gate sortable list with:
- **useSortable integration**: Animation, ghost class, drag class
- **Drag handle**: `.drag-handle` class restricts drag to grip icon
- **Optimistic updates**: shallowRef localItems updated immediately
- **Event emission**: `reorder` event with new request ID array
- **Priority display**: Badge for `is_priority` items
- **Empty state**: "No customers in queue" message

### 4. PriorityButton Component
Simple ghost button with ArrowUp icon:
- Disabled state support
- Title tooltip "Mark as priority"
- Emits click to parent for priority action

## Key Implementation Details

### Drag-and-Drop Pattern
```typescript
useSortable(listRef, localItems, {
  animation: 150,
  handle: '.drag-handle',
  ghostClass: 'opacity-50',
  dragClass: 'bg-accent',
  onUpdate: async (e: SortableEvent) => {
    moveArrayElement(localItems, e.oldIndex!, e.newIndex!, e)
    emit('reorder', localItems.value.map(item => item.id))
  }
})
```

### RPC Call Pattern
```typescript
async function reorderQueue(gateId: string, requestIds: string[]): Promise<boolean> {
  const { error } = await client.rpc('reorder_queue', {
    p_gate_id: gateId,
    p_request_ids: requestIds
  })
  if (error) throw error
  toast.success('Queue reordered')
  return true
}
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing @types/sortablejs**
- **Found during:** Task 3 typecheck
- **Issue:** `Parameter 'e' implicitly has an 'any' type` error on SortableEvent
- **Fix:** Added @types/sortablejs@1.15.9 as devDependency
- **Files modified:** staff/package.json, staff/pnpm-lock.yaml
- **Commit:** 3f8b71d

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 97b612c | chore | Install sortablejs and @vueuse/integrations |
| f4a797f | feat | Extend useQueueActions with reorder, priority, move |
| 9121369 | feat | Create GateQueueList sortable component |
| 72f805c | feat | Create PriorityButton component |
| 3f8b71d | chore | Add @types/sortablejs for TypeScript support |

## Verification Results

| Check | Status |
|-------|--------|
| sortablejs installed | Pass |
| @vueuse/integrations installed | Pass |
| useQueueActions exports reorderQueue | Pass |
| useQueueActions exports setPriority | Pass |
| useQueueActions exports moveToGate | Pass |
| GateQueueList uses useSortable | Pass |
| GateQueueList min 60 lines | Pass (87 lines) |
| Import pattern `useSortable.*from.*@vueuse/integrations` | Pass |
| RPC pattern `rpc('reorder_queue'` | Pass |
| TypeScript compiles | Pass |

## Integration Notes

The GateQueueList component is ready to be integrated into the main dashboard. To use it:

```vue
<GateQueueList
  :gate-id="gate.id"
  :items="gateQueueItems"
  @reorder="(ids) => reorderQueue(gate.id, ids)"
  @set-priority="(id) => setPriority(id)"
/>
```

The parent component should:
1. Filter requests by gate and status='in_queue'
2. Sort by queue_position
3. Handle reorder event by calling reorderQueue
4. Handle set-priority event by calling setPriority
5. Refresh data after successful operations

## Next Phase Readiness

Phase 6 is now complete with all three plans executed:
- 06-01: Advanced PostgreSQL queue functions
- 06-02: Gate CRUD operations
- 06-03: Drag-drop reorder and priority (this plan)

Ready to proceed to Phase 7 (Customer Submission Flow).
