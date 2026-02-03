# Phase 21: Dashboard Polish - Research

**Researched:** 2026-02-03
**Domain:** Vue 3 / Nuxt 4 UI Components (shadcn-vue, Tabs, Dropdown Menus)
**Confidence:** HIGH

## Summary

This phase focuses on UI/UX polish for the existing dashboard. The research confirms that all necessary UI components and patterns already exist in the codebase. The primary work involves refactoring existing components rather than introducing new libraries.

Key findings:
1. **Dropdown menu components exist** - Full shadcn-vue DropdownMenu component set is already installed and used in NavUser.vue
2. **Tab system is mature** - shadcn-vue Tabs already implemented in dashboard; modifications are straightforward
3. **Order display patterns are established** - NowProcessingSection and GateQueueList provide reusable patterns for order display
4. **Action button patterns need conditional logic** - ActionButtons.vue needs dropdown for processing state, keeping existing pattern for other states

**Primary recommendation:** Refactor existing ActionButtons.vue to conditionally render a DropdownMenu for processing orders, update NowProcessingSection to show table with one row per active gate (including idle gates), and remove the "Manage Gates" tab from index.vue.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn-vue | (reka-ui based) | UI component library | Already in use throughout app |
| lucide-vue-next | latest | Icon library | Already in use, provides MoreVertical, MoreHorizontal icons |
| @tanstack/vue-table | latest | Data table rendering | Already used in DataTable.vue |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vueuse/core | latest | Vue Composition utilities | Already available for computed helpers |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn DropdownMenu | Custom popover | No reason to diverge - DropdownMenu already exists |
| Table for processing | Cards (current) | Table better fits "one row per gate" requirement |

**Installation:**
```bash
# No new packages needed - all components exist
```

## Architecture Patterns

### Recommended Project Structure
```
staff/app/
├── components/
│   └── dashboard/
│       ├── ActionButtons.vue       # Modify: add dropdown for processing state
│       ├── NowProcessingSection.vue # Modify: table format with idle gates
│       └── ShowUnassignedToggle.vue # New: checkbox filter (similar to ShowCompletedToggle)
├── composables/
│   └── useDashboardData.ts         # Modify: add unassigned filter support
└── pages/
    └── index.vue                   # Modify: remove Manage Gates tab, add toggle
```

### Pattern 1: Conditional Action Rendering
**What:** Render different action UI based on order status
**When to use:** ActionButtons needs different behavior for processing vs other states
**Example:**
```typescript
// Source: Existing ActionButtons.vue pattern
const isProcessing = computed(() => props.status === PICKUP_STATUS.PROCESSING)

// For processing: DropdownMenu with Complete (primary) + Return to Queue + Cancel
// For other states: existing inline buttons
```

### Pattern 2: Gate-Centric Table (Processing Section)
**What:** Show one row per active gate, with order info or "Idle" state
**When to use:** NowProcessingSection redesign
**Example:**
```vue
<!-- Source: GatesTable.vue pattern (lines 51-99) -->
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Gate</TableHead>
      <TableHead>Order</TableHead>
      <TableHead>Company</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow v-for="gate in sortedActiveGates" :key="gate.id">
      <TableCell>Gate {{ gate.gate_number }}</TableCell>
      <TableCell>{{ processingOrder?.sales_order_number ?? 'Idle' }}</TableCell>
      <!-- ... -->
    </TableRow>
  </TableBody>
</Table>
```

### Pattern 3: Dropdown Menu with AlertDialog Confirmation
**What:** Dropdown trigger with items that open confirmation dialogs
**When to use:** Processing order actions (Return to Queue, Cancel need confirmation)
**Example:**
```vue
<!-- Source: NavUser.vue dropdown pattern + ActionButtons.vue AlertDialog pattern -->
<DropdownMenu>
  <DropdownMenuTrigger as-child>
    <Button variant="ghost" size="icon">
      <MoreVertical class="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem @click="handleRevert">
      <RotateCcw class="h-4 w-4 mr-2" />
      Return to Queue
    </DropdownMenuItem>
    <DropdownMenuItem variant="destructive" @click="handleCancel">
      <X class="h-4 w-4 mr-2" />
      Cancel
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Anti-Patterns to Avoid
- **Duplicating order display logic:** Reuse existing StatusBadge, order info patterns from NowProcessingSection
- **Showing GateSelect for processing orders:** Processing orders already have a gate - don't show gate selector
- **Inline confirmation for destructive actions:** Always use AlertDialog for Cancel action

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dropdown menus | Custom popover | shadcn DropdownMenu | Already exists, handles focus, keyboard nav |
| Confirmation dialogs | Window.confirm() | AlertDialog component | Consistent UX, already used in ActionButtons |
| Checkbox toggle | Custom checkbox | Switch component | ShowCompletedToggle pattern already exists |
| Order display | New display component | Existing StatusBadge + patterns | DRY principle per CONTEXT.md |

**Key insight:** All UI primitives needed for this phase already exist in the codebase. The work is composition and refactoring, not building new components.

## Common Pitfalls

### Pitfall 1: Click Event Propagation in Tables
**What goes wrong:** Clicking dropdown/buttons triggers row click handler
**Why it happens:** Event bubbling through table row click handlers
**How to avoid:** Use `@click.stop` on action buttons/dropdowns (already done in GateQueueList.vue)
**Warning signs:** Clicking Complete opens detail sheet instead of completing

### Pitfall 2: Processing Order Lookup Performance
**What goes wrong:** O(n) lookup in template for each gate row
**Why it happens:** Filtering requests array for each gate in v-for
**How to avoid:** Use computed Map for O(1) lookup (pattern from GatesTable.vue line 32-40)
**Warning signs:** Sluggish UI with many gates/orders

### Pitfall 3: Stale Data in Processing Section
**What goes wrong:** Processing section shows outdated order after completion
**Why it happens:** Not refreshing data after action
**How to avoid:** Emit events that trigger refresh (existing pattern in index.vue handlers)
**Warning signs:** Completed order still shows as processing

### Pitfall 4: Missing Gate from Active Gates List
**What goes wrong:** Gate has processing order but is inactive - order disappears from view
**Why it happens:** Filtering to activeGates excludes gate with processing order
**How to avoid:** Per CONTEXT.md decision, only show active gates - this is expected behavior
**Warning signs:** None if following spec; edge case is acceptable

### Pitfall 5: Dropdown Not Closing After Action
**What goes wrong:** Dropdown stays open after clicking menu item
**Why it happens:** Not handling dropdown state properly
**How to avoid:** DropdownMenu auto-closes on item click by default with reka-ui
**Warning signs:** Dropdown visually stuck open

## Code Examples

Verified patterns from the existing codebase:

### DropdownMenu Usage (from NavUser.vue)
```vue
<DropdownMenu>
  <DropdownMenuTrigger as-child>
    <Button variant="ghost" size="icon">
      <MoreVertical class="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem @click="handleAction">
      <Icon class="mr-2 h-4 w-4" />
      <span>Action Label</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Destructive Dropdown Item (from DropdownMenuItem.vue)
```vue
<!-- variant="destructive" provides red styling -->
<DropdownMenuItem variant="destructive" @click="handleCancel">
  <X class="h-4 w-4 mr-2" />
  Cancel
</DropdownMenuItem>
```

### Processing Order Lookup Map (from GatesTable.vue)
```typescript
const processingByGate = computed(() => {
  const map = new Map<string, PickupRequest>()
  for (const order of props.processingOrders) {
    if (order.assigned_gate_id) {
      map.set(order.assigned_gate_id, order)
    }
  }
  return map
})

function getProcessingOrder(gateId: string): PickupRequest | undefined {
  return processingByGate.value.get(gateId)
}
```

### Switch Toggle Pattern (from ShowCompletedToggle.vue)
```vue
<template>
  <div class="flex items-center gap-2">
    <Switch v-model="showUnassigned" />
    <span class="text-sm text-muted-foreground">Show only unassigned</span>
  </div>
</template>

<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
const showUnassigned = defineModel<boolean>('showUnassigned', { default: false })
</script>
```

### Idle State Display (recommendation)
```vue
<TableCell class="text-muted-foreground italic">
  Idle
</TableCell>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline buttons for all states | Context-aware action UI | This phase | Cleaner UX for processing orders |
| Cards per processing order | Table with gate rows | This phase | Consistent "one row per gate" model |
| Manage Gates in dashboard | Separate /gates page | Phase 20 | Tab can now be removed |

**Deprecated/outdated:**
- "Manage Gates" tab: Functionality moved to /gates page in Phase 20

## Open Questions

1. **AlertDialog within DropdownMenu**
   - What we know: AlertDialog and DropdownMenu both work independently
   - What's unclear: Whether AlertDialog trigger inside DropdownMenuItem works seamlessly
   - Recommendation: Test first; if issues, use ref-controlled AlertDialog triggered by dropdown item click

2. **Mobile responsiveness of processing table**
   - What we know: Current card layout is mobile-friendly
   - What's unclear: Table will need responsive handling
   - Recommendation: Use existing responsive patterns (flex-col on small screens) or keep simple table

## Sources

### Primary (HIGH confidence)
- `/staff/app/components/ui/dropdown-menu/*` - All DropdownMenu components verified present
- `/staff/app/components/NavUser.vue` - Verified working DropdownMenu usage pattern
- `/staff/app/components/dashboard/ActionButtons.vue` - Current action button implementation
- `/staff/app/components/dashboard/NowProcessingSection.vue` - Current processing display
- `/staff/app/components/gates/GatesTable.vue` - Table pattern with processing lookup
- `/staff/app/components/dashboard/ShowCompletedToggle.vue` - Toggle pattern to follow

### Secondary (MEDIUM confidence)
- Existing shadcn-vue/reka-ui documentation patterns (verified via codebase usage)

### Tertiary (LOW confidence)
- None - all patterns verified in codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all components already exist and are in use
- Architecture: HIGH - patterns derived from existing code
- Pitfalls: HIGH - based on existing patterns and Vue/shadcn-vue knowledge

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - stable internal codebase)
