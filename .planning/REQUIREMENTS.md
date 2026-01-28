# Requirements: Warehouse Pickup Queue System

**Defined:** 2026-01-28
**Core Value:** Customers always know their queue position and which gate to go to

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Customer App

- [ ] **CUST-01**: Mobile-responsive web app accessible via static QR code/URL
- [ ] **CUST-02**: Business hours check with message when warehouse is closed
- [ ] **CUST-03**: Submission form with sales order number, email, optional phone
- [ ] **CUST-04**: Real-time queue status display (position, gate, estimated wait)
- [ ] **CUST-05**: Visual confirmation when pickup is complete

### Warehouse Staff App

- [ ] **STAFF-01**: Email/password authentication via Supabase
- [ ] **STAFF-02**: Dashboard with table view of all pickup requests
- [ ] **STAFF-03**: Visual highlighting of requests requiring attention (flagged/pending)
- [ ] **STAFF-04**: Gate assignment functionality
- [ ] **STAFF-05**: Add to queue / Cancel request actions
- [ ] **STAFF-06**: Mark pickup as complete
- [ ] **STAFF-07**: Reorder queue positions within a gate
- [ ] **STAFF-08**: Move customer between gates
- [ ] **STAFF-09**: Priority override capability
- [ ] **STAFF-10**: Gate enable/disable (gates must be empty to disable)

### Validation & Security

- [ ] **VAL-01**: Validate sales order exists in NetSuite and is valid for pickup
- [ ] **VAL-02**: Retrieve order details from NetSuite (company name, item count, PO number)
- [ ] **VAL-03**: Email domain verification against NetSuite customer record
- [ ] **VAL-04**: Flag indicator for email-mismatched requests
- [ ] **VAL-05**: Rate limiting to prevent brute-force order number attempts

### Real-time Updates

- [ ] **RT-01**: Queue position updates via Supabase Realtime
- [ ] **RT-02**: Wait time estimate recalculation on queue changes
- [ ] **RT-03**: Gate assignment change notifications
- [ ] **RT-04**: Status change notifications (pending → approved → in_queue → completed)

### Infrastructure

- [ ] **INFRA-01**: Supabase database schema (SQL files in supabase/)
- [ ] **INFRA-02**: AWS Lambda for NetSuite integration (OpenTofu in infra/)
- [ ] **INFRA-03**: Supabase Auth configuration
- [ ] **INFRA-04**: Supabase Realtime subscriptions

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Notifications

- **NOTF-01**: SMS notifications via Twilio when turn is approaching
- **NOTF-02**: Configurable notification threshold (positions before turn)

### Enhanced Features

- **ENH-01**: Request details view (shipping address, subtotal, line items)
- **ENH-02**: Configurable business hours and vacation days via staff app

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Native mobile apps (iOS/Android) | Web-first approach, mobile responsive sufficient |
| Multiple warehouse locations | Single warehouse for v1 |
| Role-based permissions | All staff have equal access for v1 |
| Customer accounts/login | Public access with order number validation |
| Other ERP integrations | NetSuite only |
| Automated gate assignment | All assignments manual for v1 |
| Multi-language support | English only for v1 |
| Offline functionality | Online connectivity required |
| Dynamic gate management | Gates fixed at setup, rarely changed |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CUST-01 | TBD | Pending |
| CUST-02 | TBD | Pending |
| CUST-03 | TBD | Pending |
| CUST-04 | TBD | Pending |
| CUST-05 | TBD | Pending |
| STAFF-01 | TBD | Pending |
| STAFF-02 | TBD | Pending |
| STAFF-03 | TBD | Pending |
| STAFF-04 | TBD | Pending |
| STAFF-05 | TBD | Pending |
| STAFF-06 | TBD | Pending |
| STAFF-07 | TBD | Pending |
| STAFF-08 | TBD | Pending |
| STAFF-09 | TBD | Pending |
| STAFF-10 | TBD | Pending |
| VAL-01 | TBD | Pending |
| VAL-02 | TBD | Pending |
| VAL-03 | TBD | Pending |
| VAL-04 | TBD | Pending |
| VAL-05 | TBD | Pending |
| RT-01 | TBD | Pending |
| RT-02 | TBD | Pending |
| RT-03 | TBD | Pending |
| RT-04 | TBD | Pending |
| INFRA-01 | TBD | Pending |
| INFRA-02 | TBD | Pending |
| INFRA-03 | TBD | Pending |
| INFRA-04 | TBD | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 0
- Unmapped: 28 (pending roadmap)

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-28 after initial definition*
