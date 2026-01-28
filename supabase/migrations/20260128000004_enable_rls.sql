-- Enable Row Level Security on all tables
-- This must be done before creating policies

-- Gates table
ALTER TABLE gates ENABLE ROW LEVEL SECURITY;

-- Pickup requests table
ALTER TABLE pickup_requests ENABLE ROW LEVEL SECURITY;

-- Business hours table
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
