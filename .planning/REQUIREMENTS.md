# Requirements: Warehouse Pickup Queue v2.2

**Defined:** 2026-02-03
**Core Value:** Customers always know their queue position and which gate to go to

## v2.2 Requirements

Requirements for v2.2 Polish & Bug Fixes milestone.

### UI Polish

- [x] **UI-01**: Gates page "Open" button uses link variant with ExternalLink icon
- [x] **UI-02**: Sidebar footer uses two-line NavUser layout (name + smaller email)
- [x] **UI-03**: Sidebar dropdown positions correctly (bottom on mobile, right on desktop)
- [x] **UI-04**: Tab queue count badges use `Badge variant="secondary"` for visibility
- [x] **UI-05**: ProcessingGatesTable idle rows show only "Idle" text (no dashes/empty cells)

### Queue Table Unification

- [ ] **TBL-01**: QueueTable component supports `mode='sort'` with column sorting
- [ ] **TBL-02**: QueueTable component supports `mode='drag'` with row reordering
- [ ] **TBL-03**: Drag-and-drop uses drag handles (not entire row)
- [ ] **TBL-04**: Keyboard arrow keys provide accessible reordering alternative
- [ ] **TBL-05**: All Requests tab uses QueueTable with sort mode
- [ ] **TBL-06**: Gate tabs use QueueTable with drag mode
- [ ] **TBL-07**: Drag operations optimistically update UI before server response

### Cleanup

- [x] **CLN-01**: Remove refresh button from queue view
- [ ] **CLN-02**: Remove deprecated GateQueueList component after migration

## Future Requirements

None — this is a targeted polish milestone.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chart updates | Manual refresh sufficient for dashboard |
| Combined sort + drag mode | UX anti-pattern, creates confusion |
| Drag entire row (no handle) | Touch/scroll conflict on mobile |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UI-01 | Phase 22 | Complete |
| UI-02 | Phase 23 | Complete |
| UI-03 | Phase 23 | Complete |
| UI-04 | Phase 22 | Complete |
| UI-05 | Phase 23 | Complete |
| TBL-01 | Phase 24 | Pending |
| TBL-02 | Phase 24 | Pending |
| TBL-03 | Phase 24 | Pending |
| TBL-04 | Phase 24 | Pending |
| TBL-05 | Phase 24 | Pending |
| TBL-06 | Phase 24 | Pending |
| TBL-07 | Phase 24 | Pending |
| CLN-01 | Phase 22 | Complete |
| CLN-02 | Phase 24 | Pending |

**Coverage:**
- v2.2 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 — Phase 23 complete (UI-02, UI-03, UI-05)*
