# Phase 10: Customer Queue Experience - Research

**Researched:** 2026-01-29
**Domain:** Vue UI refinements, loading states, status-based displays
**Confidence:** HIGH

## Summary

Phase 10 refines the customer status page experience that was largely implemented in Phase 9. The core infrastructure (real-time updates, position display, wait time estimation, turn takeover, gate assignment toasts) already exists. This phase focuses on polish: skeleton loading states, completion confirmation, improved error handling, live indicator, and cancelled/rejected status handling.

The existing codebase uses Nuxt 4 with Vue 3.5, Tailwind CSS 4 with tw-animate-css, shadcn-vue components, and lucide-vue-next icons. All required dependencies are installed. The status page (`customer/app/pages/status/[id].vue`) currently handles pending, approved, in_queue, completed, and cancelled states but needs refinement per CONTEXT.md decisions.

Key insight: This phase is primarily UI enhancement, not infrastructure work. The real-time subscription, wait time calculation, and core display components are complete. Work involves adding skeleton UI, enhancing the completed status display with receipt-like summary, adding a live indicator, and improving error/cancelled states.

**Primary recommendation:** Enhance the existing status page with skeleton loading states using shadcn Skeleton component, add a completion confirmation display with success visuals, implement a live indicator badge, and improve error/cancelled messaging with links back to submission.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 | ^3.5.27 | Core framework | Already configured |
| Tailwind CSS | ^4.1.18 | Styling, animations | Already configured with tw-animate-css |
| shadcn-vue | ^2.4.3 | UI components (Card, Button, Skeleton) | Already installed via shadcn-nuxt |
| lucide-vue-next | ^0.563.0 | Icons (CheckCircle, AlertCircle, etc.) | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vueuse/core | ^14.1.0 | useTransition (already used) | Position animation (already implemented) |
| vue-sonner | ^2.0.9 | Toast notifications | Gate change toasts (already implemented) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Skeleton component | div with animate-pulse | Skeleton provides consistent styling |
| Live badge | Pulsing dot inline | Badge is more visible, clearer meaning |

**Installation:**
```bash
# Add skeleton component via shadcn-vue CLI
pnpm dlx shadcn-vue@latest add skeleton
```

## Architecture Patterns

### Recommended Project Structure
```
customer/app/
├── components/
│   ├── ui/
│   │   └── skeleton/           # NEW - shadcn skeleton component
│   │       ├── Skeleton.vue
│   │       └── index.ts
│   ├── StatusSkeleton.vue      # NEW - Skeleton for status page
│   ├── CompletedStatus.vue     # NEW - Completion confirmation display
│   ├── LiveIndicator.vue       # NEW - Real-time data indicator
│   ├── PositionDisplay.vue     # Existing - animated position
│   ├── WaitTimeEstimate.vue    # Existing - wait time range
│   ├── TurnTakeover.vue        # Existing - full-screen takeover
│   └── ConnectionStatus.vue    # Existing - connection indicator
├── composables/
│   ├── useRealtimeStatus.ts    # Existing - realtime subscription
│   └── useWaitTimeEstimate.ts  # Existing - wait time calculation
└── pages/
    └── status/[id].vue         # Enhance existing page
```

### Pattern 1: Skeleton Loading State
**What:** Replace generic "Loading..." text with skeleton placeholder matching content shape
**When to use:** While fetching initial request data
**Example:**
```vue
<!-- StatusSkeleton.vue -->
<template>
  <Card>
    <CardHeader class="text-center space-y-2">
      <Skeleton class="h-7 w-40 mx-auto" /> <!-- Title -->
      <Skeleton class="h-4 w-32 mx-auto" /> <!-- Order number -->
    </CardHeader>
    <CardContent class="text-center space-y-6 py-4">
      <div class="space-y-2">
        <Skeleton class="h-5 w-24 mx-auto" /> <!-- "You are" -->
        <Skeleton class="h-16 w-20 mx-auto" /> <!-- Position number -->
        <Skeleton class="h-5 w-20 mx-auto" /> <!-- "in queue" -->
      </div>
      <Skeleton class="h-5 w-36 mx-auto" /> <!-- Wait time -->
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>
```

### Pattern 2: Completion Confirmation Display
**What:** Receipt-like summary when pickup is marked complete
**When to use:** Status changes to 'completed'
**Example:**
```vue
<!-- CompletedStatus.vue -->
<template>
  <div class="text-center space-y-6 py-4">
    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
      <CheckCircle2 class="w-10 h-10 text-green-600" />
    </div>
    <div class="space-y-1">
      <h2 class="text-2xl font-bold text-green-700">Pickup Complete</h2>
      <p class="text-muted-foreground">Thank you for your pickup!</p>
    </div>
    <div class="bg-muted/50 rounded-lg p-4 text-sm">
      <p class="text-muted-foreground">Order #{{ orderNumber }}</p>
      <p v-if="gateNumber" class="text-muted-foreground">
        Completed at Gate {{ gateNumber }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'

defineProps<{
  orderNumber: string
  gateNumber?: number | null
}>()
</script>
```

### Pattern 3: Live Indicator Badge
**What:** Visual indicator showing data updates in real-time
**When to use:** When connection status is 'connected'
**Example:**
```vue
<!-- LiveIndicator.vue -->
<template>
  <div
    v-if="show"
    class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium"
  >
    <span class="relative flex h-2 w-2">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
    </span>
    Live
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
}>()
</script>
```

### Pattern 4: Cancelled/Rejected Status with Link
**What:** Informative status display with option to submit new request
**When to use:** Status is 'cancelled'
**Example:**
```vue
<!-- In status page template -->
<div v-if="request.status === 'cancelled'" class="text-center space-y-4 py-4">
  <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted">
    <XCircle class="w-6 h-6 text-muted-foreground" />
  </div>
  <div class="space-y-1">
    <h2 class="text-xl font-semibold">Request Cancelled</h2>
    <p class="text-muted-foreground text-sm">
      This pickup request has been cancelled.
    </p>
  </div>
  <NuxtLink to="/" class="text-primary hover:underline text-sm">
    Submit a new request
  </NuxtLink>
</div>
```

### Pattern 5: Error State with Link
**What:** "Request not found" error with navigation back to form
**When to use:** Fetch error or request doesn't exist
**Example:**
```vue
<!-- In status page template -->
<Card v-if="fetchError || !request">
  <CardHeader class="text-center">
    <CardTitle class="text-xl">Request Not Found</CardTitle>
  </CardHeader>
  <CardContent class="text-center space-y-4">
    <p class="text-muted-foreground">
      We couldn't find a pickup request with this ID.
    </p>
    <NuxtLink to="/">
      <Button variant="outline">Submit a New Request</Button>
    </NuxtLink>
  </CardContent>
</Card>
```

### Anti-Patterns to Avoid
- **Full-screen takeover for completion:** CONTEXT.md specifies status change approach, not takeover (unlike turn notification)
- **Warning/error colors for cancelled:** CONTEXT.md specifies neutral/muted colors since cancellation isn't customer's fault
- **Hiding skeleton immediately:** Keep skeleton until data is fully loaded, avoid flash of content
- **Auto-redirect after completion:** Customer stays on page, manually navigates away

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Loading placeholder animation | CSS keyframes | Tailwind animate-pulse | Already configured via tw-animate-css |
| Skeleton component | Gray divs | shadcn Skeleton | Consistent with rest of UI, accessible |
| Status icons | Custom SVG | lucide-vue-next | Already installed, consistent icon set |
| Live indicator animation | Custom animation | Tailwind animate-ping | GPU-accelerated, already available |

**Key insight:** This phase adds no new libraries. Everything needed is already installed or available via the existing shadcn-vue integration.

## Common Pitfalls

### Pitfall 1: Skeleton Flash on Fast Loads
**What goes wrong:** Skeleton briefly appears then immediately disappears
**Why it happens:** Data loads faster than skeleton renders
**How to avoid:** Use `v-if="pending"` with minimum loading time if desired, or accept brief flash
**Warning signs:** Skeleton flashes for <100ms

### Pitfall 2: Completion Status Not Updating
**What goes wrong:** Page shows old status after staff marks complete
**Why it happens:** Realtime subscription callback not refreshing
**How to avoid:** Already handled - existing `refresh()` call on UPDATE events
**Warning signs:** Status stays as "in_queue" after completion

### Pitfall 3: Live Indicator Shows When Disconnected
**What goes wrong:** "Live" badge displays despite connection issues
**Why it happens:** Not tied to connection status
**How to avoid:** Bind to `realtimeStatus === 'connected'`
**Warning signs:** Live indicator shows while ConnectionStatus shows "Reconnecting"

### Pitfall 4: Order Number Display Incorrect Field
**What goes wrong:** Shows undefined or wrong field
**Why it happens:** Database uses `sales_order_number`, not `order_number`
**How to avoid:** Already fixed in Phase 9 - use `request.sales_order_number`
**Warning signs:** TypeScript error or undefined in display

### Pitfall 5: Gate Number Missing in Completion
**What goes wrong:** "Completed at Gate undefined" displayed
**Why it happens:** Request loses gate info after status change
**How to avoid:** Store gate number in local state before completion, or always show gates relationship
**Warning signs:** Gate shows undefined after completing

## Code Examples

Verified patterns from existing codebase:

### Skeleton Component (shadcn-vue standard)
```vue
<!-- components/ui/skeleton/Skeleton.vue -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('animate-pulse rounded-md bg-muted', props.class)" />
</template>
```

### Enhanced Status Page Integration
```vue
<!-- Snippet showing how components integrate in status/[id].vue -->
<template>
  <!-- Loading State with Skeleton -->
  <StatusSkeleton v-if="pending" />

  <!-- Error State -->
  <Card v-else-if="fetchError || !request">
    <CardHeader class="text-center">
      <CardTitle>Request Not Found</CardTitle>
    </CardHeader>
    <CardContent class="text-center space-y-4">
      <p class="text-muted-foreground">
        We couldn't find a pickup request with this ID.
      </p>
      <NuxtLink to="/">
        <Button variant="outline">Submit a New Request</Button>
      </NuxtLink>
    </CardContent>
  </Card>

  <!-- Status Display -->
  <Card v-else>
    <CardHeader class="text-center space-y-2">
      <div class="flex items-center justify-center gap-2">
        <CardTitle>{{ statusDisplay?.title }}</CardTitle>
        <LiveIndicator :show="realtimeStatus === 'connected'" />
      </div>
      <p class="text-sm text-muted-foreground">
        Order: {{ request.sales_order_number }}
      </p>
    </CardHeader>
    <CardContent>
      <!-- Completed Status -->
      <CompletedStatus
        v-if="request.status === 'completed'"
        :order-number="request.sales_order_number"
        :gate-number="gateNumber"
      />

      <!-- Cancelled Status -->
      <div v-else-if="request.status === 'cancelled'" class="text-center space-y-4 py-4">
        <XCircle class="w-12 h-12 mx-auto text-muted-foreground" />
        <div class="space-y-1">
          <h2 class="text-lg font-medium">Request Cancelled</h2>
          <p class="text-muted-foreground text-sm">
            This pickup request has been cancelled.
          </p>
        </div>
        <NuxtLink to="/" class="text-primary hover:underline text-sm">
          Submit a new request
        </NuxtLink>
      </div>

      <!-- In Queue Status (existing) -->
      <div v-else-if="statusDisplay?.showPosition" class="py-4">
        <PositionDisplay :position="request.queue_position" />
        <WaitTimeEstimate :estimate="waitEstimate" class="mt-4" />
      </div>

      <!-- Other statuses -->
      <p v-else class="text-muted-foreground text-center py-4">
        {{ statusDisplay?.message }}
      </p>
    </CardContent>
  </Card>

  <ConnectionStatus :status="realtimeStatus" />
  <TurnTakeover ... />
</template>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| "Loading..." text | Skeleton placeholders | 2020+ best practice | Reduced perceived load time |
| Full page spinners | Content-shaped skeletons | 2019+ | Better UX, no layout shift |
| Generic error pages | Contextual error with actions | Current best practice | Better recovery paths |

**Deprecated/outdated:**
- Loading spinners for content areas (skeletons preferred)
- Text-only loading states without shape hints

## Open Questions

Things that couldn't be fully resolved:

1. **Completed_at timestamp display**
   - What we know: Database has `completed_at` field
   - What's unclear: Should completion summary show timestamp?
   - Recommendation: Skip for now per "minimal" UI decision; can add later

2. **Gate number retention after completion**
   - What we know: Gate assignment may change when status changes
   - What's unclear: Is gate still associated after completion?
   - Recommendation: Test with actual flow; if needed, store gate in local state

## Sources

### Primary (HIGH confidence)
- Existing codebase: `customer/app/pages/status/[id].vue` - current implementation
- Existing codebase: `customer/app/components/*.vue` - established patterns
- [shadcn-vue Skeleton](https://www.shadcn-vue.com/docs/components/skeleton) - component usage

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions - user-specified requirements
- Phase 9 research and implementation - established patterns

### Tertiary (LOW confidence)
- None - all recommendations based on existing patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies already installed
- Architecture: HIGH - Building on existing patterns
- UI patterns: HIGH - Following CONTEXT.md decisions and existing code
- Skeleton implementation: HIGH - Standard shadcn-vue component

**Research date:** 2026-01-29
**Valid until:** 2026-02-28 (30 days - patterns well-established, minimal change expected)
