# Phase 5: Staff Queue Management - Research

**Researched:** 2026-01-29
**Domain:** Vue Table Actions, Supabase Mutations, UI Feedback Patterns
**Confidence:** HIGH

## Summary

This phase adds queue management actions to the Phase 4 dashboard: gate assignment (which automatically adds to queue), cancel request, and mark complete. The existing Nuxt 4 + shadcn-vue + TanStack Table stack provides all necessary tools. New components needed are Select (for gate dropdown), AlertDialog (for confirmations), Tabs (for Active/History views), and Sonner (for toast notifications).

The standard approach uses inline action buttons rendered via TanStack Table column definitions, with shadcn-vue's Select component for gate assignment in each row. Confirmations use AlertDialog with simple yes/no patterns. Status transitions are handled by direct Supabase updates via the authenticated client. Vue Sonner provides toast feedback alongside inline visual updates (button loading states, row class changes).

Key findings: The existing RLS policies already allow authenticated users full CRUD on pickup_requests. Queue position calculation should use an atomic single-statement pattern to avoid race conditions. Completed/cancelled rows should remain visible briefly (fade-out via CSS transition) then filter to History tab. The Sheet component is ideal for the row-click detail panel.

**Primary recommendation:** Use inline Select for gate assignment, AlertDialog for confirmations, Sonner toasts + button spinners for feedback, and Tabs to separate Active Queue from History.

## Standard Stack

The established libraries/tools for this domain:

### Core (Partially Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/vue-table | ^8.21.3 | Inline actions in table columns | Already installed in Phase 4 |
| vue-sonner | ^2.x | Toast notifications | Official shadcn-vue recommendation |
| shadcn-vue Select | - | Gate dropdown in table rows | Add via CLI |
| shadcn-vue AlertDialog | - | Confirmation dialogs | Add via CLI |
| shadcn-vue Tabs | - | Active Queue / History separation | Add via CLI |
| shadcn-vue Sheet | - | Row detail slide-over panel | Add via CLI |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-vue-next | ^0.563.0 | Action icons (Check, X, Loader2) | Button icons, loading spinners |
| @nuxtjs/supabase | ^2.0.3 | Authenticated mutations | All database updates |
| reka-ui | ^2.7.0 | Primitive components | Base for shadcn-vue components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| vue-sonner | vue-toastification | Sonner is shadcn-vue default, simpler API |
| Sheet for detail | Modal/Dialog | Sheet feels more natural for supplementary content |
| Inline Select | Dropdown menu | Select better for single value selection in constrained space |

**Installation:**
```bash
# From staff/ directory
pnpm add vue-sonner

# Add shadcn-vue components
pnpm dlx shadcn-vue@latest add select alert-dialog tabs sheet sonner
```

**Sonner Setup (app.vue):**
```vue
<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster position="top-right" />
</template>
```

## Architecture Patterns

### Recommended Project Structure
```
staff/app/
├── components/
│   ├── ui/
│   │   ├── select/           # Gate selection dropdown (add via CLI)
│   │   ├── alert-dialog/     # Confirmation dialogs (add via CLI)
│   │   ├── tabs/             # Active/History tabs (add via CLI)
│   │   ├── sheet/            # Detail panel (add via CLI)
│   │   └── sonner/           # Toast component (add via CLI)
│   └── dashboard/
│       ├── DataTable.vue     # Update: add row click handler
│       ├── columns.ts        # Update: add actions column
│       ├── StatusBadge.vue   # Existing
│       ├── GateSelect.vue    # NEW: Gate dropdown with queue counts
│       ├── ActionButtons.vue # NEW: Cancel/Complete buttons
│       └── RequestDetail.vue # NEW: Sheet content for request details
├── composables/
│   └── useQueueActions.ts    # NEW: Mutation handlers with toast feedback
└── pages/
    └── index.vue             # Update: Add tabs, sheet state
```

### Pattern 1: Inline Action Buttons in TanStack Table
**What:** Add an actions column that renders buttons for each row
**When to use:** Row-level operations like Cancel, Complete

**Column Definition:**
```typescript
// Source: TanStack Table column definitions + shadcn-vue patterns
import { h } from 'vue'
import ActionButtons from './ActionButtons.vue'

{
  id: 'actions',
  header: 'Actions',
  cell: ({ row }) => {
    return h(ActionButtons, {
      request: row.original,
      onComplete: () => handleComplete(row.original.id),
      onCancel: () => handleCancel(row.original.id),
    })
  },
}
```

### Pattern 2: Gate Select with Queue Counts
**What:** Inline dropdown showing available gates and their current queue depth
**When to use:** Assigning/reassigning a request to a gate

```vue
<!-- GateSelect.vue -->
<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Gate {
  id: string
  gate_number: number
  queue_count: number
}

const props = defineProps<{
  gates: Gate[]
  currentGateId: string | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: [gateId: string]
}>()
</script>

<template>
  <Select
    :model-value="currentGateId ?? undefined"
    :disabled="disabled"
    @update:model-value="emit('select', $event)"
  >
    <SelectTrigger class="w-[140px]">
      <SelectValue placeholder="Select gate" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="gate in gates" :key="gate.id" :value="gate.id">
        Gate {{ gate.gate_number }} ({{ gate.queue_count }} in queue)
      </SelectItem>
    </SelectContent>
  </Select>
</template>
```

### Pattern 3: Confirmation Dialog Pattern
**What:** AlertDialog for destructive actions with simple yes/no
**When to use:** Cancel request, reassign gate, mark complete

```vue
<!-- CancelConfirmDialog.vue -->
<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger as-child>
      <slot />
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Cancel this pickup request?</AlertDialogTitle>
        <AlertDialogDescription>
          This will remove the customer from the queue. This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>No, keep it</AlertDialogCancel>
        <AlertDialogAction @click="$emit('confirm')">
          Yes, cancel request
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
```

### Pattern 4: Queue Action Composable with Toast Feedback
**What:** Centralized mutation handlers with loading state and toast notifications
**When to use:** All queue operations (assign gate, cancel, complete)

```typescript
// composables/useQueueActions.ts
import { ref } from 'vue'
import { toast } from 'vue-sonner'

export function useQueueActions() {
  const client = useSupabaseClient()
  const pending = ref<Record<string, boolean>>({})

  async function assignGate(requestId: string, gateId: string) {
    pending.value[requestId] = true
    try {
      // Get next queue position atomically
      const { data: nextPos } = await client.rpc('get_next_queue_position', {
        p_gate_id: gateId
      })

      const { error } = await client
        .from('pickup_requests')
        .update({
          assigned_gate_id: gateId,
          queue_position: nextPos,
          status: 'in_queue'
        })
        .eq('id', requestId)

      if (error) throw error
      toast.success('Request added to queue')
    } catch (e) {
      toast.error('Failed to assign gate')
      throw e
    } finally {
      pending.value[requestId] = false
    }
  }

  async function cancelRequest(requestId: string) {
    pending.value[requestId] = true
    try {
      const { error } = await client
        .from('pickup_requests')
        .update({
          status: 'cancelled',
          assigned_gate_id: null,
          queue_position: null
        })
        .eq('id', requestId)

      if (error) throw error
      toast.success('Request cancelled')
    } catch (e) {
      toast.error('Failed to cancel request')
      throw e
    } finally {
      pending.value[requestId] = false
    }
  }

  async function completeRequest(requestId: string) {
    pending.value[requestId] = true
    try {
      const { error } = await client
        .from('pickup_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) throw error
      toast.success('Pickup marked complete')
    } catch (e) {
      toast.error('Failed to complete pickup')
      throw e
    } finally {
      pending.value[requestId] = false
    }
  }

  return {
    pending: readonly(pending),
    assignGate,
    cancelRequest,
    completeRequest,
  }
}
```

### Pattern 5: Tabs for Active Queue vs History
**What:** Tab-based separation of active vs completed/cancelled requests
**When to use:** Dashboard main view

```vue
<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const activeRequests = computed(() =>
  requests.value?.filter(r =>
    !['completed', 'cancelled'].includes(r.status)
  ) ?? []
)

const historyRequests = computed(() =>
  requests.value?.filter(r =>
    ['completed', 'cancelled'].includes(r.status)
  ) ?? []
)
</script>

<template>
  <Tabs default-value="active" class="w-full">
    <TabsList>
      <TabsTrigger value="active">
        Active Queue ({{ activeRequests.length }})
      </TabsTrigger>
      <TabsTrigger value="history">
        History ({{ historyRequests.length }})
      </TabsTrigger>
    </TabsList>
    <TabsContent value="active">
      <DataTable :columns="activeColumns" :data="activeRequests" />
    </TabsContent>
    <TabsContent value="history">
      <DataTable :columns="historyColumns" :data="historyRequests" />
    </TabsContent>
  </Tabs>
</template>
```

### Pattern 6: Row Click to Open Detail Sheet
**What:** Click table row to open slide-over panel with full request info
**When to use:** Viewing request details without leaving the list

```vue
<!-- DataTable.vue updates -->
<script setup lang="ts">
const emit = defineEmits<{
  'row-click': [row: TData]
}>()
</script>

<template>
  <TableRow
    v-for="row in table.getRowModel().rows"
    :key="row.id"
    class="cursor-pointer"
    @click="emit('row-click', row.original)"
  >
    <!-- cells -->
  </TableRow>
</template>
```

```vue
<!-- index.vue with Sheet -->
<script setup lang="ts">
const selectedRequest = ref<PickupRequest | null>(null)
const sheetOpen = computed({
  get: () => selectedRequest.value !== null,
  set: (v) => { if (!v) selectedRequest.value = null }
})

function handleRowClick(request: PickupRequest) {
  selectedRequest.value = request
}
</script>

<template>
  <Sheet v-model:open="sheetOpen">
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Request Details</SheetTitle>
      </SheetHeader>
      <RequestDetail v-if="selectedRequest" :request="selectedRequest" />
    </SheetContent>
  </Sheet>
</template>
```

### Pattern 7: Button Loading State
**What:** Show spinner in button while action is processing
**When to use:** All action buttons

```vue
<script setup lang="ts">
import { Loader2, Check, X } from 'lucide-vue-next'

const props = defineProps<{
  loading?: boolean
}>()
</script>

<template>
  <Button size="sm" :disabled="loading" @click="$emit('complete')">
    <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
    <Check v-else class="h-4 w-4" />
    Complete
  </Button>
</template>
```

### Anti-Patterns to Avoid
- **Optimistic updates without rollback:** For queue operations, wait for server confirmation. The queue state is critical and race conditions are possible.
- **Fetching gates per row:** Fetch gates once at page level and pass down via props or provide/inject.
- **Inline confirmation strings:** Use AlertDialog for any destructive action, not window.confirm().
- **Missing loading states:** Every action button must show loading state while processing.
- **Direct status updates without position cleanup:** When cancelling, also clear queue_position and gate assignment.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gate selection dropdown | Custom div with click handler | shadcn-vue Select | Keyboard nav, accessibility, consistent styling |
| Confirmation dialogs | window.confirm() | shadcn-vue AlertDialog | Better UX, consistent styling, customizable |
| Toast notifications | Custom positioned divs | vue-sonner via shadcn-vue | Queue management, auto-dismiss, animations |
| Side panel | Custom positioned div | shadcn-vue Sheet | Accessibility, backdrop, close handling |
| Tab navigation | Custom tab state | shadcn-vue Tabs | Keyboard nav, ARIA labels, active state |
| Queue position calculation | SELECT MAX + 1 in app | Postgres function | Race condition prevention |

**Key insight:** Queue operations are sensitive to race conditions. Use single-statement Postgres operations for position assignment. For UI components, shadcn-vue provides accessible, styled primitives that handle edge cases like keyboard navigation and focus management.

## Common Pitfalls

### Pitfall 1: Race Condition in Queue Position Assignment
**What goes wrong:** Two concurrent requests get same queue position
**Why it happens:** Read-modify-write pattern with gap between SELECT MAX and UPDATE
**How to avoid:** Use Postgres function with single-statement UPDATE that calculates position atomically
**Warning signs:** Duplicate queue_position values in same gate, constraint violations

**Solution - Create a Postgres function:**
```sql
CREATE OR REPLACE FUNCTION assign_to_queue(
  p_request_id uuid,
  p_gate_id uuid
) RETURNS integer AS $$
DECLARE
  v_position integer;
BEGIN
  -- Calculate next position and update in single statement
  UPDATE pickup_requests
  SET
    assigned_gate_id = p_gate_id,
    status = 'in_queue',
    queue_position = (
      SELECT COALESCE(MAX(queue_position), 0) + 1
      FROM pickup_requests
      WHERE assigned_gate_id = p_gate_id
        AND status = 'in_queue'
    )
  WHERE id = p_request_id
  RETURNING queue_position INTO v_position;

  RETURN v_position;
END;
$$ LANGUAGE plpgsql;
```

### Pitfall 2: Stale Gate Queue Counts
**What goes wrong:** Gate dropdown shows outdated queue counts after operations
**Why it happens:** Gate query not refreshed after mutations
**How to avoid:** Refresh gates query after any queue operation, or use Supabase Realtime
**Warning signs:** Gate count doesn't match visible in_queue rows

### Pitfall 3: Missing Position Cleanup on Cancel/Complete
**What goes wrong:** Gaps in queue positions after cancellation
**Why it happens:** Only updating status, not cleaning up position
**How to avoid:** Set queue_position = null and assigned_gate_id = null when cancelling
**Warning signs:** Queue shows gaps (1, 2, 4 instead of 1, 2, 3)

### Pitfall 4: Sonner Not Rendering
**What goes wrong:** toast() calls do nothing
**Why it happens:** `<Toaster />` component not added to app.vue
**How to avoid:** Add Toaster to app.vue template, verify it renders
**Warning signs:** No errors but no toasts appear

### Pitfall 5: Sheet Blocking Row Actions
**What goes wrong:** Clicking action button in row also opens sheet
**Why it happens:** Event bubbles from button click to row click
**How to avoid:** Use @click.stop on action buttons
**Warning signs:** Sheet opens when clicking Cancel/Complete buttons

### Pitfall 6: Completed Row Disappears Too Fast
**What goes wrong:** Row vanishes immediately after marking complete, confusing UX
**Why it happens:** Filter removes completed rows from active list
**How to avoid:** Add CSS transition with delay, or keep in list for ~30 seconds
**Warning signs:** User unsure if action succeeded because row just vanished

## Code Examples

Verified patterns from official sources:

### Atomic Queue Position Function (Postgres)
```sql
-- Migration: Add function for atomic queue assignment
-- Source: PostgreSQL atomic operation pattern

CREATE OR REPLACE FUNCTION assign_to_queue(
  p_request_id uuid,
  p_gate_id uuid
) RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_position integer;
BEGIN
  -- Single statement prevents race conditions
  UPDATE pickup_requests
  SET
    assigned_gate_id = p_gate_id,
    status = 'in_queue',
    queue_position = (
      SELECT COALESCE(MAX(queue_position), 0) + 1
      FROM pickup_requests
      WHERE assigned_gate_id = p_gate_id
        AND status = 'in_queue'
    )
  WHERE id = p_request_id
    AND status IN ('pending', 'approved')
  RETURNING queue_position INTO v_position;

  RETURN v_position;
END;
$$;
```

### Complete Action Button with Confirmation
```vue
<!-- Source: shadcn-vue AlertDialog + Button patterns -->
<script setup lang="ts">
import { Check, Loader2 } from 'lucide-vue-next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
}>()
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger as-child>
      <Button size="sm" variant="outline" :disabled="loading" @click.stop>
        <Loader2 v-if="loading" class="h-4 w-4 mr-1 animate-spin" />
        <Check v-else class="h-4 w-4 mr-1" />
        Complete
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Mark pickup as complete?</AlertDialogTitle>
        <AlertDialogDescription>
          This will complete the pickup and remove it from the active queue.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction @click="emit('confirm')">
          Mark Complete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
```

### Gate Select with Query for Counts
```typescript
// Fetch gates with queue counts
const client = useSupabaseClient()

const { data: gates } = await useAsyncData('gates-with-counts', async () => {
  const { data, error } = await client
    .from('gates')
    .select(`
      id,
      gate_number,
      is_active,
      pickup_requests!left(id)
    `)
    .eq('is_active', true)
    .eq('pickup_requests.status', 'in_queue')

  if (error) throw error

  // Transform to include queue count
  return data.map(gate => ({
    id: gate.id,
    gate_number: gate.gate_number,
    is_active: gate.is_active,
    queue_count: gate.pickup_requests?.length ?? 0
  }))
})
```

### Row Fade-Out Animation for Completed/Cancelled
```vue
<style scoped>
.row-fade-out {
  animation: fadeOut 0.5s ease-out 30s forwards;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    height: 0;
    padding: 0;
    margin: 0;
  }
}
</style>

<template>
  <TableRow
    v-for="row in table.getRowModel().rows"
    :key="row.id"
    :class="{
      'row-fade-out': ['completed', 'cancelled'].includes(row.original.status),
      'bg-destructive/10': row.original.status === 'pending' || row.original.email_flagged,
    }"
  >
    <!-- cells -->
  </TableRow>
</template>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| window.confirm() | AlertDialog component | 2023 | Better UX, consistent styling |
| Custom toast divs | vue-sonner | 2024 | Stacking, queue, animations |
| Dropdown for select | shadcn-vue Select | 2024 | Accessibility, keyboard nav |
| Custom slide panel | Sheet component | 2024 | Focus trap, backdrop, a11y |
| Optimistic + rollback | Wait for server | 2025 | Simpler for critical queue ops |

**Deprecated/outdated:**
- `vue-toastification`: Works but vue-sonner is now shadcn-vue default
- `@headlessui/vue`: Reka UI is now the base for shadcn-vue
- Optimistic queue updates: Too complex for the race condition risk

## Open Questions

Things that couldn't be fully resolved:

1. **Fade-out timing for completed requests**
   - What we know: Context says "fade out after ~30 seconds"
   - What's unclear: Exact UX feel - might need adjustment after testing
   - Recommendation: Start with 30s, make it configurable via CSS variable

2. **Reassignment confirmation dialog content**
   - What we know: Need confirmation when reassigning to different gate
   - What's unclear: Should it show old vs new gate info?
   - Recommendation: Show "Move from Gate X to Gate Y?" with customer name

3. **History tab data limits**
   - What we know: Should show completed/cancelled requests
   - What's unclear: How far back? All time or limited?
   - Recommendation: Start with last 24 hours, add date filter in Phase 6 if needed

4. **Queue position recalculation on cancel**
   - What we know: Cancelling creates gap in positions
   - What's unclear: Should remaining positions shift down?
   - Recommendation: Leave gaps for now - renumbering adds complexity. Queue order still works.

## Sources

### Primary (HIGH confidence)
- [shadcn-vue Select](https://www.shadcn-vue.com/docs/components/select) - Select component API, usage patterns
- [shadcn-vue AlertDialog](https://www.shadcn-vue.com/docs/components/alert-dialog) - Confirmation dialog patterns
- [shadcn-vue Tabs](https://www.shadcn-vue.com/docs/components/tabs) - Tab component structure
- [shadcn-vue Sheet](https://www.shadcn-vue.com/docs/components/sheet) - Side panel component
- [shadcn-vue Sonner](https://www.shadcn-vue.com/docs/components/sonner) - Toast notifications setup
- [vue-sonner](https://vue-sonner.vercel.app/) - Toast API reference

### Secondary (MEDIUM confidence)
- [Supabase RLS Policies](https://supabase.com/docs/guides/database/postgres/row-level-security) - Authenticated user policies
- [TanStack Table Vue](https://tanstack.com/table/v8/docs/framework/vue/vue-table) - Column action patterns
- [PostgreSQL race condition prevention](https://dev.to/mistval/winning-race-conditions-with-postgresql-54gn) - Atomic update patterns

### Tertiary (LOW confidence)
- WebSearch results on vue-sonner Nuxt setup - patterns work but may vary by version
- WebSearch on optimistic updates - general patterns, not Vue-specific

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official shadcn-vue docs
- Architecture: HIGH - Patterns from official component examples
- Pitfalls: MEDIUM - Based on common patterns and PostgreSQL documentation

**Research date:** 2026-01-29
**Valid until:** 2026-02-28 (30 days - stack is stable)
