# Phase 11: Processing Status Foundation - Research

**Researched:** 2026-01-30
**Domain:** Database schema migration, Vue component patterns, status state machine
**Confidence:** HIGH

## Summary

Phase 11 adds a "processing" status to the pickup request lifecycle, sitting between "in_queue" and "completed". This enables explicit acceptance of pickups by gate operators. The implementation requires:

1. **Database schema changes** - Adding 'processing' to the status CHECK constraint and a new `processing_started_at` timestamp column
2. **StatusBadge component update** - Adding yellow/amber styling with spinning loader and live duration display
3. **Database functions** - New `start_processing` function for atomic status transition
4. **Dashboard integration** - New "Now Processing" section showing active processing per gate

The project uses Nuxt 4, Vue 3 with shadcn-vue components, Supabase (PostgreSQL), and TailwindCSS 4. The existing codebase follows established patterns for queue management with atomic database functions.

**Primary recommendation:** Extend the existing CHECK constraint pattern (drop and recreate), add `processing_started_at` column, create atomic `start_processing` and `revert_to_queue` database functions, and update StatusBadge with VueUse `useIntervalFn` for live duration display.

## Standard Stack

The phase uses the existing project stack with no new libraries required.

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @vueuse/core | ^14.1.0 | Vue composition utilities | `useIntervalFn` for live timer updates |
| lucide-vue-next | ^0.563.0 | Icons | `Loader2` icon with `animate-spin` class |
| class-variance-authority | ^0.7.1 | Variant styling | Existing badge variant pattern |
| tailwindcss | ^4.1.18 | CSS utility framework | Amber color classes for processing |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vue-sonner | ^2.0.9 | Toast notifications | User feedback on status changes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| VueUse useIntervalFn | Native setInterval | VueUse handles cleanup and pause/resume automatically |
| CHECK constraint | ENUM type | CHECK is already used in project; easier to evolve without table locks |

**Installation:**
No new dependencies required - all needed libraries are already installed.

## Architecture Patterns

### Existing Project Structure (Relevant Files)
```
supabase/
├── migrations/              # Ordered SQL migrations
│   └── YYYYMMDDHHMMSS_*.sql
staff/
├── app/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── StatusBadge.vue    # Update for processing
│   │   │   └── columns.ts         # PickupRequest type update
│   │   └── ui/badge/              # Base badge component
│   ├── composables/
│   │   └── useQueueActions.ts     # Add startProcessing, revertToQueue
│   └── pages/
│       └── index.vue              # Add "Now Processing" section
customer/
└── app/
    └── pages/status/[id].vue      # Handle processing status display
```

### Pattern 1: Status Badge with Duration Display
**What:** Badge that shows status + live elapsed time since processing started
**When to use:** When displaying "Processing (5m)" style status
**Example:**
```typescript
// Composable for elapsed time formatting
import { useIntervalFn } from '@vueuse/core'

function useElapsedTime(startTimestamp: Ref<string | null>) {
  const elapsed = ref('')

  const { pause, resume } = useIntervalFn(() => {
    if (!startTimestamp.value) {
      elapsed.value = ''
      return
    }
    const start = new Date(startTimestamp.value).getTime()
    const now = Date.now()
    const minutes = Math.floor((now - start) / 60000)

    if (minutes < 60) {
      elapsed.value = `${minutes}m`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      elapsed.value = `${hours}h ${mins}m`
    }
  }, 60000, { immediate: true, immediateCallback: true })

  return { elapsed, pause, resume }
}
```

### Pattern 2: Atomic Database Function for Status Transition
**What:** PostgreSQL function that atomically transitions status and sets timestamp
**When to use:** Any status change that needs to be atomic
**Example:**
```sql
-- Source: Existing project pattern from assign_to_queue function
CREATE OR REPLACE FUNCTION start_processing(p_request_id uuid, p_gate_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_started_at timestamptz;
BEGIN
    -- Verify gate doesn't already have a processing request
    IF EXISTS (
        SELECT 1 FROM pickup_requests
        WHERE assigned_gate_id = p_gate_id
          AND status = 'processing'
    ) THEN
        RAISE EXCEPTION 'Gate already has a processing request';
    END IF;

    -- Atomically update status and set timestamp
    UPDATE pickup_requests
    SET status = 'processing',
        processing_started_at = now()
    WHERE id = p_request_id
      AND status = 'in_queue'
      AND assigned_gate_id = p_gate_id
      AND queue_position = 1  -- Only position 1 can start processing
    RETURNING processing_started_at INTO v_started_at;

    IF v_started_at IS NULL THEN
        RAISE EXCEPTION 'Cannot start processing: request not at position 1 or wrong status';
    END IF;

    RETURN v_started_at;
END;
$$;
```

### Pattern 3: Status State Machine (Updated)
**What:** Valid status transitions for pickup requests
**When to use:** All status change operations

```
Current v1 State Machine:
pending -> approved -> in_queue -> completed
                    └-> cancelled

Updated v1.1 State Machine (with processing):
pending -> approved -> in_queue -> processing -> completed
                    └-> cancelled  ↑         ↓
                                   └─────────┘ (revert_to_queue)
```

### Anti-Patterns to Avoid
- **Direct UPDATE without function:** Status transitions should use atomic functions to prevent race conditions
- **Storing duration instead of timestamp:** Store `processing_started_at` and compute duration client-side
- **Multiple processing per gate:** Database must enforce one processing request per gate constraint

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Interval cleanup | Manual setInterval/clearInterval | VueUse `useIntervalFn` | Automatic cleanup on unmount, pause/resume |
| Duration formatting | Custom time logic | Simple Math.floor division | Under 24 hours, minutes-only format is simple enough |
| Spinner animation | Custom CSS animation | Tailwind `animate-spin` class | Already used throughout project |
| Status colors | Custom color logic | CVA badge variants | Existing pattern in project |

**Key insight:** The project already has established patterns for loading states, badges, and database functions. Follow existing patterns rather than introducing new ones.

## Common Pitfalls

### Pitfall 1: Forgetting to Update CHECK Constraint
**What goes wrong:** New 'processing' status causes INSERT/UPDATE failures
**Why it happens:** CHECK constraint validation runs before RLS policies
**How to avoid:** Migration must drop and recreate the CHECK constraint with new value
**Warning signs:** "new row violates check constraint" errors

### Pitfall 2: Race Condition on Start Processing
**What goes wrong:** Two operators click "Start Processing" simultaneously
**Why it happens:** Client-side validation isn't atomic
**How to avoid:** Use database function with constraint checking inside transaction
**Warning signs:** Two requests showing as processing on same gate

### Pitfall 3: Memory Leak from Interval Timer
**What goes wrong:** Timer continues running after component unmounts
**Why it happens:** Manual setInterval without proper cleanup
**How to avoid:** Use VueUse `useIntervalFn` which handles cleanup automatically
**Warning signs:** Console errors about updating unmounted component

### Pitfall 4: Stale Duration Display After Tab Switch
**What goes wrong:** Duration shows old value after returning to tab
**Why it happens:** Interval continues but DOM isn't updated while hidden
**How to avoid:** Use `immediateCallback: true` and VueUse's visibility handling
**Warning signs:** Duration "jumps" when tab becomes visible

### Pitfall 5: Processing Requests Breaking Queue Position Constraint
**What goes wrong:** Queue position uniqueness constraint fails
**Why it happens:** Processing requests still have queue_position set
**How to avoid:** Keep queue_position during processing (for revert), ensure constraint only applies to in_queue
**Warning signs:** Unique constraint violation errors

## Code Examples

### StatusBadge Update with Processing Status
```vue
<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-vue-next'
import { computed } from 'vue'
import { useIntervalFn } from '@vueuse/core'

const props = defineProps<{
  status: 'pending' | 'approved' | 'in_queue' | 'processing' | 'completed' | 'cancelled'
  processingStartedAt?: string | null
}>()

// Elapsed time calculation for processing status
const elapsed = ref('')
const { pause, resume } = useIntervalFn(() => {
  if (props.status !== 'processing' || !props.processingStartedAt) {
    elapsed.value = ''
    return
  }
  const start = new Date(props.processingStartedAt).getTime()
  const minutes = Math.floor((Date.now() - start) / 60000)

  if (minutes < 60) {
    elapsed.value = `${minutes}m`
  } else {
    elapsed.value = `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  }
}, 60000, { immediate: true, immediateCallback: true })

// Pause timer when not processing
watch(() => props.status, (status) => {
  if (status === 'processing') resume()
  else pause()
}, { immediate: true })

const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'default',
  approved: 'default',
  in_queue: 'default',
  processing: 'default',  // Yellow via custom class
  completed: 'secondary',
  cancelled: 'outline',
}

const labelMap: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  in_queue: 'In Queue',
  processing: 'Processing',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const customClass = computed(() => {
  if (props.status === 'pending') {
    return 'bg-blue-500 hover:bg-blue-600 text-white'
  }
  if (props.status === 'processing') {
    return 'bg-amber-500 hover:bg-amber-600 text-white'
  }
  return ''
})

const displayLabel = computed(() => {
  if (props.status === 'processing' && elapsed.value) {
    return `Processing (${elapsed.value})`
  }
  return labelMap[props.status]
})
</script>

<template>
  <Badge :variant="variantMap[status]" :class="customClass">
    <Loader2 v-if="status === 'processing'" class="h-3 w-3 animate-spin" />
    {{ displayLabel }}
  </Badge>
</template>
```

### Database Migration for Processing Status
```sql
-- Migration: YYYYMMDDHHMMSS_add_processing_status.sql

-- Step 1: Add processing_started_at column
ALTER TABLE pickup_requests
ADD COLUMN processing_started_at timestamptz;

COMMENT ON COLUMN pickup_requests.processing_started_at
IS 'Timestamp when pickup entered processing state';

-- Step 2: Update status CHECK constraint to include processing
-- Must drop and recreate since CHECK constraints can't be modified in-place
ALTER TABLE pickup_requests
DROP CONSTRAINT pickup_requests_status_check;

ALTER TABLE pickup_requests
ADD CONSTRAINT pickup_requests_status_check
CHECK (status IN ('pending', 'approved', 'in_queue', 'processing', 'completed', 'cancelled'));

-- Step 3: Update partial index to include processing in queue management
-- Processing requests retain queue_position for potential revert
DROP INDEX IF EXISTS idx_queue_position_in_queue;
CREATE UNIQUE INDEX idx_queue_position_in_queue
    ON pickup_requests (assigned_gate_id, queue_position)
    WHERE status IN ('in_queue', 'processing');

-- Step 4: Create index for processing timestamp queries
CREATE INDEX idx_pickup_requests_processing_started
    ON pickup_requests (processing_started_at)
    WHERE status = 'processing';
```

### Revert to Queue Function (Preserves Position)
```sql
CREATE OR REPLACE FUNCTION revert_to_queue(p_request_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_position integer;
BEGIN
    -- Revert processing back to in_queue, keeping original position
    UPDATE pickup_requests
    SET status = 'in_queue',
        processing_started_at = NULL
    WHERE id = p_request_id
      AND status = 'processing'
    RETURNING queue_position INTO v_position;

    IF v_position IS NULL THEN
        RAISE EXCEPTION 'Request is not in processing status';
    END IF;

    RETURN v_position;
END;
$$;

GRANT EXECUTE ON FUNCTION revert_to_queue(uuid) TO authenticated;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Direct status UPDATE | Atomic database functions | v1 (this project) | Prevents race conditions |
| Native setInterval | VueUse useIntervalFn | VueUse 4.0+ | Automatic cleanup, pause/resume |
| Manual CSS animations | Tailwind animate-* utilities | Tailwind 3.0+ | Consistent, performant |

**Deprecated/outdated:**
- None for this phase - all patterns are current

## Open Questions

1. **Warning Color Threshold**
   - What we know: User wants option for color change if processing takes too long
   - What's unclear: Exact threshold (15 min? 30 min?)
   - Recommendation: Implement as Claude's discretion - suggest 15 minutes, use red-orange tint

2. **Position 1 Enforcement**
   - What we know: Only position 1 should be able to start processing
   - What's unclear: Should this be enforced in database or UI only?
   - Recommendation: Enforce in database function (already shown in example) - UI can hide button for non-position-1

## Sources

### Primary (HIGH confidence)
- Existing codebase files:
  - `/supabase/migrations/20260128000002_create_pickup_requests_table.sql` - Current schema
  - `/staff/app/components/dashboard/StatusBadge.vue` - Current badge implementation
  - `/staff/app/composables/useQueueActions.ts` - Current action patterns
  - `/supabase/migrations/20260129000000_add_queue_functions.sql` - Database function patterns
- VueUse official docs: https://vueuse.org/shared/useintervalfn/

### Secondary (MEDIUM confidence)
- PostgreSQL ALTER TABLE docs: https://www.postgresql.org/docs/current/sql-altertable.html
- Tailwind CSS color utilities (amber-500, amber-600 classes)

### Tertiary (LOW confidence)
- None - all findings verified with official sources or existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, no new deps
- Architecture: HIGH - Following existing project patterns exactly
- Pitfalls: HIGH - Based on actual constraints in codebase

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (30 days - stable domain, no fast-moving deps)
