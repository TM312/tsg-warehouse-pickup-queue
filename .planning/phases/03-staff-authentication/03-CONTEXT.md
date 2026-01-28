# Phase 3: Staff Authentication - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Warehouse staff can securely access their dashboard via Supabase Auth email/password. Staff accounts are created by admin; staff can log in, log out, and change their own passwords. All staff have equal access (no role hierarchy).

</domain>

<decisions>
## Implementation Decisions

### Account Provisioning
- Admin creates accounts manually (Supabase dashboard or SQL)
- Admin sets initial password and communicates it to staff directly (verbal/secure channel)
- No self-signup or invite link flow
- No email domain restrictions needed (admin controls who gets accounts)
- All staff have equal access — no roles or permission levels

### Password Management
- Staff can change their own password via a settings/profile area
- Self-service password change available after login
- If staff forgets password, "forgot password" flow sends reset email

### Claude's Discretion
- Login page visual design and layout
- Session duration and timeout behavior
- Multi-tab session handling
- Logout button placement
- Error message wording
- What happens when unauthenticated users hit protected routes (redirect to login)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for Supabase Auth implementation.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-staff-authentication*
*Context gathered: 2026-01-28*
