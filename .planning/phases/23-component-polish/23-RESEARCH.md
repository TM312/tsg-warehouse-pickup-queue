# Phase 23: Component Polish - Research

**Researched:** 2026-02-03
**Domain:** Vue 3 / shadcn-vue Component Styling, reka-ui Dropdown Positioning, Tailwind CSS
**Confidence:** HIGH

## Summary

This phase focuses on visual polish for two specific components: NavUser sidebar footer and ProcessingGatesTable idle state display. The research confirms that all necessary components and patterns already exist in the codebase. The work is purely CSS/layout modifications and prop configuration - no new libraries needed.

Key findings:
1. **NavUser layout** - Current component uses horizontal layout with email only. Change to stacked vertical layout with name derivation from email (or name if available), requiring only template/CSS changes.
2. **Dropdown positioning** - reka-ui DropdownMenuContent supports `side` prop for positioning. Use `side="right"` for desktop and rely on collision avoidance for mobile.
3. **Idle state display** - ProcessingGatesTable already shows idle gates with "Idle" text. Needs row-level muted styling and colspan to span across customer data columns.
4. **All patterns exist** - Typography classes (`text-muted-foreground`, `font-semibold`), colspan usage, and dropdown positioning are all established in the codebase.

**Primary recommendation:** Modify NavUser.vue template to use stacked layout with name/email, change DropdownMenuContent side prop from "top" to "right", and update ProcessingGatesTable idle row styling with muted row treatment and colspan for the "Idle" text.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| reka-ui | 2.7.0 | DropdownMenuContent positioning props | Powers all shadcn-vue dropdowns |
| shadcn-vue sidebar | Latest | SidebarMenuButton, NavUser patterns | Already in use for sidebar |
| tailwindcss | 4.x | Utility classes for styling | Already configured with design tokens |
| lucide-vue-next | 0.563.0 | ChevronUp/ChevronRight icons | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vueuse/core | 14.1.0 | useSidebar composable | For mobile detection if needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| side="right" | Custom positioning CSS | No reason - prop is built-in |
| Row opacity | Conditional row CSS | Row opacity is cleaner, semantic |

**Installation:**
```bash
# No new packages needed - all components exist
```

## Architecture Patterns

### Recommended Project Structure
```
staff/app/
├── components/
│   ├── NavUser.vue              # Modify: stacked layout, dropdown positioning
│   └── dashboard/
│       └── ProcessingGatesTable.vue  # Modify: idle row styling, colspan
```

### Pattern 1: Stacked User Info Layout
**What:** Name above email in vertical hierarchy within sidebar footer
**When to use:** NavUser component layout update
**Example:**
```vue
<!-- Current horizontal layout -->
<span class="truncate">{{ user?.email }}</span>

<!-- New stacked layout -->
<div class="grid flex-1 text-left text-sm leading-tight">
  <span class="truncate font-semibold">{{ displayName }}</span>
  <span class="truncate text-xs text-muted-foreground">{{ user?.email }}</span>
</div>
```
Source: shadcn-vue sidebar patterns

### Pattern 2: Side-Positioned Dropdown
**What:** Dropdown opens to the right of trigger instead of above
**When to use:** Desktop sidebar footer dropdowns
**Example:**
```vue
<DropdownMenuContent
  side="right"
  :side-offset="8"
  align="end"
  class="w-56"
>
  <!-- menu items -->
</DropdownMenuContent>
```
Source: reka-ui DropdownMenuContent props

### Pattern 3: Muted Table Row with Colspan
**What:** Grayed row with single "Idle" text spanning multiple columns
**When to use:** ProcessingGatesTable idle gate display
**Example:**
```vue
<TableRow class="opacity-60">
  <TableCell class="font-medium">Gate {{ gate.gate_number }}</TableCell>
  <TableCell colspan="3" class="text-muted-foreground italic">
    Idle
  </TableCell>
  <TableCell></TableCell>
</TableRow>
```
Source: Existing colspan patterns in RequestsTable.vue and GatesTable.vue

### Pattern 4: Deriving Display Name from Email
**What:** Extract readable name from email address
**When to use:** When user.name is not available
**Example:**
```typescript
const displayName = computed(() => {
  // Prefer user metadata name if available
  if (user.value?.user_metadata?.name) {
    return user.value.user_metadata.name
  }
  // Fall back to email username portion
  const email = user.value?.email ?? ''
  const username = email.split('@')[0] ?? ''
  // Convert to title case: john.doe -> John Doe
  return username
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
})
```

### Anti-Patterns to Avoid
- **Changing avatar treatment:** Context specifies "Keep current avatar/icon treatment"
- **Changing dropdown menu items:** Context specifies "Keep current menu items"
- **Sorting gates by idle status:** Context specifies "Gates maintain natural/configured order"
- **Hiding idle rows:** Context specifies idle gates should be visible with "Idle" label

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dropdown positioning | Custom CSS transforms | reka-ui `side` prop | Built-in collision avoidance |
| Muted text styling | Custom color values | `text-muted-foreground` | Design token consistency |
| Row dimming | Custom color calc | `opacity-60` or `opacity-50` | Standard Tailwind utility |
| Column spanning | Multiple empty cells | `colspan` attribute | Semantic HTML |

**Key insight:** All visual polish can be achieved with existing Tailwind utilities and reka-ui props. No custom CSS values needed.

## Common Pitfalls

### Pitfall 1: Dropdown Positioning Collision on Mobile
**What goes wrong:** Dropdown opens off-screen or partially hidden
**Why it happens:** Fixed side position doesn't account for viewport constraints
**How to avoid:** reka-ui's `avoidCollisions` is enabled by default, automatically adjusts position
**Warning signs:** Dropdown content cut off on mobile devices

### Pitfall 2: SidebarMenuButton Size Mismatch with Stacked Layout
**What goes wrong:** Button height doesn't accommodate two lines of text
**Why it happens:** Default size="default" is h-8, too short for stacked content
**How to avoid:** Use `size="lg"` variant which is h-12 and handles multi-line content
**Warning signs:** Text gets clipped or overflows button bounds

### Pitfall 3: Colspan Count Mismatch
**What goes wrong:** Idle row doesn't align with header columns
**Why it happens:** colspan value doesn't match actual column count
**How to avoid:** ProcessingGatesTable has 5 columns (Gate, Order, Company, Status, Actions). For idle, Gate + (Order+Company+Status as colspan=3) + Actions = 5 total
**Warning signs:** Misaligned columns, visual inconsistency

### Pitfall 4: Loss of Clickable Area
**What goes wrong:** Only part of NavUser button is clickable
**Why it happens:** Nested elements blocking click events
**How to avoid:** SidebarMenuButton wrapper already handles this when used as trigger with `as-child`
**Warning signs:** Clicks on name/email don't open dropdown

### Pitfall 5: Opacity Affecting Action Buttons
**What goes wrong:** Action buttons in idle row become hard to see
**Why it happens:** Parent row opacity applies to all children
**How to avoid:** Idle rows have no actions anyway (empty TableCell), but if needed, use opacity on specific cells not row
**Warning signs:** N/A for idle rows since actions cell is empty

## Code Examples

Verified patterns from the existing codebase:

### Current NavUser Layout (to modify)
```vue
<!-- Current: staff/app/components/NavUser.vue lines 35-41 -->
<SidebarMenuButton>
  <Avatar class="h-6 w-6">
    <AvatarFallback class="text-xs">{{ initials }}</AvatarFallback>
  </Avatar>
  <span class="truncate">{{ user?.email }}</span>
  <ChevronUp class="ml-auto h-4 w-4" />
</SidebarMenuButton>
```

### Recommended NavUser Layout
```vue
<SidebarMenuButton size="lg">
  <Avatar class="h-8 w-8 rounded-lg">
    <AvatarFallback class="rounded-lg">{{ initials }}</AvatarFallback>
  </Avatar>
  <div class="grid flex-1 text-left text-sm leading-tight">
    <span class="truncate font-semibold">{{ displayName }}</span>
    <span class="truncate text-xs text-muted-foreground">{{ user?.email }}</span>
  </div>
  <ChevronsUpDown class="ml-auto size-4" />
</SidebarMenuButton>
```

### Dropdown Right-Side Positioning
```vue
<!-- Change from current side="top" -->
<DropdownMenuContent
  side="right"
  :side-offset="4"
  align="end"
  class="w-56 rounded-lg"
>
  <DropdownMenuItem @click="logout">
    <LogOut class="mr-2 h-4 w-4" />
    <span>Log out</span>
  </DropdownMenuItem>
</DropdownMenuContent>
```

### Current Idle State (to modify)
```vue
<!-- Current: staff/app/components/dashboard/ProcessingGatesTable.vue lines 86-91 -->
<template v-else>
  <TableCell class="text-muted-foreground italic">Idle</TableCell>
  <TableCell>—</TableCell>
  <TableCell>—</TableCell>
  <TableCell></TableCell>
</template>
```

### Recommended Idle State
```vue
<TableRow
  :key="gate.id"
  class="opacity-60"
>
  <TableCell class="font-medium">Gate {{ gate.gate_number }}</TableCell>
  <TableCell colspan="3" class="text-muted-foreground italic text-center">
    Idle
  </TableCell>
  <TableCell></TableCell>
</TableRow>
```

### Icon Import for Visual Connector
```typescript
// If using ChevronsUpDown instead of ChevronUp for dropdown indicator
import { ChevronsUpDown, LogOut } from 'lucide-vue-next'
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ChevronUp for dropdown | ChevronsUpDown (up-down arrows) | Current shadcn-vue patterns | Visual hint that dropdown opens |
| Single line user display | Stacked name/email | Current sidebar patterns | Better hierarchy, fits sidebar footer |
| Individual cells for idle | Colspan with "Idle" | This phase | Cleaner idle state presentation |

**Deprecated/outdated:**
- Using `side="top"` for sidebar footer dropdowns (opens into content area, not ideal)
- Em-dash (—) placeholders in idle rows (replace with proper idle state display)

## Open Questions

1. **Name Source for Display**
   - What we know: Supabase user object has email, may have user_metadata.name
   - What's unclear: Whether users have names stored in metadata
   - Recommendation: Fall back to email username if name not available, per code example above

2. **Mobile Dropdown Behavior**
   - What we know: reka-ui has collision avoidance built-in
   - What's unclear: Exact behavior on narrow viewports when side="right"
   - Recommendation: Test and rely on avoidCollisions default; if issues, may need conditional side prop based on isMobile

3. **Opacity Value for Idle Rows**
   - What we know: Context says "muted/grayed"
   - What's unclear: Exact opacity value (50, 60, 70?)
   - Recommendation: Start with `opacity-60` (matches common disabled patterns), adjust if needed

## Sources

### Primary (HIGH confidence)
- `/staff/app/components/NavUser.vue` - Current implementation
- `/staff/app/components/dashboard/ProcessingGatesTable.vue` - Current implementation
- `/staff/app/components/ui/dropdown-menu/DropdownMenuContent.vue` - Shows reka-ui props forwarding
- `/staff/app/components/ui/sidebar/index.ts` - SidebarMenuButton size variants (lg is h-12)
- `/staff/app/assets/css/tailwind.css` - Design tokens (muted-foreground, opacity)
- reka-ui DropdownMenuContent docs - side, sideOffset, align, alignOffset props

### Secondary (MEDIUM confidence)
- Existing colspan usage in RequestsTable.vue and GatesTable.vue

### Tertiary (LOW confidence)
- None - all patterns verified in codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all components already exist and are in use
- Architecture: HIGH - patterns derived from existing code and verified props
- Pitfalls: HIGH - based on existing patterns and component prop knowledge

**Research date:** 2026-02-03
**Valid until:** 2026-03-05 (30 days - stable internal codebase, CSS patterns)
