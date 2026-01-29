# Phase 7: Customer Submission Flow - Research

**Researched:** 2026-01-29
**Domain:** Mobile-responsive customer form submission with validation and rate limiting
**Confidence:** HIGH

## Summary

This phase implements a customer-facing web application for submitting pickup requests. The customer app will be a separate Nuxt 4 application in a `customer/` directory, following the established pattern from the `staff/` app. Key challenges include:

1. **Mobile-first responsive design** - Customers will primarily access via QR code scan on mobile devices
2. **Business hours checking** - Form submission should only be available during open hours
3. **Order validation** - Integration with existing Lambda/NetSuite validation service
4. **Rate limiting** - Protection against brute-force order number attempts
5. **Anonymous submission** - Customers don't authenticate; RLS policies need anon INSERT capability

The existing staff app provides a proven pattern: Nuxt 4 + shadcn-vue (new-york style, neutral base) + vee-validate + Zod + Supabase. The customer app will reuse this stack but without authentication requirements.

**Primary recommendation:** Create a separate Nuxt 4 app in `customer/` with the same stack as staff/, add nuxt-api-shield for rate limiting, implement business hours check as a server route, and add RLS policy for anonymous INSERT on pickup_requests.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Nuxt | ^4.3.0 | Framework | Already used in staff/, Vue full-stack |
| @nuxtjs/supabase | ^2.0.3 | Database access | Already configured, handles anon client |
| vee-validate | ^4.15.1 | Form validation | Already used in staff/ forms |
| @vee-validate/zod | ^4.15.1 | Schema adapter | Type-safe validation |
| zod | ^3.25.76 | Schema definition | Already used project-wide |
| shadcn-nuxt | ^2.4.3 | UI components | Already configured with new-york style |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nuxt-api-shield | latest | Rate limiting | VAL-05 requirement for brute-force protection |
| date-fns | ^4.x | Date/time handling | Business hours checking |
| @date-fns/tz | ^1.x | Timezone support | Converting to warehouse local time |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| nuxt-api-shield | nuxt-security | nuxt-api-shield is simpler and purpose-built for rate limiting; nuxt-security is broader |
| date-fns | dayjs | date-fns has better tree-shaking and v4 has first-class TZ support |

**Installation:**
```bash
cd customer
pnpm add @nuxtjs/supabase@^2.0.3 vee-validate@^4.15.1 @vee-validate/zod@^4.15.1 zod@^3.25.76 shadcn-nuxt@^2.4.3 nuxt-api-shield date-fns @date-fns/tz
pnpm add -D tailwindcss @tailwindcss/vite
```

## Architecture Patterns

### Recommended Project Structure
```
customer/
├── app/
│   ├── assets/
│   │   └── css/
│   │       └── tailwind.css    # Mobile-first styles
│   ├── components/
│   │   ├── ui/                 # shadcn-vue components (copy from staff/)
│   │   ├── PickupRequestForm.vue
│   │   └── ClosedMessage.vue
│   ├── composables/
│   │   └── useBusinessHours.ts
│   ├── layouts/
│   │   └── default.vue
│   └── pages/
│       └── index.vue           # Single-page submission form
├── server/
│   ├── api/
│   │   ├── submit.post.ts      # Submission endpoint (rate limited)
│   │   └── business-hours.get.ts
│   └── utils/
│       └── validateOrder.ts    # Lambda API call wrapper
├── nuxt.config.ts
├── components.json             # shadcn-vue config (copy from staff/)
└── package.json
```

### Pattern 1: Mobile-First Form Layout
**What:** Design base styles for mobile, use breakpoint prefixes for larger screens
**When to use:** All customer-facing components
**Example:**
```vue
<template>
  <!-- Base mobile styles, then md: for tablet+ -->
  <div class="px-4 py-6 md:px-8 md:py-12">
    <Card class="w-full max-w-md mx-auto">
      <CardHeader class="text-center space-y-2">
        <CardTitle class="text-xl md:text-2xl">Request Pickup</CardTitle>
      </CardHeader>
      <CardContent>
        <!-- Form with large touch targets -->
        <Input class="h-12 text-base" />
      </CardContent>
    </Card>
  </div>
</template>
```

### Pattern 2: Business Hours Checking
**What:** Server-side check if warehouse is open, computed client-side display
**When to use:** Page load and before form submission
**Example:**
```typescript
// server/api/business-hours.get.ts
import { format, getDay, parse, isWithinInterval } from 'date-fns'
import { TZDate } from '@date-fns/tz'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { data: hours } = await client.from('business_hours').select('*')

  // Get current time in warehouse timezone (America/Los_Angeles assumed)
  const warehouseNow = new TZDate(new Date(), 'America/Los_Angeles')
  const dayOfWeek = getDay(warehouseNow)
  const todayHours = hours?.find(h => h.day_of_week === dayOfWeek)

  if (!todayHours || todayHours.is_closed) {
    return { isOpen: false, message: 'The warehouse is currently closed.' }
  }

  const openTime = parse(todayHours.open_time, 'HH:mm:ss', warehouseNow)
  const closeTime = parse(todayHours.close_time, 'HH:mm:ss', warehouseNow)
  const isOpen = isWithinInterval(warehouseNow, { start: openTime, end: closeTime })

  return {
    isOpen,
    message: isOpen ? null : `We're open ${format(openTime, 'h:mm a')} - ${format(closeTime, 'h:mm a')}`
  }
})
```

### Pattern 3: Rate-Limited Submission Endpoint
**What:** Server route that validates order and creates pickup request
**When to use:** Form submission
**Example:**
```typescript
// server/api/submit.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 1. Validate input with Zod
  const schema = z.object({
    salesOrderNumber: z.string().min(1).max(50),
    email: z.string().email(),
    phone: z.string().optional()
  })
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  // 2. Call Lambda validation (or direct to Supabase cache first)
  const validation = await validateOrder(parsed.data.salesOrderNumber, parsed.data.email)
  if (!validation.success) {
    throw createError({ statusCode: 404, message: validation.error })
  }

  // 3. Insert pickup request as anon
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('pickup_requests')
    .insert({
      sales_order_number: parsed.data.salesOrderNumber,
      customer_email: parsed.data.email,
      customer_phone: parsed.data.phone || null,
      company_name: validation.order.company_name,
      item_count: validation.order.item_count,
      po_number: validation.order.po_number,
      email_flagged: !validation.order.email_match,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: 'Failed to create request' })
  return { success: true, requestId: data.id }
})
```

### Pattern 4: Anonymous RLS INSERT Policy
**What:** Allow anon role to insert pickup requests
**When to use:** Database migration for this phase
**Example:**
```sql
-- Migration: Add anonymous insert policy
CREATE POLICY "Customers can submit pickup requests"
  ON pickup_requests
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Only allow inserting with pending status
    status = 'pending'
    -- Prevent setting staff-only fields
    AND assigned_gate_id IS NULL
    AND queue_position IS NULL
    AND is_priority = false
    AND email_verified = false
    AND completed_at IS NULL
  );

-- Grant necessary permissions
GRANT INSERT ON pickup_requests TO anon;
```

### Anti-Patterns to Avoid
- **Client-side business hours check only:** Always verify on server - client can manipulate time
- **Direct Lambda calls from client:** Exposes API gateway URL; use server route as proxy
- **No rate limiting on submit endpoint:** Allows order number enumeration attacks
- **Using service_role key in customer app:** Never expose service_role; use anon with proper RLS

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rate limiting | Custom IP tracking | nuxt-api-shield | Handles storage, cleanup, banning logic |
| Form validation | Manual field checks | vee-validate + zod | Reactive validation, typed schemas |
| Timezone conversion | Manual UTC offset | @date-fns/tz TZDate | Handles DST, IANA timezone names |
| Input components | Raw HTML inputs | shadcn-vue Input | Accessibility, consistent styling |
| Business hours logic | Date.getDay() only | date-fns isWithinInterval | Edge cases around midnight |

**Key insight:** The customer submission flow has security implications (rate limiting, RLS) that are easy to get wrong with custom code. Using established libraries reduces attack surface.

## Common Pitfalls

### Pitfall 1: Missing SELECT Policy for Insert Return
**What goes wrong:** Insert fails with 401 even though INSERT policy exists
**Why it happens:** Supabase `.insert().select()` requires both INSERT and SELECT policies
**How to avoid:** Either add anon SELECT policy with restricted columns, or use `{ returning: 'minimal' }` option
**Warning signs:** 401 errors on insert despite correct INSERT policy

### Pitfall 2: Timezone Mismatch in Business Hours
**What goes wrong:** Warehouse shows open when it's closed (or vice versa)
**Why it happens:** Server time differs from warehouse local time
**How to avoid:** Always use TZDate with explicit warehouse timezone (e.g., 'America/Los_Angeles')
**Warning signs:** Business hours appear correct locally but wrong in production

### Pitfall 3: Rate Limiting Bypassed via X-Forwarded-For
**What goes wrong:** Attacker spoofs IP header to bypass rate limits
**Why it happens:** trustXForwardedFor enabled without proper proxy configuration
**How to avoid:** Only enable trustXForwardedFor if behind a trusted reverse proxy that strips client headers
**Warning signs:** Rate limits not triggering despite high request volume

### Pitfall 4: Lambda Timeout on Cold Start
**What goes wrong:** Order validation times out occasionally
**Why it happens:** Lambda cold starts can take 3-5 seconds
**How to avoid:** Set generous timeout (10-15s) on server route, show loading state
**Warning signs:** Intermittent 504 errors on first submission after idle period

### Pitfall 5: QR Code URL Too Dense
**What goes wrong:** QR code becomes hard to scan, especially at small sizes
**Why it happens:** Long URLs create busy QR patterns
**How to avoid:** Use short, clean URL (e.g., `https://pickup.example.com`)
**Warning signs:** QR code has very small modules, scan failures at distance

## Code Examples

Verified patterns from official sources and existing staff/ app:

### Form Schema with Zod
```typescript
// Source: Existing staff/app/pages/login.vue pattern
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

const formSchema = toTypedSchema(z.object({
  salesOrderNumber: z.string()
    .min(1, 'Sales order number is required')
    .max(50, 'Sales order number too long')
    .regex(/^[A-Z0-9-]+$/i, 'Invalid sales order number format'),
  email: z.string()
    .email('Please enter a valid email address'),
  phone: z.string()
    .optional()
    .refine(val => !val || /^[0-9-+() ]+$/.test(val), 'Invalid phone number format')
}))
```

### Form Component Structure
```vue
<!-- Source: Existing staff/app/pages/login.vue pattern -->
<script setup lang="ts">
import { useForm } from 'vee-validate'

const form = useForm({ validationSchema: formSchema })
const isLoading = ref(false)
const errorMessage = ref('')

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await useFetch('/api/submit', {
      method: 'POST',
      body: values
    })

    if (error.value) {
      errorMessage.value = error.value.data?.message || 'Submission failed'
      return
    }

    // Navigate to success page or show confirmation
    navigateTo('/success')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-4">
    <FormField v-slot="{ componentField }" name="salesOrderNumber">
      <FormItem>
        <FormLabel>Sales Order Number</FormLabel>
        <FormControl>
          <Input
            placeholder="SO-12345"
            autocomplete="off"
            class="h-12 text-base"
            v-bind="componentField"
          />
        </FormControl>
        <FormDescription>Found on your order confirmation email</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Similar for email and phone -->

    <Button type="submit" class="w-full h-12" :disabled="isLoading">
      {{ isLoading ? 'Submitting...' : 'Submit Request' }}
    </Button>
  </form>
</template>
```

### nuxt-api-shield Configuration
```typescript
// Source: https://github.com/rrd108/nuxt-api-shield
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-api-shield'],
  nuxtApiShield: {
    limit: {
      max: 5,          // 5 attempts per window
      duration: 60,    // 60 second window
      ban: 300         // 5 minute ban after exceeding
    },
    routes: [
      { path: '/api/submit', max: 5, duration: 60 }
    ],
    errorMessage: 'Too many attempts. Please wait a few minutes.',
    retryAfterHeader: true
  },
  nitro: {
    storage: {
      shield: { driver: 'memory' }  // Use redis in production
    }
  }
})
```

### Business Hours Composable
```typescript
// composables/useBusinessHours.ts
export function useBusinessHours() {
  const { data, pending, refresh } = useFetch('/api/business-hours', {
    lazy: true
  })

  const isOpen = computed(() => data.value?.isOpen ?? false)
  const closedMessage = computed(() => data.value?.message ?? 'Checking hours...')

  return {
    isOpen,
    closedMessage,
    isLoading: pending,
    refresh
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| date-fns-tz separate package | @date-fns/tz with TZDate | date-fns v4 (2024) | Built-in timezone support |
| Manual RLS policy debugging | Supabase RLS debugger in dashboard | 2024 | Easier policy testing |
| Global rate limiting only | Per-route rate limiting | nuxt-api-shield 1.x | Better UX for different endpoints |
| Tailwind CSS config file | Tailwind CSS v4 with @tailwindcss/vite | 2025 | No config file needed |

**Deprecated/outdated:**
- `utcToZonedTime` from date-fns-tz: Use `TZDate` from @date-fns/tz in v4
- `zonedTimeToUtc` from date-fns-tz: Use `TZDate` constructor instead

## Open Questions

Things that couldn't be fully resolved:

1. **Warehouse timezone configuration**
   - What we know: Business hours stored in database without timezone
   - What's unclear: Should timezone be configurable or hardcoded?
   - Recommendation: Hardcode 'America/Los_Angeles' initially, add config later if needed

2. **Lambda endpoint URL**
   - What we know: Lambda code exists but deployment is deferred
   - What's unclear: What will the production API Gateway URL be?
   - Recommendation: Use environment variable `NETSUITE_VALIDATION_URL`

3. **Success flow after submission**
   - What we know: Request created with pending status
   - What's unclear: Should customer see confirmation page or just a message?
   - Recommendation: Show success message with order details, no separate page needed

4. **Duplicate order handling**
   - What we know: No unique constraint on sales_order_number currently
   - What's unclear: Can same order be submitted multiple times?
   - Recommendation: Check for existing pending/approved/in_queue request for same order, reject if exists

## Sources

### Primary (HIGH confidence)
- Existing staff/ app codebase - form patterns, shadcn-vue setup, vee-validate usage
- Supabase migrations - database schema, RLS policy patterns
- Lambda handler.py - validation API contract

### Secondary (MEDIUM confidence)
- [nuxt-api-shield GitHub](https://github.com/rrd108/nuxt-api-shield) - rate limiting configuration
- [shadcn-vue Form docs](https://www.shadcn-vue.com/docs/components/form) - form component structure
- [vee-validate Zod integration](https://vee-validate.logaretm.com/v4/integrations/zod-schema-validation/) - typed schema setup
- [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security) - anonymous insert policies

### Tertiary (LOW confidence)
- [date-fns v4 timezone docs](https://github.com/date-fns/date-fns/blob/main/docs/timeZones.md) - TZDate usage
- [Tailwind responsive design](https://tailwindcss.com/docs/responsive-design) - mobile-first breakpoints

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified against existing staff/ app code
- Architecture: HIGH - follows established Nuxt patterns
- Rate limiting: MEDIUM - nuxt-api-shield docs verified, not tested in this project
- Business hours: MEDIUM - date-fns patterns verified, TZ edge cases need testing
- Pitfalls: HIGH - based on documented issues and Supabase discussions

**Research date:** 2026-01-29
**Valid until:** 2026-02-28 (30 days - stable stack, known patterns)
