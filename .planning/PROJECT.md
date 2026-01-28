# Warehouse Pickup Queue System

## What This Is

A two-part web application that streamlines warehouse pickup operations. Customers scan a QR code, enter their sales order number, and get real-time queue updates. Warehouse staff manage the queue, assign gates, and process pickups through an internal dashboard. The system integrates with NetSuite ERP for order validation and Twilio for SMS notifications.

## Core Value

Customers always know their queue position and which gate to go to — no confusion, no manual coordination overhead.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Customer App:**
- [ ] Mobile-responsive web app accessible via static QR code/URL
- [ ] Business hours check with informational message when closed
- [ ] Submission form: sales order number, email, optional phone number
- [ ] Real-time validation of sales order against NetSuite
- [ ] Email domain verification against NetSuite customer record
- [ ] Rate limiting to prevent brute-force order number attempts
- [ ] Clear messaging for email mismatch (direct to front desk)
- [ ] Real-time queue status display (position, gate, estimated wait time)
- [ ] SMS notification when turn is approaching (only if phone provided)
- [ ] Visual confirmation when pickup is complete

**Warehouse Staff App:**
- [ ] Email/password authentication via Supabase
- [ ] Dashboard with table view of all pickup requests
- [ ] Visual highlighting of requests requiring attention
- [ ] Request details view (shipping address, subtotal, line items)
- [ ] Flag indicator for email-mismatched requests
- [ ] Gate assignment functionality
- [ ] Add to queue / Cancel request actions
- [ ] Mark pickup as complete
- [ ] Reorder queue positions within a gate
- [ ] Move customer between gates
- [ ] Priority override capability
- [ ] Gate enable/disable (gates must be empty to disable)
- [ ] Configure business hours and vacation days

**Real-time Updates (all via Supabase Realtime):**
- [ ] Queue position updates
- [ ] Wait time estimate recalculation
- [ ] Gate assignment changes
- [ ] Status changes (pending → approved → in_queue → completed)

**NetSuite Integration:**
- [ ] Validate sales order exists and is valid for pickup
- [ ] Retrieve order details (company, items, PO, address, subtotal)
- [ ] Retrieve customer email domain for verification
- [ ] Cache order data per session

**SMS Integration:**
- [ ] Twilio integration for notifications
- [ ] Send SMS when customer's turn is approaching

### Out of Scope

- Native mobile apps (iOS/Android) — web-first approach
- Multiple warehouse locations — single warehouse for v1
- Role-based permissions — all staff have equal access
- Customer accounts/login — public access with order number
- Other ERP integrations — NetSuite only
- Automated gate assignment — all assignments manual
- Multi-language support — English only
- Offline functionality — online required
- Dynamic gate management — gates fixed at setup

## Context

**Business Environment:**
- Expected daily volume: 50-100 pickups
- Customers arrive with sales order number from purchase confirmation
- Current process lacks visibility into queue position and gate assignment
- Staff currently coordinates manually, creating overhead

**Technical Environment:**
- NetSuite ERP is source of truth for orders and customer data
- NetSuite sandbox available for development
- Token-based authentication credentials available
- Python `python-netsuite` library for integration

**User Research:**
- Customers need clear guidance on where to go and how long to wait
- Staff need efficient tools to validate orders and manage queue
- Email domain mismatch happens — flagged customers go to front desk, staff adds them manually

## Constraints

- **Tech Stack**: Nuxt 3 + Vue 3 + TailwindCSS + shadcn-vue for both frontends — non-negotiable
- **Database/Auth**: Supabase Cloud (PostgreSQL, Auth, Realtime) — non-negotiable
- **NetSuite Integration**: AWS Lambda + python-netsuite — required for Python library support
- **SMS Provider**: Twilio — decided
- **Infrastructure as Code**: OpenTofu in `infra/` directory for AWS resources
- **Database Schema**: SQL files in `supabase/` directory for Supabase tables/functions
- **Real-time Latency**: < 2 seconds for queue updates
- **Browser Support**: Modern browsers (Chrome, Safari, Firefox, Edge)
- **Mobile Support**: Full functionality on devices ≥ 320px width

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phone number optional in form | Not all customers want SMS; only notify those who opt in | — Pending |
| Cache NetSuite data per session | Orders rarely change during pickup window; reduces API calls | — Pending |
| Static QR code | Simpler implementation; single URL for all customers | — Pending |
| Gates fixed at setup | Reduces complexity; staff rarely needs to add/remove gates | — Pending |
| Gate must be empty to disable | Prevents orphaned customers in queue | — Pending |
| Email mismatch → staff handles manually | Front desk can verify identity and add to queue via warehouse app | — Pending |
| AWS Lambda for NetSuite | python-netsuite requires Python runtime; Supabase Edge is Deno-based | — Pending |
| OpenTofu for AWS infrastructure | Infrastructure as code for reproducibility and version control | — Pending |

---
*Last updated: 2026-01-28 after initialization*
