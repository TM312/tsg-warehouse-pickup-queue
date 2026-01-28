# Phase 2: NetSuite Integration - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable order validation against the NetSuite ERP system. Includes AWS Lambda deployment via OpenTofu, order validation/lookup, email domain verification, and session caching. This phase builds the backend integration — customer and staff UIs that consume this data are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Error responses
- Show specific guidance for missing orders: "Order SO-12345 not found. Make sure you're using the SO number from your confirmation email."
- Fail fast on NetSuite errors — show error immediately, let user retry manually (no auto-retry)
- Use vague messaging for email mismatch: "We couldn't verify your email. Please see staff at the front desk." (don't reveal domain comparison details)

### Caching strategy
- Cache validated order data for session duration (1-2 hours or until pickup complete)
- Store cached data in Supabase (in pickup_requests table alongside request data)

### Validation strictness
- One active pickup request per order at a time — reject if order already has pending/in_queue request
- Allow re-submission of completed orders (partial pickup scenarios, let staff handle)

### API contract
- Frontend calls Lambda directly via API Gateway (configure CORS)
- API key required — Lambda rejects requests without valid key
- API key stored as environment variable, passed in request header

### Claude's Discretion
- Include reference IDs in errors for debugging (operational needs assessment)
- Force refresh capability for staff (complexity vs value)
- Reuse cached data for duplicate submissions (API efficiency vs freshness)
- Email domain matching approach (exact vs subdomain-flexible based on business email patterns)
- Valid NetSuite order statuses for pickup (based on NetSuite status field options)
- Order details to return (based on what downstream phases need)
- Return email match flag vs domains (privacy vs debugging)

</decisions>

<specifics>
## Specific Ideas

- NetSuite credentials are token-based authentication (already available)
- Use python-netsuite library (requires Python runtime, hence Lambda not Edge Functions)
- OpenTofu for AWS infrastructure in `infra/` directory

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-netsuite-integration*
*Context gathered: 2026-01-28*
