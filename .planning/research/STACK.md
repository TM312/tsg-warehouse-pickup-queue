# Technology Stack: v1.1 Gate Operator Experience

**Project:** Warehouse Pickup Queue System
**Researched:** 2026-01-30
**Confidence:** HIGH (verified against existing codebase and official documentation)

## Executive Summary

**No new dependencies required.** The existing stack (Nuxt 4, Vue 3, TailwindCSS, shadcn-vue, Supabase, date-fns) fully supports all v1.1 features. The gate operator view, processing status workflow, and business hours UI can all be built with current technologies.

The only consideration was time picker components for business hours. After research, the recommendation is to use native HTML5 `<input type="time">` styled with existing Input component patterns, avoiding additional dependencies.

## Current Stack (Verified from package.json)

### Staff App (`staff/package.json`)

| Package | Version | Purpose | v1.1 Usage |
|---------|---------|---------|------------|
| nuxt | ^4.3.0 | Framework | Routing for /gate/[id], /settings/business-hours |
| vue | ^3.5.27 | UI framework | All new components |
| @nuxtjs/supabase | ^2.0.3 | Supabase integration | Data fetching, realtime |
| @supabase/supabase-js | ^2.93.2 | Supabase client | RPC calls, CRUD |
| shadcn-nuxt | ^2.4.3 | Component library | UI components |
| reka-ui | ^2.7.0 | Headless components | Base for shadcn-vue |
| @vueuse/core | ^14.1.0 | Composables | useSwipe (if needed), existing patterns |
| @vueuse/integrations | ^14.1.0 | Extended composables | useSortable (existing) |
| tailwindcss | ^4.1.18 | Styling | Mobile-first responsive |
| lucide-vue-next | ^0.563.0 | Icons | Action icons |
| vue-sonner | ^2.0.9 | Toasts | Success/error feedback |
| vee-validate | ^4.15.1 | Form validation | Business hours form |
| zod | ^3.25.76 | Schema validation | Form schemas |

### Customer App (`customer/package.json`)

| Package | Version | Purpose | v1.1 Usage |
|---------|---------|---------|------------|
| date-fns | ^4.1.0 | Date/time formatting | Business hours display |
| @date-fns/tz | ^1.4.1 | Timezone handling | Warehouse timezone logic |

**Note:** date-fns is in customer app but not staff app. Recommend installing in staff app for business hours editor.

## Recommended Stack Additions

### Staff App Only

| Package | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| date-fns | ^4.1.0 | Time formatting | Format time values for display, already proven in customer app |
| @date-fns/tz | ^1.4.1 | Timezone handling | Warehouse timezone for business hours preview |

**Installation:**
```bash
cd staff
pnpm add date-fns @date-fns/tz
```

**Why:** Business hours editor needs to format time values (`08:00:00` -> `8:00 AM`) and show "current warehouse time" preview. date-fns is already validated in customer app.

## What NOT to Add (and Why)

### Time Picker Libraries

| Library | Why NOT |
|---------|---------|
| @vuepic/vue-datepicker | Overkill for simple time input; adds 50KB+ |
| vue-timepicker | Vue 2 focused, requires adaptation |
| v-calendar | Full calendar system, unnecessary |
| @internationalized/date | Already have date-fns which is sufficient |

**Instead:** Use native HTML5 `<input type="time">` with existing Input component styling. Benefits:
- Zero additional dependencies
- Native mobile time picker UI (excellent on iOS/Android)
- Consistent with existing form patterns
- Ships time as `HH:mm` string (matches database `time` type)

Example implementation:
```vue
<template>
  <Input
    type="time"
    v-model="openTime"
    class="w-32"
  />
</template>
```

### Swipe Gesture Libraries

| Library | Why NOT |
|---------|---------|
| vue-swipe-actions | Adds complexity for minimal benefit |
| @vueuse/gesture | Gate operator doesn't need swipe actions |
| hammer.js | Overkill, large bundle |

**Instead:** Use `@vueuse/core`'s `useSwipe` (already installed) IF swipe gestures become a requirement. For v1.1, large tap buttons are more appropriate for gate operators (faster, clearer).

### Business Hours Scheduling Libraries

| Library | Why NOT |
|---------|---------|
| vue-business-hours | Vue 2 package, not maintained |
| date-holidays | Premature - holidays are v2 scope |
| @fullcalendar/vue | Calendar view not needed for weekly schedule |

**Instead:** Build a simple 7-row editor using existing form components. The `business_hours` table schema already exists with exactly what's needed.

### Additional UI Component Libraries

| Library | Why NOT |
|---------|---------|
| nuxt-ui | Would conflict with shadcn-vue patterns |
| vuetify | Different design system, heavy |
| primevue | Unnecessary given shadcn-vue coverage |

**Instead:** Continue using shadcn-vue. All needed components exist:
- Card, Button, Input, Label, Switch (gate operator view)
- Dialog, Form, Table (business hours editor)
- Alert-dialog (confirmations)

## Feature-Specific Stack Usage

### 1. Gate Operator View (`/gate/[id]`)

**Uses existing:**
- Nuxt routing (dynamic route)
- `useSupabaseClient()` for data
- `useRealtimeQueue` composable
- `useQueueActions` composable (extend for startProcessing)
- Card, Button components from shadcn-vue
- Tailwind responsive utilities

**Mobile-first implementation:**
```typescript
// Large touch targets via Tailwind
<Button class="min-h-[56px] text-lg w-full">
  Complete Pickup
</Button>

// Responsive layout
<div class="flex flex-col gap-6 p-4 md:p-8">
```

### 2. Processing Status Workflow

**Uses existing:**
- Supabase migrations (add status value)
- `useQueueActions` composable (new method)
- StatusBadge component (new variant)

**Database migration:**
```sql
-- Uses existing pattern from ARCHITECTURE.md
ALTER TABLE pickup_requests
DROP CONSTRAINT pickup_requests_status_check;

ALTER TABLE pickup_requests
ADD CONSTRAINT pickup_requests_status_check
CHECK (status IN ('pending', 'approved', 'in_queue', 'processing', 'completed', 'cancelled'));
```

### 3. Business Hours Management

**Uses existing:**
- Nuxt routing (`/settings/business-hours`)
- Form components (FormField, FormItem, etc.)
- Input component (for native time input)
- Switch component (open/closed toggle)
- Label component
- `useSupabaseClient()` for CRUD

**Add to staff app:**
- date-fns for time formatting
- @date-fns/tz for timezone preview

**Time input pattern:**
```vue
<FormField name="openTime">
  <FormItem>
    <FormLabel>Open Time</FormLabel>
    <FormControl>
      <!-- Native time input with shadcn styling -->
      <Input
        type="time"
        :model-value="formatTimeForInput(openTime)"
        @update:model-value="openTime = parseTimeFromInput($event)"
      />
    </FormControl>
  </FormItem>
</FormField>
```

**Time formatting utilities:**
```typescript
// staff/app/utils/time.ts
import { parse, format } from 'date-fns'

// Database format: '08:00:00' -> Input format: '08:00'
export function formatTimeForInput(dbTime: string): string {
  return dbTime.slice(0, 5)
}

// Input format: '08:00' -> Database format: '08:00:00'
export function parseTimeFromInput(inputTime: string): string {
  return `${inputTime}:00`
}

// Display format: '08:00:00' -> '8:00 AM'
export function formatTimeForDisplay(dbTime: string): string {
  const date = parse(dbTime, 'HH:mm:ss', new Date())
  return format(date, 'h:mm a')
}
```

## shadcn-vue Components to Add

These components may need to be added via CLI if not already present:

```bash
cd staff
npx shadcn-vue@latest add calendar  # For future holiday picker
```

**Currently installed (verified):**
- alert-dialog, badge, button, card, dialog, form, input, label, select, separator, sheet, sonner, switch, table, tabs

**May need for v1.1:**
- None required for core features
- Calendar component (optional, for future holiday management)

## Database Stack (No Changes)

Current Supabase PostgreSQL configuration supports all v1.1 features:

| Feature | Table | Existing Support |
|---------|-------|------------------|
| Processing status | pickup_requests | CHECK constraint update only |
| Gate operator data | pickup_requests, gates | Full support |
| Business hours | business_hours | Full CRUD support |

**No schema changes needed except:**
1. Migration to add 'processing' to status CHECK constraint
2. New `start_processing()` SECURITY DEFINER function

## Alternatives Considered

### Time Picker Alternatives

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Native `<input type="time">` | Zero deps, native mobile UX, simple | Limited styling control | **Selected** |
| @vuepic/vue-datepicker | Full-featured, time-only mode | 50KB+, overkill for simple use | Rejected |
| Custom Select dropdowns | Full control, consistent styling | More code, worse mobile UX | Rejected |

### Mobile Swipe Alternatives

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Large tap buttons | Clear, fast, error-proof | Less "modern" feel | **Selected** |
| Swipe actions | iOS-style UX | Discoverability issues, accidental actions | Rejected for v1.1 |
| Hold-to-confirm | Prevents accidents | Slow, unfamiliar | Rejected |

### State Management Alternatives

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Per-page data fetching | Simple, isolated | Some redundant fetches | **Selected** |
| Pinia store | Shared state, single fetch | Complexity, overkill for 2 pages | Rejected |
| Nuxt useState | Built-in, simple | Less structured than Pinia | Could work, not needed |

## Installation Summary

**Staff app only:**
```bash
cd staff
pnpm add date-fns @date-fns/tz
```

**Verification:**
```bash
pnpm ls date-fns @date-fns/tz
```

Expected output:
```
date-fns@4.1.0
@date-fns/tz@1.4.1
```

## Migration Checklist

Before development:
- [ ] Run `pnpm add date-fns @date-fns/tz` in staff directory
- [ ] Verify shadcn components installed (all should be present)
- [ ] No nuxt.config.ts changes needed
- [ ] No tailwind.config changes needed

## Sources

| Source | Type | Confidence |
|--------|------|------------|
| `staff/package.json`, `customer/package.json` | Codebase | HIGH |
| [shadcn-vue Date Picker](https://www.shadcn-vue.com/docs/components/date-picker) | Official docs | HIGH |
| [VueUse useSwipe](https://vueuse.org/core/useswipe/) | Official docs | HIGH |
| [@vuepic/vue-datepicker](https://www.npmjs.com/package/@vuepic/vue-datepicker) | npm | MEDIUM |
| [date-fns documentation](https://date-fns.org/) | Official docs | HIGH |
| Existing codebase patterns | Codebase | HIGH |
