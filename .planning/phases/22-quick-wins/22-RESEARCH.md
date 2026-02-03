# Phase 22: Quick Wins - Research

**Researched:** 2026-02-03
**Domain:** UI polish (badges, links, button removal)
**Confidence:** HIGH

## Summary

This phase involves three isolated UI changes with zero architectural risk: adding an external link icon to the Gates page "Open" button, improving tab badge visibility with subtle styling differences, and removing the refresh button from the dashboard.

All changes use existing project infrastructure. The project already has lucide-vue-next for icons, shadcn-vue Badge and Button components with appropriate variants, and Tailwind CSS for styling. No new dependencies are required.

**Primary recommendation:** Use existing component variants and Tailwind utilities - Badge `variant="secondary"` for visibility, Button with `ExternalLink` icon, and straightforward JSX deletion for the refresh button.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn-vue | ^2.4.3 | UI components (Badge, Button) | Already in use throughout app |
| lucide-vue-next | ^0.563.0 | Icon library | Already used for all icons |
| TailwindCSS | ^4.1.18 | Utility CSS | Project styling foundation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| class-variance-authority | ^0.7.1 | Variant styling | Already powers Badge/Button variants |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Badge secondary variant | Custom CSS classes | Secondary variant is semantic and theme-aware |
| ExternalLink icon | ArrowUpRight icon | ExternalLink is more universally recognized |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
```

## Architecture Patterns

### Pattern 1: Icon in Button with as-child for Links

**What:** Using Button component with icon alongside NuxtLink via as-child pattern
**When to use:** When a button needs to function as a link to another route
**Example:**
```vue
<!-- Source: https://www.shadcn-vue.com/docs/components/button -->
<script setup>
import { ExternalLink } from 'lucide-vue-next'
</script>

<template>
  <Button variant="outline" size="sm" as-child>
    <NuxtLink :to="`/gate/${gate.id}`" target="_blank">
      Open
      <ExternalLink class="h-4 w-4" />
    </NuxtLink>
  </Button>
</template>
```

### Pattern 2: Badge Secondary Variant for Tab Counts

**What:** Using Badge component with secondary variant for subtle visual distinction
**When to use:** When displaying counts that need visibility but shouldn't dominate
**Example:**
```vue
<!-- Source: https://www.shadcn-vue.com/docs/components/badge -->
<script setup>
import { Badge } from '@/components/ui/badge'
</script>

<template>
  <TabsTrigger value="all">
    All Requests
    <Badge variant="secondary" class="ml-2 tabular-nums">{{ count }}</Badge>
  </TabsTrigger>
</template>
```

### Pattern 3: Tabular Numbers for Count Badges

**What:** Using `tabular-nums` Tailwind utility for monospace number display
**When to use:** When numbers will change and layout shift must be prevented
**Example:**
```vue
<!-- Source: https://tailwindcss.com/docs/font-variant-numeric -->
<template>
  <Badge variant="secondary" class="tabular-nums">{{ count }}</Badge>
</template>
```

### Anti-Patterns to Avoid
- **Inline color classes on Badge:** Don't use `bg-gray-200` directly; use `variant="secondary"` for theme awareness
- **Hardcoded icon sizes:** Use consistent `h-4 w-4` or let Button's gap utility handle spacing
- **Missing target="_blank" without context:** The gate view is meant to be opened in a separate tab/window for gate operators

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Badge styling | Custom CSS for background | `variant="secondary"` | Theme-aware, dark mode support |
| Icon sizing in buttons | Manual margin/padding | Button's built-in icon spacing | Consistent with rest of app |
| Monospace numbers | Custom font-family | `tabular-nums` utility | Standard CSS feature, well-supported |

**Key insight:** All three changes are configuration of existing components, not new implementations.

## Common Pitfalls

### Pitfall 1: Badge Visibility on Active vs Inactive Tabs
**What goes wrong:** Badge looks identical on active (white bg) and inactive (muted bg) tabs
**Why it happens:** Secondary variant uses `bg-secondary` which may be too similar to tab backgrounds
**How to avoid:** Test badge visibility on both active and inactive tab states; adjust opacity or shade if needed
**Warning signs:** Badge "disappears" when tab is selected or deselected

### Pitfall 2: Layout Shift When Counts Change
**What goes wrong:** Numbers jump/shift when count changes from 9 to 10 (single to double digit)
**Why it happens:** Proportional number widths cause varying badge sizes
**How to avoid:** Always use `tabular-nums` class on numeric badges
**Warning signs:** Visible jitter during realtime updates

### Pitfall 3: External Link Icon Placement
**What goes wrong:** Icon appears on wrong side or has inconsistent spacing
**Why it happens:** Icon before text vs after text, or missing gap utility
**How to avoid:** Place icon after text for external links (convention); use Button's built-in gap
**Warning signs:** Icon looks cramped or separated from text

### Pitfall 4: target="_blank" Security
**What goes wrong:** New tab can access opener window via window.opener
**Why it happens:** Missing rel="noopener noreferrer" attribute
**How to avoid:** NuxtLink handles this automatically for external targets; verify behavior
**Warning signs:** Security linting warnings about target="_blank"

## Code Examples

Verified patterns from official sources:

### External Link Button (Gates Table)
```vue
<!-- Current implementation in GatesTable.vue -->
<Button variant="outline" size="sm" as-child>
  <NuxtLink :to="`/gate/${gate.id}`">Open</NuxtLink>
</Button>

<!-- Updated with ExternalLink icon -->
<script setup>
import { ExternalLink } from 'lucide-vue-next'
</script>

<Button variant="outline" size="sm" as-child>
  <NuxtLink :to="`/gate/${gate.id}`" target="_blank">
    Open
    <ExternalLink class="h-4 w-4" />
  </NuxtLink>
</Button>
```

### Tab Badge with Secondary Variant
```vue
<!-- Current implementation in index.vue -->
<TabsTrigger value="all">
  All Requests
  <span class="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">{{ count }}</span>
</TabsTrigger>

<!-- Updated with Badge component -->
<script setup>
import { Badge } from '@/components/ui/badge'
</script>

<TabsTrigger value="all">
  All Requests
  <Badge variant="secondary" class="ml-2 tabular-nums">{{ count }}</Badge>
</TabsTrigger>
```

### Refresh Button Removal
```vue
<!-- Current implementation in index.vue (lines 200-203) -->
<Button variant="outline" size="sm" :disabled="refreshing" @click="refresh()">
  <RefreshCw :class="['h-4 w-4 mr-2', { 'animate-spin': refreshing }]" />
  Refresh
</Button>

<!-- Simply delete these lines -->
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom `<span>` for badges | shadcn Badge component | Already in codebase | Consistent theming |
| Manual icon imports | lucide-vue-next tree-shaking | Already in codebase | Optimal bundle size |

**Deprecated/outdated:**
- None relevant to this phase - using current patterns already in the codebase

## Open Questions

1. **Badge shade on active tabs**
   - What we know: `variant="secondary"` uses `bg-secondary` which is `oklch(0.97 0 0)` in light mode
   - What's unclear: Whether this provides enough contrast against active tab's white background
   - Recommendation: Implement and visually verify; adjust with slight opacity or darker shade if needed

2. **External link target behavior**
   - What we know: Gate operator view is designed for tablet/phone at gate
   - What's unclear: Whether `target="_blank"` is the right UX (new tab) vs `target="_self"` (same tab)
   - Recommendation: Use `target="_blank"` since staff may want to keep Gates overview open while operating gate

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `/staff/app/components/ui/badge/index.ts`, `/staff/app/components/ui/button/index.ts`
- [shadcn-vue Badge documentation](https://www.shadcn-vue.com/docs/components/badge)
- [shadcn-vue Button documentation](https://www.shadcn-vue.com/docs/components/button)
- [Tailwind CSS font-variant-numeric](https://tailwindcss.com/docs/font-variant-numeric)

### Secondary (MEDIUM confidence)
- [MDN font-variant-numeric](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variant-numeric)

### Tertiary (LOW confidence)
- None - all findings verified with official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in use in codebase
- Architecture: HIGH - patterns verified against official shadcn-vue docs
- Pitfalls: HIGH - based on codebase analysis and known CSS behavior

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - stable patterns, no rapidly changing dependencies)
