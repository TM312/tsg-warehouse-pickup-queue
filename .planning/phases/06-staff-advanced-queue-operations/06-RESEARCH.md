# Phase 6: Staff Advanced Queue Operations - Research

**Researched:** 2026-01-29
**Domain:** Drag-and-Drop Reordering, Queue Position Management, Gate CRUD Operations
**Confidence:** HIGH

## Summary

This phase adds advanced queue manipulation capabilities to the staff dashboard: drag-and-drop reordering within gates, moving customers between gates, priority override, and full gate CRUD (create, rename, delete, enable/disable). The existing Nuxt 4 + shadcn-vue stack is extended with SortableJS for drag-and-drop, and new PostgreSQL functions handle atomic position updates.

The standard approach uses `@vueuse/integrations/useSortable` (wrapper around SortableJS) for drag-and-drop within per-gate filtered lists. Queue positions use integer-based ordering with atomic PostgreSQL functions for reordering, moving between gates, and priority insertion. The database schema already supports `is_priority` on pickup_requests and `is_active` on gates. Gate management uses Dialog components for create/rename forms and AlertDialog for delete confirmations.

Key decisions from CONTEXT.md constrain the implementation: reordering happens within per-gate filtered views (not across all gates), gate reassignment is a separate dropdown action (no cross-gate dragging), priority moves to position 2 (behind current service), multiple priorities stack FIFO, and optimistic updates with rollback on server failure. The gates table already has `is_active` for disable functionality.

**Primary recommendation:** Use useSortable for per-gate drag-and-drop reordering, atomic PostgreSQL functions for all position updates (reorder, move, priority), Dialog for gate create/rename, and AlertDialog for gate delete with queue-empty validation.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @vueuse/integrations | ^14.1.0 | useSortable composable | Already using @vueuse/core, consistent API |
| sortablejs | ^1.x | Underlying drag-and-drop engine | Most mature, well-supported library |
| shadcn-vue Dialog | - | Gate create/rename forms | Consistent with existing UI patterns |
| PostgreSQL Functions | - | Atomic queue operations | Race condition prevention |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vue-sonner | ^2.0.9 | Toast feedback for operations | All queue/gate mutations |
| shadcn-vue AlertDialog | - | Delete confirmation, disable validation | Destructive gate operations |
| lucide-vue-next | ^0.563.0 | Drag handle icon, action icons | GripVertical for drag handle |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useSortable | vue-draggable-plus | vue-draggable-plus is newer but useSortable leverages existing @vueuse ecosystem |
| Integer positions | Fractional indexing | Fractional is more efficient but integers are simpler and sufficient for small queues |
| Dialog for forms | Sheet | Dialog better for focused create/edit, Sheet already used for request details |

**Installation:**
```bash
# From staff/ directory
pnpm add sortablejs @vueuse/integrations

# Add shadcn-vue components if not already present
pnpm dlx shadcn-vue@latest add dialog
```

## Architecture Patterns

### Recommended Project Structure
```
staff/app/
├── components/
│   ├── ui/
│   │   └── dialog/           # For gate create/rename forms
│   ├── dashboard/
│   │   ├── GateQueueList.vue # NEW: Per-gate sortable list
│   │   ├── GateManagement.vue # NEW: Gate CRUD panel
│   │   └── GateCard.vue      # NEW: Individual gate display with queue
│   └── gates/
│       ├── CreateGateDialog.vue  # NEW: Create gate form
│       ├── EditGateDialog.vue    # NEW: Rename gate form
│       └── DeleteGateDialog.vue  # NEW: Delete confirmation with validation
├── composables/
│   ├── useQueueActions.ts    # UPDATE: Add reorder, move, priority functions
│   └── useGateManagement.ts  # NEW: Gate CRUD operations
└── pages/
    └── index.vue             # UPDATE: Add gate management tab/section
```

### Pattern 1: Per-Gate Sortable List with useSortable
**What:** Drag-and-drop reordering within a filtered list for a single gate
**When to use:** Queue reordering within one gate's view

```vue
<!-- GateQueueList.vue -->
<script setup lang="ts">
import { useSortable, moveArrayElement } from '@vueuse/integrations/useSortable'
import { shallowRef, useTemplateRef, nextTick } from 'vue'
import { GripVertical } from 'lucide-vue-next'

interface QueueItem {
  id: string
  sales_order_number: string
  company_name: string | null
  queue_position: number
  is_priority: boolean
}

const props = defineProps<{
  gateId: string
  items: QueueItem[]
}>()

const emit = defineEmits<{
  reorder: [requestIds: string[]]
}>()

const listRef = useTemplateRef('listRef')
const localItems = shallowRef([...props.items])

// Watch for external updates
watch(() => props.items, (newItems) => {
  localItems.value = [...newItems]
}, { deep: true })

const { option } = useSortable(listRef, localItems, {
  animation: 150,
  handle: '.drag-handle',
  ghostClass: 'opacity-50',
  dragClass: 'bg-accent',
  onUpdate: async (e) => {
    // Optimistic update already happened via localItems
    moveArrayElement(localItems, e.oldIndex!, e.newIndex!, e)
    await nextTick()

    // Emit new order for server sync
    const newOrder = localItems.value.map(item => item.id)
    emit('reorder', newOrder)
  }
})
</script>

<template>
  <div ref="listRef" class="space-y-2">
    <div
      v-for="item in localItems"
      :key="item.id"
      class="flex items-center gap-2 p-3 border rounded-lg bg-background"
    >
      <div class="drag-handle cursor-grab active:cursor-grabbing">
        <GripVertical class="h-5 w-5 text-muted-foreground" />
      </div>
      <div class="flex-1">
        <span class="font-medium">{{ item.sales_order_number }}</span>
        <span v-if="item.company_name" class="text-muted-foreground ml-2">
          {{ item.company_name }}
        </span>
      </div>
      <Badge v-if="item.is_priority" variant="destructive">Priority</Badge>
    </div>
  </div>
</template>
```

### Pattern 2: Optimistic Update with Rollback
**What:** Update UI immediately, rollback on server failure
**When to use:** All drag-and-drop reorder operations

```typescript
// composables/useQueueActions.ts - extended
export function useQueueActions() {
  const client = useSupabaseClient()
  const pending = ref<Record<string, boolean>>({})

  async function reorderQueue(
    gateId: string,
    requestIds: string[],
    previousOrder: string[]
  ): Promise<boolean> {
    // Optimistic update already applied by useSortable
    try {
      const { error } = await client.rpc('reorder_queue', {
        p_gate_id: gateId,
        p_request_ids: requestIds
      })

      if (error) throw error
      toast.success('Queue reordered')
      return true
    } catch (e) {
      toast.error('Failed to reorder queue')
      // Caller should restore previousOrder
      return false
    }
  }

  async function setPriority(requestId: string): Promise<boolean> {
    pending.value[requestId] = true
    try {
      const { error } = await client.rpc('set_priority', {
        p_request_id: requestId
      })

      if (error) throw error
      toast.success('Marked as priority')
      return true
    } catch (e) {
      toast.error('Failed to set priority')
      return false
    } finally {
      pending.value[requestId] = false
    }
  }

  async function moveToGate(requestId: string, newGateId: string): Promise<boolean> {
    pending.value[requestId] = true
    try {
      const { error } = await client.rpc('move_to_gate', {
        p_request_id: requestId,
        p_new_gate_id: newGateId
      })

      if (error) throw error
      toast.success('Moved to new gate')
      return true
    } catch (e) {
      toast.error('Failed to move to gate')
      return false
    } finally {
      pending.value[requestId] = false
    }
  }

  return {
    pending: readonly(pending),
    // ... existing functions
    reorderQueue,
    setPriority,
    moveToGate,
  }
}
```

### Pattern 3: Gate Management Composable
**What:** CRUD operations for gates with validation
**When to use:** Gate create, rename, delete, enable/disable

```typescript
// composables/useGateManagement.ts
import { ref, readonly } from 'vue'
import { toast } from 'vue-sonner'

export function useGateManagement() {
  const client = useSupabaseClient()
  const pending = ref(false)

  async function createGate(gateNumber: number): Promise<string | null> {
    pending.value = true
    try {
      const { data, error } = await client
        .from('gates')
        .insert({ gate_number: gateNumber })
        .select('id')
        .single()

      if (error) throw error
      toast.success(`Gate ${gateNumber} created`)
      return data.id
    } catch (e: any) {
      if (e.code === '23505') { // unique violation
        toast.error(`Gate ${gateNumber} already exists`)
      } else {
        toast.error('Failed to create gate')
      }
      return null
    } finally {
      pending.value = false
    }
  }

  async function renameGate(gateId: string, newNumber: number): Promise<boolean> {
    pending.value = true
    try {
      const { error } = await client
        .from('gates')
        .update({ gate_number: newNumber })
        .eq('id', gateId)

      if (error) throw error
      toast.success(`Gate renamed to ${newNumber}`)
      return true
    } catch (e: any) {
      if (e.code === '23505') {
        toast.error(`Gate ${newNumber} already exists`)
      } else {
        toast.error('Failed to rename gate')
      }
      return false
    } finally {
      pending.value = false
    }
  }

  async function deleteGate(gateId: string): Promise<boolean> {
    pending.value = true
    try {
      // Check for customers in queue first
      const { count } = await client
        .from('pickup_requests')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_gate_id', gateId)
        .eq('status', 'in_queue')

      if (count && count > 0) {
        toast.error('Cannot delete gate with customers in queue')
        return false
      }

      const { error } = await client
        .from('gates')
        .delete()
        .eq('id', gateId)

      if (error) throw error
      toast.success('Gate deleted')
      return true
    } catch (e) {
      toast.error('Failed to delete gate')
      return false
    } finally {
      pending.value = false
    }
  }

  async function toggleGateActive(gateId: string, isActive: boolean): Promise<boolean> {
    pending.value = true
    try {
      // If disabling, check for customers in queue
      if (!isActive) {
        const { count } = await client
          .from('pickup_requests')
          .select('id', { count: 'exact', head: true })
          .eq('assigned_gate_id', gateId)
          .eq('status', 'in_queue')

        if (count && count > 0) {
          toast.error('Cannot disable gate with customers in queue')
          return false
        }
      }

      const { error } = await client
        .from('gates')
        .update({ is_active: isActive })
        .eq('id', gateId)

      if (error) throw error
      toast.success(isActive ? 'Gate enabled' : 'Gate disabled')
      return true
    } catch (e) {
      toast.error(`Failed to ${isActive ? 'enable' : 'disable'} gate`)
      return false
    } finally {
      pending.value = false
    }
  }

  return {
    pending: readonly(pending),
    createGate,
    renameGate,
    deleteGate,
    toggleGateActive,
  }
}
```

### Pattern 4: Gate View with Tabbed Interface
**What:** Per-gate filtered view for reordering, separate from all-requests view
**When to use:** Main dashboard organization

```vue
<!-- Conceptual structure for index.vue -->
<script setup lang="ts">
// Gates become primary navigation
const selectedGateId = ref<string | null>(null)

const gatesWithQueues = computed(() => {
  return gates.value?.map(gate => ({
    ...gate,
    queue: requests.value?.filter(r =>
      r.assigned_gate_id === gate.id &&
      r.status === 'in_queue'
    ).sort((a, b) => a.queue_position - b.queue_position) ?? []
  })) ?? []
})
</script>

<template>
  <Tabs v-model="selectedGateId">
    <TabsList>
      <TabsTrigger value="all">All Requests</TabsTrigger>
      <TabsTrigger
        v-for="gate in gatesWithQueues"
        :key="gate.id"
        :value="gate.id"
        :class="{ 'opacity-50': !gate.is_active }"
      >
        Gate {{ gate.gate_number }}
        <Badge class="ml-2">{{ gate.queue.length }}</Badge>
      </TabsTrigger>
      <TabsTrigger value="manage">Manage Gates</TabsTrigger>
    </TabsList>

    <TabsContent value="all">
      <!-- Existing DataTable view -->
    </TabsContent>

    <TabsContent v-for="gate in gatesWithQueues" :key="gate.id" :value="gate.id">
      <GateQueueList
        :gate-id="gate.id"
        :items="gate.queue"
        @reorder="handleReorder(gate.id, $event)"
      />
    </TabsContent>

    <TabsContent value="manage">
      <GateManagement :gates="gates" />
    </TabsContent>
  </Tabs>
</template>
```

### Anti-Patterns to Avoid
- **Cross-gate dragging:** Decision explicitly says no cross-gate dragging. Use dropdown for gate reassignment.
- **Optimistic without rollback plan:** Always capture previous state before optimistic update to enable rollback.
- **Integer position gaps:** Integer reordering should reassign all positions 1,2,3... not just swap two values.
- **Blocking gate disable without explanation:** Show clear message about why gate can't be disabled (customers in queue).
- **Missing drag handle:** Without explicit handle, entire row becomes draggable which interferes with other interactions.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop sorting | Custom mousedown/mousemove handlers | useSortable + SortableJS | Touch support, accessibility, animation, ghost preview |
| Position recalculation | Client-side loop with individual updates | PostgreSQL function with array | Race conditions, atomicity |
| Dialog forms | Custom modal with backdrop | shadcn-vue Dialog | Focus trap, escape handling, a11y |
| Ghost/drag preview | CSS transform on drag | SortableJS ghostClass/dragClass | Smooth animation, cross-browser |
| Optimistic rollback | Manual state management | Capture state before, restore on error | Clean separation of concerns |

**Key insight:** Drag-and-drop has many edge cases (touch devices, scroll containers, accessibility) that SortableJS handles. Queue position updates must be atomic to prevent race conditions - PostgreSQL functions are the only safe approach with Supabase.

## Common Pitfalls

### Pitfall 1: Race Condition During Concurrent Reordering
**What goes wrong:** Two staff members reorder the same gate's queue simultaneously, resulting in corrupted positions
**Why it happens:** Client-side position calculations don't account for concurrent changes
**How to avoid:** All position changes go through atomic PostgreSQL functions that operate on current server state
**Warning signs:** Duplicate positions, requests appearing in wrong order after refresh

### Pitfall 2: Forgetting to Disable Sortable for Empty/Disabled Gates
**What goes wrong:** Attempting to drag in empty list or disabled gate causes errors
**Why it happens:** SortableJS needs at least implicit handling for edge cases
**How to avoid:** Conditional rendering of sortable list, or use `option('disabled', true)` when gate is disabled
**Warning signs:** Console errors when dragging, ghost element stuck

### Pitfall 3: Priority Insertion Without Position Recalculation
**What goes wrong:** Setting priority doesn't actually move request to position 2
**Why it happens:** Only setting `is_priority = true` without updating positions
**How to avoid:** Priority function must: 1) set is_priority, 2) move to position 2, 3) shift others down
**Warning signs:** Priority badge shows but request still at original position

### Pitfall 4: Gate Deletion Without Foreign Key Handling
**What goes wrong:** Deleting gate leaves orphaned pickup_requests with invalid assigned_gate_id
**Why it happens:** Not clearing gate assignment before delete
**How to avoid:** Either: 1) prevent delete if queue has requests, OR 2) null out assigned_gate_id first
**Warning signs:** Foreign key constraint error, or orphaned requests

### Pitfall 5: Optimistic Update Not Capturing Previous State
**What goes wrong:** Rollback fails because original order wasn't saved
**Why it happens:** Direct mutation of reactive array without snapshot
**How to avoid:** Clone array before useSortable updates: `const previousOrder = [...localItems.value]`
**Warning signs:** After failed server call, UI stays in wrong state

### Pitfall 6: useSortable Not Reinitializing on Gate Change
**What goes wrong:** Switching gates shows wrong items or drag doesn't work
**Why it happens:** useSortable binds to element on mount, doesn't auto-rebind
**How to avoid:** Use `:key="gateId"` on the container to force remount, or use `option('disabled', ...)` dynamically
**Warning signs:** Dragging items from previous gate view, stale data

## Code Examples

Verified patterns from official sources:

### PostgreSQL Function: Reorder Queue Positions
```sql
-- Source: PostgreSQL UNNEST WITH ORDINALITY pattern
-- Atomically updates queue positions based on new order array

CREATE OR REPLACE FUNCTION reorder_queue(
  p_gate_id uuid,
  p_request_ids uuid[]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update positions based on array order
  -- UNNEST WITH ORDINALITY gives us (id, position) pairs
  UPDATE pickup_requests pr
  SET queue_position = arr.new_pos
  FROM (
    SELECT id, ordinality AS new_pos
    FROM UNNEST(p_request_ids) WITH ORDINALITY AS t(id, ordinality)
  ) arr
  WHERE pr.id = arr.id
    AND pr.assigned_gate_id = p_gate_id
    AND pr.status = 'in_queue';
END;
$$;

GRANT EXECUTE ON FUNCTION reorder_queue(uuid, uuid[]) TO authenticated;
```

### PostgreSQL Function: Set Priority
```sql
-- Source: Atomic position insertion pattern
-- Moves request to position 2, shifts others down

CREATE OR REPLACE FUNCTION set_priority(p_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_gate_id uuid;
  v_current_pos integer;
BEGIN
  -- Get current gate and position
  SELECT assigned_gate_id, queue_position
  INTO v_gate_id, v_current_pos
  FROM pickup_requests
  WHERE id = p_request_id AND status = 'in_queue';

  IF v_gate_id IS NULL THEN
    RAISE EXCEPTION 'Request not in queue';
  END IF;

  -- Shift positions 2 and above up by 1 (to make room)
  UPDATE pickup_requests
  SET queue_position = queue_position + 1
  WHERE assigned_gate_id = v_gate_id
    AND status = 'in_queue'
    AND queue_position >= 2
    AND queue_position < v_current_pos;

  -- Move request to position 2 and mark priority
  UPDATE pickup_requests
  SET queue_position = 2, is_priority = true
  WHERE id = p_request_id;
END;
$$;

GRANT EXECUTE ON FUNCTION set_priority(uuid) TO authenticated;
```

### PostgreSQL Function: Move to Different Gate
```sql
-- Source: Atomic gate transfer pattern
-- Removes from old gate, adds to end of new gate's queue

CREATE OR REPLACE FUNCTION move_to_gate(
  p_request_id uuid,
  p_new_gate_id uuid
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_gate_id uuid;
  v_old_pos integer;
  v_new_pos integer;
BEGIN
  -- Get current assignment
  SELECT assigned_gate_id, queue_position
  INTO v_old_gate_id, v_old_pos
  FROM pickup_requests
  WHERE id = p_request_id AND status = 'in_queue';

  IF v_old_gate_id IS NULL THEN
    RAISE EXCEPTION 'Request not in queue';
  END IF;

  -- Calculate new position at end of new gate's queue
  SELECT COALESCE(MAX(queue_position), 0) + 1
  INTO v_new_pos
  FROM pickup_requests
  WHERE assigned_gate_id = p_new_gate_id AND status = 'in_queue';

  -- Update request to new gate
  UPDATE pickup_requests
  SET assigned_gate_id = p_new_gate_id, queue_position = v_new_pos
  WHERE id = p_request_id;

  -- Compact old gate's positions (close gap)
  UPDATE pickup_requests
  SET queue_position = queue_position - 1
  WHERE assigned_gate_id = v_old_gate_id
    AND status = 'in_queue'
    AND queue_position > v_old_pos;

  RETURN v_new_pos;
END;
$$;

GRANT EXECUTE ON FUNCTION move_to_gate(uuid, uuid) TO authenticated;
```

### useSortable with Optimistic Rollback
```typescript
// Source: VueUse useSortable documentation + optimistic pattern
import { useSortable, moveArrayElement } from '@vueuse/integrations/useSortable'

const listRef = useTemplateRef('listRef')
const localItems = shallowRef<QueueItem[]>([])
let previousOrder: string[] = []

const { option } = useSortable(listRef, localItems, {
  animation: 150,
  handle: '.drag-handle',
  ghostClass: 'sortable-ghost',
  onStart: () => {
    // Capture state before drag
    previousOrder = localItems.value.map(i => i.id)
  },
  onUpdate: async (e) => {
    // Optimistic: array already updated by sortable
    moveArrayElement(localItems, e.oldIndex!, e.newIndex!, e)

    const newOrder = localItems.value.map(i => i.id)
    const success = await reorderQueue(props.gateId, newOrder, previousOrder)

    if (!success) {
      // Rollback: restore previous order
      const reorderedItems = previousOrder.map(id =>
        localItems.value.find(i => i.id === id)!
      )
      localItems.value = reorderedItems
    }
  }
})
```

### Gate Create Dialog
```vue
<!-- Source: shadcn-vue Dialog patterns -->
<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'

const emit = defineEmits<{
  create: [gateNumber: number]
}>()

const open = ref(false)
const gateNumber = ref<number | null>(null)

async function handleCreate() {
  if (gateNumber.value) {
    emit('create', gateNumber.value)
    open.value = false
    gateNumber.value = null
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="outline" size="sm">
        <Plus class="h-4 w-4 mr-2" />
        Add Gate
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Gate</DialogTitle>
        <DialogDescription>
          Enter a gate number. This will be displayed to customers.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="gate-number" class="text-right">Gate Number</Label>
          <Input
            id="gate-number"
            v-model.number="gateNumber"
            type="number"
            min="1"
            class="col-span-3"
            placeholder="e.g., 5"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="open = false">Cancel</Button>
        <Button :disabled="!gateNumber" @click="handleCreate">Create Gate</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HTML5 native drag-drop | SortableJS | 2020+ | Cross-browser, touch support, animations |
| Fractional indexing | Integer with atomic reorder | Depends | Integers simpler for small lists, fractions for high-frequency updates |
| Per-row position updates | Bulk UPDATE with UNNEST | 2023+ | Single round-trip, atomic, no race conditions |
| Custom drag preview | SortableJS ghostClass/dragClass | 2020+ | Consistent, configurable, performant |
| Separate sort handle component | CSS class selector in options | 2022+ | Simpler, less nesting |

**Deprecated/outdated:**
- `vue-draggable` (Vue 2): Use vuedraggable@next or vue-draggable-plus for Vue 3
- Direct SortableJS new Sortable(): Use useSortable for reactive integration
- Individual UPDATE per position: Use UNNEST bulk pattern

## Open Questions

Things that couldn't be fully resolved:

1. **Priority badge visual indicator**
   - What we know: Context says "Priority visual indicator (badge, icon, or position alone)" is Claude's discretion
   - What's unclear: Exact styling/placement
   - Recommendation: Use Badge variant="destructive" for high visibility, place after company name

2. **Gate management UI placement**
   - What we know: Context says this is Claude's discretion
   - What's unclear: Dedicated tab vs inline controls vs separate page
   - Recommendation: Add "Manage Gates" tab alongside per-gate tabs for discoverability

3. **Behavior when disabling gate with customers**
   - What we know: Context says "block with error vs offer to reassign" is Claude's discretion
   - What's unclear: Whether to offer reassignment UI
   - Recommendation: Start with block + clear error message. Reassignment adds complexity.

4. **Real-time updates from other staff**
   - What we know: Context mentions this as Claude's discretion
   - What's unclear: Whether to use Supabase Realtime or polling
   - Recommendation: Defer realtime to later phase. Manual refresh for now. Add "Last updated" timestamp.

## Sources

### Primary (HIGH confidence)
- [VueUse useSortable](https://vueuse.org/integrations/useSortable/) - Composable API, options, events
- [SortableJS Options](https://sortablejs.github.io/Sortable/) - ghostClass, dragClass, handle, animation
- [shadcn-vue Dialog](https://www.shadcn-vue.com/docs/components/dialog) - Form dialog patterns
- [PostgreSQL UNNEST WITH ORDINALITY](https://www.postgresql.org/docs/current/functions-array.html) - Bulk update pattern

### Secondary (MEDIUM confidence)
- [Rocicorp fractional-indexing](https://github.com/rocicorp/fractional-indexing) - Alternative approach (not recommended for this use case)
- [Supabase RPC transactions](https://github.com/orgs/supabase/discussions/526) - PostgreSQL function patterns

### Tertiary (LOW confidence)
- WebSearch results on optimistic updates with Vue - general patterns
- WebSearch on queue position management - various approaches

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - useSortable verified via VueUse docs, SortableJS is mature
- Architecture: HIGH - Patterns follow existing Phase 5 structure, PostgreSQL patterns are well-documented
- Pitfalls: HIGH - Based on known SortableJS behaviors and PostgreSQL concurrency patterns

**Research date:** 2026-01-29
**Valid until:** 2026-02-28 (30 days - stack is stable)
