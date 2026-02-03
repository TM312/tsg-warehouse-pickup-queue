# Phase 18: Gate Operator & Bug Fixes - Research

**Researched:** 2026-02-03
**Domain:** Vue 3 navigation, mobile viewport, component event binding
**Confidence:** HIGH

## Summary

This phase involves three distinct implementation areas: (1) prev/next gate navigation with keyboard support, (2) mobile viewport scrolling fix, and (3) a filter toggle bug fix. Research confirms the existing codebase uses Nuxt 4 with Vue 3, Pinia stores, and shadcn-vue components built on reka-ui.

The filter toggle bug (BUG-01) has been identified: the `ShowCompletedToggle.vue` component uses the legacy Radix Vue event binding pattern (`@update:checked`) instead of the reka-ui pattern (`@update:modelValue` or `v-model`). This is a straightforward fix.

For gate navigation, the project already has a gates store with sorted gate getters. VueUse's `useMagicKeys` composable provides clean keyboard event handling that auto-cleans up on unmount.

**Primary recommendation:** Fix the toggle by migrating to v-model pattern, use VueUse composables for keyboard events, and apply `min-h-svh` for consistent mobile viewport height.

## Standard Stack

This phase uses existing project dependencies - no new libraries needed.

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vue | ^3.5.27 | Framework | Project standard |
| vue-router | ^4.6.4 | Navigation | Nuxt auto-imports useRouter |
| @vueuse/core | ^14.1.0 | Composables | useMagicKeys, useEventListener |
| pinia | via @pinia/nuxt | State | Gates store already exists |
| reka-ui | ^2.7.0 | UI primitives | shadcn-vue dependency |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-vue-next | ^0.563.0 | Icons | ChevronLeft, ChevronRight for nav buttons |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useMagicKeys | useEventListener('keydown') | useMagicKeys has cleaner API for specific keys |
| svh/dvh | vh with JS fallback | Modern browsers support viewport units natively |

**Installation:**
```bash
# No new dependencies required
```

## Architecture Patterns

### Navigation Composable Pattern
Create a dedicated composable for gate navigation logic to keep the page component clean.

**Location:** `app/composables/useGateNavigation.ts`

```typescript
// Source: VueUse useMagicKeys + existing gates store pattern
import { useMagicKeys } from '@vueuse/core'

export function useGateNavigation(currentGateId: Ref<string>) {
  const router = useRouter()
  const gatesStore = useGatesStore()

  // Get alphabetically sorted active gates (A, B, C order by gate_number)
  const sortedGates = computed(() => gatesStore.sortedActiveGates)

  const currentIndex = computed(() =>
    sortedGates.value.findIndex(g => g.id === currentGateId.value)
  )

  // Wrap-around navigation
  const prevGate = computed(() => {
    if (sortedGates.value.length === 0) return null
    const idx = currentIndex.value <= 0
      ? sortedGates.value.length - 1
      : currentIndex.value - 1
    return sortedGates.value[idx]
  })

  const nextGate = computed(() => {
    if (sortedGates.value.length === 0) return null
    const idx = currentIndex.value >= sortedGates.value.length - 1
      ? 0
      : currentIndex.value + 1
    return sortedGates.value[idx]
  })

  function goToPrev() {
    if (prevGate.value) {
      router.push(`/gate/${prevGate.value.id}`)
    }
  }

  function goToNext() {
    if (nextGate.value) {
      router.push(`/gate/${nextGate.value.id}`)
    }
  }

  // Keyboard shortcuts (auto-cleanup on unmount)
  const { ArrowLeft, ArrowRight } = useMagicKeys()

  watch(ArrowLeft, (pressed) => {
    if (pressed) goToPrev()
  })

  watch(ArrowRight, (pressed) => {
    if (pressed) goToNext()
  })

  return {
    prevGate,
    nextGate,
    goToPrev,
    goToNext
  }
}
```

### Recommended Project Structure
```
app/
├── composables/
│   └── useGateNavigation.ts   # NEW: Gate navigation logic
├── components/
│   ├── gate/
│   │   └── GateNavButtons.vue # NEW: Prev/Next button UI
│   └── dashboard/
│       └── ShowCompletedToggle.vue # FIX: v-model binding
├── pages/
│   └── gate/
│       └── [id].vue           # UPDATE: Add nav + keyboard
└── layouts/
    └── fullscreen.vue         # UPDATE: Mobile viewport fix
```

### Anti-Patterns to Avoid
- **Global keyboard listeners without cleanup:** Always use VueUse composables or ensure cleanup in onUnmounted
- **Direct DOM manipulation for viewport:** Use CSS viewport units, not JavaScript calculations
- **Mixing controlled/uncontrolled patterns:** Either use v-model OR :value/@update:modelValue, not both

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keyboard event handling | Manual addEventListener/removeEventListener | VueUse useMagicKeys | Auto-cleanup, reactive, SSR-safe |
| Mobile viewport height | JS-based vh calculation | CSS svh/dvh units | Native browser support, no layout thrashing |
| Two-way binding | Manual prop + emit | v-model directive | Vue standard pattern, cleaner code |

**Key insight:** The project already has @vueuse/core installed. Leverage it instead of rolling custom event handling.

## Common Pitfalls

### Pitfall 1: reka-ui Event Naming (BUG-01 Root Cause)
**What goes wrong:** Switch component doesn't respond to clicks
**Why it happens:** reka-ui migrated from `v-model:checked` to `v-model`, but code still uses `@update:checked`
**How to avoid:** Always use `v-model` or `:model-value` + `@update:modelValue` with reka-ui components
**Warning signs:** Component renders but state doesn't update when interacted with

### Pitfall 2: 100vh on iOS Safari
**What goes wrong:** Content extends below visible viewport, causing unwanted scroll
**Why it happens:** 100vh includes the address bar height even when it's visible
**How to avoid:** Use `svh` (small viewport height) for content that must fit, or `dvh` only when dynamic resize is needed
**Warning signs:** Layout looks correct in desktop browser but breaks on iPhone

### Pitfall 3: Keyboard Events During Input
**What goes wrong:** Arrow key navigation triggers while typing in an input field
**Why it happens:** useMagicKeys captures all keyboard events globally
**How to avoid:** Check `document.activeElement` or use useMagicKeys options to filter
**Warning signs:** Unexpected navigation when user is filling out forms

### Pitfall 4: Gate Order Inconsistency
**What goes wrong:** Gates appear in different order on different screens
**Why it happens:** Using `gates.value` directly instead of sorted computed
**How to avoid:** Always use `sortedActiveGates` getter from gates store
**Warning signs:** Gate 3 sometimes appears before Gate 2

## Code Examples

Verified patterns from official sources:

### Fix: ShowCompletedToggle v-model Migration
```vue
<!-- Source: reka-ui migration guide + shadcn-vue docs -->
<template>
  <div class="flex items-center gap-2">
    <Switch v-model="modelValue" />
    <span class="text-sm text-muted-foreground">Show completed/cancelled</span>
  </div>
</template>

<script setup lang="ts">
import { Switch } from '@/components/ui/switch'

const modelValue = defineModel<boolean>('showCompleted', { default: false })
</script>
```

### Keyboard Navigation with useMagicKeys
```typescript
// Source: https://vueuse.org/core/useMagicKeys/
import { useMagicKeys, whenever } from '@vueuse/core'

const { ArrowLeft, ArrowRight } = useMagicKeys()

// Only trigger when not in an input
whenever(ArrowLeft, () => {
  if (!isInputActive()) goToPrev()
})

whenever(ArrowRight, () => {
  if (!isInputActive()) goToNext()
})

function isInputActive() {
  const el = document.activeElement
  return el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA'
}
```

### Vue Router Programmatic Navigation
```typescript
// Source: https://router.vuejs.org/guide/essentials/navigation.html
const router = useRouter()

function navigateToGate(gateId: string) {
  // Use path directly for simple routes
  router.push(`/gate/${gateId}`)
}
```

### Mobile Viewport Height CSS
```css
/* Source: https://ishadeed.com/article/new-viewport-units/ */
.fullscreen-layout {
  /* svh = small viewport height (address bar visible) */
  min-height: 100svh;

  /* Fallback for older browsers */
  min-height: 100vh;
  min-height: 100svh;
}

/* For containers that should scroll when content overflows */
.scrollable-content {
  max-height: 100svh;
  overflow-y: auto;
}
```

### Navigation Buttons Pattern
```vue
<!-- Button with icon only on small screens, icon + label on larger -->
<template>
  <div class="flex items-center gap-2">
    <Button
      variant="ghost"
      size="sm"
      :disabled="!prevGate"
      @click="goToPrev"
    >
      <ChevronLeft class="h-4 w-4" />
      <span class="hidden sm:inline">{{ prevGate?.gate_number }}</span>
    </Button>

    <span class="font-bold text-lg">Gate {{ currentGate?.gate_number }}</span>

    <Button
      variant="ghost"
      size="sm"
      :disabled="!nextGate"
      @click="goToNext"
    >
      <span class="hidden sm:inline">{{ nextGate?.gate_number }}</span>
      <ChevronRight class="h-4 w-4" />
    </Button>
  </div>
</template>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 100vh for fullscreen | svh/dvh viewport units | Safari 15.4 (2022) | Consistent mobile layouts |
| v-model:checked (Radix Vue) | v-model (reka-ui) | reka-ui v2.0 | Breaking change for Switch/Checkbox |
| addEventListener in onMounted | VueUse composables | VueUse v10+ | Auto-cleanup, SSR-safe |

**Deprecated/outdated:**
- `v-model:checked` on Switch: Replaced by `v-model` in reka-ui v2
- CSS `100vh` on mobile: Use `svh` or `dvh` for reliable viewport sizing

## Open Questions

None - all technical questions resolved through research.

## Sources

### Primary (HIGH confidence)
- [reka-ui SwitchRoot source](file://staff/node_modules/reka-ui/src/Switch/SwitchRoot.vue) - Confirmed emits only `update:modelValue`
- [VueUse useEventListener docs](https://vueuse.org/core/useEventListener/) - Event handling patterns
- [VueUse useMagicKeys docs](https://vueuse.org/core/useMagicKeys/) - Keyboard event composable

### Secondary (MEDIUM confidence)
- [New CSS Viewport Units (ishadeed.com)](https://ishadeed.com/article/new-viewport-units/) - svh/lvh/dvh explanation
- [Vue Router Programmatic Navigation](https://router.vuejs.org/guide/essentials/navigation.html) - router.push patterns
- [reka-ui Migration Guide](https://reka-ui.com/docs/guides/migration) - v-model:checked to v-model change

### Tertiary (LOW confidence)
- None - all findings verified with primary sources

## Metadata

**Confidence breakdown:**
- Filter bug fix: HIGH - Source code inspection confirmed root cause
- Navigation pattern: HIGH - Uses existing store patterns + documented VueUse APIs
- Mobile viewport: MEDIUM - Browser support is good but edge cases may exist

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - stable patterns)

## Claude's Discretion Recommendations

Based on research, here are recommendations for areas marked as Claude's discretion:

### Navigation Button Style
**Recommendation:** Icon-only buttons with tooltip on mobile (< 640px), icon + gate number on larger screens
**Rationale:** Mobile screens need compact UI; Tailwind `hidden sm:inline` pattern handles this cleanly

### Overflow Scroll Behavior
**Recommendation:** Use `overflow-y-auto` on main content area with `max-h-svh`
**Rationale:** Allows content to scroll when it exceeds viewport while preventing initial over-scroll

### Target Device Breakpoints
**Recommendation:** Focus on iOS Safari (primary mobile issue) and standard Tailwind breakpoints
**Rationale:** iOS Safari has the most viewport quirks; svh handles most cases natively

### Filter State Persistence
**Recommendation:** Session storage (not localStorage)
**Rationale:** Show completed/cancelled is a temporary view preference, not a permanent setting. Should reset on new session.
