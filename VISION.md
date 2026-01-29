# Warehouse Pickup Queue System - Vision Document

## Executive Summary

This document outlines the requirements for a digital queuing system that streamlines the pickup process for warehouse customers. The system consists of two web applications: a mobile-friendly customer-facing app for queue registration and status tracking, and an internal warehouse staff dashboard for queue management and order processing.

---

## 1. Problem Statement

Currently, customers arriving for warehouse pickups know their sales order number but lack visibility into:
- Which gate they should proceed to
- Their position in the queue
- Estimated waiting time

This leads to uncertainty, inefficient wait times, and manual coordination overhead for warehouse staff.

---

## 2. Solution Overview

A two-part web application system:

1. **Customer App** - Mobile-friendly web application for customers to:
   - Submit pickup requests using their sales order number
   - Track their position in the queue in real-time
   - View estimated wait times and assigned gate

2. **Warehouse Staff App** - Internal dashboard for warehouse team to:
   - View and validate incoming pickup requests
   - Assign customers to gates and manage the queue
   - Mark pickups as complete

---

## 3. User Personas

### 3.1 Customer
- Arrives at warehouse for a scheduled pickup
- Has their sales order number (from purchase confirmation)
- Uses a smartphone to access the system via QR code or direct link
- Needs clear guidance on where to go and how long to wait

### 3.2 Warehouse Staff
- Manages incoming pickup requests
- Validates orders against NetSuite ERP
- Assigns gates and manages queue priority
- Marks orders as complete when pickup is finished

---

## 4. User Journeys

### 4.1 Customer Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CUSTOMER JOURNEY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. ARRIVAL                                                                 │
│     Customer scans QR code or opens link                                    │
│                         │                                                   │
│                         ▼                                                   │
│  2. BUSINESS HOURS CHECK                                                    │
│     ├── Outside hours → Display business hours message                      │
│     └── Within hours  → Continue to form                                    │
│                         │                                                   │
│                         ▼                                                   │
│  3. SUBMISSION                                                              │
│     Customer enters:                                                        │
│     • Sales Order Number                                                    │
│     • Email Address                                                         │
│                         │                                                   │
│                         ▼                                                   │
│  4. VALIDATION                                                              │
│     ├── Invalid order    → Error message, retry allowed (rate limited)      │
│     ├── Email mismatch   → Flagged, directed to front desk                  │
│     └── Valid + verified → Proceed to waiting                               │
│                         │                                                   │
│                         ▼                                                   │
│  5. WAITING FOR APPROVAL                                                    │
│     "Your request is being processed..."                                    │
│     (Warehouse staff reviews and assigns gate)                              │
│                         │                                                   │
│                         ▼                                                   │
│  6. IN QUEUE                                                                │
│     Customer sees real-time:                                                │
│     • Assigned gate number                                                  │
│     • Position in queue                                                     │
│     • Estimated wait time                                                   │
│                         │                                                   │
│                         ▼                                                   │
│  7. NOTIFICATION                                                            │
│     SMS sent when turn is approaching                                       │
│                         │                                                   │
│                         ▼                                                   │
│  8. PICKUP COMPLETE                                                         │
│     Status updated to "Complete"                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Warehouse Staff Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WAREHOUSE STAFF JOURNEY                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. LOGIN                                                                   │
│     Staff authenticates via email/password                                  │
│                         │                                                   │
│                         ▼                                                   │
│  2. DASHBOARD VIEW                                                          │
│     See all incoming requests in table format:                              │
│     • Pending requests (highlighted)                                        │
│     • In-queue orders by gate                                               │
│     • Recently completed                                                    │
│                         │                                                   │
│                         ▼                                                   │
│  3. REVIEW REQUEST                                                          │
│     Click "Details" to see:                                                 │
│     • Shipping address                                                      │
│     • Order subtotal                                                        │
│     • Line items                                                            │
│     • Flagged status (if email mismatch)                                    │
│                         │                                                   │
│                         ▼                                                   │
│  4. TAKE ACTION                                                             │
│     ├── Assign gate + Add to queue                                          │
│     ├── Cancel request (with reason)                                        │
│     └── Reorder queue / Change priority                                     │
│                         │                                                   │
│                         ▼                                                   │
│  5. PROCESS PICKUP                                                          │
│     Mark as "Complete" when customer has collected order                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Functional Requirements

### 5.1 Customer Web Application

| ID | Requirement | Priority |
|----|-------------|----------|
| C-01 | Mobile-responsive web application accessible via QR code or direct URL | Must Have |
| C-02 | Business hours check - display operating hours message when closed | Must Have |
| C-03 | Form to submit sales order number and email address | Must Have |
| C-04 | Real-time validation of sales order against NetSuite | Must Have |
| C-05 | Email domain verification against NetSuite customer record | Must Have |
| C-06 | Rate limiting to prevent brute-force order number attempts | Must Have |
| C-07 | Clear messaging for email mismatch cases (direct to front desk) | Must Have |
| C-08 | Real-time queue status display (position, gate, estimated wait) | Must Have |
| C-09 | SMS notification when turn is approaching | Must Have |
| C-10 | Visual confirmation when pickup is complete | Should Have |

### 5.2 Warehouse Staff Web Application

| ID | Requirement | Priority |
|----|-------------|----------|
| W-01 | Email/password authentication via Supabase | Must Have |
| W-02 | Dashboard with table view of all pickup requests | Must Have |
| W-03 | Visual highlighting of requests requiring attention | Must Have |
| W-04 | Request details view (shipping address, subtotal, items) | Must Have |
| W-05 | Flag indicator for email-mismatched requests | Must Have |
| W-06 | Gate assignment functionality | Must Have |
| W-07 | Add to queue / Cancel request actions | Must Have |
| W-08 | Mark pickup as complete | Must Have |
| W-09 | Reorder queue positions within a gate | Must Have |
| W-10 | Move customer between gates | Must Have |
| W-11 | Priority override capability | Must Have |
| W-12 | Gate management (enable/disable gates for selection) | Must Have |
| W-13 | Configure business hours and vacation days | Should Have |

### 5.3 Request Table Columns (Warehouse Dashboard)

| Column | Source |
|--------|--------|
| Sales Order Number | User input / NetSuite |
| Company Name | NetSuite |
| Number of Items | NetSuite |
| PO Number | NetSuite |
| Status | System |
| Assigned Gate | System |
| Queue Position | System |
| Actions | System |

### 5.4 Request Details View

| Field | Source |
|-------|--------|
| Shipping Address | NetSuite |
| Order Subtotal | NetSuite |
| Line Items (list) | NetSuite |
| Email Match Status | System (flagged if mismatch) |

---

## 6. Technical Architecture

### 6.1 Recommended Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ARCHITECTURE OVERVIEW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐     ┌─────────────────┐                                │
│  │  Customer App   │     │  Warehouse App  │                                │
│  │  (Nuxt 3 + Vue) │     │  (Nuxt 3 + Vue) │                                │
│  │  TailwindCSS    │     │  TailwindCSS    │                                │
│  │  shadcn-vue     │     │  shadcn-vue     │                                │
│  └────────┬────────┘     └────────┬────────┘                                │
│           │                       │                                         │
│           └───────────┬───────────┘                                         │
│                       │                                                     │
│                       ▼                                                     │
│           ┌───────────────────────┐                                         │
│           │   Supabase (Cloud)    │                                         │
│           │  ├─ PostgreSQL DB     │                                         │
│           │  ├─ Auth              │                                         │
│           │  ├─ Realtime (WS)     │                                         │
│           │  └─ Edge Functions    │                                         │
│           └───────────┬───────────┘                                         │
│                       │                                                     │
│                       ▼                                                     │
│           ┌───────────────────────┐                                         │
│           │   Python Lambda       │                                         │
│           │   (NetSuite Client)   │                                         │
│           │   python-netsuite     │                                         │
│           └───────────┬───────────┘                                         │
│                       │                                                     │
│                       ▼                                                     │
│           ┌───────────────────────┐                                         │
│           │    NetSuite ERP       │                                         │
│           │  (Token-Based Auth)   │                                         │
│           └───────────────────────┘                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Component Breakdown

| Component | Technology | Purpose |
|-----------|------------|---------|
| Customer Frontend | Nuxt 3, Vue 3, TailwindCSS, shadcn-vue | Mobile-friendly customer interface |
| Warehouse Frontend | Nuxt 3, Vue 3, TailwindCSS, shadcn-vue | Internal staff dashboard |
| Database | Supabase PostgreSQL | Persistent storage for queue state, requests |
| Authentication | Supabase Auth | Email/password auth for warehouse staff |
| Real-time Updates | Supabase Realtime | WebSocket connections for live queue updates |
| NetSuite Integration | Python Lambda + python-netsuite | Order validation, data retrieval |
| SMS Notifications | TBD (Twilio recommended) | Customer notifications |

### 6.3 Database Schema (Conceptual)

```sql
-- Pickup Requests
pickup_requests (
  id UUID PRIMARY KEY,
  sales_order_number VARCHAR NOT NULL,
  customer_email VARCHAR NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  email_flagged BOOLEAN DEFAULT false,
  status ENUM ('pending', 'approved', 'in_queue', 'completed', 'cancelled'),
  assigned_gate_id UUID REFERENCES gates(id),
  queue_position INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  completed_at TIMESTAMP
)

-- NetSuite Cache (optional, for performance)
netsuite_order_cache (
  sales_order_number VARCHAR PRIMARY KEY,
  company_name VARCHAR,
  item_count INTEGER,
  po_number VARCHAR,
  shipping_address JSONB,
  subtotal DECIMAL,
  line_items JSONB,
  customer_email_domain VARCHAR,
  cached_at TIMESTAMP
)

-- Gates
gates (
  id UUID PRIMARY KEY,
  gate_number INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)

-- Configuration
app_config (
  key VARCHAR PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP
)
-- Keys: 'business_hours', 'vacation_days', 'avg_pickup_time_minutes'

-- Audit Log (optional)
audit_log (
  id UUID PRIMARY KEY,
  action VARCHAR,
  entity_type VARCHAR,
  entity_id UUID,
  performed_by UUID,
  details JSONB,
  created_at TIMESTAMP
)
```

---

## 7. Integration Specifications

### 7.1 NetSuite Integration

**Authentication:** Token-based authentication (credentials provided by client)

**Package:** `python-netsuite`

**Required Operations:**

| Operation | Purpose | Trigger |
|-----------|---------|---------|
| Validate Sales Order | Check if order exists and is valid for pickup | Customer submission |
| Get Order Details | Retrieve company, items, PO, address, subtotal | Customer submission |
| Get Customer Email Domain | Retrieve customer's email domain for verification | Customer submission |

**Data to Retrieve from NetSuite:**
- Sales Order validity/status
- Company name
- Number of line items
- PO Number
- Shipping address
- Order subtotal
- Line item details (name, quantity, etc.)
- Customer email domain

### 7.2 SMS Integration

**Recommended Provider:** Twilio (or similar)

**Trigger Events:**
- Customer's turn is approaching (configurable threshold, e.g., 2 positions away)

**Message Content Example:**
> "Your pickup at [Warehouse Name] is almost ready. Please proceed to Gate [X]. Queue position: [N]"

---

## 8. Security Considerations

### 8.1 Rate Limiting

To prevent brute-force attempts at guessing valid sales order numbers:

- Limit submission attempts per IP address (e.g., 5 attempts per 15 minutes)
- Implement exponential backoff after failed attempts
- Log suspicious activity patterns

### 8.2 Email Verification

- Compare submitted email domain against customer email domain in NetSuite
- Exact email match not required; domain-level matching is sufficient
- Mismatched emails are flagged for manual review (not rejected outright)
- Flagged customers directed to front desk for in-person verification

### 8.3 Authentication

- Warehouse staff: Supabase Auth with email/password
- Customer app: No authentication required (public access)
- All API endpoints for staff operations require valid session

---

## 9. Business Rules

### 9.1 Business Hours

- System operates within configured business hours
- Outside business hours: Display informational message instead of submission form
- Business hours and vacation days are configurable by staff

**Default Business Hours (to be confirmed):**
- Monday - Friday: 8:00 AM - 5:00 PM
- Saturday - Sunday: Closed

### 9.2 Wait Time Calculation

- Method: Average time per pickup
- Formula: `Estimated Wait = Queue Position × Average Pickup Duration`
- Average pickup duration is configurable (initial default: 10 minutes)

### 9.3 Queue Management

- Customers can be reordered within a gate's queue
- Customers can be moved between gates
- Priority can be manually overridden by staff
- Completed pickups are removed from active queue

---

## 10. Non-Functional Requirements

| Requirement | Specification |
|-------------|---------------|
| Expected Daily Volume | 50-100 pickups |
| Real-time Update Latency | < 2 seconds |
| Mobile Responsiveness | Full functionality on devices ≥ 320px width |
| Browser Support | Modern browsers (Chrome, Safari, Firefox, Edge) |
| Hosting | Cloud-based (Supabase Cloud) |
| Availability | During business hours |
| Data Retention | No specific compliance requirements |

---

## 11. Code Quality Standards

The implementation must adhere to clean code best practices to ensure maintainability, readability, and scalability.

### 11.1 Core Principles

| Principle | Expectation |
|-----------|-------------|
| **Separation of Concerns** | Clear boundaries between presentation, business logic, and data access layers |
| **DRY (Don't Repeat Yourself)** | Shared logic extracted into reusable functions, composables, and utilities |
| **Single Responsibility** | Each module, component, and function has one well-defined purpose |
| **SOLID Principles** | Apply where applicable, especially in backend service design |
| **Meaningful Naming** | Self-documenting code with descriptive variable, function, and file names |

### 11.2 Frontend Architecture

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # Base components (shadcn-vue)
│   └── features/        # Feature-specific components
├── composables/         # Shared Vue composition functions
├── services/            # API client and external service integrations
├── stores/              # State management (Pinia)
├── types/               # TypeScript type definitions
├── utils/               # Pure utility functions
└── pages/               # Route-based page components
```

**Expectations:**
- Components should be presentational where possible; business logic lives in composables/stores
- API calls abstracted into service layer, not embedded in components
- Shared types defined centrally and reused across the application
- Consistent code formatting enforced via ESLint + Prettier

### 11.3 Backend Architecture

```
src/
├── handlers/            # Lambda entry points (thin layer)
├── services/            # Business logic layer
├── repositories/        # Data access layer (Supabase queries)
├── integrations/        # External service clients (NetSuite, SMS)
├── models/              # Data models and validation schemas
├── utils/               # Shared utility functions
└── config/              # Configuration management
```

**Expectations:**
- Lambda handlers should be thin controllers delegating to services
- Business logic isolated in service layer for testability
- Database operations abstracted in repository pattern
- External integrations wrapped in dedicated client classes
- Consistent error handling strategy across all endpoints

### 11.4 Code Review Criteria

All code submissions should satisfy:

- [ ] No code duplication; shared logic properly extracted
- [ ] Clear separation between layers (UI, business logic, data)
- [ ] Consistent naming conventions followed
- [ ] No hardcoded values; configuration externalized
- [ ] Error handling implemented with meaningful messages
- [ ] TypeScript types properly defined (no `any` types without justification)
- [ ] Comments used sparingly and only for complex logic (code should be self-documenting)

---

## 12. Testing Requirements

The test suite must align with industry best practices to ensure application reliability and prevent regressions.

### 12.1 Testing Strategy

| Test Type | Scope | Tools (Recommended) |
|-----------|-------|---------------------|
| **Unit Tests** | Individual functions, composables, utilities | Vitest |
| **Component Tests** | Vue components in isolation | Vitest + Vue Test Utils |
| **Integration Tests** | API endpoints, service interactions | Vitest, Supertest |
| **End-to-End Tests** | Critical user flows | Playwright or Cypress |

### 12.2 Coverage Expectations

| Area | Minimum Coverage |
|------|------------------|
| Business logic (services) | 80% |
| Utility functions | 90% |
| API handlers/endpoints | 80% |
| Vue composables | 80% |
| UI components | 60% (focus on interactive components) |

### 12.3 Testing Best Practices

**General:**
- Tests should be independent and not rely on execution order
- Each test should have a single, clear assertion focus
- Use descriptive test names that explain the expected behavior
- Follow the Arrange-Act-Assert (AAA) pattern
- Mock external dependencies (NetSuite, SMS, Supabase) in unit/integration tests


**Backend Testing:**
- Test happy paths and error scenarios
- Validate input validation and error responses
- Test business rule edge cases thoroughly
- Use factories/fixtures for consistent test data

### 12.4 Continuous Integration

| Requirement | Expectation |
|-------------|-------------|
| Test execution | All tests run on every pull request |
| Coverage reporting | Coverage reports generated and tracked |
| Blocking criteria | PRs cannot merge with failing tests |
| E2E frequency | Run on merge to main branch minimum |

### 12.5 Test Documentation

- README in test directories explaining test organization
- Complex test scenarios documented with comments
- Test data fixtures documented and version controlled

---

## 13. Deployment

### 13.1 Environments

| Environment | Purpose |
|-------------|---------|
| Development | Active development and testing |
| Staging | Pre-production validation |
| Production | Live system |

### 13.2 Hosting

- **Frontend Applications:** Vercel, Netlify, or similar (Nuxt-compatible)
- **Database & Auth:** Supabase Cloud
- **Lambda Functions:** AWS Lambda or Supabase Edge Functions
- **Region:** To be determined (consider proximity to warehouse location)

---

## 14. Out of Scope (Version 1)

The following features are explicitly out of scope for the initial release:

- Native mobile applications (iOS/Android)
- Multiple warehouse locations
- Role-based permissions (all staff have equal access)
- Customer accounts / login
- Integration with other ERP systems
- Automated gate assignment (all assignments are manual)
- Multi-language support
- Offline functionality

---

## 15. Success Criteria

| Metric | Target |
|--------|--------|
| Customer can submit request | < 30 seconds |
| Staff can process a request | < 1 minute |
| Queue position updates in real-time | < 2 seconds latency |
| System handles peak load | 100+ concurrent users |
| Customer satisfaction | Reduced confusion and wait time |

---

## 16. Open Items for Vendor Discussion

| Item | Question |
|------|----------|
| SMS Provider | Confirm Twilio or alternative preference |
| Hosting Region | Confirm preferred region for latency optimization |
| Lambda Hosting | AWS Lambda vs Supabase Edge Functions |
| QR Code Generation | Static QR code or dynamic per-order? |
| Notification Threshold | How many positions before turn triggers SMS? |
| Gate Count | Total number of gates to configure |

---

## 17. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| Sales Order | Order created in NetSuite ERP system |
| Gate | Physical pickup location at the warehouse |
| Queue Position | Customer's place in line for a specific gate |
| Flagged Request | Request where email domain doesn't match NetSuite record |

### B. Reference Links

**Framework & UI:**
- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [shadcn-vue](https://www.shadcn-vue.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [python-netsuite Package](https://github.com/jmagnusson/netsuite)
- [Twilio SMS API](https://www.twilio.com/docs/sms)

**Testing:**
- [Vitest](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Playwright](https://playwright.dev/)
- [Cypress](https://www.cypress.io/)

---

*Document Version: 1.0*  
*Last Updated: January 28, 2026*
