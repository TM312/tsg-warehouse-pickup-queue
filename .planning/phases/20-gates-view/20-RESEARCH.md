# Phase 20: Gates View - Research

**Researched:** 2026-02-03
**Domain:** Vue/Nuxt admin page with table, modal dialog, and toggle controls
**Confidence:** HIGH

## Summary

This phase creates a dedicated `/gates` management page following established patterns already present in the codebase. The existing `GateManagement.vue` component (used in dashboard's "Manage Gates" tab) provides most of the required functionality but uses a grid layout. This phase requires converting to a table layout with specific columns and adding an "Open" link to navigate to gate operator views.

The codebase already has all necessary UI primitives (Table, Badge, Switch, Dialog components from shadcn-vue) and the business logic composable (`useGateManagement`). The main work is creating a new page that reorganizes existing functionality into the required table format.

**Primary recommendation:** Create a simple table-based page using existing UI components and `useGateManagement` composable. No new libraries or patterns needed.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 | ^3.5.27 | Component framework | Already in use |
| Nuxt 4 | ^4.3.0 | File-based routing, auto-imports | Already in use |
| Pinia | 0.11.3 | State management | Already in use |
| shadcn-vue | via reka-ui 2.7.0 | UI components | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-vue-next | ^0.563.0 | Icons | Button icons, empty states |
| vue-sonner | ^2.0.9 | Toast notifications | Success/error feedback |

### No New Dependencies Needed

All required functionality exists in codebase:
- `@/components/ui/table/*` - Table primitives
- `@/components/ui/badge/*` - Status badges
- `@/components/ui/switch/*` - Toggle controls
- `@/components/ui/dialog/*` - Modal dialogs
- `@/components/ui/alert-dialog/*` - Confirmation dialogs
- `@/composables/useGateManagement` - Gate CRUD operations
- `@/stores/gates` - Gate state management

## Architecture Patterns

### Recommended File Structure
```
staff/app/
├── pages/
│   └── gates.vue                    # New page (simple, minimal logic)
├── components/
│   └── gates/
│       ├── GatesTable.vue           # New: Table component
│       ├── GateStatusBadge.vue      # New: Active/Inactive badge
│       ├── CreateGateDialog.vue     # Existing: Reuse as-is
│       └── GateManagement.vue       # Existing: Keep for dashboard tab
└── composables/
    └── useGateManagement.ts         # Existing: Reuse as-is
```

### Pattern 1: Page Component Pattern (from index.vue, business-hours.vue)
**What:** Thin page components that delegate to composables and child components
**When to use:** All page-level components
**Example:**
```typescript
// Source: staff/app/pages/settings/business-hours.vue pattern
<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const gatesStore = useGatesStore()
const { gates } = storeToRefs(gatesStore)
const { createGate, toggleGateActive } = useGateManagement()
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Gates</h1>
      <CreateGateDialog @create="createGate" />
    </div>
    <GatesTable
      :gates="gates"
      @toggle-active="toggleGateActive"
    />
  </div>
</template>
```

### Pattern 2: Simple Table (without TanStack)
**What:** Use raw shadcn Table components for simple, static tables
**When to use:** No sorting/filtering required (per CONTEXT.md decision)
**Example:**
```vue
// Source: staff/app/components/ui/table pattern
<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Status</TableHead>
        <!-- ... -->
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="gate in gates" :key="gate.id">
        <TableCell>Gate {{ gate.gate_number }}</TableCell>
        <!-- ... -->
      </TableRow>
    </TableBody>
  </Table>
</template>
```

### Pattern 3: Status Badge with Custom Colors
**What:** Badge component with conditional styling for status
**When to use:** Active/Inactive status display
**Example:**
```vue
// Source: staff/app/components/dashboard/StatusBadge.vue pattern
<script setup lang="ts">
const props = defineProps<{ isActive: boolean }>()

const badgeClass = computed(() =>
  props.isActive
    ? 'bg-green-500 text-white'
    : 'bg-gray-400 text-white'
)
</script>

<template>
  <Badge :class="badgeClass">
    {{ isActive ? 'Active' : 'Inactive' }}
  </Badge>
</template>
```

### Pattern 4: Confirmation Dialog for Destructive Actions
**What:** AlertDialog that requires user confirmation
**When to use:** Disabling gate with active orders (per CONTEXT.md)
**Example:**
```vue
// Source: staff/app/components/dashboard/ActionButtons.vue pattern
<AlertDialog v-model:open="showConfirm">
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Cannot Disable Gate</AlertDialogTitle>
      <AlertDialogDescription>
        This gate has {{ orderCount }} active orders.
        Please reassign or complete them first.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogAction @click="showConfirm = false">
        Understood
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Anti-Patterns to Avoid
- **Using TanStack for simple tables:** Overkill when no sorting/filtering needed
- **Duplicating gate logic:** Reuse `useGateManagement` composable
- **Creating new store:** Gates store already exists and is populated by app.vue
- **Adding new API calls:** `useGateManagement` already handles all gate operations

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toggle gate active state | Custom API call | `useGateManagement.toggleGateActive()` | Already handles queue check, toasts, store update |
| Create new gate | Custom form submission | `CreateGateDialog.vue` + `useGateManagement.createGate()` | Already handles validation, duplicate detection, toasts |
| Gate state management | Local component state | `useGatesStore` | Already populated by app.vue, kept in sync |
| UI components | Custom styled elements | shadcn-vue Table, Badge, Switch, Dialog | Consistent styling, accessibility built-in |

**Key insight:** The GateManagement tab in the dashboard already implements 90% of the required functionality. This phase primarily reorganizes it into a table layout on a dedicated page.

## Common Pitfalls

### Pitfall 1: Not Checking Processing Orders
**What goes wrong:** User tries to disable gate, silent failure or confusing error
**Why it happens:** `toggleGateActive` only checks IN_QUEUE status, not PROCESSING
**How to avoid:** The existing composable already handles this correctly - it checks for IN_QUEUE. Need to also check PROCESSING per CONTEXT.md requirement.
**Warning signs:** Gate can be disabled while order is being processed

**Resolution:** Modify `useGateManagement.toggleGateActive()` to check both statuses:
```typescript
// Current implementation checks:
.eq('status', PICKUP_STATUS.IN_QUEUE)

// Should check both:
.in('status', [PICKUP_STATUS.IN_QUEUE, PICKUP_STATUS.PROCESSING])
```

### Pitfall 2: Missing Gate Data on Initial Load
**What goes wrong:** Empty table flashes before data loads
**Why it happens:** Gates store might not be populated yet
**How to avoid:** Gates are fetched in app.vue on mount. Use loading state from store.
**Warning signs:** Table shows "No gates" briefly, then populates

### Pitfall 3: Confirmation Dialog Blocking User
**What goes wrong:** User clicks disable, sees error, but switch already toggled
**Why it happens:** Switch updates optimistically before API check
**How to avoid:** Per CONTEXT.md, confirmation is only needed if gate has active orders. Check first, show error if blocked, don't toggle.
**Warning signs:** Switch state doesn't match actual gate state

### Pitfall 4: Router Link vs NuxtLink
**What goes wrong:** Full page reload instead of SPA navigation
**Why it happens:** Using `<a>` or `<router-link>` instead of `<NuxtLink>`
**How to avoid:** Always use `<NuxtLink to="/gate/${gateId}">` for internal navigation
**Warning signs:** Page refresh when clicking "Open" link

## Code Examples

Verified patterns from codebase:

### GatesTable Component Structure
```vue
// Based on: staff/app/components/dashboard/DataTable.vue + GateManagement.vue
<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { GateWithCount } from '#shared/types/gate'

const props = defineProps<{
  gates: GateWithCount[]
}>()

const emit = defineEmits<{
  'toggle-active': [gateId: string, isActive: boolean]
}>()

const sortedGates = computed(() =>
  [...props.gates].sort((a, b) => a.gate_number - b.gate_number)
)
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Gate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Queue</TableHead>
          <TableHead>Processing</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="gate in sortedGates" :key="gate.id">
          <TableCell class="font-medium">Gate {{ gate.gate_number }}</TableCell>
          <TableCell>
            <Badge :class="gate.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'">
              {{ gate.is_active ? 'Active' : 'Inactive' }}
            </Badge>
          </TableCell>
          <TableCell>{{ gate.queue_count }}</TableCell>
          <TableCell><!-- processing order ID or dash --></TableCell>
          <TableCell class="text-right space-x-2">
            <Switch
              :checked="gate.is_active"
              @update:checked="(checked) => emit('toggle-active', gate.id, checked)"
            />
            <Button variant="outline" size="sm" as-child>
              <NuxtLink :to="`/gate/${gate.id}`">Open</NuxtLink>
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
```

### Empty State Pattern
```vue
// Based on: staff/app/components/gates/GateManagement.vue
<template>
  <div v-if="gates.length === 0" class="text-center py-12 text-muted-foreground">
    <DoorOpen class="h-12 w-12 mx-auto mb-4 opacity-50" />
    <p class="text-lg font-medium mb-2">No gates configured</p>
    <p class="text-sm mb-4">Create your first gate to get started</p>
    <CreateGateDialog @create="handleCreate" />
  </div>
</template>
```

### Error Dialog for Blocked Disable
```vue
// Based on: staff/app/components/dashboard/ActionButtons.vue pattern
<AlertDialog v-model:open="showBlockedError">
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Cannot Disable Gate</AlertDialogTitle>
      <AlertDialogDescription>
        Gate {{ blockedGate?.gate_number }} has {{ blockedOrderCount }} active orders
        ({{ queuedCount }} queued, {{ processingCount }} processing).
        Please reassign or complete these orders before disabling the gate.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogAction>Understood</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Grid card layout | Table layout | This phase | Better information density |
| Tab in dashboard | Dedicated page | This phase | Clearer navigation |
| No processing column | Show processing order | This phase | More complete view |

**No deprecated patterns:** All existing code uses current Nuxt 4 / Vue 3 patterns.

## Open Questions

### Question 1: Processing Order Display
- What we know: Need to show "order ID only" per CONTEXT.md
- What's unclear: Which ID? `id` (UUID) or `sales_order_number`?
- Recommendation: Use `sales_order_number` as it's human-readable and shown elsewhere in UI

### Question 2: Queue Count Data Source
- What we know: `GateWithCount` has `queue_count` property
- What's unclear: Does this include PROCESSING orders or only IN_QUEUE?
- Recommendation: Verify by checking where `queue_count` is calculated. May need to fetch processing order separately.

### Question 3: Gate Name vs Gate Number
- What we know: CONTEXT.md says "gate name" but existing code uses "gate_number"
- What's unclear: Should we add a `name` field or display "Gate X" pattern?
- Recommendation: Continue "Gate X" pattern (e.g., "Gate 1") as done throughout codebase

## Sources

### Primary (HIGH confidence)
- `/staff/app/components/gates/GateManagement.vue` - Existing gate management UI
- `/staff/app/components/gates/CreateGateDialog.vue` - Existing create dialog
- `/staff/app/composables/useGateManagement.ts` - Existing gate operations
- `/staff/app/stores/gates.ts` - Existing gate store
- `/staff/app/components/ui/table/*` - Existing table components
- `/staff/app/components/dashboard/DataTable.vue` - Table pattern reference
- `/staff/app/components/dashboard/StatusBadge.vue` - Badge pattern reference
- `/staff/app/pages/index.vue` - Dashboard page pattern
- `/staff/app/pages/settings/business-hours.vue` - Settings page pattern

### Secondary (MEDIUM confidence)
- `/staff/app/components/ui/alert-dialog/*` - Confirmation dialog components
- `/staff/shared/types/gate.ts` - Gate type definitions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All components already exist in codebase
- Architecture: HIGH - Following established page/component patterns
- Pitfalls: HIGH - Based on code review and CONTEXT.md requirements

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (stable, internal codebase patterns)
