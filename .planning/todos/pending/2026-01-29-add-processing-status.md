---
created: 2026-01-29T17:35
title: Add "processing" status for active pickups
area: database
files:
  - supabase/migrations/20260128000002_create_pickup_requests_table.sql:28-29
  - staff/app/components/dashboard/StatusBadge.vue
---

## Problem

Currently the pickup request lifecycle has these statuses: pending → approved → in_queue → completed/cancelled.

When a customer is at position 1 in the queue, they are "next up" but there's no distinction between:
1. Waiting at position 1 (next to be served)
2. Actually being served (staff loading their order)

Staff and customers need visibility into when a pickup is actively being processed vs just waiting at the front of the queue.

## Solution

Add a "processing" status between in_queue and completed:
- in_queue (position 1) → processing → completed
- Staff clicks "Start Processing" to transition from in_queue to processing
- This removes the customer from the visible queue and shows them as "being served"
- Requires:
  - Schema change: Add 'processing' to status CHECK constraint
  - UI: Add "Start Processing" button for position 1 items
  - UI: Update StatusBadge to show processing state
  - Consider: Should processing items still have queue_position or clear it?
