# Client Interview Guide — Warehouse Pickup Queue

## Purpose

Before presenting the prototype, validate that the solution design matches the client's actual operations. This guide identifies the key assumptions baked into the current system and the questions needed to confirm or correct them.

---

## Current Design Summary

The system is a **real-time, walk-up queue** with two frontends:

- **Customer app** (public): Submit a pickup request with a sales order number, then track status and queue position in real-time
- **Staff app** (authenticated): Dashboard to manage the queue — approve requests, assign to gates, drag-to-reorder, process pickups at a fullscreen gate console

**Core flow:** Customer submits online &rarr; Staff approves &rarr; Customer arrives &rarr; Staff assigns to gate queue &rarr; Gate operator processes &rarr; Complete

**Key structural decisions:**
- Queue positions are per-gate (1, 2, 3...), not global
- One customer processed at a time per gate
- Priority moves a request to position 2 (behind whoever is currently being served)
- NetSuite validates the sales order before the request enters the system
- Business hours, scheduled closures, and manual override control availability
- Real-time WebSocket updates keep all screens synchronized

---

## Critical Assumptions to Validate

### 1. Queue Model

The entire data model assumes a **linear, single-lane-per-gate queue** where customers arrive, wait in order, and get served one at a time. If the operation is actually appointment-based, batch-processed, or allows concurrent loading at one dock, the core model needs rethinking.

### 2. Two-Phase Flow (Submit Online, Then Show Up)

The handoff between "approved" and "in_queue" is manual and undefined. There is no check-in mechanism — staff must notice the customer has arrived and assign them to a gate. The time gap between submission and arrival is unknown.

### 3. Single Sales Order Per Visit

Each pickup request maps to exactly one sales order number. Customers picking up multiple orders would need to submit multiple requests.

### 4. No Staging or Prep State

The system has no concept of "order is being pulled from shelves" before the customer arrives. If the warehouse needs lead time to stage orders, the queue should account for a prep phase.

### 5. No Rejection or Hold

The only way to remove a request is "cancel." There's no way to communicate "come back tomorrow" or "order isn't ready" with a reason.

### 6. No Timeout or No-Show Handling

A customer who submits a request and never arrives stays in the system indefinitely until staff manually cancels it.

### 7. Gate Interchangeability

All gates are treated as identical. There's no concept of gate specialization (oversized loads, hazmat, refrigerated, specific product lines).

### 8. Customer Identity

Email is the sole customer identifier. Domain matching (not exact email) against NetSuite is the only authorization check. No driver ID, vehicle info, or account system.

### 9. No Write-Back to NetSuite

Completing a pickup in the queue system does not update the sales order status in NetSuite. The loop isn't closed in the ERP.

### 10. Single Location, Single Timezone

The system is hardcoded to one warehouse in the America/Los_Angeles timezone.

---

## Interview Questions

### A. The Pickup Process

These questions determine whether the queue model is correct at all.

1. **Walk us through a typical pickup from the customer's perspective.** Do they call ahead? Schedule a time? Just show up? How far in advance do they know they're coming?

2. **When a customer arrives at the warehouse, what happens first?** Do they check in at a window? Pull up to a dock? Call someone? How does the warehouse know they're here?

3. **How many gates or docks do you have?** Are they interchangeable, or do specific gates handle specific types of loads (oversized, refrigerated, hazmat)?

4. **Can multiple customers be served at the same gate simultaneously?** For example, one order being loaded while the next is being staged or pulled from shelves.

5. **Who decides which gate a customer goes to?** Is there a dispatcher, or do customers self-direct? Is it first-come-first-served or based on order type or size?

6. **What does "processing" a pickup actually look like?** How long does a typical pickup take — minutes or hours? Does the customer wait at the dock, or go to a waiting area and get called back?

### B. Order and Customer Context

7. **What information do you need from the customer before they arrive?** Just the sales order number, or also vehicle info, driver name, appointment time, number of pallets, etc.?

8. **Do customers always know their sales order number?** Or do they sometimes show up with just a PO number, company name, or a confirmation email?

9. **Can one customer pick up multiple sales orders in a single visit?** How common is this?

10. **Do you need to verify the person picking up is authorized?** ID check, driver's license, company badge, or is knowing the SO number sufficient?

11. **Are there recurring customers — same company, weekly pickups?** Would they benefit from an account or history view, or is each visit independent?

### C. Scheduling and Timing

12. **Do customers schedule pickup times in advance, or is it walk-up only?** If scheduled, how far in advance — same day, day before, week ahead?

13. **How does the warehouse prepare for a pickup?** Is the order pre-staged before the customer arrives, or does staging begin when they check in? This determines whether "queue time" is actual wait time or prep time.

14. **What are your busiest times?** Are there patterns (morning rush, end-of-month surge)? Do you ever need to limit how many pickups happen in a given time window?

15. **What should happen when the warehouse is closed and someone wants to schedule a pickup for the next day?** Should they be able to submit a request outside business hours?

### D. Priority and Exceptions

16. **What makes a pickup "priority"?** VIP customer? Time-sensitive order? Staff discretion? How often does this happen?

17. **What happens when a pickup can't be completed?** Wrong items, damaged goods, missing paperwork — is there a "hold" or "problem" state needed?

18. **Can a pickup be partially completed?** Customer takes some items and comes back for the rest?

19. **Do you ever need to reject a pickup request** (not just cancel it)? For example, "this order isn't ready for pickup yet" — with a reason communicated back to the customer.

### E. Communication and Notifications

20. **How do you currently communicate with customers about their pickup?** Phone call, email, text, nothing? What would be ideal?

21. **Does the customer need to know their queue position and estimated wait time?** Or is a simpler signal sufficient — "you're next" or "go to gate X"?

22. **When a customer is next in line, how do you notify them?** PA system, phone call, text message, screen in the waiting area?

### F. Staff and Operations

23. **How many staff members manage the queue at any given time?** One dispatcher? Multiple people? Does each person own a gate?

24. **Do gate operators need to see broader queue information, or just "who's next at my gate"?** The current gate console is minimal by design — is that right?

25. **What metrics matter to you?** Throughput per day? Average wait times? Peak utilization? Do you report on these to management?

26. **Do you need an audit trail of actions?** Who approved what, who cancelled what, for dispute resolution or accountability?

### G. Integration and Data

27. **Beyond the sales order number, what NetSuite data does the dock worker need?** Individual item details, weights, special handling instructions, hazmat flags?

28. **Should the system update NetSuite when a pickup is completed?** Mark the order as fulfilled, trigger invoicing, update shipping status?

29. **Are there other systems this needs to integrate with?** Warehouse management system (WMS), shipping, inventory, scales, cameras?

### H. Scale and Environment

30. **How many pickups do you handle per day?** This affects whether a real-time queue makes sense vs. appointment time slots.

31. **Is this for a single warehouse location, or should it support multiple sites in the future?**

32. **What devices will staff use?** Desktop at a desk? Tablet at the dock? Phone while walking the floor? This affects the interface design.

---

## Risk Matrix

| Assumption | Risk if Wrong | Impact |
|---|---|---|
| Walk-up queue, not appointments | Core data model is wrong; need scheduling instead of positions | **High** |
| No check-in mechanism | Staff can't tell when customer arrives; manual workaround needed | **Medium** |
| Single SO per request | Friction for customers picking up multiple orders | **Medium** |
| No staging or prep concept | Queue time ≠ actual wait; warehouse can't plan ahead | **Medium** |
| No rejection flow | Staff can only cancel, not defer with a reason | **Low-Medium** |
| No timeout or no-show handling | Stale requests accumulate, pollute the queue | **Low-Medium** |
| Gates are interchangeable | Assignments may need to factor in gate capabilities | **Low-Medium** |
| No write-back to NetSuite | Pickup completion doesn't close the loop in ERP | **Medium** |
| Single location and timezone | Multi-site expansion requires rework | **Low** |
| Email-only identity | May not satisfy authorization requirements | **Low-Medium** |

---

## Notes During Interview

_Use this space to capture answers, surprises, and follow-up items._

### Key Findings

-

### Surprises (Things We Got Wrong)

-

### Confirmed Assumptions

-

### Follow-Up Items

-
