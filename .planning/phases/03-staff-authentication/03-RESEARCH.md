# Phase 3: Staff Authentication - Research

**Researched:** 2026-01-28
**Domain:** Supabase Auth with Nuxt 3 (@nuxtjs/supabase)
**Confidence:** HIGH

## Summary

This phase implements staff authentication using Supabase Auth with email/password via the `@nuxtjs/supabase` module. The established pattern uses the official Nuxt module which provides Vue composables (`useSupabaseUser`, `useSupabaseClient`) and automatic session management via SSR cookies.

The implementation follows a straightforward pattern: admin creates accounts in Supabase dashboard (with email verification disabled), staff logs in via `signInWithPassword`, middleware protects routes, and staff can change their own password via `updateUser`. Password reset uses `resetPasswordForEmail` with a redirect to an update password page.

**Primary recommendation:** Use `@nuxtjs/supabase` module with built-in redirect handling, named middleware for route protection, and shadcn-vue Form components for the login UI.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @nuxtjs/supabase | latest | Nuxt module for Supabase integration | Official Nuxt module with SSR support, composables, automatic session handling |
| shadcn-vue | latest | UI components | Already in project stack (per PROJECT.md) |
| vee-validate | 4.x | Form validation | Required by shadcn-vue Form component |
| @vee-validate/zod | latest | Zod schema integration | Type-safe validation with vee-validate |
| zod | 3.x | Schema validation | Type-safe schema definition for forms |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn-nuxt | latest | Auto-imports shadcn components | Already required for shadcn-vue in Nuxt |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @nuxtjs/supabase | @supabase/supabase-js directly | Lose SSR session handling, must manage cookies manually |
| shadcn-vue Form | Native form handling | Lose accessibility, validation integration, type safety |

**Installation:**
```bash
# Supabase module (if not already installed)
npx nuxi@latest module add supabase

# shadcn-vue form components
pnpm dlx shadcn-vue@latest add form input button card label

# Form validation
pnpm add vee-validate @vee-validate/zod zod
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── components/
│   └── ui/              # shadcn-vue components (auto-generated)
├── composables/
│   └── useAuth.ts       # Auth helper composable (optional)
├── middleware/
│   └── auth.ts          # Route protection middleware
├── pages/
│   ├── login.vue        # Login page (public)
│   ├── confirm.vue      # OAuth/email callback handler
│   ├── password/
│   │   └── update.vue   # Password update page (requires auth)
│   └── forgot-password.vue  # Password reset request (public)
└── layouts/
    └── auth.vue         # Layout for auth pages (no navbar)
```

### Pattern 1: Route Protection Middleware
**What:** Named middleware that redirects unauthenticated users to login
**When to use:** Apply to all staff dashboard routes
**Example:**
```typescript
// middleware/auth.ts
// Source: https://supabase.nuxtjs.org/getting-started/authentication
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  // CRITICAL: Check destination to prevent infinite redirect loop
  if (to.path === '/login' || to.path === '/forgot-password' || to.path === '/confirm') {
    return // Allow access to auth pages
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
```

### Pattern 2: Email/Password Sign In
**What:** Direct password authentication without OAuth flows
**When to use:** Staff login form
**Example:**
```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-signinwithpassword
const supabase = useSupabaseClient()

async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    // Error messages are intentionally vague for security
    // "Invalid login credentials" covers: wrong password, no account, etc.
    return { error: error.message }
  }

  return { user: data.user }
}
```

### Pattern 3: Password Reset Flow
**What:** Two-step flow: request reset email, then update password
**When to use:** "Forgot password" feature
**Example:**
```typescript
// Step 1: Request reset (public page)
// Source: https://supabase.com/docs/guides/auth/auth-password-reset
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://yoursite.com/password/update'  // MUST be absolute URL
})

// Step 2: Update password (authenticated page, after clicking email link)
// The user is automatically signed in when clicking the reset link
const { error } = await supabase.auth.updateUser({
  password: newPassword
})
```

### Pattern 4: Session Persistence
**What:** Sessions persist across browser refreshes via SSR cookies
**When to use:** Automatic via @nuxtjs/supabase module
**Configuration:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/supabase'],
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    useSsrCookies: true,  // Default: true - handles session across SSR
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/'],  // Public pages that don't require auth
    }
  }
})
```

### Pattern 5: Logout
**What:** Sign out and clear session
**When to use:** Logout button/action
**Example:**
```typescript
// Source: https://supabase.nuxtjs.org/getting-started/authentication
const supabase = useSupabaseClient()

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
```

### Anti-Patterns to Avoid
- **Infinite redirect loops:** Always check `to.path` before redirecting in middleware
- **Using useRoute() in middleware:** Use the `to` and `from` parameters instead - there's no "current route" in middleware
- **Relative redirect URLs:** Password reset `redirectTo` MUST be absolute URLs
- **Global middleware without exclusions:** Will prevent access to login page itself
- **Calling useSupabaseUser() outside setup:** Composables must be called in setup context

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session management | Custom cookie/localStorage handling | @nuxtjs/supabase module | Handles SSR, refresh tokens, multi-tab sync |
| Form validation | Custom validation logic | vee-validate + zod | Accessibility, type safety, error messages |
| Password hashing | bcrypt implementation | Supabase Auth | Security best practices, salt handling |
| Token refresh | Manual refresh logic | Supabase Auth client | Automatic background refresh before expiry |
| Login rate limiting | Custom rate limiting | Supabase Auth | Built-in rate limiting on auth endpoints |

**Key insight:** Supabase Auth handles all the complex security concerns (password hashing with bcrypt, rate limiting, session management, refresh tokens). Custom auth implementations invariably have security vulnerabilities.

## Common Pitfalls

### Pitfall 1: Infinite Redirect Loop in Middleware
**What goes wrong:** Middleware redirects to /login, but middleware also runs on /login, creating a loop
**Why it happens:** Middleware runs on ALL routes including the login page
**How to avoid:** Explicitly check if destination is an auth page before redirecting
**Warning signs:** Browser shows "too many redirects" error

```typescript
// WRONG
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/login')  // Runs on /login too!
  }
})

// CORRECT
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  const publicPaths = ['/login', '/forgot-password', '/confirm']
  if (publicPaths.includes(to.path)) {
    return  // Don't redirect on public pages
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
```

### Pitfall 2: Admin-Created Users Can't Login (Email Not Confirmed)
**What goes wrong:** Users created by admin in Supabase dashboard get "Email not confirmed" error
**Why it happens:** Known Supabase issue where admin-created users require email verification even when disabled
**How to avoid:** Disable "Confirm email" in Supabase Auth settings, OR use SQL to set `email_confirmed_at`:
```sql
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'staff@example.com';
```
**Warning signs:** Error message "Email not confirmed" on first login attempt

### Pitfall 3: Relative URL in Password Reset
**What goes wrong:** Password reset email links don't work or redirect to wrong domain
**Why it happens:** Using relative path instead of absolute URL in `redirectTo`
**How to avoid:** Always use full absolute URLs including protocol
**Warning signs:** Reset email link goes to wrong place or 404s

```typescript
// WRONG
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: '/password/update'  // Won't work!
})

// CORRECT
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://yourapp.com/password/update'
})
```

### Pitfall 4: Missing Redirect URL Configuration
**What goes wrong:** Auth callbacks fail or redirect to wrong place
**Why it happens:** Redirect URLs not added to Supabase dashboard whitelist
**How to avoid:** Add all redirect URLs to Supabase Dashboard > Authentication > URL Configuration
**Warning signs:** "Redirect URL not allowed" errors

### Pitfall 5: Password Update Hangs or Fails with 401
**What goes wrong:** `updateUser({ password })` hangs or returns unauthorized
**Why it happens:** "Secure password change" setting in Supabase requires reauthentication
**How to avoid:** For simple setups, disable "Secure password change" in Supabase Studio. Otherwise implement reauthentication flow.
**Warning signs:** Code doesn't proceed past `updateUser`, or 401 error

## Code Examples

Verified patterns from official sources:

### Complete Login Page
```vue
<!-- pages/login.vue -->
<!-- Source: Supabase docs + shadcn-vue Form -->
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm } from 'vee-validate'

definePageMeta({
  layout: 'auth'  // Use auth layout (no navbar)
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

// Redirect if already logged in
watch(user, (value) => {
  if (value) navigateTo('/')
}, { immediate: true })

const formSchema = toTypedSchema(z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
}))

const form = useForm({ validationSchema: formSchema })
const isLoading = ref(false)
const errorMessage = ref('')

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true
  errorMessage.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password
  })

  isLoading.value = false

  if (error) {
    errorMessage.value = 'Invalid email or password'
    return
  }

  await navigateTo('/')
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Staff Login</CardTitle>
        <CardDescription>Enter your credentials to access the dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="onSubmit" class="space-y-4">
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="staff@example.com" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div v-if="errorMessage" class="text-sm text-red-500">
            {{ errorMessage }}
          </div>

          <Button type="submit" class="w-full" :disabled="isLoading">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </Button>

          <NuxtLink to="/forgot-password" class="block text-center text-sm text-muted-foreground hover:underline">
            Forgot password?
          </NuxtLink>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
```

### Auth Middleware
```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/forgot-password', '/confirm', '/password/update']

  // Allow access to public pages
  if (publicPaths.some(path => to.path.startsWith(path))) {
    // If logged in and trying to access login, redirect to dashboard
    if (user.value && to.path === '/login') {
      return navigateTo('/')
    }
    return
  }

  // Redirect unauthenticated users to login
  if (!user.value) {
    return navigateTo('/login')
  }
})
```

### Password Change Component
```vue
<!-- components/PasswordChange.vue -->
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm } from 'vee-validate'

const supabase = useSupabaseClient()

const formSchema = toTypedSchema(z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
}))

const form = useForm({ validationSchema: formSchema })
const isLoading = ref(false)
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true
  message.value = null

  // Note: Supabase doesn't require current password verification
  // If you need this, you'd re-authenticate first
  const { error } = await supabase.auth.updateUser({
    password: values.newPassword
  })

  isLoading.value = false

  if (error) {
    message.value = { type: 'error', text: 'Failed to update password. Please try again.' }
    return
  }

  message.value = { type: 'success', text: 'Password updated successfully!' }
  form.resetForm()
})
</script>
```

### Confirm Page (Callback Handler)
```vue
<!-- pages/confirm.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const user = useSupabaseUser()

// The @nuxtjs/supabase module automatically handles the token exchange
// from the URL hash. We just need to wait for the user to be set.
watch(user, (value) => {
  if (value) {
    navigateTo('/')
  }
}, { immediate: true })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p class="text-muted-foreground">Confirming your session...</p>
    </div>
  </div>
</template>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual cookie/localStorage | @nuxtjs/supabase SSR cookies | 2024+ | Automatic session sync, SSR support |
| Custom form validation | vee-validate + zod | 2023+ | Type-safe, accessible forms |
| signInWithOtp for everything | signInWithPassword for email/pass | Always available | Direct password auth without email OTP |
| useSupabaseAuthClient | useSupabaseClient | @nuxtjs/supabase 1.x | Simplified API, same underlying client |

**Deprecated/outdated:**
- `useSupabaseAuthClient()`: Now just use `useSupabaseClient()` which provides the same auth methods

## Open Questions

Things that couldn't be fully resolved:

1. **Multi-tab session sync**
   - What we know: @nuxtjs/supabase uses SSR cookies for session, Supabase client has built-in sync
   - What's unclear: Exact behavior when logging out in one tab
   - Recommendation: Test during implementation; likely works automatically via Supabase client events

2. **Session timeout configuration**
   - What we know: Default JWT expiry is 1 hour, refresh tokens don't expire but are single-use
   - What's unclear: Whether project uses custom session duration
   - Recommendation: Use Supabase defaults (1 hour JWT, indefinite sessions) unless specific timeout required

## Sources

### Primary (HIGH confidence)
- https://supabase.nuxtjs.org/getting-started/authentication - @nuxtjs/supabase auth guide
- https://supabase.nuxtjs.org/getting-started/introduction - Module setup and configuration
- https://supabase.com/docs/guides/auth/passwords - Password authentication guide
- https://supabase.com/docs/reference/javascript/auth-signinwithpassword - API reference
- https://supabase.com/docs/reference/javascript/auth-updateuser - Password update API
- https://supabase.com/docs/guides/auth/auth-password-reset - Password reset flow
- https://supabase.com/docs/guides/auth/sessions - Session management
- https://www.shadcn-vue.com/docs/components/form - Form component docs

### Secondary (MEDIUM confidence)
- https://dev.to/sebastianrubina/setting-up-supabase-auth-with-nuxt-v3-2b7a - Practical patterns verified against official docs
- https://github.com/nuxt-modules/supabase/issues/271 - Known updateUser issue

### Tertiary (LOW confidence)
- https://github.com/supabase/auth/issues/1961 - Admin-created user email verification bug

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Nuxt module with extensive documentation
- Architecture: HIGH - Patterns from official documentation
- Pitfalls: MEDIUM - Mix of official docs and community-reported issues

**Research date:** 2026-01-28
**Valid until:** 30 days (Supabase Auth is stable, @nuxtjs/supabase actively maintained)
