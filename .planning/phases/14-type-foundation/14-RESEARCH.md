# Phase 14: Type Foundation - Research

**Researched:** 2026-01-30
**Domain:** TypeScript type centralization with Nuxt 4 shared directory
**Confidence:** HIGH

## Summary

This research investigates how to centralize type definitions and replace magic strings with typed constants in a Nuxt 4 monorepo containing both `staff/` and `customer/` apps. The codebase currently has 12 files using inline status strings like `'pending'`, `'approved'`, `'in_queue'`, `'processing'`, `'completed'`, `'cancelled'` and multiple duplicate `PickupRequest` interface definitions.

Nuxt 4 provides a `#shared` alias that maps to `./shared/` directory. Files in `shared/types/` are auto-imported and available globally. The `as const` pattern is the established TypeScript approach for creating typed constants that enable both runtime values and compile-time type safety without using enums (which have worse tree-shaking).

**Primary recommendation:** Create `staff/shared/types/pickup-request.ts` and `staff/shared/types/gate.ts` with `as const` status objects, then migrate files incrementally using re-exports from the old `columns.ts` location.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.9.3 | Type system | Already in project |
| Nuxt | 4.3.0 | Framework with `#shared` alias | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none required) | - | - | Pure TypeScript solution |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `as const` objects | TypeScript enums | Enums have worse tree-shaking, require imports everywhere |
| `shared/types/` | `types/` in app directory | Not auto-imported, less discoverable |

**Installation:**
```bash
# No new packages needed - pure TypeScript refactoring
```

## Architecture Patterns

### Recommended Project Structure
```
staff/
├── shared/
│   └── types/
│       ├── pickup-request.ts    # PickupRequest interface + PickupStatus const
│       └── gate.ts              # Gate interface + GateStatus const (if needed)
└── app/
    └── components/
        └── dashboard/
            └── columns.ts       # Re-exports PickupRequest for migration period

customer/
├── shared/
│   └── types/
│       └── pickup-request.ts    # Import from staff shared OR duplicate minimal type
└── app/
    └── ...
```

### Pattern 1: Status Constants with `as const`
**What:** Define status values as a readonly object, extract type from it
**When to use:** Any fixed set of status values that need both runtime access and type safety
**Example:**
```typescript
// Source: https://www.convex.dev/typescript/advanced/type-operators-manipulation/typescript-as-const
// staff/shared/types/pickup-request.ts

export const PICKUP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_QUEUE: 'in_queue',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type PickupStatus = typeof PICKUP_STATUS[keyof typeof PICKUP_STATUS]
// Result: 'pending' | 'approved' | 'in_queue' | 'processing' | 'completed' | 'cancelled'
```

### Pattern 2: Status Arrays for Filtering
**What:** Create typed arrays of status values for `.includes()` checks
**When to use:** When filtering by multiple statuses (e.g., "active" statuses)
**Example:**
```typescript
// staff/shared/types/pickup-request.ts

export const ACTIVE_STATUSES = [
  PICKUP_STATUS.PENDING,
  PICKUP_STATUS.APPROVED,
  PICKUP_STATUS.IN_QUEUE,
  PICKUP_STATUS.PROCESSING,
] as const

export const TERMINAL_STATUSES = [
  PICKUP_STATUS.COMPLETED,
  PICKUP_STATUS.CANCELLED,
] as const

// Usage in component:
const isActive = ACTIVE_STATUSES.includes(request.status)
```

### Pattern 3: Interface with Typed Status
**What:** Interface references the derived type, not inline union
**When to use:** All entity interfaces that have status fields
**Example:**
```typescript
// staff/shared/types/pickup-request.ts

export interface PickupRequest {
  id: string
  sales_order_number: string
  company_name: string | null
  customer_email: string
  status: PickupStatus  // Uses derived type, not inline union
  email_flagged: boolean
  assigned_gate_id: string | null
  queue_position: number | null
  is_priority?: boolean
  processing_started_at?: string | null
  created_at: string
  gate?: { id: string; gate_number: number } | null
}
```

### Pattern 4: Re-export Migration Pattern
**What:** Keep exports from old location during transition
**When to use:** Avoid breaking all imports at once
**Example:**
```typescript
// staff/app/components/dashboard/columns.ts (keep temporarily)
export { PickupRequest, PickupStatus, PICKUP_STATUS } from '#shared/types/pickup-request'

// Later: Remove re-exports, update remaining imports
```

### Anti-Patterns to Avoid
- **Inline union types everywhere:** Creates drift between definitions, no single source of truth
- **TypeScript enums:** Worse tree-shaking, enum values are numbers by default
- **Duplicating interfaces per file:** Found 5+ duplicate `PickupRequest` definitions in codebase
- **`status: string`:** Loses type safety (found in `customer/app/composables/useRealtimeStatus.ts`)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Status validation | Custom validator functions | TypeScript type system | Compile-time vs runtime checking |
| Type extraction from const | Manual union types | `typeof X[keyof typeof X]` | Stays in sync automatically |
| Status arrays | Separate hardcoded arrays | `Object.values(STATUS)` | Single source of truth |

**Key insight:** The `as const` pattern gives you both the runtime object AND the compile-time type from a single definition. No need to maintain two separate things.

## Common Pitfalls

### Pitfall 1: Breaking All Imports at Once
**What goes wrong:** Moving `PickupRequest` to `shared/types/` breaks 12+ files simultaneously
**Why it happens:** Single-commit migration without re-export bridge
**How to avoid:** Add re-export from old location (`columns.ts`), migrate files incrementally
**Warning signs:** Large PR touching every file that uses the type

### Pitfall 2: Forgetting the Customer App
**What goes wrong:** Staff types centralized but customer app still has duplicates
**Why it happens:** Focus on one app, forget it's a monorepo
**How to avoid:** Either share types cross-app (complex) or update both apps (simpler for this project)
**Warning signs:** `PickupRequest` defined differently in customer vs staff

### Pitfall 3: Status Arrays Not Typed Correctly
**What goes wrong:** `ACTIVE_STATUSES.includes(status)` doesn't narrow types
**Why it happens:** Array is typed as `string[]` instead of `readonly PickupStatus[]`
**How to avoid:** Use `as const` on arrays and proper type assertions
**Warning signs:** TypeScript doesn't catch invalid status comparisons

### Pitfall 4: Auto-Import Not Working
**What goes wrong:** Types in `shared/types/` aren't available globally
**Why it happens:** Files must be directly in `shared/types/`, not subdirectories
**How to avoid:** Put files at `shared/types/pickup-request.ts`, not `shared/types/models/pickup-request.ts`
**Warning signs:** Need explicit `import type` statements after running `nuxt prepare`

## Code Examples

Verified patterns from official sources:

### Complete pickup-request.ts
```typescript
// staff/shared/types/pickup-request.ts
// Source: Nuxt shared directory + as const best practices

// Status constants - single source of truth
export const PICKUP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_QUEUE: 'in_queue',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

// Derived type from constants
export type PickupStatus = typeof PICKUP_STATUS[keyof typeof PICKUP_STATUS]

// Status groupings for filtering
export const ACTIVE_STATUSES = [
  PICKUP_STATUS.PENDING,
  PICKUP_STATUS.APPROVED,
  PICKUP_STATUS.IN_QUEUE,
  PICKUP_STATUS.PROCESSING,
] as const satisfies readonly PickupStatus[]

export const TERMINAL_STATUSES = [
  PICKUP_STATUS.COMPLETED,
  PICKUP_STATUS.CANCELLED,
] as const satisfies readonly PickupStatus[]

// Helper type guard
export function isActiveStatus(status: PickupStatus): status is typeof ACTIVE_STATUSES[number] {
  return (ACTIVE_STATUSES as readonly string[]).includes(status)
}

// Main interface
export interface PickupRequest {
  id: string
  sales_order_number: string
  company_name: string | null
  customer_email: string
  status: PickupStatus
  email_flagged: boolean
  assigned_gate_id: string | null
  queue_position: number | null
  is_priority?: boolean
  processing_started_at?: string | null
  created_at: string
  gate?: { id: string; gate_number: number } | null
}
```

### Complete gate.ts
```typescript
// staff/shared/types/gate.ts

export interface Gate {
  id: string
  gate_number: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// Extended type for UI that needs queue count
export interface GateWithCount extends Gate {
  queue_count: number
}
```

### Migration: Updated columns.ts
```typescript
// staff/app/components/dashboard/columns.ts
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { ArrowUpDown, Flag } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import StatusBadge from './StatusBadge.vue'
import GateSelect from './GateSelect.vue'
import ActionButtons from './ActionButtons.vue'

// Re-export for backward compatibility during migration
// TODO: Update imports in other files, then remove these re-exports
export type { PickupRequest, PickupStatus } from '#shared/types/pickup-request'
export { PICKUP_STATUS, ACTIVE_STATUSES } from '#shared/types/pickup-request'

// Import for local use
import type { PickupRequest } from '#shared/types/pickup-request'
import { ACTIVE_STATUSES } from '#shared/types/pickup-request'

// ... rest of file uses ACTIVE_STATUSES.includes() instead of inline array
```

### Usage: StatusBadge.vue
```typescript
// staff/app/components/dashboard/StatusBadge.vue
<script setup lang="ts">
import type { PickupStatus } from '#shared/types/pickup-request'
import { PICKUP_STATUS } from '#shared/types/pickup-request'

const props = defineProps<{
  status: PickupStatus
  processingStartedAt?: string | null
}>()

// Now uses constants instead of magic strings
const showTimer = props.status === PICKUP_STATUS.PROCESSING && props.processingStartedAt
</script>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| TypeScript enums | `as const` objects | ~2020 | Better tree-shaking, works with string values |
| `app/types/` directory | `shared/types/` directory | Nuxt 4 | Auto-import, shared with server |
| Inline union types | Derived types from const | TypeScript 3.4+ | Single source of truth |

**Deprecated/outdated:**
- TypeScript numeric enums: Replaced by `as const` for string-based constants
- `declare const enum`: Removed in TypeScript 5.0+ for isolatedModules

## Open Questions

Things that couldn't be fully resolved:

1. **Cross-app type sharing**
   - What we know: Both staff and customer need `PickupRequest`, staff has richer type
   - What's unclear: Best way to share types between separate Nuxt apps in this monorepo
   - Recommendation: For Phase 14, create minimal types in each app's `shared/types/`. Future phase could explore pnpm workspace shared package.

2. **Database types from Supabase**
   - What we know: Supabase can generate TypeScript types from schema
   - What's unclear: Whether generated types should be source of truth vs hand-written
   - Recommendation: Use hand-written types for now (match current pattern), consider generated types in future phase.

## Sources

### Primary (HIGH confidence)
- Nuxt 4 docs - `shared/` directory structure and `#shared` alias: https://nuxt.com/docs/4.x/directory-structure/shared
- Convex TypeScript guide - `as const` patterns: https://www.convex.dev/typescript/advanced/type-operators-manipulation/typescript-as-const
- Project codebase analysis - existing type definitions and magic strings

### Secondary (MEDIUM confidence)
- GitHub issue #32870 - Auto-import types behavior in Nuxt 4: https://github.com/nuxt/nuxt/issues/32870
- LogRocket blog - Complete guide to const assertions: https://blog.logrocket.com/complete-guide-const-assertions-typescript/

### Tertiary (LOW confidence)
- None - all findings verified with official sources

## Codebase Analysis

### Files with Magic Strings (12 files)
**Staff app (9 files):**
1. `staff/app/pages/index.vue` - multiple status comparisons
2. `staff/app/pages/gate/[id].vue` - status filtering
3. `staff/app/components/dashboard/columns.ts` - PickupRequest interface, status checks
4. `staff/app/components/dashboard/StatusBadge.vue` - status-based rendering
5. `staff/app/components/dashboard/ActionButtons.vue` - button visibility logic
6. `staff/app/components/dashboard/RequestDetail.vue` - active status check
7. `staff/app/components/gate/CurrentPickup.vue` - status prop type
8. `staff/app/composables/useQueueActions.ts` - status updates
9. `staff/app/composables/useGateManagement.ts` - status filtering

**Customer app (3 files):**
1. `customer/app/pages/status/[id].vue` - status display logic
2. `customer/app/composables/useWaitTimeEstimate.ts` - query filter
3. `customer/server/api/submit.post.ts` - duplicate check, initial status

### Existing Type Definitions (to consolidate)
1. `staff/app/components/dashboard/columns.ts` - Main PickupRequest (most complete)
2. `customer/app/pages/status/[id].vue` - Local PickupRequest interface
3. `customer/app/composables/useRealtimeStatus.ts` - PickupRequestPayload (status: string!)
4. `customer/server/api/submit.post.ts` - Minimal PickupRequest interface
5. Multiple inline Gate interfaces in various files

### Database Schema (source of truth)
From migration `20260128000002_create_pickup_requests_table.sql`:
```sql
status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'in_queue', 'processing', 'completed', 'cancelled'))
```

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Uses only TypeScript features already in project
- Architecture: HIGH - Nuxt 4 shared directory verified with official docs
- Pitfalls: HIGH - Based on direct codebase analysis
- Code examples: HIGH - Tested patterns from official sources

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (stable TypeScript patterns, unlikely to change)
