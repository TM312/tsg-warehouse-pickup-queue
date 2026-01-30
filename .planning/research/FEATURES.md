# Feature Landscape: Gate Operator Experience (v1.1)

**Domain:** Warehouse pickup queue system - gate operator view, processing workflow, business hours
**Researched:** 2026-01-30
**Milestone context:** Adding to existing system with customer app, supervisor dashboard, real-time updates

## Table Stakes

Features users expect. Missing = feature feels incomplete or broken.

### Gate Operator View

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Current pickup display | Operators need to know who they're serving | Low | Existing pickup_requests table | Position 1 at their gate, or "processing" status |
| Sales order number prominently shown | Primary identifier for locating order in warehouse | Low | Existing data | Large, scannable text |
| Customer name/company | Verify correct customer, personalize interaction | Low | Existing company_name column | From NetSuite cache |
| Quick action: Mark complete | Core workflow completion | Low | Existing completeRequest action | Single tap, confirmation optional |
| Quick action: Mark processing | Explicit acceptance of current pickup | Medium | New status, schema change | Transitions in_queue -> processing |
| Mobile-responsive layout | Gate operators use phones/tablets at dock | Low | Nuxt/Tailwind responsive | Touch-friendly targets (min 44x44px) |
| Real-time updates | Know immediately when queue changes | Low | Existing Supabase Realtime | Already working in customer/staff apps |

### Processing Status Workflow

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| "Processing" status state | Distinguish "next up" from "actively being served" | Medium | Schema migration, status CHECK constraint | in_queue -> processing -> completed |
| Visual indicator of processing | Staff/customer see when pickup is active | Low | StatusBadge.vue update | New badge variant |
| Processing timestamp | Track when service started | Low | Add started_at column | Useful for metrics |
| Customer notification of processing | Customer knows they're being served | Low | Existing realtime subscription | Status page already subscribes |

### Business Hours Management

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Weekly schedule editor | Set Mon-Fri 8am-5pm, etc. | Medium | Existing business_hours table | 7-day grid with time pickers |
| Holiday/closure scheduling | Close for Christmas, Memorial Day, etc. | Medium | New table or extension | Date-based overrides |
| View current hours | See what's configured | Low | Read from business_hours | Simple display |
| Hours take effect immediately | No deploy required to change hours | Low | Already using DB check | Customer app queries in real-time |

## Differentiators

Features that add value beyond basics. Not expected, but appreciated.

### Gate Operator View

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Next-up preview | See who's coming after current customer | Low | Query next position | Reduces surprise, allows prep |
| Order details (item count, PO#) | Verify right order without separate lookup | Low | Existing NetSuite cache | Reduces back-and-forth |
| Quick cancel with reason | Handle no-shows efficiently | Medium | Add cancellation_reason column | Common scenario |
| Elapsed time indicator | Know how long customer has been waiting/processing | Low | Calculate from timestamps | Helpful for monitoring |
| Customer contact info | Call customer if they're not at gate | Low | Existing phone/email | Only show if needed |
| Gate status indicator | "Active" / "Idle" / "Processing" at a glance | Low | Derive from current pickup | Dashboard overview value |
| Estimated completion | Based on historical processing times | High | Requires metrics collection | v2+ feature |

### Processing Status Workflow

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Auto-advance to next | After completing, show next in queue automatically | Low | UI state management | Smooth workflow |
| Processing timeout alert | Flag if processing takes too long | Medium | Background job or client timer | Prevents forgotten pickups |
| Skip/defer action | Move customer back if they're not ready | Medium | Requeue logic | Edge case but valuable |
| Batch processing mode | Handle multiple related orders at once | High | Complex state | v2+ if volume warrants |

### Business Hours Management

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Manual override toggle | "Closed today" or "Open late" instant control | Medium | Add manual_override table/column | Emergency closures, special events |
| Schedule preview | See next 7 days of hours including holidays | Low | Query and render | Helps catch mistakes |
| Recurring holidays | Set "Closed every July 4th" once | Medium | Holiday recurrence logic | Reduces annual maintenance |
| Copy schedule | Clone Mon hours to Tue-Fri | Low | UI convenience | Faster setup |
| Time zone handling | Ensure times are warehouse-local | Low | Already using timestamptz | Verify display is correct |
| Closure message customization | "Closed for inventory" vs generic message | Low | Add closure_message column | Better customer communication |

## Anti-Features

Features to explicitly NOT build. Common mistakes or scope creep.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Operator login/auth per gate | Adds complexity, operators share gates | Use existing staff auth, gate ID in URL |
| Gate-specific permissions | All staff can operate any gate | Single permission model (all staff equal) |
| Automatic gate assignment | Complex algorithm, rarely optimal | Keep manual assignment (STAFF-06 scope) |
| Separate operator mobile app | Maintenance burden, fragmented codebase | Mobile-responsive web page at /gate/[id] |
| Processing time SLAs | Over-engineering for 50-100 daily pickups | Simple elapsed time display, no enforcement |
| Complex scheduling (shifts, breaks) | Employee scheduling is separate domain | Just business hours for pickup service |
| Timezone selection per gate | Single warehouse, single timezone | Warehouse-wide timezone setting |
| Historical hours editing | "What were hours last Tuesday?" rarely needed | Only show/edit current schedule |
| Customer-facing business hours edit | Security risk, staff-only function | Keep in staff app behind auth |
| Offline mode for operators | Requires significant architecture changes | Online required (existing constraint) |
| Push notifications to operator devices | Complex setup, web notifications unreliable | Rely on realtime page updates, audio cue optional |
| Order loading instructions | ERP/WMS domain, not queue system | Link to external system if needed |
| Forklift assignment | Outside pickup queue scope | Separate operational concern |

## Feature Dependencies

```
Existing (v1)                    New (v1.1)
-------------                    ----------
pickup_requests table ---------> processing status (schema change)
                         |
StatusBadge.vue ---------+-----> processing badge variant
                         |
completeRequest action --+-----> startProcessing action
                         |
business_hours table ----+-----> weekly schedule UI
                         |       holiday/closure table
                         |       manual override
                         |
staff auth -------------+-----> /gate/[id] page (same auth)
                         |
Supabase Realtime ------+-----> gate view real-time updates
```

## MVP Recommendation

For v1.1 MVP, prioritize in this order:

### Must Have (Phase 1-2)

1. **Processing status** - Schema change, StatusBadge update
   - Enables explicit workflow state
   - Low risk, foundational change

2. **Gate operator view** - /gate/[id] with current pickup, quick actions
   - Core value for operators
   - Depends on processing status

3. **Weekly schedule UI** - Edit business hours in settings
   - Table stakes for business hours feature
   - Existing table, just needs UI

### Should Have (Phase 3)

4. **Holiday scheduling** - Date-based closures
   - Expected for complete business hours
   - New table, moderate complexity

5. **Manual override** - "Closed now" toggle
   - High operational value
   - Simple addition once holidays work

### Defer to Post-v1.1

- Recurring holidays (nice-to-have)
- Processing timeout alerts (needs usage data)
- Estimated completion times (needs metrics)
- Skip/defer actions (edge case)
- Closure message customization (low priority)

## Complexity Summary

| Feature Area | Total Table Stakes | Total Differentiators | Recommended for v1.1 |
|--------------|-------------------|----------------------|---------------------|
| Gate Operator View | 7 features | 7 features | 7 table stakes + 3 differentiators |
| Processing Status | 4 features | 4 features | All 4 table stakes + 1 differentiator |
| Business Hours | 4 features | 6 features | 4 table stakes + 2 differentiators |

## Sources

### Gate Operator Interface Patterns

- [LoadProof - WMS UI/UX Best Practices](https://loadproof.com/best-practices-designing-ui-ux-warehouse-app/) - Training reduction, simplified UI
- [BlueFletch - Modern Warehouse UX](https://bluefletch.com/why-a-modern-ux-should-be-the-next-step-in-warehouse-technology/) - Power user shortcuts, adaptive interfaces
- [AufaitUX - Logistics Dashboard Design](https://www.aufaitux.com/blog/dashboard-design-logistics-supply-chain-ux/) - Visual hierarchy, minimal cognitive load
- [Softeon - WMS UI/UX Importance](https://www.softeon.com/blog/the-importance-of-ui-ux-in-wms/) - Handheld device considerations

### Workflow State Patterns

- [Adobe Commerce - Order Processing](https://experienceleague.adobe.com/en/docs/commerce-admin/stores-sales/order-management/orders/order-processing) - Pending -> Processing -> Complete states
- [Drupal Commerce - Order Workflows](https://docs.drupalcommerce.org/v2/developer-guide/orders/workflows/) - State machine for order fulfillment
- [Vanilophp/Workflow - State Machine Library](https://github.com/vanilophp/workflow) - Transition patterns (new/pending -> processing -> completed)
- [Square - Pickup Order Fulfillment](https://squareup.com/help/us/en/article/6923-pickup-orders-on-square-point-of-sale) - Order status flow (Active, In Progress, Ready)

### Business Hours Management

- [Zendesk - Business Hours & Holidays](https://support.zendesk.com/hc/en-us/articles/4408842938522-Setting-your-schedule-with-business-hours-and-holidays) - Weekly schedule, holiday exceptions
- [Google Business Profile - Special Hours](https://support.google.com/business/answer/6303076?hl=en) - Temporary hours, closures
- [Acuity Scheduling - Override Hours](https://help.acuityscheduling.com/hc/en-us/articles/16676880363277-Setting-repeating-hours-in-Acuity-Scheduling) - Override patterns for specific days
- [Uberall - Special Opening Hours](https://uberall.helpjuice.com/locations/special-opening-hours) - Temporary vs permanent hour changes

### Pickup/Fulfillment Patterns

- [ShipStation - Customer Pickup Processing](https://help.shipstation.com/hc/en-us/articles/360046802111-How-do-I-process-orders-picked-up-by-the-customer) - Order identification for pickup
- [Squarespace - Fulfilling Orders](https://support.squarespace.com/hc/en-us/articles/206540697-Fulfilling-orders) - Ready for pickup notification workflow
