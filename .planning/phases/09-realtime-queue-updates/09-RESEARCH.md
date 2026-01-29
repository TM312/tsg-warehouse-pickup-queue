# Phase 9: Real-time Queue Updates - Research

**Researched:** 2026-01-29
**Domain:** Real-time UI updates, wait time estimation, Vue transitions
**Confidence:** HIGH

## Summary

This phase builds the display layer that consumes the existing realtime infrastructure from Phase 8. The core challenge is not connectivity (already solved) but presentation: animating position changes, calculating wait time estimates, showing toast notifications for gate changes, and creating a full-screen takeover when the customer's turn arrives.

The project already has all required dependencies installed: `vue-sonner` for toast notifications, `@vueuse/core` for `useTransition` (animated number interpolation), Vue 3's built-in `<Transition>` component for enter/leave animations, and the realtime composables (`useRealtimeQueue`, `useRealtimeStatus`) from Phase 8.

Wait time calculation follows the rolling average pattern: query the last 10 completed pickups, compute average completion time, multiply by (position - 1). Display as a range (e.g., "10-15 minutes") using a +/- 20% buffer. When no history exists (start of day), hide the wait time display entirely.

**Primary recommendation:** Implement display components that react to realtime events with subtle animations. Use `useTransition` from VueUse for smooth position number changes, Vue's `<Transition>` for visibility changes, and vue-sonner's `toast.info()` for gate assignment notifications.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vue-sonner | ^2.0.9 | Toast notifications | Already installed, shadcn-vue compatible |
| @vueuse/core | ^14.1.0 | useTransition, useDocumentVisibility | Already installed, reactive number animation |
| Vue 3 (built-in) | ^3.5.27 | `<Transition>`, `<TransitionGroup>` | Native Vue, no external dependency |
| Tailwind CSS | ^4.1.18 | Animation classes (animate-*, transition-*) | Already configured, GPU-accelerated |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-vue-next | ^0.563.0 | Icons (CheckCircle, ArrowUp, etc.) | Visual indicators in UI |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useTransition | CSS counter-animation | useTransition simpler, more control over interpolation |
| vue-sonner | native Notification API | sonner integrates with existing UI, no permission needed |
| CSS transitions | @vueuse/motion | CSS sufficient for simple transitions, no additional bundle |

**Installation:**
No additional packages needed - all required dependencies already installed.

## Architecture Patterns

### Recommended Project Structure
```
customer/app/
├── components/
│   ├── QueueStatus.vue           # Main status display with position, wait time
│   ├── PositionDisplay.vue       # Animated position number
│   ├── WaitTimeEstimate.vue      # Wait time range display
│   ├── TurnTakeover.vue          # Full-screen "Your Turn" overlay
│   └── ConnectionStatus.vue      # Existing connection indicator
├── composables/
│   ├── useRealtimeStatus.ts      # Existing - Phase 8
│   └── useWaitTimeEstimate.ts    # Calculate wait time from completed requests
└── pages/
    └── status/[id].vue           # Status page for submitted requests

staff/app/
├── components/
│   └── dashboard/
│       ├── DataTable.vue         # Existing - receives realtime updates
│       └── ShowCompletedToggle.vue # Toggle for completed/cancelled visibility
└── pages/
    └── index.vue                 # Existing - integrate realtime subscription
```

### Pattern 1: Reactive Position Display with Animation
**What:** Use `useTransition` to smoothly animate position number changes
**When to use:** Customer queue position display
**Example:**
```typescript
// Source: https://vueuse.org/core/useTransition/
import { useTransition, TransitionPresets } from '@vueuse/core'

const actualPosition = ref(5)
const displayPosition = useTransition(actualPosition, {
  duration: 500,
  transition: TransitionPresets.easeOutCubic,
})

// In template: {{ Math.round(displayPosition) }}
// When actualPosition changes from 5 to 3, displayPosition animates smoothly
```

### Pattern 2: Wait Time Rolling Average Calculation
**What:** Calculate wait time estimate from recent completion history
**When to use:** Customer wait time display
**Example:**
```typescript
// Composable: useWaitTimeEstimate.ts
export function useWaitTimeEstimate() {
  const client = useSupabaseClient()

  async function calculateEstimate(position: number): Promise<{ min: number; max: number } | null> {
    // Fetch last 10 completed pickups
    const { data } = await client
      .from('pickup_requests')
      .select('created_at, completed_at')
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(10)

    if (!data || data.length < 3) {
      return null // Not enough history
    }

    // Calculate average processing time in minutes
    const times = data.map(r => {
      const created = new Date(r.created_at).getTime()
      const completed = new Date(r.completed_at).getTime()
      return (completed - created) / 60000 // Convert to minutes
    })

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    const baseEstimate = avgTime * (position - 1) // Position 1 = next up = 0 wait

    // Return as range with ±20% buffer
    return {
      min: Math.max(0, Math.round(baseEstimate * 0.8)),
      max: Math.round(baseEstimate * 1.2)
    }
  }

  return { calculateEstimate }
}
```

### Pattern 3: Toast for Gate Assignment Changes
**What:** Show toast notification when gate assignment changes
**When to use:** Customer app when staff assigns/changes gate
**Example:**
```typescript
// Source: https://vue-sonner.vercel.app/
import { toast } from 'vue-sonner'

// In realtime subscription callback
watch(() => request.value?.assigned_gate_id, (newGate, oldGate) => {
  if (newGate && newGate !== oldGate) {
    // Fetch gate number from gates table or include in payload
    toast.info(`You've been assigned to Gate ${gateNumber}`, {
      duration: 5000, // 5 seconds
    })
  }
})
```

### Pattern 4: Full-Screen Takeover Component
**What:** Unmissable overlay when customer's turn arrives
**When to use:** Status changes to "being served" or position becomes 1 with gate
**Example:**
```vue
<!-- TurnTakeover.vue -->
<template>
  <Transition name="takeover">
    <div
      v-if="show"
      class="fixed inset-0 z-50 bg-primary flex flex-col items-center justify-center text-primary-foreground"
    >
      <div class="text-center space-y-6 p-8">
        <CheckCircle2 class="w-24 h-24 mx-auto animate-bounce" />
        <h1 class="text-4xl font-bold">It's Your Turn!</h1>
        <p class="text-2xl">Proceed to</p>
        <p class="text-6xl font-black">Gate {{ gateNumber }}</p>
        <Button
          variant="secondary"
          size="lg"
          class="mt-8"
          @click="$emit('dismiss')"
        >
          Got it
        </Button>
      </div>
    </div>
  </Transition>
</template>

<style>
.takeover-enter-active,
.takeover-leave-active {
  transition: opacity 0.3s ease;
}
.takeover-enter-from,
.takeover-leave-to {
  opacity: 0;
}
</style>
```

### Pattern 5: Row-Level Table Updates (Staff Dashboard)
**What:** Update individual rows without full table refresh
**When to use:** Staff dashboard real-time updates
**Example:**
```typescript
// In staff dashboard page
const { status, subscribe, unsubscribe } = useRealtimeQueue()

onMounted(() => {
  subscribe(() => {
    // Refresh data - TanStack Table handles row identity via key
    // No scroll position reset because we're updating data ref, not remounting
    refreshRequests()
  })
})

// The existing useAsyncData already handles this pattern
// Just need to ensure row keys are stable (use request.id)
```

### Anti-Patterns to Avoid
- **Animating every change:** Only animate significant changes (position <=3, or moving up 2+ spots)
- **Replacing entire table DOM:** Update data ref, let TanStack Table handle diffing
- **Full refresh on every event:** Use Vue reactivity, only refresh what changed
- **Blocking UI during calculation:** Calculate wait time asynchronously, show loading state
- **Sound notifications:** No audio per user decisions - visual only

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Number animation | CSS counter-increment | @vueuse/core useTransition | Handles interruption, easing, SSR-safe |
| Toast notifications | Custom popup div | vue-sonner (already installed) | Stacking, dismissal, accessibility |
| Visibility detection | window.onvisibilitychange | @vueuse/core useDocumentVisibility | Reactive, cross-browser |
| Enter/leave transitions | Manual class toggling | Vue `<Transition>` | Handles timing, lifecycle hooks |

**Key insight:** The project already has vue-sonner for toasts and @vueuse/core for animations. Don't build custom alternatives.

## Common Pitfalls

### Pitfall 1: Animating Hidden Components
**What goes wrong:** useTransition continues animating even when component is hidden
**Why it happens:** Transition ref updates regardless of visibility
**How to avoid:** Use `disabled: true` option when component not visible, or guard with `v-if`
**Warning signs:** Console shows value updates when page not visible

### Pitfall 2: Wait Time with No History
**What goes wrong:** Displaying "0 minutes" or NaN
**Why it happens:** No completed requests exist yet (start of day scenario)
**How to avoid:** Return null from calculation, hide display with `v-if="waitTime !== null"`
**Warning signs:** Division by zero, displaying negative or zero wait times

### Pitfall 3: Toast Spam on Reconnect
**What goes wrong:** Multiple toasts appear after tab switch/reconnect
**Why it happens:** Events queued or state resynced triggers watch callbacks
**How to avoid:** Track previous gate ID, only toast when different and not initial load
**Warning signs:** Multiple identical toasts appearing on tab focus

### Pitfall 4: Full-Screen Takeover Not Dismissing
**What goes wrong:** User stuck on takeover screen
**Why it happens:** No dismiss mechanism or status changes before user acts
**How to avoid:** Include dismiss button, also dismiss when status changes away from "being served"
**Warning signs:** Takeover shows but user can't proceed

### Pitfall 5: Position Shows Wrong After Reorder
**What goes wrong:** Position display shows stale value briefly
**Why it happens:** Local optimistic update conflicts with realtime update
**How to avoid:** For customer, always use server value - no optimistic updates
**Warning signs:** Position flickers between values

### Pitfall 6: TanStack Table Scroll Reset
**What goes wrong:** Table scrolls to top on every update
**Why it happens:** Table component remounts instead of updating
**How to avoid:** Use stable `:key` on DataTable, update data ref not component
**Warning signs:** Scroll position resets when any request changes

## Code Examples

Verified patterns from official sources:

### Wait Time Display Component
```vue
<!-- WaitTimeEstimate.vue -->
<template>
  <div v-if="estimate" class="text-muted-foreground">
    <span class="font-medium">Estimated wait:</span>
    <span v-if="estimate.min === estimate.max">~{{ estimate.min }} min</span>
    <span v-else>{{ estimate.min }}-{{ estimate.max }} min</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  estimate: { min: number; max: number } | null
}>()
</script>
```

### Position Display with Animation
```vue
<!-- PositionDisplay.vue -->
<template>
  <div class="text-center">
    <Transition name="position" mode="out-in">
      <div :key="position" class="space-y-2">
        <p class="text-lg text-muted-foreground">You are</p>
        <p class="text-6xl font-bold text-primary">#{{ Math.round(displayPosition) }}</p>
        <p class="text-lg text-muted-foreground">in queue</p>
        <p v-if="position === 1" class="text-primary font-medium mt-4">
          Your turn any moment
        </p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useTransition, TransitionPresets } from '@vueuse/core'

const props = defineProps<{
  position: number
}>()

const positionRef = computed(() => props.position)
const displayPosition = useTransition(positionRef, {
  duration: 400,
  transition: TransitionPresets.easeOutCubic,
})
</script>

<style>
.position-enter-active,
.position-leave-active {
  transition: all 0.3s ease;
}
.position-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.position-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
```

### Staff Dashboard Toggle for Completed/Cancelled
```vue
<!-- ShowCompletedToggle.vue -->
<template>
  <div class="flex items-center gap-2">
    <Switch
      :checked="showCompleted"
      @update:checked="$emit('update:showCompleted', $event)"
    />
    <Label class="text-sm text-muted-foreground">
      Show completed/cancelled
    </Label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showCompleted: boolean
}>()
defineEmits<{
  'update:showCompleted': [value: boolean]
}>()
</script>
```

### Integration in Staff Dashboard
```typescript
// In staff/app/pages/index.vue - add realtime subscription

import { useRealtimeQueue } from '@/composables/useRealtimeQueue'
import ConnectionStatus from '@/components/ConnectionStatus.vue'

const { status: realtimeStatus, subscribe, unsubscribe } = useRealtimeQueue()

onMounted(() => {
  subscribe(() => {
    // Refresh data on any change
    refresh()
  })
})

onUnmounted(() => {
  unsubscribe()
})

// Add to template:
// <ConnectionStatus :status="realtimeStatus" />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual DOM animation | Vue `<Transition>` | Vue 3.0 (2020) | Declarative, composable |
| setInterval for number animation | useTransition | VueUse 4.0+ | Reactive, handles interruption |
| Alert boxes for notifications | Toast libraries | 2018+ | Non-blocking, stackable |
| Polling for wait time | Calculate on-demand + cache | Current best practice | Reduces DB queries |

**Deprecated/outdated:**
- Vue 2 transition classes (v-enter renamed to v-enter-from in Vue 3)
- velocity.js for animation (useTransition is simpler for number interpolation)

## Open Questions

Things that couldn't be fully resolved:

1. **Exact threshold for "significant" position change**
   - What we know: User decided "position 3 or lower, or moving up 2+ spots"
   - What's unclear: Should we track previous position to detect 2+ spot jump?
   - Recommendation: Store previous position in component state, compare on update

2. **Wait time cache strategy**
   - What we know: Calculate from last 10 completed requests
   - What's unclear: How often to recalculate (every time position changes? periodic?)
   - Recommendation: Recalculate on position change, cache for 1 minute minimum

3. **Toggle default state for show/hide completed**
   - What we know: Toggle switch to show/hide completed/cancelled
   - What's unclear: Default checked or unchecked?
   - Recommendation: Default to hidden (unchecked) - staff usually cares about active queue

## Sources

### Primary (HIGH confidence)
- [Vue 3 Transition Documentation](https://vuejs.org/guide/built-ins/transition) - CSS classes, modes, TransitionGroup
- [VueUse useTransition](https://vueuse.org/core/useTransition/) - Number animation API, TransitionPresets
- [Vue Sonner Documentation](https://vue-sonner.vercel.app/) - Toast API, duration, positioning

### Secondary (MEDIUM confidence)
- [Wait Time Estimation Patterns](https://help.puzzel.com/knowledgebase/puzzel-contact-centre/puzzel-admin-portal/how-is-estimated-wait-time-calculated) - Rolling average methodology
- [Little's Law for Queue Estimation](https://isssp.org/finding-the-average-wait-time-littles-law/) - Theoretical foundation

### Tertiary (LOW confidence)
- Community patterns for full-screen overlays - no authoritative source, but common practice

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and verified
- Architecture: HIGH - Patterns from official Vue/VueUse documentation
- Wait time calculation: MEDIUM - Based on queueing theory, simplified for small scale
- UI patterns (takeover, toggles): MEDIUM - User decisions guide design, implementation flexible

**Research date:** 2026-01-29
**Valid until:** 2026-02-28 (30 days - Vue/VueUse stable, patterns well-established)
