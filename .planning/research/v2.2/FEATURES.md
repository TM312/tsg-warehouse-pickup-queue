# Feature Patterns: v2.2 UI Polish (shadcn-vue)

**Domain:** shadcn-vue component patterns for dashboard polish
**Researched:** 2026-02-03
**Confidence:** HIGH (verified against official shadcn-vue docs and source code)

## Pattern 1: Sidebar Footer with Avatar + Email (NavUser)

**Problem:** Current NavUser shows avatar + full email in a single row, causing truncation issues. Dropdown menu is small and centered.

**Reference:** [shadcn-vue Sidebar docs](https://www.shadcn-vue.com/docs/components/sidebar#sidebar-footer), dashboard-01 block pattern

### Current Implementation (problematic)

```vue
<!-- Current NavUser.vue - single row layout -->
<SidebarMenuButton>
  <Avatar class="h-6 w-6">
    <AvatarFallback class="text-xs">{{ initials }}</AvatarFallback>
  </Avatar>
  <span class="truncate">{{ user?.email }}</span>  <!-- Too long, truncates poorly -->
  <ChevronUp class="ml-auto h-4 w-4" />
</SidebarMenuButton>
```

### Recommended Implementation

The key pattern is using `SidebarMenuButton size="lg"` with a two-line grid layout:

```vue
<script setup lang="ts">
import { ChevronsUpDown, LogOut } from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { isMobile } = useSidebar()

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}

// Extract display name from email (before @)
const displayName = computed(() => {
  const email = user.value?.email ?? ''
  return email.split('@')[0]
})

const initials = computed(() => {
  const name = displayName.value
  return name.substring(0, 2).toUpperCase()
})
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarFallback class="rounded-lg">{{ initials }}</AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{{ displayName }}</span>
              <span class="truncate text-xs text-muted-foreground">{{ user?.email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-popper-anchor-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarFallback class="rounded-lg">{{ initials }}</AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ displayName }}</span>
                <span class="truncate text-xs text-muted-foreground">{{ user?.email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="logout">
            <LogOut class="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
```

### Key CSS Classes Explained

| Class | Purpose |
|-------|---------|
| `size="lg"` | Makes SidebarMenuButton taller (accommodates two-line layout) |
| `grid flex-1 text-left text-sm leading-tight` | Two-line text container with tight line height |
| `truncate font-semibold` | Name line - bold, truncates on overflow |
| `truncate text-xs text-muted-foreground` | Email line - smaller, muted color, truncates |
| `w-[--reka-popper-anchor-width] min-w-56` | Dropdown matches trigger width, minimum 224px |
| `rounded-lg` | Consistent border radius on avatar and dropdown |
| `data-[state=open]:bg-sidebar-accent` | Highlight button when dropdown is open |

### Responsive Dropdown Positioning

The dropdown uses `isMobile` from `useSidebar()` to position correctly:

```typescript
const { isMobile } = useSidebar()
```

- **Mobile:** `side="bottom"` - opens below the trigger
- **Desktop:** `side="right"` - opens to the right (avoids sidebar collapse issues)

### Icon Change

Current uses `ChevronUp` - the dashboard-01 pattern uses `ChevronsUpDown` (double chevron) which better indicates bidirectional dropdown behavior.

---

## Pattern 2: Tab Badges with Distinct Background

**Problem:** Current tab badges use `bg-muted` which blends with the active tab background, making counts hard to read.

### Current Implementation (problematic)

```vue
<TabsTrigger value="all">
  All Requests
  <span class="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">{{ count }}</span>
</TabsTrigger>
```

The `bg-muted` class creates a gray background that's similar to the active tab's background (`bg-background`), reducing visual contrast.

### Option A: Use Badge Component (Recommended)

The `Badge` component provides semantic variants with built-in contrast:

```vue
<script setup>
import { Badge } from '@/components/ui/badge'
</script>

<template>
  <TabsTrigger value="all">
    All Requests
    <Badge variant="secondary" class="ml-1.5">{{ count }}</Badge>
  </TabsTrigger>
</template>
```

**Available variants in your project's Badge component:**

| Variant | CSS Classes | Visual Effect |
|---------|-------------|---------------|
| `default` | `bg-primary text-primary-foreground` | Primary brand color |
| `secondary` | `bg-secondary text-secondary-foreground` | Neutral gray (recommended) |
| `destructive` | `bg-destructive text-white` | Red/danger |
| `outline` | `text-foreground` border only | Subtle, transparent |

### Option B: Custom Inline Styling

If you want more control without using Badge:

```vue
<TabsTrigger value="all">
  All Requests
  <span class="ml-1.5 inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
    {{ count }}
  </span>
</TabsTrigger>
```

### Recommended Color Patterns for Visual Distinction

| Pattern | Classes | Effect |
|---------|---------|--------|
| Primary tint | `bg-primary/10 text-primary` | Subtle brand color, visible on any tab state |
| Secondary solid | `bg-secondary text-secondary-foreground` | Neutral, consistent contrast |
| Blue tint | `bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400` | Information counts |
| Muted contrast | `bg-muted-foreground/20 text-muted-foreground` | More visible than `bg-muted` alone |

### Numeric Badge Optimization

For badges showing numbers, use monospace and tabular nums to prevent layout shift:

```vue
<Badge variant="secondary" class="ml-1.5 font-mono tabular-nums">
  {{ count }}
</Badge>
```

The `font-mono tabular-nums` ensures numbers like `9` and `10` occupy consistent width.

---

## Pattern 3: Link Button with External Arrow Icon

**Problem:** Need a button styled as a link with an external link indicator icon.

### Using Button Component with Link Variant

Your project already has a `link` variant defined:

```typescript
// From staff/app/components/ui/button/index.ts
link: "text-primary underline-offset-4 hover:underline"
```

### Implementation Examples

**Basic link button with external icon:**

```vue
<script setup>
import { ExternalLink } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="link" as-child>
    <a href="https://example.com" target="_blank" rel="noopener noreferrer">
      View Documentation
      <ExternalLink class="ml-1 h-3 w-3" />
    </a>
  </Button>
</template>
```

**Inline link (without Button wrapper):**

```vue
<a
  href="https://example.com"
  target="_blank"
  rel="noopener noreferrer"
  class="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
>
  Learn more
  <ExternalLink class="h-3 w-3" />
</a>
```

**In a table cell:**

```vue
<TableCell>
  <a
    :href="order.trackingUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex items-center text-primary hover:underline"
  >
    {{ order.trackingNumber }}
    <ExternalLink class="ml-1 h-3 w-3" />
  </a>
</TableCell>
```

### Icon Sizing Guidelines

| Context | Icon Class | Notes |
|---------|------------|-------|
| Inline text (sm) | `h-3 w-3` | Matches x-height of small text |
| Standard button | `h-4 w-4` | Default icon size |
| Large button | `h-5 w-5` | For `size="lg"` buttons |

### Alternative External Link Icons (lucide-vue-next)

```typescript
import {
  ExternalLink,    // Arrow pointing up-right out of box (standard)
  ArrowUpRight,    // Simple diagonal arrow
  Link2,           // Chain link icon (for general links)
  SquareArrowOutUpRight, // Arrow from square
} from 'lucide-vue-next'
```

**Recommendation:** Use `ExternalLink` - it's the standard convention users recognize for opening in new tab.

---

## Pattern 4: Idle State Row in Table

**Problem:** ProcessingGatesTable needs to display gates differently when they have no active order (idle state).

### Current Context

The `ProcessingGatesTable.vue` shows gates with their current processing order. When a gate has no order assigned, it should display distinctly from active gates.

### Implementation Pattern

```vue
<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Gate</TableHead>
        <TableHead>Order</TableHead>
        <TableHead>Status</TableHead>
        <TableHead class="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="gate in gates" :key="gate.id">
        <!-- Gate has active order -->
        <template v-if="gate.order">
          <TableCell class="font-medium">
            Gate {{ gate.gate_number }}
          </TableCell>
          <TableCell>{{ gate.order.sales_order_number }}</TableCell>
          <TableCell>
            <StatusBadge :status="gate.order.status" />
          </TableCell>
          <TableCell class="text-right">
            <Button size="sm" @click="complete(gate.id, gate.order.id)">
              Complete
            </Button>
          </TableCell>
        </template>

        <!-- Gate is idle (no active order) -->
        <template v-else>
          <TableCell class="font-medium">
            Gate {{ gate.gate_number }}
          </TableCell>
          <TableCell colspan="3">
            <div class="flex items-center justify-center py-2 text-muted-foreground">
              <span class="text-sm italic">No active pickup</span>
            </div>
          </TableCell>
        </template>
      </TableRow>
    </TableBody>
  </Table>
</template>
```

### Idle State Styling Options

| Style | Classes | Visual Effect |
|-------|---------|---------------|
| Muted text | `text-muted-foreground` | De-emphasized, grayed out |
| Centered | `text-center` | Visual distinction from left-aligned data |
| Italic | `italic` | Indicates placeholder/empty state |
| Lighter row background | `bg-muted/30` on TableRow | Visual separation |
| Dashed indicator | `border-l-2 border-dashed border-muted-foreground/50` | Subtle visual cue |

### Enhanced Idle Row with Icon

```vue
<template v-else>
  <TableCell class="font-medium text-muted-foreground">
    Gate {{ gate.gate_number }}
  </TableCell>
  <TableCell colspan="3">
    <div class="flex items-center justify-center gap-2 py-3 text-muted-foreground">
      <CircleDashed class="h-4 w-4" />
      <span class="text-sm">Idle - No active pickup</span>
    </div>
  </TableCell>
</template>
```

### Alternative: Entire Row Styling

Apply classes to the TableRow itself for idle gates:

```vue
<TableRow
  v-for="gate in gates"
  :key="gate.id"
  :class="{ 'bg-muted/20': !gate.order }"
>
  ...
</TableRow>
```

### Icon Options for Idle State (lucide-vue-next)

```typescript
import {
  CircleDashed,    // Dashed circle (recommended - indicates "waiting")
  Clock,           // Clock icon
  Pause,           // Pause icon
  MinusCircle,     // Minus in circle
  Circle,          // Empty circle
} from 'lucide-vue-next'
```

---

## Component Imports Summary

For implementing all patterns above, ensure these imports are available:

```typescript
// Lucide icons
import {
  ChevronsUpDown,   // For NavUser dropdown indicator (replaces ChevronUp)
  LogOut,           // For logout menu item
  ExternalLink,     // For external links
  CircleDashed,     // For idle state indicator
} from 'lucide-vue-next'

// UI Components (already in project)
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
```

---

## Quick Reference: Files to Modify

| Pattern | File(s) to Modify |
|---------|-------------------|
| NavUser footer | `staff/app/components/NavUser.vue` |
| Tab badges | `staff/app/pages/index.vue` (TabsTrigger elements) |
| External links | Various (as needed in tables/details) |
| Idle state rows | `staff/app/components/dashboard/ProcessingGatesTable.vue` |

---

## Sources

- [shadcn-vue Sidebar Documentation](https://www.shadcn-vue.com/docs/components/sidebar) - SidebarFooter, SidebarMenuButton size prop
- [shadcn-vue Badge Documentation](https://www.shadcn-vue.com/docs/components/badge) - Badge variants and styling
- [shadcn-vue Button Documentation](https://www.shadcn-vue.com/docs/components/button) - Link variant
- [shadcn-vue Avatar Documentation](https://www.shadcn-vue.com/docs/components/avatar) - Avatar, AvatarFallback, AvatarImage
- [Lucide Vue Next Guide](https://lucide.dev/guide/packages/lucide-vue-next) - Icon usage and props
- [NavUser Reference Implementation](https://github.com/Kiranism/next-shadcn-dashboard-starter/blob/main/src/components/nav-user.tsx) - Complete NavUser pattern with grid layout
- [Reka UI Dropdown Menu](https://reka-ui.com/docs/components/dropdown-menu) - Popper anchor width CSS variable
