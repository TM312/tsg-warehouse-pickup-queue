# Requirements: Warehouse Pickup Queue v1.1

**Defined:** 2026-01-30
**Core Value:** Customers always know their queue position and which gate to go to

## v1.1 Requirements

Requirements for Gate Operator Experience milestone. Each maps to roadmap phases.

### Gate Operator View

- [ ] **GATE-01**: Gate operator can view current pickup at their gate (/gate/[id] route)
- [ ] **GATE-02**: Sales order number displayed prominently (large, scannable text)
- [ ] **GATE-03**: Customer name/company shown for verification
- [ ] **GATE-04**: Quick action to mark pickup as complete (single tap)
- [ ] **GATE-05**: Quick action to start processing (accepts current pickup)
- [ ] **GATE-06**: Mobile-responsive layout with 44x44px minimum touch targets
- [ ] **GATE-07**: Real-time updates when queue changes
- [ ] **GATE-08**: Next-up preview shows who's coming after current customer
- [ ] **GATE-09**: Order details displayed (item count, PO# from NetSuite cache)

### Processing Status

- [ ] **PROC-01**: New "processing" status between queued and completed
- [ ] **PROC-02**: Visual indicator for processing status (StatusBadge update)
- [ ] **PROC-03**: Processing timestamp recorded (started_at column)
- [ ] **PROC-04**: Customer notified when their pickup enters processing
- [ ] **PROC-05**: Auto-advance to next pickup after completing current

### Business Hours Management

- [ ] **HOUR-01**: Weekly schedule editor (7-day grid with time pickers)
- [ ] **HOUR-02**: Holiday/closure date scheduling (shadcn-vue date picker)
- [ ] **HOUR-03**: View current configured hours
- [ ] **HOUR-04**: Hours changes take effect immediately (no deploy required)
- [ ] **HOUR-05**: Manual override toggle ("Closed now" / "Open late")

## Future Requirements

Deferred to later milestones. Tracked but not in current roadmap.

### Gate Operator Enhancements

- **GATE-10**: Quick cancel with reason selection
- **GATE-11**: Elapsed time indicator (waiting/processing duration)
- **GATE-12**: Customer contact info display (phone/email)
- **GATE-13**: Processing timeout alert

### Business Hours Enhancements

- **HOUR-06**: Schedule preview (next 7 days including holidays)
- **HOUR-07**: Copy schedule (clone hours between days)
- **HOUR-08**: Recurring holidays (set once, repeats annually)
- **HOUR-09**: Closure message customization

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Operator login per gate | Adds complexity, operators share gates — use existing staff auth |
| Gate-specific permissions | All staff have equal access (existing constraint) |
| Automatic gate assignment | Complex algorithm rarely optimal — keep manual |
| Separate operator mobile app | Maintenance burden — mobile-responsive web page instead |
| Processing time SLAs | Over-engineering for 50-100 daily pickups |
| Offline mode | Requires significant architecture changes (existing constraint) |
| Push notifications | Complex setup, web notifications unreliable — rely on realtime updates |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PROC-01 | TBD | Pending |
| PROC-02 | TBD | Pending |
| PROC-03 | TBD | Pending |
| PROC-04 | TBD | Pending |
| PROC-05 | TBD | Pending |
| GATE-01 | TBD | Pending |
| GATE-02 | TBD | Pending |
| GATE-03 | TBD | Pending |
| GATE-04 | TBD | Pending |
| GATE-05 | TBD | Pending |
| GATE-06 | TBD | Pending |
| GATE-07 | TBD | Pending |
| GATE-08 | TBD | Pending |
| GATE-09 | TBD | Pending |
| HOUR-01 | TBD | Pending |
| HOUR-02 | TBD | Pending |
| HOUR-03 | TBD | Pending |
| HOUR-04 | TBD | Pending |
| HOUR-05 | TBD | Pending |

**Coverage:**
- v1.1 requirements: 19 total
- Mapped to phases: 0
- Unmapped: 19 (pending roadmap)

---
*Requirements defined: 2026-01-30*
*Last updated: 2026-01-30 after initial definition*
