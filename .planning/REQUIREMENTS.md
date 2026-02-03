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
| FIX-01 | Phase 21 | Pending |
| FIX-02 | Phase 21 | Pending |
| GATE-14 | Phase 20 | Pending |
| GATE-15 | Phase 20 | Pending |
| GATE-16 | Phase 20 | Pending |
| GATE-17 | Phase 20 | Pending |
| DASH-06 | Phase 21 | Pending |
| DASH-07 | Phase 21 | Pending |
| DASH-08 | Phase 21 | Pending |
| ARCH-10 | Phase 19 | Complete |
| ARCH-11 | Phase 19 | Complete |

**Coverage:**
- v2.1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 — Roadmap created, traceability complete*
