# Requirements: Warehouse Pickup Queue System

**Defined:** 2026-01-28
**Core Value:** Customers always know their queue position and which gate to go to

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Customer App

- [x] **CUST-01**: Mobile-responsive web app accessible via static QR code/URL
- [x] **CUST-02**: Business hours check with message when warehouse is closed
- [x] **CUST-03**: Submission form with sales order number, email, optional phone
- [ ] **CUST-04**: Real-time queue status display (position, gate, estimated wait)
- [ ] **CUST-05**: Visual confirmation when pickup is complete

### Warehouse Staff App

- [x] **STAFF-01**: Email/password authentication via Supabase
- [x] **STAFF-02**: Dashboard with table view of all pickup requests
- [x] **STAFF-03**: Visual highlighting of requests requiring attention (flagged/pending)
- [x] **STAFF-04**: Gate assignment functionality
- [x] **STAFF-05**: Add to queue / Cancel request actions
- [x] **STAFF-06**: Mark pickup as complete
- [x] **STAFF-07**: Reorder queue positions within a gate
- [x] **STAFF-08**: Move customer between gates
- [x] **STAFF-09**: Priority override capability
- [x] **STAFF-10**: Gate enable/disable (gates must be empty to disable)

### Validation & Security

- [ ] **VAL-01**: Validate sales order exists in NetSuite and is valid for pickup
- [ ] **VAL-02**: Retrieve order details from NetSuite (company name, item count, PO number)
- [ ] **VAL-03**: Email domain verification against NetSuite customer record
- [x] **VAL-04**: Flag indicator for email-mismatched requests
- [x] **VAL-05**: Rate limiting to prevent brute-force order number attempts

### Real-time Updates

- [x] **RT-01**: Queue position updates via Supabase Realtime
- [x] **RT-02**: Wait time estimate recalculation on queue changes
- [x] **RT-03**: Gate assignment change notifications
- [x] **RT-04**: Status change notifications (pending -> approved -> in_queue -> completed)

### Infrastructure

- [x] **INFRA-01**: Supabase database schema (SQL files in supabase/)
- [ ] **INFRA-02**: AWS Lambda for NetSuite integration (OpenTofu in infra/)
- [x] **INFRA-03**: Supabase Auth configuration
- [x] **INFRA-04**: Supabase Realtime subscriptions

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
| CUST-01 | Phase 7 | Complete |
| CUST-02 | Phase 7 | Complete |
| CUST-03 | Phase 7 | Complete |
| CUST-04 | Phase 10 | Pending |
| CUST-05 | Phase 10 | Pending |
| STAFF-01 | Phase 3 | Complete |
| STAFF-02 | Phase 4 | Complete |
| STAFF-03 | Phase 4 | Complete |
| STAFF-04 | Phase 5 | Complete |
| STAFF-05 | Phase 5 | Complete |
| STAFF-06 | Phase 5 | Complete |
| STAFF-07 | Phase 6 | Complete |
| STAFF-08 | Phase 6 | Complete |
| STAFF-09 | Phase 6 | Complete |
| STAFF-10 | Phase 6 | Complete |
| VAL-01 | Phase 2 | Pending |
| VAL-02 | Phase 2 | Pending |
| VAL-03 | Phase 2 | Pending |
| VAL-04 | Phase 4 | Complete |
| VAL-05 | Phase 7 | Complete |
| RT-01 | Phase 9 | Complete |
| RT-02 | Phase 9 | Complete |
| RT-03 | Phase 9 | Complete |
| RT-04 | Phase 9 | Complete |
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 2 | Pending |
| INFRA-03 | Phase 3 | Complete |
| INFRA-04 | Phase 8 | Complete |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-29 after Phase 9 completion*
