# Technology Stack: v2.2 Drag-and-Drop Table Rows

**Project:** Warehouse Pickup Queue System
**Researched:** 2026-02-03
**Scope:** Drag-and-drop table row reordering for unified queue table component

## Executive Summary

**Recommendation: Extend existing `@vueuse/integrations/useSortable` to work with table tbody.**

The project already has working drag-and-drop infrastructure using `useSortable` from `@vueuse/integrations` (a thin wrapper around SortableJS). The current `GateQueueList.vue` component demonstrates the correct optimistic update pattern. The only change needed is targeting `<tbody>` instead of a `<div>` container.

**No new dependencies required.** The existing `sortablejs` (v1.15.6) and `@vueuse/integrations` (v14.1.0) already installed support table row dragging.

## Recommended Approach

### Use Existing Stack with Table Elements

| Technology | Installed Version | Change Needed |
|------------|-------------------|---------------|
| sortablejs | ^1.15.6 | None - already installed |
| @vueuse/integrations | ^14.1.0 | None - already installed |
| @types/sortablejs | ^1.15.9 | None - already installed |

**Why not add a new library:**
- `useSortable` is already working in `GateQueueList.vue` with the correct optimistic update pattern
- SortableJS natively supports `<tbody>` as a container
- Adding a second drag-and-drop library creates inconsistency and bundle bloat

### Integration Pattern

The current `GateQueueList.vue` pattern can be adapted for a table:

```vue
<script setup lang="ts">
import { shallowRef, useTemplateRef } from 'vue'
import { useSortable, moveArrayElement } from '@vueuse/integrations/useSortable'

const tbodyRef = useTemplateRef('tbodyRef')
const localItems = shallowRef([...props.items])

useSortable(tbodyRef, localItems, {
  animation: 150,
  handle: '.drag-handle',
  ghostClass: 'opacity-50',
  onUpdate: async (e) => {
    moveArrayElement(localItems, e.oldIndex!, e.newIndex!, e)
    await nextTick()
    emit('reorder', localItems.value.map(item => item.id))
  }
})
</script>

<template>
  <table>
    <thead>...</thead>
    <tbody ref="tbodyRef">
      <tr v-for="item in localItems" :key="item.id">
        <td class="drag-handle cursor-grab">
          <GripVertical />
        </td>
        <td>{{ item.name }}</td>
        <!-- ... -->
      </tr>
    </tbody>
  </table>
</template>
```

**Key differences from current div-based list:**
- Target `<tbody>` instead of a wrapper `<div>`
- Each child is a `<tr>` instead of a `<div>`
- Drag handle in a dedicated `<td>` column

### TanStack Table Integration

The existing `RequestsTable.vue` uses TanStack Table (`@tanstack/vue-table`) for sorting and column management. For drag-and-drop support:

**Option A: Bypass TanStack for Gate Tabs (Recommended)**

Create a new `DraggableQueueTable.vue` that doesn't use TanStack Table - just plain `<table>` with `useSortable`. This is simpler because:
- Gate tab tables don't need sorting (already sorted by queue position)
- Gate tab tables have fixed columns
- Avoids complexity of syncing drag state with TanStack's row model

Use `RequestsTable` (TanStack) for "All Requests" tab (sorting needed, no dragging).
Use `DraggableQueueTable` for gate tabs (dragging needed, no sorting).

**Option B: Integrate with TanStack Table**

If unified component is strictly required, you'd need to:
1. Manage row data outside TanStack (in `shallowRef`)
2. Pass that ref to both `useSortable` and `useVueTable`
3. On drag, update the ref (optimistic), then sync with server

This is more complex but possible. The official TanStack Row DnD example (React) uses a similar pattern with `@dnd-kit`.

### Optimistic Update Pattern (Existing, Proven)

From current `GateQueueList.vue`:

```typescript
useSortable(listRef, localItems, {
  onStart: () => {
    // Capture state before drag for potential rollback
    previousOrder = localItems.value.map(i => i.id)
  },
  onUpdate: async (e) => {
    // Optimistic: update local state immediately
    moveArrayElement(localItems, e.oldIndex!, e.newIndex!, e)
    await nextTick()

    // Emit for server sync (caller handles rollback on failure)
    emit('reorder', localItems.value.map(item => item.id))
  }
})

// Watch for external updates (realtime or server response)
watch(() => props.items, (newItems) => {
  localItems.value = [...newItems]
}, { deep: true })
```

This pattern already handles:
- Optimistic UI update (instant feedback)
- Server sync (via emitted event)
- External updates (via prop watcher)
- Potential rollback (captured previous state)

## Alternatives Considered

### vue-draggable-plus

| Aspect | Assessment |
|--------|------------|
| Vue 3 support | Yes |
| Table support | Yes (via `target` selector or `useDraggable` composable) |
| Weekly downloads | ~38,600 |
| Bundle size | Adds ~15KB (wraps SortableJS) |
| **Verdict** | **Not needed** - offers same SortableJS functionality already available via useSortable |

vue-draggable-plus solves a real problem (using SortableJS with component libraries that don't expose root elements), but our shadcn-vue Table exposes the tbody via template slots. We don't have that problem.

### vuedraggable@next (vue.draggable.next)

| Aspect | Assessment |
|--------|------------|
| Vue 3 support | Yes |
| Table support | Yes (via `tag="tbody"`) |
| Maintenance | Stalled (npm version outdated, community requests ignored) |
| **Verdict** | **Avoid** - maintenance concerns, we already have better solution |

The official SortableJS Vue 3 component has maintenance issues - npm version doesn't match GitHub, and there's an open issue from 2022 about this.

### Vue DnD Kit (@vue-dnd-kit/core)

| Aspect | Assessment |
|--------|------------|
| Vue 3 support | Yes |
| Based on | dnd-kit (React library) concepts |
| Version | 1.7.0 (released July 2025) |
| Table support | Planned but not documented |
| **Verdict** | **Not recommended** - newer library, less proven, requires @vueuse/core anyway |

Vue DnD Kit is promising but adds a new paradigm when we already have working SortableJS integration.

### Native HTML5 Drag and Drop

| Aspect | Assessment |
|--------|------------|
| Bundle size | Zero |
| Touch support | Poor without extra work |
| Animation | Manual implementation required |
| **Verdict** | **Not recommended** - SortableJS already handles edge cases |

## Implementation Notes

### shadcn-vue Table Structure

The existing shadcn-vue Table components render standard HTML:

```vue
<!-- Table.vue renders: -->
<div data-slot="table-container">
  <table data-slot="table">
    <slot />
  </table>
</div>

<!-- TableBody.vue renders: -->
<tbody data-slot="table-body">
  <slot />
</tbody>
```

**Important:** The `TableBody` component renders a real `<tbody>`, so we can target it with `useSortable` directly.

### Template Ref Access

For useSortable to work with shadcn-vue components, get a ref to the actual tbody element:

```vue
<script setup>
const tbodyRef = useTemplateRef('tbodyRef')
</script>

<template>
  <Table>
    <TableHeader>...</TableHeader>
    <TableBody ref="tbodyRef">
      <TableRow v-for="item in localItems" :key="item.id">
        ...
      </TableRow>
    </TableBody>
  </Table>
</template>
```

Note: Vue 3's `useTemplateRef` on a component returns the component instance. For useSortable, you may need to use `tbodyRef.value?.$el` to get the actual DOM element, or use a native `<tbody>` directly.

### Known Considerations

1. **Animation class conflicts:** SortableJS applies classes during drag. Ensure TailwindCSS doesn't purge them:
   ```javascript
   // tailwind.config.js safelist
   safelist: ['sortable-ghost', 'sortable-drag', 'sortable-chosen']
   ```

2. **Row key stability:** Use stable IDs (not array indices) for `:key` to prevent issues when rows move.

3. **Touch devices:** SortableJS handles touch events automatically. Test on mobile.

4. **Accessibility:** Add `aria-grabbed` and keyboard support for accessibility. Consider up/down buttons as an alternative to drag handles.

## Confidence Assessment

| Decision | Confidence | Basis |
|----------|------------|-------|
| Use existing useSortable | HIGH | Already working in codebase |
| Target tbody with useSortable | HIGH | SortableJS docs confirm tbody support |
| Don't add new library | HIGH | No gap in current capabilities |
| Option A (separate components) | HIGH | Simpler, proven pattern |
| Option B (TanStack integration) | MEDIUM | Possible but adds complexity |

## Sources

- [VueUse useSortable](https://vueuse.org/integrations/usesortable/) - Official documentation
- [SortableJS Table Support](https://github.com/SortableJS/Sortable#features) - Feature list
- [vue.draggable.next Table Example](https://github.com/SortableJS/vue.draggable.next/blob/master/example/components/table-example.vue) - Shows tbody targeting
- [vue-draggable-plus npm](https://www.npmjs.com/package/vue-draggable-plus) - 38,600 weekly downloads
- [Vue DnD Kit](https://zizigy.github.io/vue-dnd-kit/) - Alternative library documentation
- [TanStack Table Row DnD (React)](https://tanstack.com/table/v8/docs/framework/react/examples/row-dnd) - Reference pattern

## Summary for Implementation

1. **No new dependencies** - use existing `@vueuse/integrations/useSortable`
2. **Create `DraggableQueueTable.vue`** - new component for gate tabs with drag-and-drop
3. **Keep `RequestsTable.vue`** - for "All Requests" tab (sorting, no drag)
4. **Copy optimistic pattern** - from `GateQueueList.vue` which already works correctly
5. **Target tbody** - either via template ref on shadcn-vue TableBody or native tbody element

The hard part is already solved (optimistic updates, realtime sync). This is just adapting the container from divs to table rows.
