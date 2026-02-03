# Requirements: Warehouse Pickup Queue v2.1

**Defined:** 2026-02-03
**Core Value:** Customers always know their queue position and which gate to go to

## v2.1 Requirements

Dashboard polish and gates view — fixing UX issues and completing the gates management experience.

### Action Fixes

- [ ] **FIX-01**: DataTable actions respect processing state — Processing orders show Complete + Return to Queue
- [ ] **FIX-02**: Cancel action is secondary throughout all states

### Gates View

- [ ] **GATE-14**: Gates overview page exists at /gates route
- [ ] **GATE-15**: Gates page shows table with all gates and their status
- [ ] **GATE-16**: Gates page provides links to individual gate operator views (/gate/[id])
- [ ] **GATE-17**: "Manage gates" functionality (create/enable/disable) lives on /gates route

### Dashboard Improvements

- [ ] **DASH-06**: Dashboard tabs contain only queue filtering (All, Gate 1, Gate 2, etc.)
- [ ] **DASH-07**: "Now processing" section shows table with one row per active gate
- [ ] **DASH-08**: Processing table shows order info or "Idle" state per gate

### Code Quality

- [ ] **ARCH-10**: index.vue refactored following DRY principle
- [ ] **ARCH-11**: index.vue has clear separation of concerns (components extracted where appropriate)

## Out of Scope

| Feature | Reason |
|---------|--------|
| New features beyond polish | This milestone focuses on fixing existing issues |
| NetSuite deployment | Awaiting credentials, separate milestone |
| SMS notifications | Future scope |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIX-01 | TBD | Pending |
| FIX-02 | TBD | Pending |
| GATE-14 | TBD | Pending |
| GATE-15 | TBD | Pending |
| GATE-16 | TBD | Pending |
| GATE-17 | TBD | Pending |
| DASH-06 | TBD | Pending |
| DASH-07 | TBD | Pending |
| DASH-08 | TBD | Pending |
| ARCH-10 | TBD | Pending |
| ARCH-11 | TBD | Pending |

**Coverage:**
- v2.1 requirements: 11 total
- Mapped to phases: 0
- Unmapped: 11

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 after initial definition*
