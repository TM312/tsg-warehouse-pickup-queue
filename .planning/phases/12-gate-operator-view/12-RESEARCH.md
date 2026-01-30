# Phase 12: Gate Operator View - Research

**Researched:** 2026-01-30
**Domain:** Mobile-first Vue page, real-time subscriptions, touch-optimized UI
**Confidence:** HIGH

## Summary

Phase 12 creates a dedicated mobile-first view for gate operators at `/gate/[id]`. The view displays the current pickup (position 1) with quick actions to start processing and complete pickups. The implementation builds on Phase 11's processing status infrastructure and follows established patterns in the codebase.

Key technical areas:
1. **Dynamic route page** - New `/gate/[id].vue` page in staff app using Nuxt's file-based routing
2. **Real-time updates** - Gate-specific subscription for queue changes using existing `useRealtimeQueue` pattern
3. **Touch-optimized UI** - Large touch targets (44x44px minimum), prominent action buttons, minimal cognitive load
4. **Confirmation dialogs** - shadcn-vue AlertDialog for Complete action confirmation

**Primary recommendation:** Create a focused single-gate view with large touch targets, using existing composables (`useQueueActions`, `useRealtimeQueue`) and shadcn-vue components (`Button`, `Card`, `AlertDialog`). Prioritize the current pickup display with secondary next-up preview below.

## Standard Stack

The phase uses the existing project stack with no new libraries required.

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @vueuse/core | ^14.1.0 | Vue composition utilities | `useIntervalFn` for timer (already used in StatusBadge) |
| lucide-vue-next | ^0.563.0 | Icons | CheckCircle, RotateCcw, Clock, Users icons |
| reka-ui | ^2.2.1 | Headless UI primitives | AlertDialog for confirmations |
| class-variance-authority | ^0.7.1 | Variant styling | Existing button/badge patterns |
| tailwindcss | ^4.1.18 | CSS utility framework | Mobile-responsive classes |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vue-sonner | ^2.0.9 | Toast notifications | Action feedback (already integrated) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| AlertDialog | window.confirm() | AlertDialog provides consistent styling and accessibility |
| Custom realtime | useRealtimeQueue | Existing composable handles reconnection and visibility changes |

**Installation:**
No new dependencies required - all needed libraries are already installed.

## Architecture Patterns

### Recommended File Structure
```
staff/
├── app/
│   ├── pages/
│   │   └── gate/
│   │       └── [id].vue           # Gate operator view (new)
│   ├── components/
│   │   └── gate/                  # New folder for gate components
│   │       ├── CurrentPickup.vue  # Main pickup display
│   │       ├── NextUpPreview.vue  # Position 2 preview
│   │       ├── EmptyGateState.vue # No pickups assigned
│   │       └── CompleteDialog.vue # Confirmation dialog
│   └── composables/
│       └── useGateSubscription.ts # Gate-specific realtime (optional)
```

### Pattern 1: Dynamic Route Page with Gate ID
**What:** Nuxt file-based routing with dynamic `[id]` parameter
**When to use:** Any gate-specific view
**Example:**
```typescript
// staff/app/pages/gate/[id].vue
const route = useRoute()
const gateId = computed(() => route.params.id as string)

// Validate gate exists
const { data: gate, error: gateError } = await useAsyncData(
  `gate-${gateId.value}`,
  async () => {
    const { data, error } = await client
      .from('gates')
      .select('id, gate_number, is_active')
      .eq('id', gateId.value)
      .single()
    if (error) throw error
    return data
  }
)
```

### Pattern 2: Gate-Filtered Real-time Subscription
**What:** Subscribe to pickup_requests changes filtered by gate
**When to use:** Gate operator view needs live updates only for its gate
**Example:**
```typescript
// Reuse useRealtimeQueue but filter locally
const { status: realtimeStatus, subscribe, unsubscribe } = useRealtimeQueue()

onMounted(() => {
  subscribe(() => {
    // Refresh gate-specific data
    refreshPickups()
  })
})
```
**Note:** The existing `useRealtimeQueue` subscribes to all pickup_requests changes. For a single gate, this is acceptable because:
- Expected volume is low (50-100 pickups/day across all gates)
- Local filtering is simple: `filter(r => r.assigned_gate_id === gateId)`
- Avoids creating a new composable for minimal benefit

### Pattern 3: Mobile Touch Target Sizing
**What:** Ensuring all interactive elements meet 44x44px minimum
**When to use:** Any touch-enabled interface
**Example:**
```vue
<!-- Large touch-friendly button -->
<Button
  class="h-14 w-full text-lg"
  @click="handleStartProcessing"
>
  <Play class="h-6 w-6 mr-2" />
  Start Processing
</Button>
```

### Pattern 4: Confirmation Dialog for Complete Action
**What:** AlertDialog requiring explicit confirmation before completing
**When to use:** Destructive or important state transitions
**Example:**
```vue
<AlertDialog v-model:open="showCompleteDialog">
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Complete Pickup?</AlertDialogTitle>
      <AlertDialogDescription>
        Order {{ currentPickup.sales_order_number }} for
        {{ currentPickup.company_name || 'Customer' }} will be marked as complete.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction @click="handleComplete">Complete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Pattern 5: Empty State with Illustration
**What:** Friendly message when no pickups are assigned to gate
**When to use:** Gate has no queue items
**Example:**
```vue
<div v-if="!currentPickup && !nextUp" class="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
  <Inbox class="h-24 w-24 text-muted-foreground/50 mb-4" />
  <h2 class="text-xl font-semibold text-muted-foreground">No Pickups Assigned</h2>
  <p class="text-muted-foreground mt-2">
    Pickups will appear here when assigned to this gate.
  </p>
</div>
```

### Anti-Patterns to Avoid
- **Polling instead of realtime:** Use Supabase Realtime subscriptions, not setInterval polling
- **Desktop-first design:** Start with mobile layout, enhance for larger screens
- **Small touch targets:** Never use `size="sm"` buttons for primary actions on mobile
- **Blocking confirmations for Start Processing:** User decision says no confirmation needed
- **Showing full queue:** Only show current (position 1) and next-up (position 2)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confirmation dialogs | Custom modal | shadcn AlertDialog | Accessibility, focus management, animation |
| Touch feedback | Custom ripple effect | Button hover states | Tailwind handles this via hover:bg-* |
| Realtime connection | Custom WebSocket | useRealtimeQueue | Handles reconnection, visibility changes |
| Processing actions | Direct Supabase UPDATE | useQueueActions | Atomic functions, error handling, toast |
| Duration display | Custom interval | StatusBadge component | Already built in Phase 11 |

**Key insight:** Phase 11 built the processing infrastructure. Phase 12 composes existing pieces into a mobile-optimized view.

## Common Pitfalls

### Pitfall 1: Forgetting Gate Validation
**What goes wrong:** User navigates to /gate/invalid-uuid, page crashes
**Why it happens:** No error boundary or gate existence check
**How to avoid:** Use useAsyncData with error handling, show "Gate not found" state
**Warning signs:** Unhandled errors in console, blank page

### Pitfall 2: Stale Data After Action
**What goes wrong:** "Complete" succeeds but old pickup still shows
**Why it happens:** Not awaiting refresh after action
**How to avoid:** Always `await refresh()` after any queue action
**Warning signs:** UI doesn't update until manual refresh

### Pitfall 3: Touch Target Too Small
**What goes wrong:** Users tap wrong button on mobile
**Why it happens:** Using desktop-sized buttons (h-8, h-9)
**How to avoid:** Use h-11 (44px) or larger for primary mobile actions
**Warning signs:** User frustration, accidental taps

### Pitfall 4: Racing Conditions on Double-Tap
**What goes wrong:** Action fires twice on fast double-tap
**Why it happens:** Button not disabled during pending state
**How to avoid:** Use `pending` ref from useQueueActions to disable buttons
**Warning signs:** Duplicate toasts, database errors

### Pitfall 5: Transition Flash on Auto-Advance
**What goes wrong:** Jarring jump when current pickup completes
**Why it happens:** No transition animation between pickups
**How to avoid:** Use Vue `<Transition>` for smooth content swap
**Warning signs:** Visual stutter, user confusion about what changed

### Pitfall 6: No Loading State on Initial Fetch
**What goes wrong:** Blank screen while data loads
**Why it happens:** Not handling useAsyncData pending state
**How to avoid:** Show skeleton or spinner while `pending` is true
**Warning signs:** Flash of empty content

## Code Examples

Verified patterns from the existing codebase:

### Gate Page Structure
```vue
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/dashboard/StatusBadge.vue'
import { useQueueActions } from '@/composables/useQueueActions'
import { useRealtimeQueue } from '@/composables/useRealtimeQueue'
import { CheckCircle, RotateCcw, Play, Inbox, Users } from 'lucide-vue-next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const client = useSupabaseClient()

const gateId = computed(() => route.params.id as string)

// Fetch gate info
const { data: gate, error: gateError } = await useAsyncData(
  `gate-${gateId.value}`,
  async () => {
    const { data, error } = await client
      .from('gates')
      .select('id, gate_number, is_active')
      .eq('id', gateId.value)
      .single()
    if (error) throw error
    return data
  }
)

// ... rest of component
</script>
```

### Fetching Gate Queue Data
```typescript
interface QueuePickup {
  id: string
  sales_order_number: string
  company_name: string | null
  status: 'in_queue' | 'processing'
  queue_position: number | null
  processing_started_at: string | null
  item_count: number | null
  po_number: string | null
}

const { data: pickups, refresh, pending: loading } = await useAsyncData(
  `gate-queue-${gateId.value}`,
  async () => {
    const { data, error } = await client
      .from('pickup_requests')
      .select('id, sales_order_number, company_name, status, queue_position, processing_started_at, item_count, po_number')
      .eq('assigned_gate_id', gateId.value)
      .in('status', ['in_queue', 'processing'])
      .order('queue_position', { ascending: true })
    if (error) throw error
    return data as QueuePickup[]
  }
)

// Computed for current and next
const currentPickup = computed(() => {
  // Processing pickup takes precedence, otherwise position 1
  const processing = pickups.value?.find(p => p.status === 'processing')
  if (processing) return processing
  return pickups.value?.find(p => p.queue_position === 1) ?? null
})

const nextUp = computed(() => {
  // Position 2 if current is processing or position 1
  return pickups.value?.find(p => p.queue_position === 2) ?? null
})

const queueCount = computed(() => {
  // Count of in_queue items (excludes processing)
  return pickups.value?.filter(p => p.status === 'in_queue').length ?? 0
})
```

### Mobile-First Layout
```vue
<template>
  <div class="min-h-screen flex flex-col">
    <!-- Gate Header -->
    <header class="bg-primary text-primary-foreground p-4 text-center">
      <h1 class="text-2xl font-bold">Gate {{ gate?.gate_number }}</h1>
    </header>

    <!-- Main Content -->
    <main class="flex-1 p-4 space-y-6">
      <!-- Current Pickup Card -->
      <Card v-if="currentPickup" class="border-2 border-primary">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm text-muted-foreground">Now Serving</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Sales Order - Large scannable text -->
          <p class="text-4xl font-mono font-bold text-center tracking-wider">
            {{ currentPickup.sales_order_number }}
          </p>

          <!-- Company Name -->
          <p class="text-xl text-center text-muted-foreground">
            {{ currentPickup.company_name || 'Customer' }}
          </p>

          <!-- Order Details (from NetSuite cache) -->
          <div v-if="currentPickup.item_count || currentPickup.po_number"
               class="flex justify-center gap-4 text-sm text-muted-foreground">
            <span v-if="currentPickup.item_count">{{ currentPickup.item_count }} items</span>
            <span v-if="currentPickup.po_number">PO: {{ currentPickup.po_number }}</span>
          </div>

          <!-- Status Badge -->
          <div class="flex justify-center">
            <StatusBadge
              :status="currentPickup.status"
              :processing-started-at="currentPickup.processing_started_at"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Inbox class="h-24 w-24 text-muted-foreground/50 mb-4" />
        <h2 class="text-xl font-semibold text-muted-foreground">No Pickups Assigned</h2>
        <p class="text-muted-foreground mt-2">
          Pickups will appear here when assigned to this gate.
        </p>
      </div>

      <!-- Action Buttons (44px+ touch targets) -->
      <div v-if="currentPickup" class="space-y-3">
        <!-- Start Processing (only when in_queue) -->
        <Button
          v-if="currentPickup.status === 'in_queue'"
          class="h-14 w-full text-lg"
          :disabled="actionPending"
          @click="handleStartProcessing"
        >
          <Play class="h-6 w-6 mr-2" />
          Start Processing
        </Button>

        <!-- Complete (only when processing) -->
        <Button
          v-if="currentPickup.status === 'processing'"
          class="h-14 w-full text-lg"
          :disabled="actionPending"
          @click="showCompleteDialog = true"
        >
          <CheckCircle class="h-6 w-6 mr-2" />
          Complete
        </Button>

        <!-- Revert to Queue (secondary, only when processing) -->
        <Button
          v-if="currentPickup.status === 'processing'"
          variant="outline"
          class="h-11 w-full"
          :disabled="actionPending"
          @click="handleRevert"
        >
          <RotateCcw class="h-5 w-5 mr-2" />
          Return to Queue
        </Button>
      </div>

      <!-- Next Up Preview -->
      <div v-if="nextUp" class="mt-6">
        <h3 class="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
          <Users class="h-4 w-4" />
          Next Up
        </h3>
        <Card>
          <CardContent class="p-4">
            <p class="font-medium">{{ nextUp.sales_order_number }}</p>
          </CardContent>
        </Card>
      </div>

      <!-- Queue Count -->
      <div v-if="queueCount > 1" class="text-center text-muted-foreground">
        {{ queueCount - 1 }} more in queue
      </div>
    </main>
  </div>
</template>
```

### Action Handlers with Pending State
```typescript
const { pending, startProcessing, revertToQueue, completeRequest } = useQueueActions()

const actionPending = computed(() => {
  return currentPickup.value ? pending.value[currentPickup.value.id] : false
})

async function handleStartProcessing() {
  if (!currentPickup.value || !gate.value) return
  await startProcessing(currentPickup.value.id, gate.value.id)
  await refresh()
}

async function handleRevert() {
  if (!currentPickup.value) return
  await revertToQueue(currentPickup.value.id)
  await refresh()
}

async function handleComplete() {
  if (!currentPickup.value) return
  showCompleteDialog.value = false
  await completeRequest(currentPickup.value.id)
  await refresh()
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Desktop-first responsive | Mobile-first with min-width breakpoints | Industry standard | Better mobile UX |
| Native confirm() | Headless AlertDialog | reka-ui/radix | Accessible, styled |
| Manual WebSocket | Supabase Realtime | Supabase 2.0 | Automatic reconnection |

**Deprecated/outdated:**
- None for this phase - all patterns are current

## Open Questions

1. **Auto-advance Animation Duration**
   - What we know: Brief transition wanted between pickups
   - What's unclear: Exact duration (200ms? 300ms?)
   - Recommendation: Use Vue Transition with 200ms fade - fast enough to feel snappy

2. **Gate Disabled State**
   - What we know: Gates can be disabled in management
   - What's unclear: Should gate view show anything for disabled gate?
   - Recommendation: Show "Gate is currently disabled" message with link back to dashboard

3. **Authentication Scope**
   - What we know: Page will use auth middleware
   - What's unclear: Should any staff member view any gate?
   - Recommendation: Yes - no gate-specific permissions needed for v1.1

## Sources

### Primary (HIGH confidence)
- Existing codebase files:
  - `/staff/app/composables/useQueueActions.ts` - Processing actions
  - `/staff/app/composables/useRealtimeQueue.ts` - Realtime subscription pattern
  - `/staff/app/components/dashboard/StatusBadge.vue` - Processing status display
  - `/staff/app/components/dashboard/NowProcessingSection.vue` - Similar card layout
  - `/supabase/migrations/20260130200000_add_processing_status.sql` - Processing functions
- Apple Human Interface Guidelines: 44x44pt minimum touch target

### Secondary (MEDIUM confidence)
- shadcn-vue AlertDialog pattern from reka-ui documentation
- Tailwind CSS responsive utilities (sm:, md: breakpoints)

### Tertiary (LOW confidence)
- None - all findings verified with codebase or official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, no new deps
- Architecture: HIGH - Following existing project patterns exactly
- Pitfalls: HIGH - Based on actual constraints and existing code patterns

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (30 days - stable domain, no fast-moving deps)
