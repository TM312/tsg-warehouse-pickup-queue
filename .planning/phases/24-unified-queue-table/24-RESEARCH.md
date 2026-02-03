# Phase 24: Unified Queue Table - Research

**Researched:** 2026-02-03
**Domain:** Vue 3 data table with dual-mode (sortable columns / drag-and-drop reordering) + keyboard accessibility
**Confidence:** HIGH

## Summary

This phase unifies two existing table implementations (RequestsTable for sorting, GateQueueList for drag reordering) into a single QueueTable component. The codebase already uses TanStack Vue Table (@tanstack/vue-table ^8.21.3) for sortable data tables and SortableJS via @vueuse/integrations for drag-and-drop. The challenge is combining these into a single component that switches between modes, with the additional requirement of keyboard accessibility for reordering.

SortableJS does NOT have built-in keyboard accessibility - this has been a long-standing gap (GitHub issue #1951 from 2020, with explicit "no" from maintainers). The keyboard reordering must be implemented as a custom layer on top of the existing drag functionality. The standard pattern involves: spacebar to enter "grabbed" state, arrow keys to move, spacebar to drop, with aria-live announcements for screen readers.

**Primary recommendation:** Extend the existing table component pattern with a `mode` prop (sort vs drag), implement custom keyboard handlers for accessibility, and use a visually-hidden aria-live region for screen reader announcements.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/vue-table | ^8.21.3 | Data table model, sorting, column definitions | Already in codebase; best-in-class headless table |
| sortablejs | ^1.15.6 | Mouse/touch drag-and-drop | Already in codebase via useSortable |
| @vueuse/integrations | ^14.1.0 | useSortable composable wrapping SortableJS | Already in codebase; Vue-idiomatic wrapper |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-vue-next | ^0.563.0 | Icons (GripVertical, ArrowUp, ArrowDown, ArrowUpDown) | Already in codebase; grip handle, sort indicators |
| @vueuse/core | ^14.1.0 | useStorage for sort preference persistence | Already in codebase; optional localStorage wrapper |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SortableJS | @dnd-kit (via vue-dndkit) | dnd-kit has better accessibility but would require adding new dependency and rewriting existing drag code |
| Custom keyboard handlers | @vue-a11y/announcer | Would add dependency for just one component's needs; native aria-live is sufficient |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
staff/app/components/
├── dashboard/
│   ├── QueueTable.vue           # New unified component
│   ├── queueTableColumns.ts     # Column definitions (rename from requestsTableColumns.ts)
│   ├── QueueTableRow.vue        # Optional: extracted row component with drag handle
│   ├── RequestsTable.vue        # DEPRECATED - remove after migration
│   └── GateQueueList.vue        # DEPRECATED - remove after migration
└── composables/
    └── useKeyboardReorder.ts    # Keyboard reorder logic (optional extraction)
```

### Pattern 1: Mode-Based Conditional Rendering
**What:** Single component that conditionally renders sort UI or drag UI based on mode prop
**When to use:** When the same data structure needs different interaction patterns
**Example:**
```typescript
// Source: Project pattern derived from requirements
interface Props {
  mode: 'sort' | 'drag'
  data: QueueItem[]
  columns: ColumnDef<QueueItem>[]
}

// In template:
// - Always show column headers
// - In sort mode: headers clickable, no drag handles
// - In drag mode: headers visible but not clickable, show drag handles
```

### Pattern 2: Keyboard Reorder State Machine
**What:** Track grabbed/moving/idle states for keyboard accessibility
**When to use:** Any sortable list needing keyboard control
**Example:**
```typescript
// Source: https://zaengle.com/blog/accessible-drag-and-drop-in-vue
type ReorderState = 'idle' | 'grabbed' | 'moving'

const reorderState = ref<ReorderState>('idle')
const grabbedIndex = ref<number | null>(null)

function handleKeydown(e: KeyboardEvent, index: number) {
  if (reorderState.value === 'idle' && e.key === ' ') {
    e.preventDefault()
    reorderState.value = 'grabbed'
    grabbedIndex.value = index
    announceGrab(index)
  } else if (reorderState.value === 'grabbed') {
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault()
      moveItem(index, index - 1)
      announceMove(index - 1)
    } else if (e.key === 'ArrowDown' && index < items.length - 1) {
      e.preventDefault()
      moveItem(index, index + 1)
      announceMove(index + 1)
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      reorderState.value = 'idle'
      announceDrop()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      revertToOriginalPosition()
      reorderState.value = 'idle'
      announceCancel()
    }
  }
}
```

### Pattern 3: Cmd/Ctrl Modifiers for Jump
**What:** Handle Cmd+Arrow (Mac) / Ctrl+Arrow (Windows) for jump-to-top/bottom
**When to use:** Per user decision - single step by default, modifier for jump
**Example:**
```typescript
// Source: User requirement from CONTEXT.md
function handleKeydown(e: KeyboardEvent, index: number) {
  const isMeta = e.metaKey || e.ctrlKey

  if (reorderState.value === 'grabbed') {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIndex = isMeta ? 0 : index - 1
      if (newIndex >= 0) {
        moveItem(index, newIndex)
        announceMove(newIndex)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = isMeta ? items.length - 1 : index + 1
      if (newIndex < items.length) {
        moveItem(index, newIndex)
        announceMove(newIndex)
      }
    }
  }
}
```

### Pattern 4: aria-live Announcements
**What:** Visually hidden region that announces reorder actions to screen readers
**When to use:** Any drag/reorder operation for accessibility
**Example:**
```vue
<!-- Source: https://accessible-vue.com/chapter/5/ + existing project pattern -->
<template>
  <!-- Visually hidden live region -->
  <div
    aria-live="assertive"
    aria-atomic="true"
    class="sr-only"
  >
    {{ announcement }}
  </div>
</template>

<script setup>
const announcement = ref('')

function announceGrab(index: number) {
  announcement.value = `${items[index].sales_order_number} grabbed. Current position ${index + 1} of ${items.length}. Use arrow keys to move, spacebar to drop.`
}

function announceMove(newIndex: number) {
  announcement.value = `Moved to position ${newIndex + 1} of ${items.length}`
}

function announceDrop() {
  announcement.value = `Item dropped at position ${grabbedIndex.value + 1}`
}
</script>
```

### Anti-Patterns to Avoid
- **Mixing sort and drag in same mode:** User should not accidentally trigger drag while trying to sort or vice versa. Modes must be mutually exclusive.
- **Using useSortable on <tbody>:** SortableJS manipulates DOM directly; can conflict with Vue's reactivity. Use shallowRef for items and sync carefully on external updates.
- **Announcing every keyboard press:** Only announce state changes (grab, move, drop), not failed attempts or no-ops.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sortable headers | Custom onClick sorting | TanStack Table getSortedRowModel() | Handles multi-column sort, sort cycles, type-aware comparison |
| Drag ghost styling | Custom clone manipulation | SortableJS ghostClass/dragClass options | Already working in GateQueueList; handles edge cases |
| Array element moving | Manual splice operations | moveArrayElement from @vueuse/integrations | Handles reactive updates correctly |
| Focus management after move | Manual DOM focus | nextTick + element.focus() | Vue 3 standard pattern |

**Key insight:** The hard part is coordinating keyboard accessibility with mouse drag - the libraries handle their respective domains well, but keyboard must be custom.

## Common Pitfalls

### Pitfall 1: Two Sources of Truth (Vue vs SortableJS)
**What goes wrong:** Vue updates items array, SortableJS also manipulates DOM, resulting in duplicated or missing rows
**Why it happens:** SortableJS directly manipulates DOM nodes; Vue expects to control DOM via reactivity
**How to avoid:**
- Use shallowRef for items to reduce Vue reactivity
- Watch props.items and sync to localItems on external changes
- Let SortableJS handle visual ordering during drag; emit final order for server sync
**Warning signs:** Items duplicating or disappearing after drag operations

### Pitfall 2: Sort State Reset on Tab Switch
**What goes wrong:** User sorts by "Order #" in All Requests, switches to gate tab and back, loses sort
**Why it happens:** Component remounts or sort state not persisted
**How to avoid:** Either persist sort state to localStorage via useStorage, OR accept reset as intentional (simpler, less surprising for users switching context)
**Warning signs:** User complaints about "lost" sort preferences

### Pitfall 3: Keyboard Focus Lost After Reorder
**What goes wrong:** User moves item with arrow keys, focus jumps to start of table or lost entirely
**Why it happens:** DOM reordering can confuse browser focus tracking
**How to avoid:** After moving item, use nextTick to refocus the moved row at its new position
**Warning signs:** Screen reader users losing context, keyboard users having to re-navigate

### Pitfall 4: Drag Handle Touch Target Too Small
**What goes wrong:** Mobile users struggle to grab drag handle (even though per CONTEXT.md, keyboard is preferred on mobile)
**Why it happens:** Grip icon is small (20x20), fingers are larger
**How to avoid:** Make drag handle clickable area larger than icon (min 44x44 per WCAG), even if icon stays small
**Warning signs:** Touch users accidentally clicking row instead of handle

### Pitfall 5: Missing tabindex on Rows in Drag Mode
**What goes wrong:** Keyboard users cannot navigate to rows to initiate keyboard reorder
**Why it happens:** Table rows are not naturally focusable
**How to avoid:** Add tabindex="0" to rows in drag mode; use role="listbox" semantics for the tbody, role="option" for rows
**Warning signs:** Tab key skips over table entirely

## Code Examples

Verified patterns from official sources:

### TanStack Vue Table Sorting (existing pattern)
```typescript
// Source: Current staff/app/components/dashboard/RequestsTable.vue
import type { SortingState } from '@tanstack/vue-table'
import { getCoreRowModel, getSortedRowModel, useVueTable } from '@tanstack/vue-table'

const sorting = ref<SortingState>([])

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  state: {
    get sorting() { return sorting.value },
  },
})
```

### useSortable with Handle (existing pattern)
```typescript
// Source: Current staff/app/components/dashboard/GateQueueList.vue
import { useSortable, moveArrayElement } from '@vueuse/integrations/useSortable'

const listRef = useTemplateRef('listRef')
const localItems = shallowRef([...props.items])

useSortable(listRef, localItems, {
  animation: 150,
  handle: '.drag-handle',
  ghostClass: 'opacity-50',
  dragClass: 'bg-accent',
  onUpdate: async (e) => {
    moveArrayElement(localItems, e.oldIndex!, e.newIndex!, e)
    await nextTick()
    emit('reorder', localItems.value.map(item => item.id))
  }
})
```

### Column Definition with Sortable Header
```typescript
// Source: Current staff/app/components/dashboard/requestsTableColumns.ts
import { h } from 'vue'
import { ArrowUpDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

{
  accessorKey: 'created_at',
  header: ({ column }) => {
    return h(Button, {
      variant: 'ghost',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Created', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })])
  },
  cell: ({ row }) => {
    const date = new Date(row.getValue('created_at'))
    return date.toLocaleString()
  },
}
```

### Screen Reader Only Class (existing pattern)
```css
/* Source: Tailwind default - already available in project */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-dnd for React drag/drop | dnd-kit recommended | 2023+ | Better accessibility, React 18 compat |
| Custom aria-live management | @vue-a11y/announcer composable | Vue 3 release | Simpler setup, but adds dependency |
| Separate sort/drag components | Unified component with mode | This phase | Less code, consistent UX |

**Deprecated/outdated:**
- react-dnd: Incompatible with React 18 strict mode (not applicable to Vue, but informs direction)
- Vue.Draggable (vue2 version): Superseded by @vueuse/integrations/useSortable for Vue 3

## Open Questions

Things that couldn't be fully resolved:

1. **Sort Preference Persistence**
   - What we know: useStorage from @vueuse/core provides easy localStorage wrapper
   - What's unclear: Whether sort preferences should persist across sessions or reset
   - Recommendation: Start without persistence (simpler), add if users request

2. **Drop Zone Indication Style**
   - What we know: SortableJS supports ghostClass/dragClass; common patterns are line-between or row-highlight
   - What's unclear: Best visual for this table design (cards vs standard rows)
   - Recommendation: Use existing ghostClass (opacity-50) + dragClass (bg-accent) from GateQueueList; add visible drop line if testing shows confusion

3. **Keyboard Reorder Initiation**
   - What we know: Two patterns exist - (a) arrows work immediately when row focused, (b) enter "grab mode" first
   - What's unclear: Which is more intuitive
   - Recommendation: Require spacebar to enter grab mode first - prevents accidental reordering, clearer state machine

4. **Mode Indicator Visibility**
   - What we know: Sort mode has arrow icons in headers; drag mode has grip handles
   - What's unclear: If additional indicator needed (e.g., "Reorder mode" badge)
   - Recommendation: Handle icons are self-evident; start without extra indicator, add if user testing shows confusion

## Sources

### Primary (HIGH confidence)
- VueUse useSortable documentation: https://vueuse.org/integrations/usesortable/
- TanStack Vue Table sorting example: https://tanstack.com/table/v8/docs/framework/vue/examples/sorting
- Existing codebase: staff/app/components/dashboard/RequestsTable.vue, GateQueueList.vue

### Secondary (MEDIUM confidence)
- Accessible Drag-and-Drop in Vue: https://zaengle.com/blog/accessible-drag-and-drop-in-vue
- Accessible Vue Chapter 5 (aria-live): https://accessible-vue.com/chapter/5/
- SortableJS keyboard accessibility issue: https://github.com/SortableJS/Sortable/issues/1951

### Tertiary (LOW confidence)
- Web accessibility patterns for sortable lists: https://pressbooks.library.torontomu.ca/wafd/chapter/sortable-lists/

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries already in use, patterns verified from existing code
- Architecture: HIGH - Patterns derived from existing components and official docs
- Pitfalls: MEDIUM - Based on VueUse issues and accessibility research
- Keyboard accessibility: MEDIUM - Patterns verified from accessibility articles, not from library docs (SortableJS lacks this)

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - libraries stable, accessibility patterns well-established)
