# Architecture Patterns: v1.1 Gate Operator Experience

**Domain:** Warehouse pickup queue management system
**Researched:** 2026-01-30
**Confidence:** HIGH (based on existing codebase analysis)

## Executive Summary

The v1.1 features (gate operator view, processing status, business hours management) integrate cleanly with the existing architecture. The key insight is that these features are **additive extensions** rather than architectural changes:

1. **Gate operator view** = new route + focused UI reusing existing composables
2. **Processing status** = new status value in existing CHECK constraint + UI updates
3. **Business hours management** = CRUD UI for existing `business_hours` table

No new technologies needed. All three features follow established patterns from v1.

## Current Architecture Overview

```
+------------------+       +------------------+
|   Customer App   |       |    Staff App     |
|   (customer/)    |       |    (staff/)      |
|   - Submit form  |       |   - Dashboard    |
|   - Status page  |       |   - Gate mgmt    |
+--------+---------+       +--------+---------+
         |                          |
         |  Supabase Realtime       |
         |  (postgres_changes)      |
         +------------+-------------+
                      |
              +-------v--------+
              |   Supabase     |
              |   PostgreSQL   |
              |   - pickup_requests
              |   - gates
              |   - business_hours
              +----------------+
```

### Existing Component Inventory

**Staff App Routes:**
- `/` - Dashboard (index.vue)
- `/login` - Auth
- `/settings` - Placeholder
- `/password/update` - Password management
- `/forgot-password` - Password reset
- `/confirm` - Auth confirmation

**Staff Composables:**
- `useQueueActions` - RPC calls for queue operations
- `useRealtimeQueue` - Realtime subscription management
- `useGateManagement` - Gate CRUD operations

**Customer App Routes:**
- `/` - Submission form
- `/status/[id]` - Real-time status tracking

**Database Functions (SECURITY DEFINER):**
- `assign_to_queue(request_id, gate_id)` - Atomic queue assignment
- `reorder_queue(gate_id, request_ids)` - Bulk position update
- `set_priority(request_id)` - Priority insertion at position 2
- `move_to_gate(request_id, new_gate_id)` - Cross-gate transfer

## Integration Architecture by Feature

### 1. Gate Operator View

**Component:** New route at `/gate/[id]` within staff app

**Integration Points:**

| Existing | New Component | Relationship |
|----------|---------------|--------------|
| `useSupabaseClient()` | GateOperatorPage | Reuse for data fetching |
| `useRealtimeQueue` | GateOperatorPage | Reuse for live updates |
| `useQueueActions.completeRequest()` | CompleteButton | Reuse existing RPC |
| `gates` table | Route param validation | Query by gate ID |
| `pickup_requests` table | Queue filtering | Filter by gate_id + status |

**New Components Needed:**

```
staff/app/pages/gate/[id].vue     # Main operator page
staff/app/components/operator/
  CurrentPickup.vue               # Display current customer (position 1)
  QuickActions.vue                # Complete/Skip buttons
  UpNextList.vue                  # Next 2-3 in queue (preview)
```

**Data Flow:**
```
GateOperatorPage
  |
  +-- useAsyncData('gate-queue', ...) ---- SELECT from pickup_requests
  |                                        WHERE gate_id = :id
  |                                        AND status IN ('in_queue', 'processing')
  |
  +-- useRealtimeQueue.subscribe() ------- postgres_changes on pickup_requests
  |
  +-- useQueueActions.completeRequest() -- UPDATE status = 'completed'
```

**Mobile-First Considerations:**
- Large touch targets (min 44x44px)
- Single-column layout for position 1 customer
- Minimal scrolling - key info above fold
- No drag-drop (desktop dashboard handles reordering)

### 2. Processing Status

**Component:** Database schema change + UI updates across both apps

**Integration Points:**

| Existing | Modification | Impact |
|----------|--------------|--------|
| `pickup_requests.status` CHECK constraint | Add 'processing' value | Migration required |
| `assign_to_queue()` function | No change | Still assigns to 'in_queue' |
| `completeRequest()` in useQueueActions | Modify to allow from 'processing' | Minor update |
| Customer status page | Add 'processing' case | New UI state |
| Staff DataTable | Add 'processing' badge | StatusBadge update |

**Database Migration:**

```sql
-- Add 'processing' to status CHECK constraint
ALTER TABLE pickup_requests
DROP CONSTRAINT pickup_requests_status_check;

ALTER TABLE pickup_requests
ADD CONSTRAINT pickup_requests_status_check
CHECK (status IN ('pending', 'approved', 'in_queue', 'processing', 'completed', 'cancelled'));
```

**New Function Needed:**

```sql
-- start_processing: Moves position 1 to 'processing' status
CREATE OR REPLACE FUNCTION start_processing(p_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE pickup_requests
  SET status = 'processing'
  WHERE id = p_request_id
    AND status = 'in_queue'
    AND queue_position = 1;

  -- Note: queue_position retained during processing
  -- for potential "put back in queue" feature
END;
$$;
```

**Status Flow Change:**
```
Current v1:
pending -> approved -> in_queue -----------------> completed
                                                -> cancelled

New v1.1:
pending -> approved -> in_queue -> processing --> completed
                                              --> cancelled
```

**UI Updates Required:**

1. **StatusBadge.vue** (staff) - Add 'processing' variant (yellow/amber)
2. **Customer status/[id].vue** - Add 'processing' case in statusDisplay computed
3. **GateQueueList.vue** - Distinguish position 1 if processing
4. **New GateOperatorPage** - "Start Processing" action button

### 3. Business Hours Management

**Component:** New settings sub-page or section for staff

**Integration Points:**

| Existing | New Component | Relationship |
|----------|---------------|--------------|
| `business_hours` table | BusinessHoursForm | Direct CRUD |
| Seed data (7 rows) | Initial state | One row per day exists |
| `/api/business-hours.get.ts` | No change | Reads same table |
| RLS policies | Already permit staff UPDATE | No migration needed |

**Architecture Decision: Settings Page vs Modal**

Recommendation: **Dedicated settings section** at `/settings/business-hours`

Rationale:
- Complex enough to warrant its own page (7 days + holidays)
- Separates from operational dashboard
- Room for future holiday/override features
- Pattern: `/settings` already exists as placeholder

**New Components Needed:**

```
staff/app/pages/settings/business-hours.vue  # Main page
staff/app/components/settings/
  WeeklyScheduleEditor.vue                   # Grid of 7 days
  DayHoursRow.vue                            # Single day editor
  HolidayManager.vue                         # Future: closures
```

**Data Model Considerations:**

Current `business_hours` table handles weekly schedule. For future holiday support:

```sql
-- Future: scheduled closures (not in v1.1 scope)
CREATE TABLE scheduled_closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  closure_date date NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**For v1.1, weekly schedule editing is sufficient.**

**CRUD Operations:**

```typescript
// No new composable needed - direct client operations
const client = useSupabaseClient()

// Update a day's hours
await client
  .from('business_hours')
  .update({ open_time: '08:00:00', close_time: '17:00:00', is_closed: false })
  .eq('day_of_week', dayIndex)

// Mark day as closed
await client
  .from('business_hours')
  .update({ is_closed: true })
  .eq('day_of_week', dayIndex)
```

## Component Boundaries

### New Components by Feature

| Feature | New Route | New Components | Modified Components |
|---------|-----------|----------------|---------------------|
| Gate Operator | `/gate/[id]` | GateOperatorPage, CurrentPickup, QuickActions | - |
| Processing Status | - | - | StatusBadge, customer status page, useQueueActions |
| Business Hours | `/settings/business-hours` | WeeklyScheduleEditor, DayHoursRow | settings/index.vue (add navigation) |

### Component Communication

```
GateOperatorPage
  |-- CurrentPickup (receives current customer prop)
  |     |-- QuickActions (emits complete/skip events)
  |-- UpNextList (receives queue preview array prop)

WeeklyScheduleEditor
  |-- DayHoursRow x7 (receives day config, emits update)
```

## Data Flow Changes

### Realtime Channel Strategy

**Current:** Single channel `pickup-requests-staff` watches all changes

**Recommendation:** Keep single channel for v1.1

The gate operator view filters client-side by gate_id. This is acceptable because:
1. Volume is low (50-100 requests/day)
2. Gate operators benefit from seeing other gates' activity (awareness)
3. Adding per-gate channels adds complexity without meaningful benefit

For high-volume scenarios (1000+ requests/day), consider filtered subscriptions:
```typescript
// Future optimization if needed
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'pickup_requests',
  filter: `assigned_gate_id=eq.${gateId}`
}, callback)
```

### State Synchronization

Gate operator view shares data with main dashboard. Two approaches:

**Option A: Independent Data Fetching (Recommended)**
- Each page fetches its own data
- Realtime events trigger refresh()
- Simple, isolated, works if operator opens directly

**Option B: Shared Store**
- Pinia store holding requests
- Both pages read from store
- More complex, unnecessary for v1.1

## Suggested Build Order

Based on dependencies and integration complexity:

### Phase 1: Processing Status (Foundation)
1. Database migration (add 'processing' to CHECK constraint)
2. Create `start_processing()` database function
3. Update `useQueueActions` with startProcessing method
4. Update StatusBadge component
5. Update customer status page

**Rationale:** Processing status is required by gate operator view. Build foundation first.

### Phase 2: Gate Operator View
1. Create `/gate/[id]` route with basic layout
2. Implement CurrentPickup component
3. Implement QuickActions with start processing + complete
4. Add realtime subscription
5. Mobile optimization pass

**Rationale:** Depends on processing status. Core v1.1 feature.

### Phase 3: Business Hours Management
1. Create `/settings/business-hours` route
2. Implement WeeklyScheduleEditor component
3. Implement DayHoursRow with time pickers
4. Add navigation from settings page
5. Test with customer app business hours check

**Rationale:** Independent feature, can be built in parallel or after. Lower urgency than operator view.

## Anti-Patterns to Avoid

### 1. Over-Engineering Realtime

**Don't:** Create per-gate channels or per-operator channels
**Do:** Reuse existing channel with client-side filtering

### 2. Duplicating Queue Logic

**Don't:** Add new database functions that replicate existing logic
**Do:** Extend existing functions (e.g., completeRequest already works)

### 3. Breaking Status Flow

**Don't:** Allow arbitrary status transitions
**Do:** Enforce valid transitions in database functions

Valid transitions for 'processing':
```
in_queue (position 1) -> processing  (start_processing function)
processing -> completed              (completeRequest update)
processing -> cancelled              (cancelRequest update)
processing -> in_queue               (future: "put back" feature)
```

### 4. Mixing Concerns in Operator View

**Don't:** Add queue reordering to operator view
**Do:** Keep operator view focused on single-customer flow

Operator view is for:
- Seeing who's up
- Starting processing
- Completing pickup

Supervisor dashboard is for:
- Queue reordering
- Priority management
- Multi-gate overview

## Technology Decisions

### No New Dependencies Required

All v1.1 features can be built with existing stack:
- Nuxt 4 / Vue 3 (routing, components)
- shadcn-vue (form components, buttons, cards)
- Supabase client (data operations, realtime)
- date-fns (time formatting in business hours)

### shadcn-vue Components for New Features

| Component | Used For |
|-----------|----------|
| Card | Operator current pickup display |
| Button | Quick actions |
| Input | Time inputs for business hours |
| Switch | Open/closed toggle per day |
| Label | Form labels |
| Select | Potentially for time dropdowns |

All already installed in staff app.

## Sources

- Codebase analysis: `/Users/thomas/Projects/tsg/warehouse-pickup-queue/`
- Existing migrations in `supabase/migrations/`
- Existing composables in `staff/app/composables/`
- shadcn-vue documentation (via existing component implementations)
