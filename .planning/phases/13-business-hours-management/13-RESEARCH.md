# Phase 13: Business Hours Management - Research

**Researched:** 2026-01-30
**Domain:** Business hours configuration UI, date/time pickers, Supabase CRUD
**Confidence:** HIGH

## Summary

This phase implements a supervisor-facing settings page for configuring warehouse business hours. The existing database schema (`business_hours` table) already supports weekly schedules with open/close times and closed days. The phase requires extending the schema to add holiday/closure scheduling and manual override capabilities, then building the staff app UI for managing these settings.

The project already uses shadcn-vue (built on reka-ui) for UI components, with established patterns for forms (vee-validate + zod), toggles (Switch component), and data management (Supabase client composables). The customer app already has a working business hours API endpoint that checks the current schedule, which will need to be extended to support closures and overrides.

**Primary recommendation:** Use native HTML time inputs styled with shadcn Input for time selection (simplest approach), shadcn-vue RangeCalendar for date range closure scheduling, and the existing Switch component for override toggles. Create two new database tables: `business_closures` for holidays and `business_settings` for manual override state.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn-vue | ^2.4.3 | UI components | Already installed, provides Switch, Input, Card, Button |
| reka-ui | ^2.7.0 | Headless primitives | Already installed, provides Calendar, RangeCalendar |
| @internationalized/date | (peer dep) | Date handling | Required by reka-ui calendar components |
| vee-validate | ^4.15.1 | Form validation | Already used in project forms |
| zod | ^3.25.76 | Schema validation | Already used for form schemas |
| date-fns | ^4.1.0 | Date formatting | Already in customer app, add to staff app |
| @date-fns/tz | ^1.4.1 | Timezone handling | Already in customer app, needed for staff preview |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-vue-next | ^0.563.0 | Icons | Already installed, use Calendar, Clock icons |
| vue-sonner | ^2.0.9 | Toast notifications | Already installed, use for save confirmations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native time input | reka-ui TimeField | TimeField more customizable but requires more setup, native input sufficient for hour/minute selection |
| RangeCalendar | Date picker x2 | Range calendar better UX for selecting closure periods |
| Full time picker component | Native `<input type="time">` | Native input is simpler, works well for business hours use case |

**Installation:**
```bash
# In staff/ directory
pnpm add date-fns @date-fns/tz @internationalized/date

# Add shadcn-vue components if not present
pnpm dlx shadcn-vue@latest add popover calendar range-calendar
```

## Architecture Patterns

### Recommended Project Structure
```
staff/app/
├── pages/
│   └── settings/
│       └── business-hours.vue     # Main settings page
├── components/
│   └── business-hours/
│       ├── WeeklyScheduleEditor.vue   # 7-day schedule editor
│       ├── DayScheduleRow.vue         # Single day row component
│       ├── ClosureScheduler.vue       # Holiday/closure management
│       ├── ManualOverrideToggle.vue   # Override switch at top
│       └── HoursPreview.vue           # Shows current effective hours
└── composables/
    └── useBusinessHours.ts        # CRUD operations for business hours
```

### Pattern 1: Settings Page Layout
**What:** Single page with sections for override, weekly schedule, and closures
**When to use:** All business hours configuration
**Example:**
```vue
<script setup lang="ts">
// Source: Project patterns from staff/app/pages/settings.vue
definePageMeta({ middleware: 'auth' })
const { weeklySchedule, closures, override, save, loading } = useBusinessHoursSettings()
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-bold mb-6">Business Hours</h1>

    <!-- Manual Override at top -->
    <ManualOverrideToggle v-model="override" class="mb-6" />

    <!-- Weekly Schedule -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <CardDescription>Set your regular business hours</CardDescription>
      </CardHeader>
      <CardContent>
        <WeeklyScheduleEditor v-model="weeklySchedule" />
      </CardContent>
    </Card>

    <!-- Closures/Holidays -->
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Closures</CardTitle>
        <CardDescription>Holidays and special closures</CardDescription>
      </CardHeader>
      <CardContent>
        <ClosureScheduler v-model="closures" />
      </CardContent>
    </Card>
  </div>
</template>
```

### Pattern 2: Day Schedule Row
**What:** Single row for configuring one day's hours
**When to use:** Each day in the 7-day schedule editor
**Example:**
```vue
<script setup lang="ts">
// Source: Context decisions - 7-row list layout
interface DaySchedule {
  dayOfWeek: number
  isClosed: boolean
  openTime: string  // HH:mm format
  closeTime: string
}

const props = defineProps<{ modelValue: DaySchedule }>()
const emit = defineEmits<{ 'update:modelValue': [DaySchedule] }>()

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
</script>

<template>
  <div class="flex items-center gap-4 py-3 border-b last:border-0">
    <div class="w-24 font-medium">{{ dayNames[modelValue.dayOfWeek] }}</div>

    <Switch
      :checked="!modelValue.isClosed"
      @update:checked="emit('update:modelValue', { ...modelValue, isClosed: !$event })"
    />

    <template v-if="!modelValue.isClosed">
      <Input
        type="time"
        :value="modelValue.openTime"
        class="w-32"
        @input="emit('update:modelValue', { ...modelValue, openTime: $event.target.value })"
      />
      <span class="text-muted-foreground">to</span>
      <Input
        type="time"
        :value="modelValue.closeTime"
        class="w-32"
        @input="emit('update:modelValue', { ...modelValue, closeTime: $event.target.value })"
      />
    </template>
    <span v-else class="text-muted-foreground">Closed</span>
  </div>
</template>
```

### Pattern 3: Database Schema Extension
**What:** New tables for closures and override settings
**When to use:** Migration for Phase 13
**Example:**
```sql
-- Source: Standard pattern for business scheduling systems
-- Closures table for holidays and special closures
CREATE TABLE business_closures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),

    CONSTRAINT valid_date_range CHECK (start_date <= end_date)
);

-- Settings table for override and other config
CREATE TABLE business_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);

-- Initial override setting
INSERT INTO business_settings (key, value) VALUES
  ('manual_override', '{"active": false, "expires_at": null}');
```

### Anti-Patterns to Avoid
- **Storing times as strings without validation:** Always validate HH:mm format and ensure open < close
- **Fetching all closures without date filter:** Query only upcoming closures (start_date >= today)
- **Immediate save on every keystroke:** Debounce or use explicit save button to avoid excessive API calls
- **Timezone conversion in the browser:** All business hours logic stays server-side; times are stored and displayed in warehouse local time

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Time input | Custom hour/minute selects | `<input type="time">` | Native time input has accessibility, mobile support built-in |
| Date range selection | Two separate date pickers | shadcn-vue RangeCalendar | Better UX, handles range highlighting |
| Toggle switch | Checkbox styling | shadcn-vue Switch | Consistent with design system |
| Timezone handling | Manual UTC offset math | date-fns TZDate | Handles DST, IANA timezone names properly |
| Form validation | Manual checks | vee-validate + zod | Already established in project |

**Key insight:** The project already has all necessary UI components installed. The complexity is in the database schema and business logic, not the UI primitives.

## Common Pitfalls

### Pitfall 1: Time Input Format Inconsistency
**What goes wrong:** Different browsers/locales return different formats from `<input type="time">`
**Why it happens:** Some browsers may include seconds (HH:mm:ss), others just HH:mm
**How to avoid:** Always normalize to HH:mm before saving; use substring(0, 5) if needed
**Warning signs:** Database constraint failures, display showing "07:00:00" instead of "7:00 AM"

### Pitfall 2: Closure Date Range Overlap
**What goes wrong:** User creates overlapping closures (e.g., Dec 23-26 and Dec 25-Jan 1)
**Why it happens:** No validation preventing overlapping date ranges
**How to avoid:** Check for overlaps before insert; show warning or merge ranges
**Warning signs:** Confusing display in closures list, "next open time" calculation bugs

### Pitfall 3: Override Not Auto-Expiring
**What goes wrong:** Manual "Closed now" override stays active forever
**Why it happens:** Forgot to implement expiry logic or expiry check
**How to avoid:** Store `expires_at` timestamp with override; API checks current time vs expiry
**Warning signs:** Warehouse shows closed even during regular business hours

### Pitfall 4: Weekly Schedule Constraint Violation
**What goes wrong:** User sets close time before open time (e.g., 17:00-07:00)
**Why it happens:** No validation in UI or database accepts invalid times
**How to avoid:** Database constraint `CHECK (open_time < close_time OR is_closed = true)` already exists; add UI validation
**Warning signs:** Error on save with cryptic PostgreSQL constraint message

### Pitfall 5: Customer API Not Checking Closures
**What goes wrong:** Customer can submit during scheduled closure because API only checks weekly schedule
**Why it happens:** Forgot to update existing business-hours.get.ts endpoint
**How to avoid:** Update API to check closures table and override setting in addition to weekly schedule
**Warning signs:** Customers submitting requests on holidays

## Code Examples

Verified patterns from official sources:

### Time Input with shadcn Styling
```vue
<!-- Source: shadcn-vue Calendar docs showing native time input -->
<Input
  type="time"
  :value="openTime"
  class="w-32 bg-background [&::-webkit-calendar-picker-indicator]:hidden"
  @input="openTime = $event.target.value"
/>
```

### RangeCalendar for Closure Dates
```vue
<script setup lang="ts">
// Source: shadcn-vue RangeCalendar docs
import type { DateRange } from 'reka-ui'
import { getLocalTimeZone, today } from '@internationalized/date'
import { RangeCalendar } from '@/components/ui/range-calendar'

const dateRange = ref<DateRange>({ start: today(getLocalTimeZone()), end: undefined })
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline">
        <CalendarIcon class="mr-2 h-4 w-4" />
        {{ dateRange.start && dateRange.end ? `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` : 'Select dates' }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <RangeCalendar v-model="dateRange" :number-of-months="2" />
    </PopoverContent>
  </Popover>
</template>
```

### Composable for Business Hours CRUD
```typescript
// Source: Project patterns from useGateManagement.ts
import { ref, readonly } from 'vue'
import { toast } from 'vue-sonner'

interface WeeklySchedule {
  dayOfWeek: number
  isClosed: boolean
  openTime: string
  closeTime: string
}

interface Closure {
  id: string
  startDate: string
  endDate: string
  reason: string | null
}

export function useBusinessHoursSettings() {
  const client = useSupabaseClient()
  const pending = ref(false)

  const weeklySchedule = ref<WeeklySchedule[]>([])
  const closures = ref<Closure[]>([])
  const override = ref<{ active: boolean; expiresAt: string | null }>({ active: false, expiresAt: null })

  async function loadSettings() {
    pending.value = true
    try {
      // Load weekly schedule
      const { data: hours } = await client
        .from('business_hours')
        .select('*')
        .order('day_of_week')

      weeklySchedule.value = (hours ?? []).map(h => ({
        dayOfWeek: h.day_of_week,
        isClosed: h.is_closed,
        openTime: h.open_time.substring(0, 5),
        closeTime: h.close_time.substring(0, 5)
      }))

      // Load upcoming closures
      const { data: closureData } = await client
        .from('business_closures')
        .select('*')
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('start_date')

      closures.value = (closureData ?? []).map(c => ({
        id: c.id,
        startDate: c.start_date,
        endDate: c.end_date,
        reason: c.reason
      }))

      // Load override setting
      const { data: settings } = await client
        .from('business_settings')
        .select('value')
        .eq('key', 'manual_override')
        .single()

      if (settings?.value) {
        override.value = settings.value as { active: boolean; expiresAt: string | null }
      }
    } finally {
      pending.value = false
    }
  }

  async function saveWeeklySchedule() {
    pending.value = true
    try {
      for (const day of weeklySchedule.value) {
        await client
          .from('business_hours')
          .upsert({
            day_of_week: day.dayOfWeek,
            is_closed: day.isClosed,
            open_time: day.openTime + ':00',
            close_time: day.closeTime + ':00'
          }, { onConflict: 'day_of_week' })
      }
      toast.success('Business hours saved')
    } catch (e) {
      toast.error('Failed to save business hours')
    } finally {
      pending.value = false
    }
  }

  return {
    weeklySchedule,
    closures,
    override,
    pending: readonly(pending),
    loadSettings,
    saveWeeklySchedule,
    // ... other methods
  }
}
```

### Updating Business Hours API for Closures
```typescript
// Source: Extend existing customer/server/api/business-hours.get.ts
// Add after checking weekly schedule:

// Check for scheduled closures
const today = format(warehouseNow, 'yyyy-MM-dd')
const { data: closures } = await client
  .from('business_closures')
  .select('reason')
  .lte('start_date', today)
  .gte('end_date', today)
  .limit(1)

if (closures && closures.length > 0) {
  return {
    isOpen: false,
    message: closures[0].reason
      ? `Closed: ${closures[0].reason}`
      : 'The warehouse is closed today.'
  }
}

// Check for manual override
const { data: overrideSetting } = await client
  .from('business_settings')
  .select('value')
  .eq('key', 'manual_override')
  .single()

if (overrideSetting?.value?.active) {
  const expiresAt = overrideSetting.value.expiresAt
  if (!expiresAt || new Date(expiresAt) > new Date()) {
    return {
      isOpen: false,
      message: 'The warehouse is temporarily closed.'
    }
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate date-fns-tz package | @date-fns/tz integrated with TZDate | date-fns v4 (2024) | Cleaner timezone handling |
| Custom time picker components | Native `<input type="time">` | Modern browsers | Better accessibility, mobile support |
| Radix UI | Reka UI | 2024 | shadcn-vue migration, same API |

**Deprecated/outdated:**
- date-fns-tz as separate package: Use @date-fns/tz with TZDate instead
- Custom time picker utilities: Native time input is sufficient for business hours

## Open Questions

Things that couldn't be fully resolved:

1. **Copy last year's holidays UX**
   - What we know: User wants easy way to re-add recurring holidays
   - What's unclear: Best UX pattern (button that shows last year's closures, import dialog, etc.)
   - Recommendation: Add "Copy from last year" button that shows preview of closures to import; filter by same date range (Jan 1 - current date last year), allow selecting which to copy

2. **Scheduling range limit**
   - What we know: User can schedule closures into the future
   - What's unclear: How far ahead should be allowed
   - Recommendation: 12 months is reasonable; no hard limit in database, add UI validation with warning for dates >12 months out

3. **Auto-expire calculation for override**
   - What we know: Override should expire at "next scheduled open time"
   - What's unclear: Should this be calculated client-side or server-side
   - Recommendation: Calculate server-side when toggle is activated; store explicit `expires_at` timestamp

## Sources

### Primary (HIGH confidence)
- [shadcn-vue Calendar](https://www.shadcn-vue.com/docs/components/calendar) - Calendar installation and usage
- [shadcn-vue RangeCalendar](https://www.shadcn-vue.com/docs/components/range-calendar) - Date range selection
- [shadcn-vue Date Picker](https://www.shadcn-vue.com/docs/components/date-picker) - Popover + Calendar composition
- [Reka UI Date Range Picker](https://reka-ui.com/docs/components/date-range-picker) - Underlying component API
- [Reka UI Time Field](https://reka-ui.com/docs/components/time-field) - Time input component (alternative to native)
- Existing project code: `customer/server/api/business-hours.get.ts`, `staff/app/composables/useGateManagement.ts`

### Secondary (MEDIUM confidence)
- [GitHub Issue #689 - Time Picker](https://github.com/unovue/shadcn-vue/issues/689) - Community time picker implementation
- Existing project patterns: form validation, composable structure, settings pages

### Tertiary (LOW confidence)
- None - all major findings verified with official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed or standard peers, verified with official docs
- Architecture: HIGH - Following established project patterns, standard CRUD operations
- Pitfalls: HIGH - Common issues well-documented, existing business hours API provides reference
- Database schema: MEDIUM - Extension patterns are standard, but specific constraint logic needs validation during implementation

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (30 days - stable domain, established patterns)
