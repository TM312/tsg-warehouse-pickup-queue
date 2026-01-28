-- Add columns for caching NetSuite order data
-- These columns allow reusing NetSuite query results for duplicate requests

-- netsuite_status: The status code from NetSuite (e.g., "B", "C")
ALTER TABLE pickup_requests ADD COLUMN IF NOT EXISTS netsuite_status TEXT;

-- netsuite_status_name: Human-readable status (e.g., "Pending Fulfillment")
ALTER TABLE pickup_requests ADD COLUMN IF NOT EXISTS netsuite_status_name TEXT;

-- valid_for_pickup: Whether the order status allows warehouse pickup
ALTER TABLE pickup_requests ADD COLUMN IF NOT EXISTS valid_for_pickup BOOLEAN;

-- netsuite_email: Customer email from NetSuite for domain comparison on cache hits
ALTER TABLE pickup_requests ADD COLUMN IF NOT EXISTS netsuite_email TEXT;

-- Add comment explaining cache fields
COMMENT ON COLUMN pickup_requests.netsuite_status IS 'Cached NetSuite order status code';
COMMENT ON COLUMN pickup_requests.netsuite_status_name IS 'Cached NetSuite order status display name';
COMMENT ON COLUMN pickup_requests.valid_for_pickup IS 'Cached flag indicating if order status allows pickup';
COMMENT ON COLUMN pickup_requests.netsuite_email IS 'Cached NetSuite customer email for domain verification';
