# Requirements: Warehouse Pickup Queue v2.2

**Defined:** 2026-02-03
**Core Value:** Customers always know their queue position and which gate to go to

## v2.2 Requirements

Requirements for v2.2 Polish & Bug Fixes milestone.

### UI Polish

- [ ] **UI-01**: Gates page "Open" button uses link variant with ExternalLink icon
- [ ] **UI-02**: Sidebar footer uses two-line NavUser layout (name + smaller email)
- [ ] **UI-03**: Sidebar dropdown positions correctly (bottom on mobile, right on desktop)
- [ ] **UI-04**: Tab queue count badges use `Badge variant="secondary"` for visibility
- [ ] **UI-05**: ProcessingGatesTable idle rows show only "Idle" text (no dashes/empty cells)

### Queue Table Unification

- [ ] **TBL-01**: QueueTable component supports `mode='sort'` with column sorting
- [ ] **TBL-02**: QueueTable component supports `mode='drag'` with row reordering
- [ ] **TBL-03**: Drag-and-drop uses drag handles (not entire row)
- [ ] **TBL-04**: Keyboard arrow keys provide accessible reordering alternative
- [ ] **TBL-05**: All Requests tab uses QueueTable with sort mode
- [ ] **TBL-06**: Gate tabs use QueueTable with drag mode
- [ ] **TBL-07**: Drag operations optimistically update UI before server response

### Cleanup

- [ ] **CLN-01**: Remove refresh button from queue view
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
| UI-01 | TBD | Pending |
| UI-02 | TBD | Pending |
| UI-03 | TBD | Pending |
| UI-04 | TBD | Pending |
| UI-05 | TBD | Pending |
| TBL-01 | TBD | Pending |
| TBL-02 | TBD | Pending |
| TBL-03 | TBD | Pending |
| TBL-04 | TBD | Pending |
| TBL-05 | TBD | Pending |
| TBL-06 | TBD | Pending |
| TBL-07 | TBD | Pending |
| CLN-01 | TBD | Pending |
| CLN-02 | TBD | Pending |

**Coverage:**
- v2.2 requirements: 14 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 14

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 after initial definition*
