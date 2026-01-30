# Phase 16: Sidebar Layout - Research

**Researched:** 2026-01-30
**Domain:** shadcn-vue Sidebar Component, Nuxt Layouts
**Confidence:** HIGH

## Summary

This phase implements a collapsible sidebar navigation for the staff application using shadcn-vue's Sidebar component. The sidebar will contain three navigation items (Dashboard, Gates, Opening Schedule) with the current route visually highlighted. Gate operator routes (/gate/[id]) will render fullscreen without the sidebar.

The shadcn-vue Sidebar component is well-documented and provides all required functionality out of the box: collapsible state management, mobile responsiveness (drawer overlay), icon-only mode, and composable sub-components. The implementation follows the dashboard-01 block pattern with `variant="inset"` layout style.

**Primary recommendation:** Install the shadcn-vue Sidebar component, create an AppSidebar component with header (logo), content (navigation items), and footer (user section), then wrap the default layout with SidebarProvider and SidebarInset. Use a separate minimal layout for gate operator routes.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn-vue sidebar | Latest | Sidebar component with collapse, mobile drawer | Official shadcn-vue component, composable design |
| shadcn-vue avatar | Latest | User avatar in sidebar footer | Standard pattern for user section |
| shadcn-vue dropdown-menu | Latest | User menu with logout | Standard pattern for footer actions |
| shadcn-vue tooltip | Latest | Icon labels in collapsed mode | Accessibility for icon-only state |
| lucide-vue-next | 0.563.0 | Navigation icons | Already installed, tree-shakable |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vueuse/core | 14.1.0 | Reactive utilities | Already installed, use for route matching if needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn-vue sidebar | Custom sidebar | Would lose collapse state, mobile drawer, keyboard shortcuts |
| Nuxt layouts | Dynamic layout switching | More complex, layouts are cleaner |

**Installation:**
```bash
cd staff && npx shadcn-vue add sidebar avatar dropdown-menu tooltip
```

Note: Sheet component is already installed (required by Sidebar for mobile drawer).

## Architecture Patterns

### Recommended Project Structure
```
staff/app/
├── layouts/
│   ├── default.vue       # Sidebar layout (REPLACE existing)
│   ├── auth.vue          # Login/auth pages (existing)
│   └── fullscreen.vue    # NEW: Gate operator, no sidebar
├── components/
│   ├── AppSidebar.vue    # NEW: Main sidebar component
│   ├── NavUser.vue       # NEW: User footer with dropdown
│   └── ui/
│       ├── sidebar/      # NEW: shadcn-vue sidebar components
│       ├── avatar/       # NEW: shadcn-vue avatar
│       ├── dropdown-menu/# NEW: shadcn-vue dropdown-menu
│       └── tooltip/      # NEW: shadcn-vue tooltip (for icon tooltips)
└── pages/
    └── gate/
        └── [id].vue      # Add: layout: 'fullscreen' in definePageMeta
```

### Pattern 1: SidebarProvider Wrapping Layout
**What:** Wrap entire layout in SidebarProvider for state management
**When to use:** Always, at the layout level
**Example:**
```vue
<!-- layouts/default.vue -->
<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-14 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <!-- Other header content -->
      </header>
      <main class="container mx-auto px-4 py-6">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
```
Source: [shadcn-vue Sidebar Documentation](https://www.shadcn-vue.com/docs/components/sidebar)

### Pattern 2: AppSidebar Component Structure
**What:** Composable sidebar with header, content, footer sections
**When to use:** For the main sidebar component
**Example:**
```vue
<!-- components/AppSidebar.vue -->
<script setup lang="ts">
import { House, DoorOpen, Calendar, ChevronUp } from 'lucide-vue-next'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar'

const items = [
  { title: 'Dashboard', url: '/', icon: House },
  { title: 'Gates', url: '/gates', icon: DoorOpen },
  { title: 'Schedule', url: '/settings/business-hours', icon: Calendar },
]

const route = useRoute()
</script>

<template>
  <Sidebar variant="inset" collapsible="icon">
    <SidebarHeader>
      <!-- Logo/branding -->
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton
                as-child
                :is-active="route.path === item.url"
              >
                <NuxtLink :to="item.url">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <!-- NavUser component -->
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
```
Source: [shadcn-vue Sidebar Documentation](https://www.shadcn-vue.com/docs/components/sidebar)

### Pattern 3: User Footer with Dropdown
**What:** User section in sidebar footer with dropdown menu
**When to use:** For logout and user actions
**Example:**
```vue
<!-- components/NavUser.vue -->
<script setup lang="ts">
import { User2, ChevronUp, LogOut } from 'lucide-vue-next'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}

// Get initials from email
const initials = computed(() => {
  const email = user.value?.email ?? ''
  return email.substring(0, 2).toUpperCase()
})
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton>
            <Avatar class="h-6 w-6">
              <AvatarFallback>{{ initials }}</AvatarFallback>
            </Avatar>
            <span class="truncate">{{ user?.email }}</span>
            <ChevronUp class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          class="w-[--reka-popper-anchor-width]"
        >
          <DropdownMenuItem @click="logout">
            <LogOut class="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
```
Source: [shadcn-vue Sidebar Documentation](https://www.shadcn-vue.com/docs/components/sidebar#sidebar-footer)

### Pattern 4: Fullscreen Layout for Gate Operator
**What:** Minimal layout without sidebar for gate operator routes
**When to use:** For /gate/[id] routes
**Example:**
```vue
<!-- layouts/fullscreen.vue -->
<template>
  <div class="min-h-screen bg-background">
    <slot />
  </div>
</template>
```

```vue
<!-- pages/gate/[id].vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'fullscreen',
  middleware: 'auth'
})
// ... rest of component
</script>
```
Source: [Nuxt Layouts Documentation](https://nuxt.com/docs/4.x/directory-structure/app/layouts)

### Pattern 5: Auto-close Sidebar on Mobile Navigation
**What:** Close sidebar drawer when navigation item is clicked on mobile
**When to use:** For mobile UX improvement
**Example:**
```vue
<script setup lang="ts">
import { useSidebar } from '@/components/ui/sidebar'

const { setOpenMobile, isMobile } = useSidebar()

function handleNavigation() {
  if (isMobile.value) {
    setOpenMobile(false)
  }
}
</script>

<template>
  <SidebarMenuButton as-child @click="handleNavigation">
    <NuxtLink :to="item.url">
      <!-- content -->
    </NuxtLink>
  </SidebarMenuButton>
</template>
```
Source: [GitHub Issue #5561 - Close sidebar on item click (mobile)](https://github.com/shadcn-ui/ui/issues/5561)

### Anti-Patterns to Avoid
- **Persisting sidebar state when not requested:** Context explicitly states "Sidebar state does NOT persist across page refreshes" - do not use `storage-key` prop
- **Custom collapse animation:** Use shadcn-vue defaults, don't hand-roll animations
- **Putting toggle in sidebar:** Context specifies "Toggle button in main content header (not in sidebar)"

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sidebar collapse state | Custom ref + watcher | useSidebar() composable | Handles mobile/desktop, open/collapsed, keyboard shortcuts |
| Mobile drawer overlay | Custom Sheet + state | Sidebar collapsible="offcanvas" | Built into component, handles outside click |
| Active route highlighting | Manual route matching | SidebarMenuButton isActive prop | Handles styling, accessibility |
| Icon tooltips in collapsed mode | Custom hover logic | Tooltip + SidebarMenuButton | Built-in behavior |
| Responsive breakpoint detection | Custom media query | useSidebar().isMobile | Synced with sidebar behavior |

**Key insight:** The shadcn-vue Sidebar component handles all the complex state management (open/closed, mobile/desktop, collapse transitions) internally. The useSidebar() composable exposes everything needed for custom behavior.

## Common Pitfalls

### Pitfall 1: Missing SidebarProvider
**What goes wrong:** Sidebar doesn't collapse, useSidebar() throws errors
**Why it happens:** SidebarProvider must wrap both Sidebar and content that uses useSidebar()
**How to avoid:** Always wrap at the layout level, including SidebarInset for main content
**Warning signs:** "useSidebar must be used within a SidebarProvider" error

### Pitfall 2: Inset Variant Height Overflow
**What goes wrong:** Page has 16px extra height causing scroll
**Why it happens:** Sidebar spacer uses h-svh which doesn't account for inset padding
**How to avoid:** Use SidebarInset component, it handles the layout calculations
**Warning signs:** Unexpected page overflow, subtle scrollbar when content fits
Source: [GitHub Issue #7947](https://github.com/shadcn-ui/ui/issues/7947)

### Pitfall 3: NuxtLink Active Class Matching
**What goes wrong:** Dashboard stays highlighted when on sub-pages
**Why it happens:** NuxtLink router-link-active matches partial paths
**How to avoid:** Use exact route comparison: `route.path === item.url`
**Warning signs:** Multiple nav items highlighted simultaneously

### Pitfall 4: Gate Layout Not Applying
**What goes wrong:** Gate operator pages still show sidebar
**Why it happens:** definePageMeta layout not taking effect
**How to avoid:** Ensure app.vue uses `<NuxtLayout>` wrapper, create fullscreen.vue layout
**Warning signs:** All pages use default layout regardless of definePageMeta

### Pitfall 5: Mobile Drawer Stays Open After Navigation
**What goes wrong:** User navigates but drawer remains open covering content
**Why it happens:** Navigation doesn't automatically close the mobile drawer
**How to avoid:** Use setOpenMobile(false) in navigation click handler when isMobile is true
**Warning signs:** Users have to manually close drawer after each navigation

## Code Examples

Verified patterns from official sources:

### Lucide Icon Names for Navigation
```typescript
// Source: https://lucide.dev/icons/
import { House, DoorOpen, Calendar } from 'lucide-vue-next'

// House - Dashboard icon (home/house shape)
// DoorOpen - Gates icon (open door shape)
// Calendar - Schedule icon (calendar grid)
```

### Route Comparison for Active State
```vue
<script setup lang="ts">
const route = useRoute()

const items = [
  { title: 'Dashboard', url: '/', icon: House },
  { title: 'Gates', url: '/gates', icon: DoorOpen },
  { title: 'Schedule', url: '/settings/business-hours', icon: Calendar },
]
</script>

<template>
  <SidebarMenuItem v-for="item in items" :key="item.title">
    <SidebarMenuButton
      as-child
      :is-active="route.path === item.url"
    >
      <NuxtLink :to="item.url">
        <component :is="item.icon" />
        <span>{{ item.title }}</span>
      </NuxtLink>
    </SidebarMenuButton>
  </SidebarMenuItem>
</template>
```

### SidebarTrigger in Header
```vue
<!-- In layouts/default.vue inside SidebarInset -->
<header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
  <SidebarTrigger class="-ml-1" />
  <Separator orientation="vertical" class="mr-2 h-4" />
  <h1 class="font-semibold">Warehouse Pickup Queue</h1>
</header>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom sidebar CSS | shadcn-vue Sidebar component | 2024 | Standardized collapse, mobile behavior |
| Nuxt 2 <Nuxt> in layouts | Nuxt 3 <slot /> | Nuxt 3 | Layout composition changed |
| router-link-active class | isActive prop on SidebarMenuButton | Current | Better control, consistent styling |

**Deprecated/outdated:**
- Using `storage-key` prop when persistence is NOT wanted (context explicitly states no persistence)
- Putting SidebarTrigger inside Sidebar (context says header, not sidebar)

## Open Questions

Things that couldn't be fully resolved:

1. **Gates Route Navigation Target**
   - What we know: Three nav items are Dashboard, Gates, Schedule
   - What's unclear: Gates links to /gates but that page doesn't exist yet. Current app has "Manage Gates" tab on dashboard.
   - Recommendation: Create /gates route that shows gate management (extract from dashboard), OR link to dashboard with gates tab selected. Planner should decide.

2. **Schedule Route Path**
   - What we know: Context says "Opening Schedule" navigation item
   - What's unclear: Whether this goes to /settings/business-hours or a new /schedule route
   - Recommendation: Use /settings/business-hours for now as that's where business hours management lives. Can be renamed later.

3. **Header Branding Placement**
   - What we know: Context says "Logo in header section" and "App branding at top of sidebar"
   - What's unclear: Exact logo asset or text to use
   - Recommendation: Use text "Warehouse Pickup Queue" or abbreviated "WPQ" logo placeholder

## Sources

### Primary (HIGH confidence)
- [shadcn-vue Sidebar Documentation](https://www.shadcn-vue.com/docs/components/sidebar) - Component API, installation, patterns
- [shadcn-vue Dropdown Menu](https://www.shadcn-vue.com/docs/components/dropdown-menu) - User menu pattern
- [shadcn-vue Avatar](https://www.shadcn-vue.com/docs/components/avatar) - User avatar component
- [Nuxt Layouts Documentation](https://nuxt.com/docs/4.x/directory-structure/app/layouts) - Layout patterns
- [Lucide Icons](https://lucide.dev/icons/) - Icon names verified

### Secondary (MEDIUM confidence)
- [GitHub Issue #5561](https://github.com/shadcn-ui/ui/issues/5561) - Mobile auto-close pattern
- [GitHub Issue #7947](https://github.com/shadcn-ui/ui/issues/7947) - Inset variant overflow bug

### Tertiary (LOW confidence)
- Dashboard-01 block pattern referenced but code not directly accessible via WebFetch

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - shadcn-vue sidebar is official, well-documented
- Architecture: HIGH - Patterns directly from shadcn-vue docs
- Pitfalls: MEDIUM - Some from GitHub issues, verified with official docs

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (stable components, 30-day validity)
