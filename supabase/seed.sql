-- Seed data for local development
-- This provides realistic test data for development and testing

-- =============================================================================
-- GATES
-- =============================================================================
-- Insert 4 gates, all active
INSERT INTO gates (gate_number, is_active) VALUES
  (1, true),
  (2, true),
  (3, true),
  (4, true);

-- =============================================================================
-- BUSINESS HOURS
-- =============================================================================
-- Standard warehouse schedule: Monday-Friday 7:00-17:00, Saturday-Sunday closed
-- Note: is_closed = true overrides times, but times are NOT NULL so we provide placeholder values
INSERT INTO business_hours (day_of_week, is_closed, open_time, close_time) VALUES
  (0, true, '00:00:00', '00:00:01'),  -- Sunday: closed
  (1, false, '07:00:00', '17:00:00'), -- Monday
  (2, false, '07:00:00', '17:00:00'), -- Tuesday
  (3, false, '07:00:00', '17:00:00'), -- Wednesday
  (4, false, '07:00:00', '17:00:00'), -- Thursday
  (5, false, '07:00:00', '17:00:00'), -- Friday
  (6, true, '00:00:00', '00:00:01');  -- Saturday: closed

-- =============================================================================
-- PICKUP REQUESTS
-- =============================================================================
-- Sample pickup requests in different states for testing

-- 1. Pending request (awaiting approval)
INSERT INTO pickup_requests (
  sales_order_number,
  customer_email,
  customer_phone,
  status
) VALUES (
  'SO-2024-001',
  'john.smith@example.com',
  '555-0101',
  'pending'
);

-- 2. Approved request (ready to join queue)
INSERT INTO pickup_requests (
  sales_order_number,
  customer_email,
  customer_phone,
  company_name,
  item_count,
  status
) VALUES (
  'SO-2024-002',
  'jane.doe@example.com',
  '555-0102',
  'Doe Construction LLC',
  5,
  'approved'
);

-- 3. In queue request (actively waiting)
INSERT INTO pickup_requests (
  sales_order_number,
  customer_email,
  customer_phone,
  company_name,
  item_count,
  po_number,
  status,
  queue_position,
  assigned_gate_id,
  is_priority
) VALUES (
  'SO-2024-003',
  'bob.wilson@example.com',
  '555-0103',
  'Wilson Industries',
  12,
  'PO-12345',
  'in_queue',
  1,
  (SELECT id FROM gates WHERE gate_number = 1),
  false
);
